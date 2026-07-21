// chatbotResponseFormatter.ts - Complete Updated File
import {
  analyzeDepartmentPerformance,
  detectLineBottlenecks,
  optimizeWorkerPlacement,
  compareCompanies,
  predictTrend,
  analyzeQuality,
  analyzeTargetAchievement,
  generateSmartRecommendations,
  type DepartmentAnalysis,
  type LineBottleneck,
  type CompanyComparison,
  type TrendAnalysis,
  type QualityAnalysis,
  type TargetAnalysis,
  type Recommendation,
} from './chatbotAnalytics';
import {
  getCompanyName,
  getDepartmentEmoji,
  getStatusIcon,
  formatAnalysisResponse,
} from './chatbotQueryProcessor';

export interface FormattedResponse {
  text: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'analysis';
  chartData?: any;
  showChart?: boolean;
}

// ===== TRANSLATION HELPER =====
const t = (key: string, params?: any): string => {
  const translations: any = {
    deptRanking: '📊 **DEPARTMENT PERFORMANCE RANKING**',
    production: '📈 Production',
    efficiency: '⚡ Efficiency',
    workers: '👥 Workers',
    quality: '📊 Quality',
    keyInsights: '💡 **Key Insights:**',
    topPerformer: 'is top performer with',
    units: 'units',
    needsSupport: 'needs support -',
    recommendation: '🎯 **Recommendation:**',
    crossTraining: '• Cross-training program for',
    deptImprovement: '• Expected improvement: 8-12% efficiency boost',
    lineEfficiency: '⚙️ **LINE EFFICIENCY ANALYSIS**',
    criticalIssues: '🔴 **CRITICAL ISSUES:**',
    gap: 'Gap:',
    atRisk: '🟡 **AT RISK (Below 80%):**',
    performingWell: '🟢 **PERFORMING WELL (100%+):**',
    keepUp: '- Keep up!',
    insight: '💡 **Insight:**',
    totalLines: '• Total lines analyzed:',
    criticalLines: '• Critical lines:',
    atRiskLines: '• At-risk lines:',
    healthyLines: '• Healthy lines:',
    suggestedActions: '🔧 **Suggested Actions:**',
    action1: '1. Immediate maintenance on critical lines',
    action2: '2. Worker reallocation to high-efficiency lines',
    action3: '3. Equipment inspection and upgrade planning',
    workerOptimization: '👥 **WORKER PLACEMENT OPTIMIZATION**',
    topPerformers: '⭐ **TOP PERFORMERS:**',
    needsImprovement: '📉 **NEEDS IMPROVEMENT:**',
    suggestions: '💡 **Suggestions:**',
    qualityControl: '🔍 **QUALITY CONTROL ANALYSIS**',
    keyMetrics: '📊 **Key Metrics:**',
    wastePercentage: '• Waste Percentage:',
    costImpact: '• Cost Impact: PKR',
    qualityDeviation: '• Quality Deviation:',
    rootCause: '🔍 **Root Cause Analysis:**',
    primarySource: '• Primary Source:',
    issue: '• Issue: Quality control gaps and operator errors',
    actionPlan: '🎯 **Action Plan:**',
    qualityChecks: '2. Implement 2-point quality checks in',
    monthlyAudits: '3. Schedule monthly quality audits',
    trainingProgram: '4. Provide operator training program',
    expectedResults: '📈 **Expected Results:**',
    reduceWaste: '• Reduce waste by 40-50%',
    saveCost: '• Save ~PKR 5,000/day',
    improveQuality: '• Improve quality score by 15-20%',
    targetAnalysis: '🎯 **TARGET ACHIEVEMENT ANALYSIS**',
    currentStatus: '📊 **Current Status:**',
    target: '• Target:',
    achieved: '• Achieved:',
    achievement: '• Achievement:',
    exceeded: '🟢 EXCEEDED',
    onTrack: '🟡 ON TRACK',
    gapToClose: '⚠️ **Gap to Close:**',
    dailyTarget: '• Daily target:',
    daysRemaining: '• Days remaining:',
    priority: '• Priority: Increase production capacity',
    greatNews: '✅ **Great News!** Target exceeded!',
    bonusPotential: '• Bonus potential: Available',
    teamMorale: '• Team morale: High',
    raiseTarget: '• Consider raising next target',
    trendPrediction: '📈 **TREND PREDICTION & FORECAST**',
    predictedTrend: '🔮 **Predicted Trend:**',
    confidenceLevel: '📊 **Confidence Level:**',
    avgProduction: '📉 **Avg Production:**',
    avgEfficiency: '⚡ **Avg Efficiency:**',
    analysis: '💡 **Analysis:**',
    upwardTrend: '✅ Production is in an upward trend',
    maintainMomentum: '✅ Maintain current momentum',
    stableGrowth: '⚠️ Production is stable but growth is needed',
    implementOptimization: '⚠️ Implement optimization measures',
    recommendations: '🎯 **Recommendations:**',
    monitorTrends: '• Continue monitoring trends daily',
    adjustTargets: '• Adjust production targets quarterly',
    planCapacity: '• Plan capacity expansion if needed',
    companyComparison: '🏭 **COMPANY PERFORMANCE COMPARISON**',
    keyInsight: '💡 **Key Insight:**',
    leadingWith: 'is leading with',
    smartRecommendations: '💡 **SMART RECOMMENDATIONS**',
    criticalActNow: '🔴 **CRITICAL (Act Now):**',
    highPriority: '🟠 **HIGH PRIORITY:**',
    impact: 'Impact:',
    department: 'department',
    totalEfficiency: '🏭 **TOTAL EFFICIENCY**',
    totalVariance: '📊 **TOTAL VARIANCE**',
    companyComparisonTitle: '🏢 **COMPANY COMPARISON**',
    departmentComparisonTitle: '🏢 **DEPARTMENT COMPARISON**',
  };

  let text = translations[key] || key;
  if (params) {
    Object.keys(params).forEach(k => {
      text = text.replace(`{${k}}`, params[k]);
    });
  }
  return text;
};

