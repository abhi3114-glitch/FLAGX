import geoip from 'geoip-lite';
import UAParser from 'ua-parser-js';

export async function evaluateRules(rules, context) {
  if (!rules || rules.length === 0) {
    return { enabled: true, reason: 'No rules defined' };
  }

  for (const rule of rules) {
    const result = await evaluateRule(rule, context);
    if (!result.passed) {
      return { enabled: false, reason: result.reason };
    }
  }

  return { enabled: true, reason: 'All rules passed' };
}

async function evaluateRule(rule, context) {
  const { type, operator, value } = rule;

  switch (type) {
    case 'geo':
      return evaluateGeoRule(operator, value, context);
    case 'device':
      return evaluateDeviceRule(operator, value, context);
    case 'percentage':
      return evaluatePercentageRule(operator, value, context);
    case 'user':
      return evaluateUserRule(operator, value, context);
    case 'custom':
      return evaluateCustomRule(rule, context);
    default:
      return { passed: true, reason: 'Unknown rule type' };
  }
}

function evaluateGeoRule(operator, value, context) {
  const ip = context?.ip || context?.userIp;
  if (!ip) {
    return { passed: false, reason: 'No IP address provided' };
  }

  const geo = geoip.lookup(ip);
  if (!geo) {
    return { passed: false, reason: 'Could not determine location' };
  }

  switch (operator) {
    case 'in':
      if (Array.isArray(value) && value.includes(geo.country)) {
        return { passed: true, reason: `Country ${geo.country} is in allowed list` };
      }
      return { passed: false, reason: `Country ${geo.country} not in allowed list` };
    case 'not_in':
      if (Array.isArray(value) && !value.includes(geo.country)) {
        return { passed: true, reason: `Country ${geo.country} is not in blocked list` };
      }
      return { passed: false, reason: `Country ${geo.country} is in blocked list` };
    default:
      return { passed: true, reason: 'Unknown operator' };
  }
}

function evaluateDeviceRule(operator, value, context) {
  const userAgent = context?.userAgent;
  if (!userAgent) {
    return { passed: false, reason: 'No user agent provided' };
  }

  const parser = new UAParser(userAgent);
  const device = parser.getDevice();
  const os = parser.getOS();
  const browser = parser.getBrowser();

  const deviceType = device.type || 'desktop';

  switch (operator) {
    case 'is':
      if (deviceType === value || os.name === value || browser.name === value) {
        return { passed: true, reason: `Device/OS/Browser matches ${value}` };
      }
      return { passed: false, reason: `Device/OS/Browser does not match ${value}` };
    case 'is_not':
      if (deviceType !== value && os.name !== value && browser.name !== value) {
        return { passed: true, reason: `Device/OS/Browser is not ${value}` };
      }
      return { passed: false, reason: `Device/OS/Browser is ${value}` };
    case 'in':
      if (Array.isArray(value) && (value.includes(deviceType) || value.includes(os.name) || value.includes(browser.name))) {
        return { passed: true, reason: 'Device/OS/Browser in allowed list' };
      }
      return { passed: false, reason: 'Device/OS/Browser not in allowed list' };
    default:
      return { passed: true, reason: 'Unknown operator' };
  }
}

function evaluatePercentageRule(operator, value, context) {
  const userId = context?.userId || context?.sessionId;
  if (!userId) {
    return { passed: false, reason: 'No user/session ID provided' };
  }

  // Consistent hash-based percentage
  const hash = simpleHash(userId);
  const percentage = (hash % 100) + 1;

  switch (operator) {
    case 'less_than':
      if (percentage <= value) {
        return { passed: true, reason: `User in ${value}% rollout` };
      }
      return { passed: false, reason: `User not in ${value}% rollout` };
    case 'greater_than':
      if (percentage > value) {
        return { passed: true, reason: `User percentage ${percentage} > ${value}` };
      }
      return { passed: false, reason: `User percentage ${percentage} <= ${value}` };
    default:
      return { passed: true, reason: 'Unknown operator' };
  }
}

function evaluateUserRule(operator, value, context) {
  const userId = context?.userId;
  if (!userId) {
    return { passed: false, reason: 'No user ID provided' };
  }

  switch (operator) {
    case 'in':
      if (Array.isArray(value) && value.includes(userId)) {
        return { passed: true, reason: 'User in whitelist' };
      }
      return { passed: false, reason: 'User not in whitelist' };
    case 'not_in':
      if (Array.isArray(value) && !value.includes(userId)) {
        return { passed: true, reason: 'User not in blacklist' };
      }
      return { passed: false, reason: 'User in blacklist' };
    default:
      return { passed: true, reason: 'Unknown operator' };
  }
}

function evaluateCustomRule(rule, context) {
  const { field, operator, value } = rule;
  const contextValue = context?.[field];

  if (contextValue === undefined) {
    return { passed: false, reason: `Field ${field} not found in context` };
  }

  switch (operator) {
    case 'equals':
      return {
        passed: contextValue === value,
        reason: contextValue === value ? 'Values match' : 'Values do not match'
      };
    case 'not_equals':
      return {
        passed: contextValue !== value,
        reason: contextValue !== value ? 'Values differ' : 'Values are equal'
      };
    case 'contains':
      return {
        passed: String(contextValue).includes(value),
        reason: String(contextValue).includes(value) ? 'Contains value' : 'Does not contain value'
      };
    case 'greater_than':
      return {
        passed: contextValue > value,
        reason: contextValue > value ? 'Greater than' : 'Not greater than'
      };
    case 'less_than':
      return {
        passed: contextValue < value,
        reason: contextValue < value ? 'Less than' : 'Not less than'
      };
    default:
      return { passed: true, reason: 'Unknown operator' };
  }
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}