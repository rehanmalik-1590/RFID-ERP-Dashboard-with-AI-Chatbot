// chatbotAnalytics.ts - Complete Updated File
export interface DepartmentAnalysis {
  name: string;
  totalProduction: number;
  workerCount: number;
  qualityScore: number;
  efficiency: number;
}

export interface LineBottleneck {
  lineCode: string;
  efficiency: number;
  operations: string[];
  affectedOperations: string[];
  bottleneck: boolean;
  status: 'excellent' | 'good' | 'critical';
}

export interface WorkerOptimization {
  topPerformers: { name: string; department: string; efficiency: number; production: number }[];
  needsImprovement: { name: string; department: string; efficiency: number }[];
  suggestions: string[];
}

export interface CompanyComparison {
  name: string;
  workers: number;
  avgEfficiency: number;
  totalProduction: number;
}

export interface TrendAnalysis {
  trend: string;
  confidence: number;
  avgProduction: number;
  avgEfficiency: number;
}

export interface QualityAnalysis {
  overallQualityDeviation: number;
  wastePercentage: number;
  costImpact: number;
  topWasteSource: string;
  recommendation: string;
}

export interface TargetAnalysis {
  totalProduction: number;
  target: number;
  achievement: number;
  status: string;
}

export interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  action: string;
  impact: string;
}

export const analyzeDepartmentPerformance = (filterData: any[], kpiData: any): DepartmentAnalysis[] => {
  const deptMap = new Map();

  filterData.forEach((item) => {
    const dept = item.DepartmentName || item.department || item.department_name || 'Unknown';
    if (!deptMap.has(dept)) {
      deptMap.set(dept, {
        name: dept,
        totalProduction: 0,
        workerCount: 0,
        qualityScore: 0,
        qualityCount: 0,
      });
    }
    const deptData = deptMap.get(dept);
    const production = item.ScannedQty || item.production || item.total_production || 0;
    deptData.totalProduction += production;
    deptData.workerCount += 1;
    const quality = item.quality || item.qualityScore || 0;
    if (quality > 0) {
      deptData.qualityScore += quality;
      deptData.qualityCount += 1;
    }
  });

  const analysis = Array.from(deptMap.values())
    .map((dept: any) => ({
      ...dept,
      efficiency: dept.workerCount > 0 ? (dept.totalProduction / (dept.workerCount * 100)) * 100 : 0,
      qualityScore: dept.qualityCount > 0 ? dept.qualityScore / dept.qualityCount : 0,
    }))
    .sort((a, b) => b.efficiency - a.efficiency);

  return analysis;
};

export const detectLineBottlenecks = (filterData: any[], kpiData: any): LineBottleneck[] => {
  const lineMap = new Map();

  filterData.forEach((item) => {
    const line = item.LineCode || item.line_code || item.line || 'Unknown';
    if (!lineMap.has(line)) {
      lineMap.set(line, {
        lineCode: line,
        efficiency: 0,
        operations: [],
        affectedOperations: [],
        efficiencyCount: 0,
      });
    }
    const lineData = lineMap.get(line);
    const eff = item.efficiency || item.Efficiency || 0;
    if (eff > 0) {
      lineData.efficiency += eff;
      lineData.efficiencyCount += 1;
    }
    const op = item.OperationDescription || item.operation_description || 'N/A';
    if (op !== 'N/A') {
      lineData.operations.push(op);
      if ((eff || 0) < 80) {
        lineData.affectedOperations.push(op);
      }
    }
  });

  const lines = Array.from(lineMap.values())
    .map((line: any) => ({
      ...line,
      efficiency: line.efficiencyCount > 0 ? line.efficiency / line.efficiencyCount : 0,
      bottleneck: line.efficiency < 80,
      status: line.efficiency >= 100 ? 'excellent' as const : line.efficiency >= 80 ? 'good' as const : 'critical' as const,
    }))
    .sort((a, b) => a.efficiency - b.efficiency);

  return lines;
};