// ===== DEPARTMENT ANALYSIS =====
export const formatDepartmentAnalysis = (
  filterData: any[],
  kpiData: any
): FormattedResponse => {
  const analysis: DepartmentAnalysis[] = analyzeDepartmentPerformance(filterData, kpiData);

  let response = `${t('deptRanking')}\n\n`;

  analysis.forEach((dept, idx) => {
    const emoji = getDepartmentEmoji(dept.name);
    const statusIcon = getStatusIcon(dept.efficiency, 100);

    response += `${idx + 1}️⃣ ${emoji} **${dept.name}** ${statusIcon}\n`;
    response += `   ${t('production')}: ${dept.totalProduction.toLocaleString()} ${t('units')}\n`;
    response += `   ${t('efficiency')}: ${dept.efficiency.toFixed(1)}%\n`;
    response += `   ${t('workers')}: ${dept.workerCount}\n`;
    response += `   ${t('quality')}: ${dept.qualityScore.toFixed(1)}\n\n`;
  });

  const topDept = analysis[0];
  const bottomDept = analysis[analysis.length - 1];

  response += `${t('keyInsights')}\n`;
  response += `✅ ${topDept.name} ${t('topPerformer')} ${topDept.totalProduction.toLocaleString()} ${t('units')}\n`;
  response += `⚠️ ${bottomDept.name} ${t('needsSupport')} ${bottomDept.efficiency.toFixed(1)}% ${t('efficiency')}\n\n`;

  response += `${t('recommendation')}\n`;
  response += `${t('crossTraining')} ${bottomDept.name} ${t('department')}\n`;
  response += `${t('deptImprovement')}\n`;

  return {
    text: response,
    type: 'analysis',
    chartData: analysis.map(d => ({ name: d.name, value: d.totalProduction })),
    showChart: true,
  };
};

