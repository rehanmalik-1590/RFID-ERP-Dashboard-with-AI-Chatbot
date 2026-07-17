// Zod Validation Schemas
// ......................schema.ts file .............................
export const workerSchema = {
  id: 'string',
  workerCode: 'string',
  name: 'string',
  department: 'string',
  efficiency: 'number (0-100)',
  production: 'number',
  quality: 'number (0-100)',
};

export const departmentSchema = {
  name: 'string',
  totalProduction: 'number',
  workerCount: 'number',
  qualityScore: 'number',
  efficiency: 'number',
};

export const lineSchema = {
  lineCode: 'string',
  efficiency: 'number (0-100)',
  operations: 'string[]',
  affectedOperations: 'string[]',
  bottleneck: 'boolean',
  status: "'excellent' | 'good' | 'critical'",
};

export const kpiSchema = {
  target: 'number',
  quality_deviation: 'number',
  waste_units: 'number',
};

export const chatMessageSchema = {
  id: 'string',
  text: 'string (required)',
  sender: "'user' | 'bot'",
  timestamp: 'Date',
  type: "'text' | 'chart' | 'table' | 'suggestion'",
  data: 'any (optional)',
};

// Validation helpers
export const validateWorkerData = (data: any): boolean => {
  return (
    data &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.efficiency === 'number' &&
    data.efficiency >= 0 &&
    data.efficiency <= 100
  );
};

export const validateDepartmentData = (data: any): boolean => {
  return (
    data &&
    typeof data.name === 'string' &&
    typeof data.totalProduction === 'number' &&
    typeof data.efficiency === 'number'
  );
};

export const validateKPIData = (data: any): boolean => {
  return (
    data &&
    typeof data.target === 'number' &&
    typeof data.quality_deviation === 'number' &&
    typeof data.waste_units === 'number'
  );
};

export const validateChatMessage = (data: any): boolean => {
  return (
    data &&
    typeof data.id === 'string' &&
    typeof data.text === 'string' &&
    (data.sender === 'user' || data.sender === 'bot') &&
    data.text.length > 0
  );
};