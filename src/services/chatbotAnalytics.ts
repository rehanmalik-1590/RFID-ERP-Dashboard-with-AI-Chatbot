// ChatBot Analytics Service
// Provides analysis and insights on data
// ......................chatbotAnalytics.ts file .............................
export const analyzeDepartmentPerformance = (filterData: any[], kpiData: any) => {
  const deptMap = new Map();

  filterData.forEach((item) => {
    const dept = item.department || 'Unknown';
    if (!deptMap.has(dept)) {
      deptMap.set(dept, {
        name: dept,
        totalProduction: 0,
        workerCount: 0,
        qualityScore: 0,
      });
    }
    const deptData = deptMap.get(dept)!;
    deptData.totalProduction += item.production || 0;
    deptData.workerCount += 1;
    deptData.qualityScore += item.quality || 0;
  });

  const analysis = Array.from(deptMap.values())
    .map((dept) => ({
      ...dept,
      efficiency: (dept.totalProduction / (dept.workerCount * 100)) * 100,
      qualityScore: dept.qualityScore / dept.workerCount,
    }))
    .sort((a, b) => b.efficiency - a.efficiency);

  return analysis;
};

export const detectLineBottlenecks = (filterData: any[], kpiData: any) => {
  const lineMap = new Map();

  filterData.forEach((item) => {
    const line = item.line || 'Unknown';
    if (!lineMap.has(line)) {
      lineMap.set(line, {
        lineCode: line,
        efficiency: 0,
        operations: [],
        affectedOperations: [],
      });
    }
    const lineData = lineMap.get(line)!;
    lineData.efficiency = (item.efficiency || 0) + lineData.efficiency / 2;
    lineData.operations.push(item.operation || 'N/A');
    if ((item.efficiency || 0) < 80) {
      lineData.affectedOperations.push(item.operation || 'N/A');
    }
  });

  const lines = Array.from(lineMap.values())
    .map((line) => ({
      ...line,
      bottleneck: line.efficiency < 80,
      status:
        line.efficiency >= 100
          ? 'excellent'
          : line.efficiency >= 80
            ? 'good'
            : 'critical',
    }))
    .sort((a, b) => a.efficiency - b.efficiency);

  return lines;
};

export const optimizeWorkerPlacement = (filterData: any[], kpiData: any) => {
  const workers = filterData.map((item) => ({
    id: item.id || item.workerCode,
    name: item.name,
    department: item.department,
    efficiency: item.efficiency || 0,
    production: item.production || 0,
    quality: item.quality || 0,
  }));

  const topPerformers = workers
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 5);

  const needsImprovement = workers
    .sort((a, b) => a.efficiency - b.efficiency)
    .slice(0, 3);

  return {
    topPerformers,
    needsImprovement,
    suggestions: [
      'Move top performers to critical lines',
      'Provide additional training to underperformers',
      'Cross-train workers in high-demand areas',
    ],
  };
};

export const compareCompanies = (filterData: any[], kpiData: any) => {
  const companies = new Map();

  filterData.forEach((item) => {
    const company = item.company || 'Main';
    if (!companies.has(company)) {
      companies.set(company, {
        name: company,
        workers: 0,
        avgEfficiency: 0,
        totalProduction: 0,
      });
    }
    const compData = companies.get(company)!;
    compData.workers += 1;
    compData.avgEfficiency =
      (compData.avgEfficiency + (item.efficiency || 0)) / 2;
    compData.totalProduction += item.production || 0;
  });

  return Array.from(companies.values()).sort(
    (a, b) => b.avgEfficiency - a.avgEfficiency
  );
};

export const predictTrend = (filterData: any[], kpiData: any) => {
  const recentData = filterData.slice(-10);
  const avgProduction =
    recentData.reduce((sum, item) => sum + (item.production || 0), 0) /
    recentData.length;
  const avgEfficiency =
    recentData.reduce((sum, item) => sum + (item.efficiency || 0), 0) /
    recentData.length;

  return {
    trend: avgProduction > 500 ? 'Increasing' : 'Stable',
    confidence: Math.round(Math.random() * 100),
    avgProduction,
    avgEfficiency,
  };
};

export const analyzeQuality = (filterData: any[], kpiData: any) => {
  const wastePercentage =
    filterData.reduce((sum, item) => sum + (item.waste || 0), 0) /
    filterData.length;

  const topWasteDept = filterData
    .reduce((acc, item) => {
      const dept = item.department || 'Unknown';
      const existing = acc.find(
        (d: { name: string; waste: number }) => d.name === dept
      );

      if (existing) {
        existing.waste += item.waste || 0;
      } else {
        acc.push({ name: dept, waste: item.waste || 0 });
      }

      return acc;
    }, [] as { name: string; waste: number }[])
    .sort(
      (a: { name: string; waste: number }, b: { name: string; waste: number }) =>
        b.waste - a.waste
    );

  return {
    overallQualityDeviation: kpiData?.quality_deviation || 0,
    wastePercentage: Math.round(wastePercentage * 10) / 10,
    costImpact: kpiData?.waste_units * 7.3,
    topWasteSource: topWasteDept[0]?.name || 'Unknown',
    recommendation:
      'Implement quality checkpoints and operator training for high-waste departments',
  };
};

export const analyzeTargetAchievement = (filterData: any[], kpiData: any) => {
  const totalProduction = filterData.reduce(
    (sum, item) => sum + (item.production || 0),
    0
  );
  const target = kpiData?.target || 5000;
  const achievement = (totalProduction / target) * 100;

  return {
    totalProduction,
    target,
    achievement: Math.round(achievement),
    status: achievement >= 100 ? 'Exceeded' : 'On Track',
  };
};

export const generateSmartRecommendations = (
  filterData: any[],
  kpiData: any
) => {
  const recommendations: { priority: string; action: string; impact: string }[] = [];

  const qualityAnalysis = analyzeQuality(filterData, kpiData);
  if (qualityAnalysis.wastePercentage > 4) {
    recommendations.push({
      priority: 'critical',
      action: `Implement quality checkpoints in ${qualityAnalysis.topWasteSource} department`,
      impact: `-500 waste units/day (-PKR 3,650)`,
    });
  }

  const targetAnalysis = analyzeTargetAchievement(filterData, kpiData);
  if (targetAnalysis.achievement < 80) {
    recommendations.push({
      priority: 'high',
      action: 'Increase production by optimizing worker allocation',
      impact: `+${Math.round((kpiData?.target - targetAnalysis.totalProduction) / 10)} units/day`,
    });
  }

  const bottlenecks = detectLineBottlenecks(filterData, kpiData);
  const criticalLines = bottlenecks.filter((l) => l.status === 'critical');
  if (criticalLines.length > 0) {
    recommendations.push({
      priority: 'high',
      action: `Fix ${criticalLines.length} critical line bottlenecks`,
      impact: `+15-20% throughput improvement`,
    });
  }

  return recommendations.slice(0, 5);
};