// ===== LINE BOTTLENECK ANALYSIS =====
export const formatLineBottleneckAnalysis = (
  filterData: any[],
  kpiData: any
): FormattedResponse => {
  const lines: LineBottleneck[] = detectLineBottlenecks(filterData, kpiData);
  const bottlenecks = lines.filter((l) => l.bottleneck);
  const critical = lines.filter((l) => l.status === 'critical');

  let response = `${t('lineEfficiency')}\n\n`;

  if (critical.length > 0) {
    response += `${t('criticalIssues')}\n`;
    critical.forEach((line) => {
      response += `• ${line.lineCode}: ${line.efficiency.toFixed(1)}% (${t('gap')} ${(100 - line.efficiency).toFixed(1)}%)\n`;
      const affected = line.affectedOperations.slice(0, 3);
      if (affected.length > 0) {
        response += `  Operations: ${affected.join(', ')}\n`;
      }
      response += '\n';
    });
  }

  const atRisk = lines.filter(l => l.status === 'critical');
  if (atRisk.length > 0) {
    response += `${t('atRisk')}\n`;
    atRisk.slice(0, 3).forEach((line) => {
      response += `• ${line.lineCode}: ${line.efficiency.toFixed(1)}%\n`;
    });
    response += '\n';
  }

  const excellent = lines.filter((l) => l.status === 'excellent');
  if (excellent.length > 0) {
    response += `${t('performingWell')}\n`;
    excellent.forEach((line) => {
      response += `✅ ${line.lineCode}: ${line.efficiency.toFixed(1)}% ${t('keepUp')}\n`;
    });
    response += '\n';
  }

  response += `${t('insight')}\n`;
  response += `${t('totalLines')} ${lines.length}\n`;
  response += `${t('criticalLines')} ${critical.length}\n`;
  response += `${t('atRiskLines')} ${atRisk.length}\n`;
  response += `${t('healthyLines')} ${excellent.length}\n\n`;

  response += `${t('suggestedActions')}\n`;
  response += `${t('action1')}\n`;
  response += `${t('action2')}\n`;
  response += `${t('action3')}\n`;

  return {
    text: response,
    type: 'analysis',
    chartData: lines.map(l => ({ name: l.lineCode, value: l.efficiency })),
    showChart: true,
  };
};

// ===== WORKER OPTIMIZATION =====
export const formatWorkerOptimization = (
  filterData: any[],
  kpiData: any
): FormattedResponse => {
  const optimization = optimizeWorkerPlacement(filterData, kpiData);

  let response = `${t('workerOptimization')}\n\n`;

  response += `${t('topPerformers')}\n`;
  optimization.topPerformers.forEach((worker, idx) => {
    response += `${idx + 1}. ${worker.name} (${worker.department})\n`;
    response += `   ${t('efficiency')}: ${worker.efficiency.toFixed(1)}%\n`;
    response += `   ${t('production')}: ${worker.production} ${t('units')}\n\n`;
  });

  response += `${t('needsImprovement')}\n`;
  optimization.needsImprovement.forEach((worker) => {
    response += `• ${worker.name} - ${worker.efficiency.toFixed(1)}% ${t('efficiency')}\n`;
  });
  response += '\n';

  response += `${t('suggestions')}\n`;
  optimization.suggestions.forEach((suggestion) => {
    response += `• ${suggestion}\n`;
  });

  return {
    text: response,
    type: 'analysis',
    chartData: optimization.topPerformers,
    showChart: true,
  };
};

// ===== QUALITY ANALYSIS =====
export const formatQualityAnalysis = (
  filterData: any[],
  kpiData: any
): FormattedResponse => {
  const quality: QualityAnalysis = analyzeQuality(filterData, kpiData);

  let response = `${t('qualityControl')}\n\n`;

  response += `${t('keyMetrics')}\n`;
  response += `${t('wastePercentage')} ${quality.wastePercentage}%\n`;
  response += `${t('costImpact')} ${quality.costImpact.toLocaleString()}\n`;
  response += `${t('qualityDeviation')} ${quality.overallQualityDeviation}%\n\n`;

  response += `${t('rootCause')}\n`;
  response += `${t('primarySource')} ${quality.topWasteSource} ${t('department')}\n`;
  response += `${t('issue')}\n\n`;

  response += `${t('actionPlan')}\n`;
  response += `1. ${quality.recommendation}\n`;
  response += `${t('qualityChecks')} ${quality.topWasteSource}\n`;
  response += `${t('monthlyAudits')}\n`;
  response += `${t('trainingProgram')}\n\n`;

  response += `${t('expectedResults')}\n`;
  response += `${t('reduceWaste')}\n`;
  response += `${t('saveCost')}\n`;
  response += `${t('improveQuality')}\n`;

  return {
    text: response,
    type: 'analysis',
    chartData: quality,
    showChart: false,
  };
};

// ===== TARGET ANALYSIS =====
export const formatTargetAnalysis = (
  filterData: any[],
  kpiData: any
): FormattedResponse => {
  const target: TargetAnalysis = analyzeTargetAchievement(filterData, kpiData);

  let response = `${t('targetAnalysis')}\n\n`;

  response += `${t('currentStatus')}\n`;
  response += `${t('target')} ${target.target.toLocaleString()} ${t('units')}\n`;
  response += `${t('achieved')} ${target.totalProduction.toLocaleString()} ${t('units')}\n`;
  response += `${t('achievement')} ${target.achievement}% ${target.achievement >= 100 ? t('exceeded') : t('onTrack')}\n`;
  response += `• ${t('gap')} ${Math.abs(target.target - target.totalProduction).toLocaleString()} ${t('units')}\n\n`;

  if (target.achievement >= 100) {
    response += `${t('greatNews')}\n`;
    response += `${t('bonusPotential')}\n`;
    response += `${t('teamMorale')}\n`;
    response += `${t('raiseTarget')}\n`;
  } else {
    response += `${t('gapToClose')}\n`;
    const daysRemaining = 5;
    const dailyRequired = Math.ceil((target.target - target.totalProduction) / daysRemaining);
    response += `${t('dailyTarget')} ${dailyRequired.toLocaleString()} ${t('units')}\n`;
    response += `${t('daysRemaining')} ${daysRemaining}\n`;
    response += `${t('priority')}\n`;
  }

  return {
    text: response,
    type: target.achievement >= 100 ? 'success' : 'info',
  };
};

