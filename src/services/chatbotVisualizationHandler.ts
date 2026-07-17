// ChatBot Visualization Handler
// Handles dynamic graph and table generation based on user requests
// ......................chatbotVisualizationHandler.ts file .............................
export interface VisualizationRequest {
  type: 'graph' | 'table' | 'metric' | 'comparison';
  dataSource: 'workers' | 'departments' | 'lines' | 'operations' | 'quality' | 'trends' | 'general';
  count?: number;
  specificId?: string;
  format?: 'bar' | 'pie' | 'line' | 'table' | 'card';
  isValid: boolean;
  errorMessage?: string;
  suggestions?: string[];
}

export interface VisualizationResponse {
  type: 'graph' | 'table' | 'metric' | 'comparison' | 'suggestion';
  title: string;
  data: any;
  format: string;
  recordCount?: number;
  showVisualization: boolean;
  chartType?: 'bar' | 'pie' | 'line' | 'table';
  suggestion?: string;
  suggestedQueries?: string[];
}

// ===== REQUEST PARSER =====
export const parseVisualizationRequest = (query: string): VisualizationRequest => {
  const lowerQuery = query.toLowerCase();

  // Extract type (graph/table/chart)
  const isGraph =
    lowerQuery.includes('graph') ||
    lowerQuery.includes('chart') ||
    lowerQuery.includes('picture') ||
    lowerQuery.includes('visual');
  const isTable =
    lowerQuery.includes('table') ||
    lowerQuery.includes('list') ||
    lowerQuery.includes('records') ||
    lowerQuery.includes('data');
  const type: 'graph' | 'table' | 'metric' | 'comparison' = isGraph
    ? 'graph'
    : isTable
      ? 'table'
      : 'metric';

  // Extract count (top 5, top 10, etc.)
  const countMatch = query.match(/top\s*(\d+)|(\d+)\s*(ka|ke|workers|records|lines)/i);
  const count = countMatch ? parseInt(countMatch[1] || countMatch[2]) : undefined;

  // Extract specific ID (for "1 ka graph" or "PAK-W00001 ka graph")
  const idMatch = query.match(/(\d+)\s*(ka|ke|ki)|(PAK-W\d{5})/i);
  const specificId = idMatch ? (idMatch[1] || idMatch[3]) : undefined;

  // Determine data source
  let dataSource: 'workers' | 'departments' | 'lines' | 'operations' | 'quality' | 'trends' | 'general' =
    'general';

  if (
    lowerQuery.includes('worker') ||
    lowerQuery.includes('employee') ||
    lowerQuery.includes('staff')
  ) {
    dataSource = 'workers';
  } else if (lowerQuery.includes('department') || lowerQuery.includes('section')) {
    dataSource = 'departments';
  } else if (lowerQuery.includes('line')) {
    dataSource = 'lines';
  } else if (lowerQuery.includes('operation')) {
    dataSource = 'operations';
  } else if (lowerQuery.includes('quality') || lowerQuery.includes('waste')) {
    dataSource = 'quality';
  } else if (lowerQuery.includes('trend') || lowerQuery.includes('forecast')) {
    dataSource = 'trends';
  }

  // Determine format
  let format: 'bar' | 'pie' | 'line' | 'table' | 'card' = 'bar';
  if (isTable) format = 'table';
  if (lowerQuery.includes('pie')) format = 'pie';
  if (lowerQuery.includes('line')) format = 'line';

  return {
    type,
    dataSource,
    count,
    specificId,
    format,
    isValid: true,
  };
};

// ===== RESPONSE BUILDER =====
export const buildVisualizationResponse = (
  request: VisualizationRequest,
  data: any
): VisualizationResponse => {
  const titles: Record<string, string> = {
    workers: 'Worker Performance',
    departments: 'Department Analysis',
    lines: 'Production Line Efficiency',
    operations: 'Operations Overview',
    quality: 'Quality Metrics',
    trends: 'Trend Analysis',
    general: 'Data Visualization',
  };

  return {
    type: request.type,
    title: titles[request.dataSource],
    data,
    format: request.format || 'bar',
    recordCount: request.count || 10,
    showVisualization: true,
    chartType: (request.format as 'bar' | 'pie' | 'line' | 'table') || 'bar',
  };
};

// ===== DATA FORMATTERS =====
export const formatGraphData = (data: any[], type: string) => {
  if (type === 'pie') {
    return data.map((item) => ({
      name: item.name || item.department,
      value: item.efficiency || item.production || item.quality,
    }));
  }

  if (type === 'line') {
    return data.map((item) => ({
      date: item.date || new Date().toISOString().split('T')[0],
      value: item.production || item.efficiency,
    }));
  }

  // Default bar chart
  return data.map((item) => ({
    name: item.name || item.department || item.lineCode,
    efficiency: item.efficiency || 0,
    production: item.production || 0,
    quality: item.quality || 0,
  }));
};

export const formatTableData = (data: any[]) => {
  return data.map((item) => ({
    id: item.id || item.workerCode || item.name,
    name: item.name,
    department: item.department,
    efficiency: item.efficiency?.toFixed(1) + '%',
    production: item.production?.toLocaleString(),
    quality: item.quality?.toFixed(1),
    status: item.efficiency >= 80 ? '🟢 Good' : item.efficiency >= 50 ? '🟡 Fair' : '🔴 Critical',
  }));
};

// ===== UTILITY FUNCTIONS =====
export const getChartConfig = (type: string) => {
  const configs: Record<string, any> = {
    bar: {
      xAxis: { type: 'category' },
      yAxis: { type: 'value' },
      series: [{ data: [], type: 'bar', smooth: true }],
    },
    pie: {
      series: [{ data: [], type: 'pie', radius: '50%' }],
    },
    line: {
      xAxis: { type: 'category' },
      yAxis: { type: 'value' },
      series: [{ data: [], type: 'line', smooth: true }],
    },
  };
  return configs[type] || configs.bar;
};

export const suggestNextQueries = (dataSource: string): string[] => {
  const suggestions: Record<string, string[]> = {
    workers: [
      'Show top 10 workers',
      'Worker efficiency graph',
      'Team comparison',
      'Worker training recommendations',
    ],
    departments: [
      'Department ranking',
      'Production by department',
      'Quality per department',
      'Department comparison',
    ],
    lines: [
      'Line efficiency analysis',
      'Bottleneck detection',
      'Line comparison',
      'Production line status',
    ],
    quality: [
      'Quality metrics',
      'Waste analysis',
      'Defect trends',
      'Quality improvement recommendations',
    ],
    trends: [
      'Production forecast',
      'Trend analysis',
      'Growth projection',
      'Historical data',
    ],
    general: [
      'Show dashboard summary',
      'Performance overview',
      'KPI status',
      'Recommendations',
    ],
  };
  return suggestions[dataSource] || suggestions.general;
};