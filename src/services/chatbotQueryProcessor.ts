// ChatBot Query Processor
// Processes natural language queries and extracts intent/entities
// ......................chatbotQueryProcessor.ts file .............................
export const processQuery = (query: string, lang: 'en' | 'ur' = 'en') => {
  const lowerQuery = query.toLowerCase();

  const intent = detectIntent(lowerQuery, lang);
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

const detectIntent = (query: string, lang: 'en' | 'ur' = 'en'): string => {
  // Urdu keywords
  const urKeywords = {
    top: ['top', 'best', 'highest', 'ٹاپ', 'بہترین', 'سب سے اچھا'],
    compare: ['compare', 'vs', 'versus', 'موازنہ', 'مقابلہ'],
    problem: ['bottleneck', 'slow', 'issue', 'رکاوٹ', 'آہستہ', 'مسئلہ'],
    quality: ['quality', 'waste', 'defect', 'کوالٹی', 'فضلہ', 'نقص'],
    target: ['target', 'goal', 'ہدف', 'مقصد'],
    trend: ['trend', 'forecast', 'رجحان', 'پیش گوئی'],
    worker: ['worker', 'employee', 'staff', 'ورکر', 'ملازم', 'عملہ'],
    department: ['department', 'section', 'team', 'ڈپارٹمنٹ', 'سیکشن', 'ٹیم'],
    line: ['line', 'production', 'لائن', 'پیداوار'],
  };

  const allKeywords = { ...urKeywords };
  
  // Check each intent
  for (const [intent, keywords] of Object.entries(allKeywords)) {
    for (const keyword of keywords) {
      if (query.includes(keyword)) {
        return intent;
      }
    }
  }

  // Check for specific phrases in Urdu
  if (query.includes('سب سے') || query.includes('زیادہ')) return 'ranking';
  if (query.includes('کم') || query.includes('کمزور')) return 'ranking';
  
  return 'unknown';
};

const extractEntities = (query: string) => {
  const entities = {
    type: 'general',
    count: 5,
    dataType: 'all',
  };

  // Extract count - supports English and Urdu numbers
  const countMatch = query.match(/top\s*(\d+)|(\d+)\s*(workers|lines|departments|operations)/i);
  if (countMatch) {
    entities.count = parseInt(countMatch[1] || countMatch[2]);
  }

  // Extract data type
  if (query.includes('worker') || query.includes('employee') || query.includes('ورکر') || query.includes('ملازم')) {
    entities.dataType = 'worker';
  } else if (query.includes('department') || query.includes('ڈپارٹمنٹ')) {
    entities.dataType = 'department';
  } else if (query.includes('line') || query.includes('لائن')) {
    entities.dataType = 'line';
  } else if (query.includes('operation') || query.includes('آپریشن')) {
    entities.dataType = 'operation';
  }

  return entities;
};

const extractFilters = (query: string) => {
  const filters = {
    efficiency: { min: 0, max: 100 },
    quality: { min: 0, max: 100 },
  };

  if (query.includes('high') || query.includes('good') || query.includes('excellent') || 
      query.includes('اچھا') || query.includes('بہترین')) {
    filters.efficiency.min = 80;
  } else if (query.includes('low') || query.includes('poor') || 
             query.includes('کم') || query.includes('خراب')) {
    filters.efficiency.max = 50;
  }

  return filters;
};

export const getCompanyName = (query: string): string => {
  if (query.includes('PAK') || query.includes('pakistan') || query.includes('پاکستان')) return 'Pakistan';
  if (query.includes('BD') || query.includes('bangladesh') || query.includes('بنگلہ دیش')) return 'Bangladesh';
  if (query.includes('IND') || query.includes('india') || query.includes('انڈیا')) return 'India';
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

export const formatAnalysisResponse = (data: any, lang: 'en' | 'ur' = 'en'): string => {
  let response = '';

  if (Array.isArray(data)) {
    data.forEach((item, idx) => {
      const prefix = lang === 'ur' ? `${idx + 1}.` : `${idx + 1}.`;
      response += `${prefix} ${item.name}: ${item.value}\n`;
    });
  } else {
    response = JSON.stringify(data, null, 2);
  }

  return response;
};