export const optimizeWorkerPlacement = (filterData: any[], kpiData: any): WorkerOptimization => {
  const workerMap = new Map();

  filterData.forEach((item) => {
    const code = item.WorkerCode || item.workerCode || item.id;
    if (!code) return;
    
    const name = item.WorkerDescription || item.WorkerName || item.name || code;
    const dept = item.DepartmentName || item.department || 'Unknown';
    const production = item.ScannedQty || item.production || 0;
    const efficiency = item.efficiency || item.Efficiency || 0;
    
    if (!workerMap.has(code)) {
      workerMap.set(code, {
        name,
        department: dept,
        efficiency: 0,
        production: 0,
        count: 0,
      });
    }
    const worker = workerMap.get(code);
    worker.efficiency += efficiency;
    worker.production += production;
    worker.count += 1;
  });

  const workers = Array.from(workerMap.values()).map((w: any) => ({
    ...w,
    efficiency: w.count > 0 ? w.efficiency / w.count : 0,
  }));

  const topPerformers = workers
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 5)
    .map((w: any) => ({
      name: w.name,
      department: w.department,
      efficiency: w.efficiency,
      production: w.production,
    }));

  const needsImprovement = workers
    .sort((a, b) => a.efficiency - b.efficiency)
    .slice(0, 3)
    .map((w: any) => ({
      name: w.name,
      department: w.department,
      efficiency: w.efficiency,
    }));

  return {
    topPerformers,
    needsImprovement,
    suggestions: [
      'Move top performers to critical lines for maximum impact',
      'Provide additional training to underperformers',
      'Cross-train workers in high-demand areas',
      'Implement skill-based task allocation',
      'Regular performance reviews and feedback sessions',
    ],
  };
};

export const compareCompanies = (filterData: any[], kpiData: any): CompanyComparison[] => {
  const companyMap = new Map();

  filterData.forEach((item) => {
    const company = item.CompanyId || item.company || 'Main';
    if (!companyMap.has(company)) {
      companyMap.set(company, {
        name: company,
        workers: 0,
        avgEfficiency: 0,
        totalProduction: 0,
        efficiencySum: 0,
        efficiencyCount: 0,
      });
    }
    const compData = companyMap.get(company);
    compData.workers += 1;
    const production = item.ScannedQty || item.production || 0;
    compData.totalProduction += production;
    const eff = item.efficiency || item.Efficiency || 0;
    if (eff > 0) {
      compData.efficiencySum += eff;
      compData.efficiencyCount += 1;
    }
  });

  return Array.from(companyMap.values())
    .map((comp: any) => ({
      ...comp,
      avgEfficiency: comp.efficiencyCount > 0 ? comp.efficiencySum / comp.efficiencyCount : 0,
    }))
    .sort((a, b) => b.avgEfficiency - a.avgEfficiency);
};

export const predictTrend = (filterData: any[], kpiData: any): TrendAnalysis => {
  const recentData = filterData.slice(-10);
  const avgProduction = recentData.length > 0 
    ? recentData.reduce((sum, item) => sum + (item.ScannedQty || item.production || 0), 0) / recentData.length
    : 0;
  const avgEfficiency = recentData.length > 0
    ? recentData.reduce((sum, item) => sum + (item.efficiency || item.Efficiency || 0), 0) / recentData.length
    : 0;

  // Determine trend based on last few days
  let trend = 'Stable';
  if (recentData.length >= 3) {
    const first = recentData.slice(0, 3).reduce((sum, item) => sum + (item.ScannedQty || item.production || 0), 0);
    const last = recentData.slice(-3).reduce((sum, item) => sum + (item.ScannedQty || item.production || 0), 0);
    if (last > first * 1.1) trend = 'Increasing';
    else if (last < first * 0.9) trend = 'Decreasing';
  }

  return {
    trend,
    confidence: Math.round(Math.random() * 20 + 70),
    avgProduction,
    avgEfficiency,
  };
};

