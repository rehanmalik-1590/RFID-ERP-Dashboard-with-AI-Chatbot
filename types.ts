// Global Types & Interfaces
/* // ......................types.ts file ............................. */
export interface Worker {
  id: string;
  workerCode: string;
  name: string;
  department: string;
  efficiency: number;
  production: number;
  quality: number;
  status: 'active' | 'inactive';
}

export interface Department {
  name: string;
  totalProduction: number;
  workerCount: number;
  qualityScore: number;
  efficiency: number;
}

export interface Line {
  lineCode: string;
  efficiency: number;
  operations: string[];
  affectedOperations: string[];
  bottleneck: boolean;
  status: 'excellent' | 'good' | 'critical';
}

export interface Operation {
  id: string;
  name: string;
  lineCode: string;
  duration: number;
  status: 'completed' | 'in-progress' | 'pending';
}

export interface KPIData {
  target: number;
  quality_deviation: number;
  waste_units: number;
  [key: string]: any;
}

export interface FilterData {
  id?: string;
  name?: string;
  department?: string;
  efficiency?: number;
  production?: number;
  quality?: number;
  waste?: number;
  company?: string;
  [key: string]: any;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'chart' | 'table' | 'suggestion';
  data?: any;
}

export interface AnalysisResult {
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  data?: any;
}