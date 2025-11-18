import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';
import { evaluateRules } from '../services/rule-engine.service.js';
import { getRedisClient } from '../config/redis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, 'feature_flag.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const featureFlagProto = grpc.loadPackageDefinition(packageDefinition).featureflag;

async function EvaluateFlag(call, callback) {
  try {
    const { flag_id, user_id, context } = call.request;

    const redis = getRedisClient();
    const cacheKey = `flag:${flag_id}`;

    let flag;
    const cached = await redis.get(cacheKey);
    if (cached) {
      flag = JSON.parse(cached);
    } else {
      const result = await pool.query('SELECT * FROM feature_flags WHERE id = $1', [flag_id]);
      if (result.rows.length === 0) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: 'Flag not found'
        });
      }
      flag = result.rows[0];
      await redis.setEx(cacheKey, 300, JSON.stringify(flag));
    }

    if (!flag.enabled) {
      return callback(null, {
        enabled: false,
        reason: 'Flag is disabled'
      });
    }

    const contextObj = context ? JSON.parse(context) : {};
    const evaluation = await evaluateRules(flag.rules, contextObj);

    callback(null, {
      enabled: evaluation.enabled,
      reason: evaluation.reason
    });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      message: error.message
    });
  }
}

async function GetFlag(call, callback) {
  try {
    const { flag_id } = call.request;

    const result = await pool.query('SELECT * FROM feature_flags WHERE id = $1', [flag_id]);

    if (result.rows.length === 0) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Flag not found'
      });
    }

    const flag = result.rows[0];

    callback(null, {
      id: flag.id,
      name: flag.name,
      description: flag.description,
      enabled: flag.enabled,
      environment: flag.environment,
      rules: JSON.stringify(flag.rules)
    });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      message: error.message
    });
  }
}

export function startGrpcServer() {
  const server = new grpc.Server();

  server.addService(featureFlagProto.FeatureFlagService.service, {
    EvaluateFlag,
    GetFlag
  });

  const port = process.env.GRPC_PORT || 50051;
  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('Failed to start gRPC server:', error);
        return;
      }
      server.start();
      console.log(`gRPC server running on port ${port}`);
    }
  );
}