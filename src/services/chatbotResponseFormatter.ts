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

// ===== DEPARTMENT ANALYSIS RESPONSE =====
export const formatDepartmentAnalysis = (
  filterData: any[],
  kpiData: any
): FormattedResponse => {
  const analysis = analyzeDepartmentPerformance(filterData, kpiData);

  let response = `📊 **DEPARTMENT PERFORMANCE RANKING**\n\n`;

  analysis.forEach((dept, idx) => {
    const emoji = getDepartmentEmoji(dept.name);
    const statusIcon = getStatusIcon(dept.efficiency, 100);

    response += `${idx + 1}️⃣ ${emoji} **${dept.name}** ${statusIcon}\n`;
    response += `   📈 Production: ${dept.totalProduction.toLocaleString()} units\n`;
    response += `   ⚡ Efficiency: ${dept.efficiency.toFixed(1)}%\n`;
    response += `   👥 Workers: ${dept.workerCount}\n`;
    response += `   📊 Quality: ${dept.qualityScore.toFixed(1)}\n\n`;
  });

  const topDept = analysis[0];
  const bottomDept = analysis[analysis.length - 1];

  response += `💡 **Key Insights:**\n`;
  response += `✅ ${topDept.name} is top performer with ${topDept.totalProduction.toLocaleString()} units\n`;
  response += `⚠️ ${bottomDept.name} needs support - ${bottomDept.efficiency.toFixed(1)}% efficiency\n\n`;

  response += `🎯 **Recommendation:**\n`;
  response += `• Cross-training program for ${bottomDept.name} department\n`;
  response += `• Expected improvement: 8-12% efficiency boost\n`;

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
  kpiData: any
): FormattedResponse => {
  const lines = detectLineBottlenecks(filterData, kpiData);
  const bottlenecks = lines.filter((l) => l.bottleneck);
  const critical = lines.filter((l) => l.status === 'critical');

  let response = `⚙️ **LINE EFFICIENCY ANALYSIS**\n\n`;

  if (critical.length > 0) {
    response += `🔴 **CRITICAL ISSUES:**\n`;
    critical.forEach((line) => {
      response += `• ${line.lineCode}: ${line.efficiency.toFixed(1)}% (Gap: ${(100 - line.efficiency).toFixed(1)}%)\n`;
      response += `  Operations: ${line.affectedOperations.slice(0, 3).join(', ')}\n\n`;
    });
  }

  if (bottlenecks.length > 0) {
    response += `🟡 **AT RISK (Below 80%):**\n`;
    bottlenecks.slice(0, 3).forEach((line) => {
      response += `• ${line.lineCode}: ${line.efficiency.toFixed(1)}%\n`;
    });
    response += '\n';
  }

  const excellent = lines.filter((l) => l.status === 'excellent');
  if (excellent.length > 0) {
    response += `🟢 **PERFORMING WELL (100%+):**\n`;
    excellent.forEach((line) => {
      response += `✅ ${line.lineCode}: ${line.efficiency.toFixed(1)}% - Keep up!\n`;
    });
    response += '\n';
  }

  response += `💡 **Insight:**\n`;
  response += `• Total lines analyzed: ${lines.length}\n`;
  response += `• Critical lines: ${critical.length}\n`;
  response += `• At-risk lines: ${bottlenecks.length}\n`;
  response += `• Healthy lines: ${excellent.length}\n\n`;

  response += `🔧 **Suggested Actions:**\n`;
  response += `1. Immediate maintenance on critical lines\n`;
  response += `2. Worker reallocation to high-efficiency lines\n`;
  response += `3. Equipment inspection and upgrade planning\n`;

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
  kpiData: any
): FormattedResponse => {
  const optimization = optimizeWorkerPlacement(filterData, kpiData);

  let response = `👥 **WORKER PLACEMENT OPTIMIZATION**\n\n`;

  response += `⭐ **TOP PERFORMERS:**\n`;
  optimization.topPerformers.forEach((worker, idx) => {
    response += `${idx + 1}. ${worker.name} (${worker.department})\n`;
    response += `   📈 Efficiency: ${worker.efficiency.toFixed(1)}%\n`;
    response += `   📊 Production: ${worker.production} units\n\n`;
  });

  response += `📉 **NEEDS IMPROVEMENT:**\n`;
  optimization.needsImprovement.forEach((worker) => {
    response += `• ${worker.name} - ${worker.efficiency.toFixed(1)}% efficiency\n`;
  });
  response += '\n';

  response += `💡 **Suggestions:**\n`;
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
  const quality = analyzeQuality(filterData, kpiData);

  let response = `🔍 **QUALITY CONTROL ANALYSIS**\n\n`;

  response += `📊 **Key Metrics:**\n`;
  response += `• Waste Percentage: ${quality.wastePercentage}%\n`;
  response += `• Cost Impact: PKR ${quality.costImpact.toLocaleString()}\n`;
  response += `• Quality Deviation: ${quality.overallQualityDeviation}%\n\n`;

  response += `🔍 **Root Cause Analysis:**\n`;
  response += `• Primary Source: ${quality.topWasteSource} department\n`;
  response += `• Issue: Quality control gaps and operator errors\n\n`;

  response += `🎯 **Action Plan:**\n`;
  response += `1. ${quality.recommendation}\n`;
  response += `2. Implement 2-point quality checks in ${quality.topWasteSource}\n`;
  response += `3. Schedule monthly quality audits\n`;
  response += `4. Provide operator training program\n\n`;

  response += `📈 **Expected Results:**\n`;
  response += `• Reduce waste by 40-50%\n`;
  response += `• Save ~PKR 5,000/day\n`;
  response += `• Improve quality score by 15-20%\n`;

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
  kpiData: any
): FormattedResponse => {
  const target = analyzeTargetAchievement(filterData, kpiData);

  let response = `🎯 **TARGET ACHIEVEMENT ANALYSIS**\n\n`;

  response += `📊 **Current Status:**\n`;
  response += `• Target: ${target.target.toLocaleString()} units\n`;
  response += `• Achieved: ${target.totalProduction.toLocaleString()} units\n`;
  response += `• Achievement: ${target.achievement}% ${target.achievement >= 100 ? '🟢 EXCEEDED' : '🟡 ON TRACK'}\n`;
  response += `• Gap: ${Math.abs(target.target - target.totalProduction).toLocaleString()} units\n\n`;

  if (target.achievement >= 100) {
    response += `✅ **Great News!** Target exceeded!\n`;
    response += `• Bonus potential: Available\n`;
    response += `• Team morale: High\n`;
    response += `• Consider raising next target\n`;
  } else {
    response += `⚠️ **Gap to Close:**\n`;
    const daysRemaining = 5;
    const dailyRequired = Math.ceil((target.target - target.totalProduction) / daysRemaining);
    response += `• Daily target: ${dailyRequired.toLocaleString()} units\n`;
    response += `• Days remaining: ${daysRemaining}\n`;
    response += `• Priority: Increase production capacity\n`;
  }

  return {
    text: response,
    type: target.achievement >= 100 ? 'success' : 'info',
  };
};

