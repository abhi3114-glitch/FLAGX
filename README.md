# Intelligent Feature Flag Management System

A production-ready, scalable feature flag management platform with real-time capabilities, advanced targeting rules, and comprehensive analytics.

##  Features

- **Real-time Kill Switches** - Instantly disable features across all services
- **Advanced User Segmentation** - Target by geography, device, user attributes, and custom rules
- **Rule Evaluation Engine** - Sophisticated rule engine with percentage rollouts, A/B testing
- **Audit Logging** - Complete audit trail of all flag changes
- **Analytics Dashboard** - Real-time metrics and evaluation statistics
- **WebSocket Updates** - Live updates across all connected clients
- **gRPC Support** - High-performance flag evaluation via gRPC
- **Redis Caching** - Ultra-fast flag lookups with Redis
- **PostgreSQL Storage** - Reliable persistent storage

##  Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL (persistent storage)
- Redis (caching + pub/sub)
- gRPC (high-performance API)
- WebSocket (real-time updates)

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (navigation)

##  Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Python 3.8+ (optional, for Python SDK)

##  Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd feature-flag-system

# Make setup script executable (Linux/Mac)
chmod +x setup.sh

# Run automated setup
./setup.sh

# Or manually install dependencies
npm install
```

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Setup PostgreSQL

```bash
# Create database
createdb feature_flags

# Or using psql
psql -U postgres -c "CREATE DATABASE feature_flags;"
```

Tables will be created automatically when you start the backend.

### 4. Start Redis

```bash
# Linux/Mac
redis-server

# Using Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### 5. Start the Application

**Option 1: Everything together**
```bash
npm run dev
```

**Option 2: Separate terminals**
```bash
# Terminal 1 - Backend
npm run start:backend

# Terminal 2 - Frontend
npm run start:frontend
```

**Option 3: Docker Compose**
```bash
docker-compose up
```

### 6. Access the Application

- **Frontend Dashboard:** http://localhost:3000
- **Backend API:** http://localhost:3001/api
- **WebSocket:** ws://localhost:3001/ws
- **gRPC Server:** localhost:50051
- **Health Check:** http://localhost:3001/api/health

##  API Documentation

### REST API Endpoints

#### Feature Flags

```bash
# Get all flags
GET /api/flags?environment=development

# Get specific flag
GET /api/flags/:id

# Create flag
POST /api/flags
{
  "name": "new-feature",
  "description": "New feature flag",
  "enabled": false,
  "environment": "development",
  "rules": []
}

# Update flag
PUT /api/flags/:id
{
  "name": "updated-feature",
  "enabled": true
}

# Delete flag
DELETE /api/flags/:id

# Toggle flag
PATCH /api/flags/:id/toggle

# Kill switch (emergency disable)
POST /api/flags/:id/kill-switch
{
  "reason": "Production issue detected"
}
```

#### Evaluation

```bash
# Evaluate single flag
POST /api/evaluate
{
  "flagId": "feature-123",
  "userId": "user-456",
  "context": {
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "customField": "value"
  }
}

# Bulk evaluate
POST /api/evaluate/bulk
{
  "flagIds": ["feature-1", "feature-2"],
  "userId": "user-456",
  "context": {}
}
```

#### Segments

```bash
# Get all segments
GET /api/segments

# Create segment
POST /api/segments
{
  "name": "Premium Users",
  "description": "Users with premium subscription",
  "conditions": {
    "plan": "premium"
  }
}
```

#### Audit Logs

```bash
# Get all audit logs
GET /api/audit?limit=100

# Get logs for specific flag
GET /api/audit/flag/:flagId
```

#### Analytics

```bash
# Get flag analytics
GET /api/analytics/flags/:flagId?timeRange=24h

# Get system metrics
GET /api/analytics/metrics
```

##  Rule Types & Examples

### 1. Geographic Targeting

```json
{
  "type": "geo",
  "operator": "in",
  "value": ["US", "CA", "UK"]
}
```