// ===== TREND ANALYSIS =====
export const formatTrendAnalysis = (
  filterData: any[],
  kpiData: any
): FormattedResponse => {
  const trend: TrendAnalysis = predictTrend(filterData, kpiData);

  let response = `${t('trendPrediction')}\n\n`;

  response += `${t('predictedTrend')} ${trend.trend}\n`;
  response += `${t('confidenceLevel')} ${trend.confidence}%\n`;
  response += `${t('avgProduction')} ${trend.avgProduction.toFixed(0)} ${t('units')}\n`;
  response += `${t('avgEfficiency')} ${trend.avgEfficiency.toFixed(1)}%\n\n`;

  response += `${t('analysis')}\n`;
  if (trend.avgProduction > 500) {
    response += `${t('upwardTrend')}\n`;
    response += `${t('maintainMomentum')}\n`;
  } else {
    response += `${t('stableGrowth')}\n`;
    response += `${t('implementOptimization')}\n`;
  }

  response += `\n${t('recommendations')}\n`;
  response += `${t('monitorTrends')}\n`;
  response += `${t('adjustTargets')}\n`;
  response += `${t('planCapacity')}\n`;

  return {
    text: response,
    type: 'info',
  };
};

// ===== COMPANY COMPARISON =====
export const formatCompanyComparison = (
  filterData: any[],
  kpiData: any
): FormattedResponse => {
  const comparison: CompanyComparison[] = compareCompanies(filterData, kpiData);

  let response = `${t('companyComparison')}\n\n`;

  comparison.forEach((company, idx) => {
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
    response += `${medal} **${company.name}**\n`;
    response += `   ${t('workers')}: ${company.workers}\n`;
    response += `   ${t('efficiency')}: ${company.avgEfficiency.toFixed(1)}%\n`;
    response += `   ${t('production')}: ${company.totalProduction.toLocaleString()} ${t('units')}\n\n`;
  });

  response += `${t('keyInsight')}\n`;
  const topCompany = comparison[0];
  response += `✅ ${topCompany.name} ${t('leadingWith')} ${topCompany.avgEfficiency.toFixed(1)}% ${t('efficiency')}\n`;

  return {
    text: response,
    type: 'analysis',
    chartData: comparison.map(c => ({ name: c.name, value: c.totalProduction })),
    showChart: true,
  };
};

// ===== SMART RECOMMENDATIONS =====
export const formatSmartRecommendations = (
  filterData: any[],
  kpiData: any
): FormattedResponse => {
  const recommendations: Recommendation[] = generateSmartRecommendations(filterData, kpiData);

  let response = `${t('smartRecommendations')}\n\n`;

  const critical = recommendations.filter((r) => r.priority === 'critical');
  const high = recommendations.filter((r) => r.priority === 'high');

  if (critical.length > 0) {
    response += `${t('criticalActNow')}\n`;
    critical.forEach((rec, idx) => {
      response += `${idx + 1}. ${rec.action}\n`;
      response += `   ${t('impact')}: ${rec.impact}\n\n`;
    });
  }

  if (high.length > 0) {
    response += `${t('highPriority')}\n`;
    high.forEach((rec, idx) => {
      response += `${idx + 1}. ${rec.action}\n`;
      response += `   ${t('impact')}: ${rec.impact}\n\n`;
    });
  }

  if (critical.length === 0 && high.length === 0) {
    response += '✅ **All systems running optimally!**\n\n';
    response += '💡 **Suggestions for continuous improvement:**\n';
    response += '• Continue monitoring KPIs daily\n';
    response += '• Regular team performance reviews\n';
    response += '• Explore new process optimization techniques\n';
  }

  return {
    text: response,
    type: critical.length > 0 ? 'warning' : 'info',
  };
};