// ChatBot Response Formatter
// Formats all responses in beautiful, rich format with emojis and insights
// ......................chatbotResponseFormatter.ts file .............................
import {
  analyzeDepartmentPerformance,
  detectLineBottlenecks,
  optimizeWorkerPlacement,
  compareCompanies,
  predictTrend,
  analyzeQuality,
  analyzeTargetAchievement,
  generateSmartRecommendations,
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

// ===== TRANSLATION HELPER (Roman Urdu) =====
const t = (key: string, params?: any, lang: 'en' | 'ur' = 'en'): string => {
  const translations: any = {
    en: {
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
    },
    ur: {
      deptRanking: '📊 **DEPARTMENT PERFORMANCE RANKING**',
      production: '📈 Production',
      efficiency: '⚡ Efficiency',
      workers: '👥 Workers',
      quality: '📊 Quality',
      keyInsights: '💡 **Key Insights:**',
      topPerformer: 'top performer hai',
      units: 'units',
      needsSupport: 'ko support chahiye -',
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
      action1: '1. Critical lines par immediate maintenance',
      action2: '2. High-efficiency lines par worker reallocation',
      action3: '3. Equipment inspection aur upgrade planning',
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
      monthlyAudits: '3. Monthly quality audits schedule karein',
      trainingProgram: '4. Operator training program provide karein',
      expectedResults: '📈 **Expected Results:**',
      reduceWaste: '• Waste 40-50% reduce karein',
      saveCost: '• ~PKR 5,000/day save karein',
      improveQuality: '• Quality score 15-20% improve karein',
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
      priority: '• Priority: Production capacity increase karein',
      greatNews: '✅ **Great News!** Target exceeded!',
      bonusPotential: '• Bonus potential: Available',
      teamMorale: '• Team morale: High',
      raiseTarget: '• Next target raise karne par ghoor karein',
      trendPrediction: '📈 **TREND PREDICTION & FORECAST**',
      predictedTrend: '🔮 **Predicted Trend:**',
      confidenceLevel: '📊 **Confidence Level:**',
      avgProduction: '📉 **Avg Production:**',
      avgEfficiency: '⚡ **Avg Efficiency:**',
      analysis: '💡 **Analysis:**',
      upwardTrend: '✅ Production upward trend mein hai',
      maintainMomentum: '✅ Current momentum maintain karein',
      stableGrowth: '⚠️ Production stable hai lekin growth zaroori hai',
      implementOptimization: '⚠️ Optimization measures implement karein',
      recommendations: '🎯 **Recommendations:**',
      monitorTrends: '• Daily trends monitor karte rahein',
      adjustTargets: '• Production targets quarterly adjust karein',
      planCapacity: '• Capacity expansion plan karein agar zaroorat ho',
      companyComparison: '🏭 **COMPANY PERFORMANCE COMPARISON**',
      keyInsight: '💡 **Key Insight:**',
      leadingWith: 'leading hai',
      smartRecommendations: '💡 **SMART RECOMMENDATIONS**',
      criticalActNow: '🔴 **CRITICAL (Act Now):**',
      highPriority: '🟠 **HIGH PRIORITY:**',
      impact: 'Impact:',
    }
  };

  let text = translations[lang]?.[key] || translations.en[key] || key;
  if (params) {
    Object.keys(params).forEach(k => {
      text = text.replace(`{${k}}`, params[k]);
    });
  }
  return text;
};

// ===== DEPARTMENT ANALYSIS RESPONSE =====
export const formatDepartmentAnalysis = (
  filterData: any[],
  kpiData: any,
  lang: 'en' | 'ur' = 'en'
): FormattedResponse => {
  const analysis = analyzeDepartmentPerformance(filterData, kpiData);

  let response = `${t('deptRanking', undefined, lang)}\n\n`;

  analysis.forEach((dept, idx) => {
    const emoji = getDepartmentEmoji(dept.name);
    const statusIcon = getStatusIcon(dept.efficiency, 100);

    response += `${idx + 1}️⃣ ${emoji} **${dept.name}** ${statusIcon}\n`;
    response += `   ${t('production', undefined, lang)}: ${dept.totalProduction.toLocaleString()} ${t('units', undefined, lang)}\n`;
    response += `   ${t('efficiency', undefined, lang)}: ${dept.efficiency.toFixed(1)}%\n`;
    response += `   ${t('workers', undefined, lang)}: ${dept.workerCount}\n`;
    response += `   ${t('quality', undefined, lang)}: ${dept.qualityScore.toFixed(1)}\n\n`;
  });

  const topDept = analysis[0];
  const bottomDept = analysis[analysis.length - 1];

  response += `${t('keyInsights', undefined, lang)}\n`;
  response += `✅ ${topDept.name} ${t('topPerformer', undefined, lang)} ${topDept.totalProduction.toLocaleString()} ${t('units', undefined, lang)}\n`;
  response += `⚠️ ${bottomDept.name} ${t('needsSupport', undefined, lang)} ${bottomDept.efficiency.toFixed(1)}% ${t('efficiency', undefined, lang)}\n\n`;

  response += `${t('recommendation', undefined, lang)}\n`;
  response += `${t('crossTraining', undefined, lang)} ${bottomDept.name} ${t('department', undefined, lang)}\n`;
  response += `${t('deptImprovement', undefined, lang)}\n`;

  return {
    text: response,
    type: 'analysis',
    chartData: analysis,
    showChart: true,
  };
};

// ===== LINE BOTTLENECK ANALYSIS =====
export const formatLineBottleneckAnalysis = (
  filterData: any[],
  kpiData: any,
  lang: 'en' | 'ur' = 'en'
): FormattedResponse => {
  const lines = detectLineBottlenecks(filterData, kpiData);
  const bottlenecks = lines.filter((l) => l.bottleneck);
  const critical = lines.filter((l) => l.status === 'critical');

  let response = `${t('lineEfficiency', undefined, lang)}\n\n`;

  if (critical.length > 0) {
    response += `${t('criticalIssues', undefined, lang)}\n`;
    critical.forEach((line) => {
      response += `• ${line.lineCode}: ${line.efficiency.toFixed(1)}% (${t('gap', undefined, lang)} ${(100 - line.efficiency).toFixed(1)}%)\n`;
      response += `  Operations: ${line.affectedOperations.slice(0, 3).join(', ')}\n\n`;
    });
  }

  if (bottlenecks.length > 0) {
    response += `${t('atRisk', undefined, lang)}\n`;
    bottlenecks.slice(0, 3).forEach((line) => {
      response += `• ${line.lineCode}: ${line.efficiency.toFixed(1)}%\n`;
    });
    response += '\n';
  }

  const excellent = lines.filter((l) => l.status === 'excellent');
  if (excellent.length > 0) {
    response += `${t('performingWell', undefined, lang)}\n`;
    excellent.forEach((line) => {
      response += `✅ ${line.lineCode}: ${line.efficiency.toFixed(1)}% ${t('keepUp', undefined, lang)}\n`;
    });
    response += '\n';
  }

  response += `${t('insight', undefined, lang)}\n`;
  response += `${t('totalLines', undefined, lang)} ${lines.length}\n`;
  response += `${t('criticalLines', undefined, lang)} ${critical.length}\n`;
  response += `${t('atRiskLines', undefined, lang)} ${bottlenecks.length}\n`;
  response += `${t('healthyLines', undefined, lang)} ${excellent.length}\n\n`;

  response += `${t('suggestedActions', undefined, lang)}\n`;
  response += `${t('action1', undefined, lang)}\n`;
  response += `${t('action2', undefined, lang)}\n`;
  response += `${t('action3', undefined, lang)}\n`;

  return {
    text: response,
    type: 'analysis',
    chartData: lines,
    showChart: true,
  };
};

// ===== WORKER OPTIMIZATION =====
export const formatWorkerOptimization = (
  filterData: any[],
  kpiData: any,
  lang: 'en' | 'ur' = 'en'
): FormattedResponse => {
  const optimization = optimizeWorkerPlacement(filterData, kpiData);

  let response = `${t('workerOptimization', undefined, lang)}\n\n`;

  response += `${t('topPerformers', undefined, lang)}\n`;
  optimization.topPerformers.forEach((worker, idx) => {
    response += `${idx + 1}. ${worker.name} (${worker.department})\n`;
    response += `   ${t('efficiency', undefined, lang)}: ${worker.efficiency.toFixed(1)}%\n`;
    response += `   ${t('production', undefined, lang)}: ${worker.production} ${t('units', undefined, lang)}\n\n`;
  });

  response += `${t('needsImprovement', undefined, lang)}\n`;
  optimization.needsImprovement.forEach((worker) => {
    response += `• ${worker.name} - ${worker.efficiency.toFixed(1)}% ${t('efficiency', undefined, lang)}\n`;
  });
  response += '\n';

  response += `${t('suggestions', undefined, lang)}\n`;
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
  kpiData: any,
  lang: 'en' | 'ur' = 'en'
): FormattedResponse => {
  const quality = analyzeQuality(filterData, kpiData);

  let response = `${t('qualityControl', undefined, lang)}\n\n`;

  response += `${t('keyMetrics', undefined, lang)}\n`;
  response += `${t('wastePercentage', undefined, lang)} ${quality.wastePercentage}%\n`;
  response += `${t('costImpact', undefined, lang)} ${quality.costImpact.toLocaleString()}\n`;
  response += `${t('qualityDeviation', undefined, lang)} ${quality.overallQualityDeviation}%\n\n`;

  response += `${t('rootCause', undefined, lang)}\n`;
  response += `${t('primarySource', undefined, lang)} ${quality.topWasteSource} ${t('department', undefined, lang)}\n`;
  response += `${t('issue', undefined, lang)}\n\n`;

  response += `${t('actionPlan', undefined, lang)}\n`;
  response += `1. ${quality.recommendation}\n`;
  response += `${t('qualityChecks', undefined, lang)} ${quality.topWasteSource}\n`;
  response += `${t('monthlyAudits', undefined, lang)}\n`;
  response += `${t('trainingProgram', undefined, lang)}\n\n`;

  response += `${t('expectedResults', undefined, lang)}\n`;
  response += `${t('reduceWaste', undefined, lang)}\n`;
  response += `${t('saveCost', undefined, lang)}\n`;
  response += `${t('improveQuality', undefined, lang)}\n`;

  return {
    text: response,
    type: 'analysis',
    chartData: quality,
    showChart: false,
  };
};

// ===== TARGET ACHIEVEMENT =====
export const formatTargetAnalysis = (
  filterData: any[],
  kpiData: any,
  lang: 'en' | 'ur' = 'en'
): FormattedResponse => {
  const target = analyzeTargetAchievement(filterData, kpiData);

  let response = `${t('targetAnalysis', undefined, lang)}\n\n`;

  response += `${t('currentStatus', undefined, lang)}\n`;
  response += `${t('target', undefined, lang)} ${target.target.toLocaleString()} ${t('units', undefined, lang)}\n`;
  response += `${t('achieved', undefined, lang)} ${target.totalProduction.toLocaleString()} ${t('units', undefined, lang)}\n`;
  response += `${t('achievement', undefined, lang)} ${target.achievement}% ${target.achievement >= 100 ? t('exceeded', undefined, lang) : t('onTrack', undefined, lang)}\n`;
  response += `• ${t('gap', undefined, lang)} ${Math.abs(target.target - target.totalProduction).toLocaleString()} ${t('units', undefined, lang)}\n\n`;

  if (target.achievement >= 100) {
    response += `${t('greatNews', undefined, lang)}\n`;
    response += `${t('bonusPotential', undefined, lang)}\n`;
    response += `${t('teamMorale', undefined, lang)}\n`;
    response += `${t('raiseTarget', undefined, lang)}\n`;
  } else {
    response += `${t('gapToClose', undefined, lang)}\n`;
    const daysRemaining = 5;
    const dailyRequired = Math.ceil((target.target - target.totalProduction) / daysRemaining);
    response += `${t('dailyTarget', undefined, lang)} ${dailyRequired.toLocaleString()} ${t('units', undefined, lang)}\n`;
    response += `${t('daysRemaining', undefined, lang)} ${daysRemaining}\n`;
    response += `${t('priority', undefined, lang)}\n`;
  }

  return {
    text: response,
    type: target.achievement >= 100 ? 'success' : 'info',
  };
};

// ===== TREND PREDICTION =====
export const formatTrendAnalysis = (
  filterData: any[],
  kpiData: any,
  lang: 'en' | 'ur' = 'en'
): FormattedResponse => {
  const trend = predictTrend(filterData, kpiData);

  let response = `${t('trendPrediction', undefined, lang)}\n\n`;

  response += `${t('predictedTrend', undefined, lang)} ${trend.trend}\n`;
  response += `${t('confidenceLevel', undefined, lang)} ${trend.confidence}%\n`;
  response += `${t('avgProduction', undefined, lang)} ${trend.avgProduction.toFixed(0)} ${t('units', undefined, lang)}\n`;
  response += `${t('avgEfficiency', undefined, lang)} ${trend.avgEfficiency.toFixed(1)}%\n\n`;

  response += `${t('analysis', undefined, lang)}\n`;
  if (trend.avgProduction > 500) {
    response += `${t('upwardTrend', undefined, lang)}\n`;
    response += `${t('maintainMomentum', undefined, lang)}\n`;
  } else {
    response += `${t('stableGrowth', undefined, lang)}\n`;
    response += `${t('implementOptimization', undefined, lang)}\n`;
  }

  response += `\n${t('recommendations', undefined, lang)}\n`;
  response += `${t('monitorTrends', undefined, lang)}\n`;
  response += `${t('adjustTargets', undefined, lang)}\n`;
  response += `${t('planCapacity', undefined, lang)}\n`;

  return {
    text: response,
    type: 'info',
  };
};

// ===== COMPANY COMPARISON =====
export const formatCompanyComparison = (
  filterData: any[],
  kpiData: any,
  lang: 'en' | 'ur' = 'en'
): FormattedResponse => {
  const comparison = compareCompanies(filterData, kpiData);

  let response = `${t('companyComparison', undefined, lang)}\n\n`;

  comparison.forEach((company, idx) => {
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
    response += `${medal} **${company.name}**\n`;
    response += `   ${t('workers', undefined, lang)}: ${company.workers}\n`;
    response += `   ${t('efficiency', undefined, lang)}: ${company.avgEfficiency.toFixed(1)}%\n`;
    response += `   ${t('production', undefined, lang)}: ${company.totalProduction.toLocaleString()} ${t('units', undefined, lang)}\n\n`;
  });

  response += `${t('keyInsight', undefined, lang)}\n`;
  const topCompany = comparison[0];
  response += `✅ ${topCompany.name} ${t('leadingWith', undefined, lang)} ${topCompany.avgEfficiency.toFixed(1)}% ${t('efficiency', undefined, lang)}\n`;

  return {
    text: response,
    type: 'analysis',
    chartData: comparison,
    showChart: true,
  };
};

// ===== SMART RECOMMENDATIONS =====
export const formatSmartRecommendations = (
  filterData: any[],
  kpiData: any,
  lang: 'en' | 'ur' = 'en'
): FormattedResponse => {
  const recommendations = generateSmartRecommendations(filterData, kpiData);

  let response = `${t('smartRecommendations', undefined, lang)}\n\n`;

  const critical = recommendations.filter((r) => r.priority === 'critical');
  const high = recommendations.filter((r) => r.priority === 'high');

  if (critical.length > 0) {
    response += `${t('criticalActNow', undefined, lang)}\n`;
    critical.forEach((rec, idx) => {
      response += `${idx + 1}. ${rec.action}\n`;
      response += `   ${t('impact', undefined, lang)}: ${rec.impact}\n\n`;
    });
  }

  if (high.length > 0) {
    response += `${t('highPriority', undefined, lang)}\n`;
    high.forEach((rec, idx) => {
      response += `${idx + 1}. ${rec.action}\n`;
      response += `   ${t('impact', undefined, lang)}: ${rec.impact}\n\n`;
    });
  }

  return {
    text: response,
    type: critical.length > 0 ? 'warning' : 'info',
  };
};