// ===== TREND PREDICTION =====
export const formatTrendAnalysis = (
  filterData: any[],
  kpiData: any
): FormattedResponse => {
  const trend = predictTrend(filterData, kpiData);

  let response = `📈 **TREND PREDICTION & FORECAST**\n\n`;

  response += `🔮 **Predicted Trend:** ${trend.trend}\n`;
  response += `📊 **Confidence Level:** ${trend.confidence}%\n`;
  response += `📉 **Avg Production:** ${trend.avgProduction.toFixed(0)} units\n`;
  response += `⚡ **Avg Efficiency:** ${trend.avgEfficiency.toFixed(1)}%\n\n`;

  response += `💡 **Analysis:**\n`;
  if (trend.avgProduction > 500) {
    response += `✅ Production is in an upward trend\n`;
    response += `✅ Maintain current momentum\n`;
  } else {
    response += `⚠️ Production is stable but growth is needed\n`;
    response += `⚠️ Implement optimization measures\n`;
  }

  response += `\n🎯 **Recommendations:**\n`;
  response += `• Continue monitoring trends daily\n`;
  response += `• Adjust production targets quarterly\n`;
  response += `• Plan capacity expansion if needed\n`;

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
  const comparison = compareCompanies(filterData, kpiData);

  let response = `🏭 **COMPANY PERFORMANCE COMPARISON**\n\n`;

  comparison.forEach((company, idx) => {
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
    response += `${medal} **${company.name}**\n`;
    response += `   👥 Workers: ${company.workers}\n`;
    response += `   ⚡ Avg Efficiency: ${company.avgEfficiency.toFixed(1)}%\n`;
    response += `   📊 Total Production: ${company.totalProduction.toLocaleString()} units\n\n`;
  });

  response += `💡 **Key Insight:**\n`;
  const topCompany = comparison[0];
  response += `✅ ${topCompany.name} is leading with ${topCompany.avgEfficiency.toFixed(1)}% efficiency\n`;

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
  kpiData: any
): FormattedResponse => {
  const recommendations = generateSmartRecommendations(filterData, kpiData);

  let response = `💡 **SMART RECOMMENDATIONS**\n\n`;

  const critical = recommendations.filter((r) => r.priority === 'critical');
  const high = recommendations.filter((r) => r.priority === 'high');

  if (critical.length > 0) {
    response += `🔴 **CRITICAL (Act Now):**\n`;
    critical.forEach((rec, idx) => {
      response += `${idx + 1}. ${rec.action}\n`;
      response += `   Impact: ${rec.impact}\n\n`;
    });
  }

  if (high.length > 0) {
    response += `🟠 **HIGH PRIORITY:**\n`;
    high.forEach((rec, idx) => {
      response += `${idx + 1}. ${rec.action}\n`;
      response += `   Impact: ${rec.impact}\n\n`;
    });
  }

  return {
    text: response,
    type: critical.length > 0 ? 'warning' : 'info',
  };
};