### 2. Device Targeting

```json
{
  "type": "device",
  "operator": "is",
  "value": "mobile"
}
```

### 3. Percentage Rollout

```json
{
  "type": "percentage",
  "operator": "less_than",
  "value": 50
}
```

### 4. User Whitelist/Blacklist

```json
{
  "type": "user",
  "operator": "in",
  "value": ["user-1", "user-2", "user-3"]
}
```

### 5. Custom Field Targeting

```json
{
  "type": "custom",
  "field": "userRole",
  "operator": "equals",
  "value": "admin"
}
```

##  Python SDK

### Installation

```bash
cd python-sdk
pip install -r requirements.txt
pip install -e .
```

### Usage

```python
from feature_flag_client import FeatureFlagClient

# Initialize client
client = FeatureFlagClient(base_url="http://localhost:3001/api")

# Get all flags
flags = client.get_all_flags(environment="production")

# Evaluate flag
result = client.evaluate_flag(
    flag_id="new-feature",
    user_id="user-123",
    context={
        "ip": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "plan": "premium"
    }
)

if result["enabled"]:
    # Feature is enabled
    print("Feature enabled:", result["reason"])
else:
    # Feature is disabled
    print("Feature disabled:", result["reason"])

# WebSocket for real-time updates
from feature_flag_client import WebSocketClient

ws_client = WebSocketClient("ws://localhost:3001/ws")

def on_flag_update(data):
    print(f"Flag {data['action']}: {data['flag']['name']}")

ws_client.on_flag_update(on_flag_update)
ws_client.connect()
```

##  Testing Flag Evaluation

```bash
# Test evaluation via REST API
curl -X POST http://localhost:3001/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "flagId": "feature-123",
    "userId": "test-user",
    "context": {
      "ip": "8.8.8.8",
      "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)"
    }
  }'

# Test via Python
python -c "
from feature_flag_client import FeatureFlagClient
client = FeatureFlagClient()
result = client.evaluate_flag('feature-123', 'test-user', {'plan': 'premium'})
print(result)
"
```

##  Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose up --build
```

##  Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Input Validation** - Express-validator for request validation
- **Audit Logging** - Complete audit trail of all changes
- **Rate Limiting** - Ready to configure (see .env)

##  Performance Optimizations

- **Redis Caching** - 5-minute TTL for flag lookups
- **Connection Pooling** - PostgreSQL connection pooling (max 20)
- **Compression** - Response compression middleware
- **gRPC** - High-performance binary protocol for evaluations
- **Indexed Queries** - Database indexes on frequently queried fields

##  Troubleshooting

### Backend won't start
```bash
# Check if ports are available
lsof -i :3001  # Backend
lsof -i :50051 # gRPC

# Check PostgreSQL connection
psql -U postgres -d feature_flags -c "SELECT 1"

# Check Redis connection
redis-cli ping
```

### Database connection errors
```bash
# Verify PostgreSQL is running
pg_isready

# Check credentials in .env
cat .env | grep POSTGRES
```

### WebSocket not connecting
- Make sure backend is running on port 3001
- Check browser console for connection errors
- Verify WebSocket URL in frontend

##  Monitoring

The system provides built-in metrics:

- **System Metrics:** Total flags, enabled flags, segments, evaluations
- **Flag Analytics:** Evaluation counts, success rates, user distribution
- **Audit Logs:** Complete change history with timestamps
- **Health Check:** `GET /api/health`

##  Roadmap

- [x] Core feature flag system
- [x] Python SDK
- [x] Real-time WebSocket updates
- [x] gRPC support
- [ ] Authentication & Authorization
- [ ] Multi-tenancy support
- [ ] Advanced A/B testing framework
- [ ] Machine learning-based rollout optimization
- [ ] Additional SDK libraries (Java, Go, .NET)
- [ ] Kubernetes Helm charts

##  License

MIT License - see LICENSE file for details

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



**Built by Abhishek for modern feature management**