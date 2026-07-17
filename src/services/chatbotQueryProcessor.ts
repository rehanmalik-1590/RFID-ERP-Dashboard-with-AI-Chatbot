// ChatBot Query Processor
// Processes natural language queries and extracts intent/entities
// ......................chatbotQueryProcessor.ts file .............................
export const processQuery = (query: string) => {
  const lowerQuery = query.toLowerCase();

  const intent = detectIntent(lowerQuery);
  const entities = extractEntities(lowerQuery);
  const filters = extractFilters(lowerQuery);

  return {
    query,
    intent,
    entities,
    filters,
    isValid: intent !== 'unknown',
  };
};

const detectIntent = (query: string): string => {
  if (
    query.includes('top') ||
    query.includes('best') ||
    query.includes('highest')
  ) {
    return 'ranking';
  }
  if (query.includes('compare') || query.includes('vs')) {
    return 'comparison';
  }
  if (
    query.includes('bottleneck') ||
    query.includes('slow') ||
    query.includes('issue')
  ) {
    return 'problem';
  }
  if (
    query.includes('quality') ||
    query.includes('waste') ||
    query.includes('defect')
  ) {
    return 'quality';
  }
  if (query.includes('target') || query.includes('goal')) {
    return 'target';
  }
  if (query.includes('trend') || query.includes('forecast')) {
    return 'trend';
  }
  if (
    query.includes('worker') ||
    query.includes('employee') ||
    query.includes('staff')
  ) {
    return 'worker';
  }
  if (
    query.includes('department') ||
    query.includes('section') ||
    query.includes('team')
  ) {
    return 'department';
  }
  if (query.includes('line') || query.includes('production')) {
    return 'line';
  }
  return 'unknown';
};

const extractEntities = (query: string) => {
  const entities = {
    type: 'general',
    count: 5,
    dataType: 'all',
  };

  // Extract count
  const countMatch = query.match(/top\s*(\d+)|(\d+)\s*(workers|lines|departments|operations)/i);
  if (countMatch) {
    entities.count = parseInt(countMatch[1] || countMatch[2]);
  }

  // Extract data type
  if (query.includes('worker') || query.includes('employee')) {
    entities.dataType = 'worker';
  } else if (query.includes('department')) {
    entities.dataType = 'department';
  } else if (query.includes('line')) {
    entities.dataType = 'line';
  } else if (query.includes('operation')) {
    entities.dataType = 'operation';
  }

  return entities;
};

const extractFilters = (query: string) => {
  const filters = {
    efficiency: { min: 0, max: 100 },
    quality: { min: 0, max: 100 },
  };

  if (query.includes('high') || query.includes('good') || query.includes('excellent')) {
    filters.efficiency.min = 80;
  } else if (query.includes('low') || query.includes('poor')) {
    filters.efficiency.max = 50;
  }

  return filters;
};

export const getCompanyName = (query: string): string => {
  if (query.includes('PAK') || query.includes('pakistan')) return 'Pakistan';
  if (query.includes('BD') || query.includes('bangladesh')) return 'Bangladesh';
  if (query.includes('IND') || query.includes('india')) return 'India';
  return 'All';
};

export const getDepartmentEmoji = (dept: string): string => {
  const emojis: Record<string, string> = {
    Assembly: '🔧',
    Welding: '🔥',
    Painting: '🎨',
    QC: '✓',
    Packaging: '📦',
    Shipping: '🚚',
  };
  return emojis[dept] || '📊';
};

export const getStatusIcon = (value: number, max: number): string => {
  const percentage = (value / max) * 100;
  if (percentage >= 90) return '🟢';
  if (percentage >= 70) return '🟡';
  return '🔴';
};

export const formatAnalysisResponse = (data: any): string => {
  let response = '';

  if (Array.isArray(data)) {
    data.forEach((item, idx) => {
      response += `${idx + 1}. ${item.name}: ${item.value}\n`;
    });
  } else {
    response = JSON.stringify(data, null, 2);
  }

  return response;
};