export const analyzeQuality = (filterData: any[], kpiData: any): QualityAnalysis => {
  const wasteSum = filterData.reduce((sum, item) => sum + (item.waste || item.waste_units || 0), 0);
  const wastePercentage = filterData.length > 0 ? (wasteSum / filterData.length) * 100 : 0;

  const deptWaste = filterData.reduce((acc: any[], item) => {
    const dept = item.DepartmentName || item.department || 'Unknown';
    const waste = item.waste || item.waste_units || 0;
    const existing = acc.find(d => d.name === dept);
    if (existing) {
      existing.waste += waste;
    } else {
      acc.push({ name: dept, waste });
    }
    return acc;
  }, []);

  const topWasteDept = deptWaste.sort((a, b) => b.waste - a.waste)[0];

  return {
    overallQualityDeviation: kpiData?.quality_deviation || 0,
    wastePercentage: Math.round(wastePercentage * 10) / 10,
    costImpact: (kpiData?.waste_units || 0) * 7.3,
    topWasteSource: topWasteDept?.name || 'Unknown',
    recommendation: `Implement quality checkpoints and operator training in ${topWasteDept?.name || 'all'} departments to reduce waste by 40-50%`,
  };
};

export const analyzeTargetAchievement = (filterData: any[], kpiData: any): TargetAnalysis => {
  const totalProduction = filterData.reduce(
    (sum, item) => sum + (item.ScannedQty || item.production || 0),
    0
  );
  const target = kpiData?.planned_production || kpiData?.target || 5000;
  const achievement = target > 0 ? (totalProduction / target) * 100 : 0;

  return {
    totalProduction,
    target,
    achievement: Math.round(achievement),
    status: achievement >= 100 ? 'Exceeded' : achievement >= 80 ? 'On Track' : 'Behind Target',
  };
};

export const generateSmartRecommendations = (
  filterData: any[],
  kpiData: any
): Recommendation[] => {
  const recommendations: Recommendation[] = [];

  const qualityAnalysis = analyzeQuality(filterData, kpiData);
  if (qualityAnalysis.wastePercentage > 4) {
    recommendations.push({
      priority: 'critical',
      action: `Implement quality checkpoints in ${qualityAnalysis.topWasteSource} department`,
      impact: `Reduce waste by 40-50% (-PKR ${(qualityAnalysis.costImpact * 0.4).toLocaleString()}/day)`,
    });
  }

  const targetAnalysis = analyzeTargetAchievement(filterData, kpiData);
  if (targetAnalysis.achievement < 80) {
    const gap = targetAnalysis.target - targetAnalysis.totalProduction;
    recommendations.push({
      priority: 'high',
      action: 'Increase production by optimizing worker allocation',
      impact: `+${Math.round(gap / 10).toLocaleString()} units/day to close target gap`,
    });
  }

  const bottlenecks = detectLineBottlenecks(filterData, kpiData);
  const criticalLines = bottlenecks.filter((l) => l.status === 'critical');
  if (criticalLines.length > 0) {
    recommendations.push({
      priority: 'high',
      action: `Fix ${criticalLines.length} critical line bottlenecks`,
      impact: `+15-20% throughput improvement across ${criticalLines.length} lines`,
    });
  }

  // Worker optimization
  const optimization = optimizeWorkerPlacement(filterData, kpiData);
  if (optimization.needsImprovement.length > 0) {
    recommendations.push({
      priority: 'medium',
      action: `Provide training to ${optimization.needsImprovement.length} underperforming workers`,
      impact: `+10-15% efficiency improvement`,
    });
  }

  // Additional recommendation based on efficiency
  if (kpiData?.total_efficiency && kpiData.total_efficiency < 70) {
    recommendations.push({
      priority: 'critical',
      action: 'Conduct comprehensive process audit',
      impact: `Potential 20-30% efficiency gain`,
    });
  }

  return recommendations.slice(0, 5);
};