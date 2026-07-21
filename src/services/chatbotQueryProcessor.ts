// chatbotQueryProcessor.ts - Complete Updated File
// chatbotQueryProcessor.ts - Fixed
export interface ParsedQuery {
  query: string;  // Add this property
  intent: string;
  entities: {
    type: string;
    count: number;
    dataType: string;
    specificId?: string;
    onlyNames?: boolean;
    chartType?: string;
    isGraph?: boolean;
    isComparison?: boolean;
    isTotalEfficiency?: boolean;
    isTotalVariance?: boolean;
    isCompanyComparison?: boolean;
    isDepartmentComparison?: boolean;
  };
  filters: {
    efficiency: { min: number; max: number };
    quality: { min: number; max: number };
  };
  isValid: boolean;
}

export const processQuery = (query: string): ParsedQuery => {
  const lowerQuery = query.toLowerCase();

  const intent = detectIntent(lowerQuery);
  const entities = extractEntities(lowerQuery);
  const filters = extractFilters(lowerQuery);

  return {
    query,  // Now this is valid
    intent,
    entities,
    filters,
    isValid: intent !== 'unknown',
  };
};

const detectIntent = (query: string): string => {
  const keywords: Record<string, string[]> = {
    top: ['top', 'best', 'highest', 'max'],
    low: ['low', 'worst', 'lowest', 'min'],
    compare: ['compare', 'vs', 'versus', 'comparison', 'comparison'],
    efficiency: ['efficiency', 'productivity', 'performance'],
    variance: ['variance', 'deviation', 'difference', 'gap'],
    quality: ['quality', 'waste', 'defect', 'reject'],
    target: ['target', 'goal', 'achievement', 'plan'],
    trend: ['trend', 'forecast', 'prediction', 'future'],
    bottleneck: ['bottleneck', 'slow', 'issue', 'problem'],
    worker: ['worker', 'employee', 'staff', 'labor'],
    department: ['department', 'section', 'team', 'dept'],
    line: ['line', 'production line', 'assembly'],
    total: ['total', 'all', 'overview', 'summary', 'complete'],
    help: ['help', 'what can you do', 'how to use', 'commands', 'support'],
  };
  
  for (const [intent, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (query.includes(word)) {
        return intent;
      }
    }
  }
  
  return 'unknown';
};

const extractEntities = (query: string) => {
  const entities = {
    type: 'general',
    count: 5,
    dataType: 'all',
    onlyNames: false,
    chartType: undefined as string | undefined,
    isGraph: false,
    isComparison: false,
    isTotalEfficiency: false,
    isTotalVariance: false,
    isCompanyComparison: false,
    isDepartmentComparison: false,
  };

  // Extract count - FIXED: Exact count
  const countMatch = query.match(/top\s*(\d+)|(\d+)\s*(workers|lines|departments|operations|records)/i);
  if (countMatch) {
    const count = parseInt(countMatch[1] || countMatch[2]);
    if (!isNaN(count) && count > 0) {
      entities.count = count;
    }
  }

  // Only names
  if (query.includes('only names') || query.includes('tell me names') || query.includes('names only') || query.includes('name bta do') || query.includes('only name')) {
    entities.onlyNames = true;
  }

  // Chart type
  if (query.includes('pie') || query.includes('pie chart')) entities.chartType = 'pie';
  else if (query.includes('line') || query.includes('line chart')) entities.chartType = 'line';
  else if (query.includes('bar') || query.includes('bar chart') || query.includes('graph') || query.includes('chart')) entities.chartType = 'bar';

  // Graph
  if (query.includes('graph') || query.includes('chart') || query.includes('show') || query.includes('visualize') || entities.chartType) {
    entities.isGraph = true;
  }

  // Comparison
  if (query.includes('comparison') || query.includes('compare') || query.includes('vs')) {
    entities.isComparison = true;
  }

  // Total efficiency
  if (query.includes('total efficiency') || query.includes('overall efficiency') || query.includes('factory efficiency')) {
    entities.isTotalEfficiency = true;
  }

  // Total variance
  if (query.includes('total variance') || query.includes('variance') || query.includes('production variance')) {
    entities.isTotalVariance = true;
  }

  // Company comparison
  if (query.includes('company comparison') || query.includes('compare companies') || query.includes('company wise')) {
    entities.isCompanyComparison = true;
  }

  // Department comparison
  if (query.includes('department comparison') || query.includes('compare departments') || query.includes('dept comparison')) {
    entities.isDepartmentComparison = true;
  }

  // Extract data type
  if (query.includes('worker') || query.includes('employee') || query.includes('staff')) {
    entities.dataType = 'worker';
  } else if (query.includes('department') || query.includes('dept') || query.includes('section')) {
    entities.dataType = 'department';
  } else if (query.includes('line')) {
    entities.dataType = 'line';
  } else if (query.includes('operation')) {
    entities.dataType = 'operation';
  } else if (query.includes('record') || query.includes('data')) {
    entities.dataType = 'record';
  } else if (query.includes('company')) {
    entities.dataType = 'company';
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
  if (query.includes('SHG') || query.includes('shaheen')) return 'Shaheen Heritage Garments';
  if (query.includes('MGI') || query.includes('maqbool')) return 'Maqbool Global Industries';
  if (query.includes('ARF') || query.includes('arifeen')) return 'Arifeen Retail Fabrics';
  if (query.includes('ZIM') || query.includes('zaman')) return 'Zaman International Mills';
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
    CUTTING: '✂️',
    SEWING: '🧵',
    FINISHING: '✨',
    'QUALITY CONTROL': '✓',
    PACKING: '📦',
    DYEING: '🎨',
    PRESSING: '👔',
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