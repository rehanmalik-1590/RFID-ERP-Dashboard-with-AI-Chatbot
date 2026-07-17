// ....Graph.tsx file .......................
import {BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,Cell,PieChart,Pie,Legend,ScatterChart,Scatter,Line} from 'recharts';
import { Box, Paper, Typography, CircularProgress, Chip, Alert, FormControl, InputLabel, Select, MenuItem, Button,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,LinearProgress,} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useState, useMemo, useEffect } from 'react';

import { 
  useWorkersPerformance, 
  useGetAllData, 
  usegetDepartmentWise, 
  usegetDailyTrend, 
  useGetLineEfficiency,
  useGetLineOperationScanning,
  useGetTopAndLowLinePerformance
} from '../services/api';

interface GraphProps {
  date_from: string;
  date_to: string;
  filters?: any;  
}

interface WorkerPerformance {
  WorkerCode: string;
  production_qty: number;
}

interface DepartmentData {
  department_name: string;
  total_production: number;
}

interface DailyTrendData {
  scanning_date: string;
  actual: number;
  target: number;
  efficiency: number;
}

interface LineEfficiencyData {
  company_id: string;
  branch_id: string;
  line_code: string;
  actual: number;
  target: number;
  efficiency: number;
}

interface LineOperationData {
  company_id: string;
  branch_id: string;
  line_code: string;
  operation_id: number;
  operation_description: string;
  actual: number;
  target: number;
  efficiency: number;
}

interface TopLowLineOperationData {
  line_id: number;
  line_code: string;
  operation_id: number;
  operation_description: string;
  production_qty: number;
}

const Graph = ({ date_from, date_to }: GraphProps) => {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  
  // State for selected from and to dates
  const [selectedFromDate, setSelectedFromDate] = useState<string>(date_from);
  const [selectedToDate, setSelectedToDate] = useState<string>(date_to);
  const [tempFromDate, setTempFromDate] = useState<string>(date_from);
  const [tempToDate, setTempToDate] = useState<string>(date_to);
  
  // State for line operation filter
  const [selectedLine, setSelectedLine] = useState<string>('all');
  const [viewMode, setViewMode] = useState<string>('table');
  
  // Update local state when props change
  useEffect(() => {
    setSelectedFromDate(date_from);
    setSelectedToDate(date_to);
    setTempFromDate(date_from);
    setTempToDate(date_to);
  }, [date_from, date_to]);
  
  // All API calls using props directly
  const { data: allData } = useGetAllData(date_from, date_to);
  const { data: departmentData, isLoading: deptLoading } = usegetDepartmentWise(date_from, date_to);
  const { data: dailyTrendData, isLoading: trendLoading } = usegetDailyTrend(selectedFromDate, selectedToDate);
  const { data: lineEfficiencyData, isLoading: lineLoading } = useGetLineEfficiency(date_from, date_to);
  const { data: lineOperationData, isLoading: operationLoading } = useGetLineOperationScanning(date_from, date_to);
  
  // New API calls for Top and Low Line Operations
  const { data: topLineOperationData, isLoading: topLineLoading } = useGetTopAndLowLinePerformance('top', date_from, date_to);
  const { data: lowLineOperationData, isLoading: lowLineLoading } = useGetTopAndLowLinePerformance('low', date_from, date_to);

  const { 
    data: topWorkers, 
    isLoading: topLoading,
    error: topError 
  } = useWorkersPerformance('top', date_from, date_to);
  
  const { 
    data: lowWorkers, 
    isLoading: lowLoading,
    error: lowError 
  } = useWorkersPerformance('low', date_from, date_to);

  // Colors for Pie Chart - FIXED
  const COLORS = {
    'CUTTING': '#2e7d32',      
    'SEWING': '#ed6c02',        
    'FINISHING': '#1976d2',     
    'DEFAULT': '#9c27b0'       
  };

  // Colors for Line Efficiency Horizontal Bar Chart
  const LINE_BAR_COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#0288d1', '#7b1fa2', '#00796b'];

  // Colors for Top and Low Line Operation Charts
  const TOP_LINE_COLORS = ['#2e7d32', '#1976d2', '#9c27b0', '#0288d1', '#00796b'];
  const LOW_LINE_COLORS = ['#d32f2f', '#ed6c02', '#ff9800', '#f44336', '#ff5722'];

  // Worker details map
  const workerDetailsMap = useMemo(() => {
    const map = new Map();
    
    if (allData && Array.isArray(allData)) {
      allData.forEach((item: any) => {
        const code = item.WorkerCode;
        if (code) {
          const trimmedCode = code.toString().trim();
          if (!map.has(trimmedCode)) {
            map.set(trimmedCode, {
              WorkerDescription: item.WorkerDescription || item.WorkerName || trimmedCode,
              CompanyId: item.CompanyId || 'N/A',
              BrId: item.BrId || 'N/A',
              DepartmentName: item.DepartmentName || 'N/A'
            });
          }
        }
      });
    }
    return map;
  }, [allData]);

  // Filter data based on selected from and to dates
  const filteredTrendData = useMemo(() => {
    if (!dailyTrendData || !Array.isArray(dailyTrendData)) return [];
    
    return dailyTrendData.filter((item: any) => {
      const itemDate = new Date(item.scanning_date);
      const fromDate = new Date(selectedFromDate);
      const toDate = new Date(selectedToDate);
      return itemDate >= fromDate && itemDate <= toDate;
    });
  }, [dailyTrendData, selectedFromDate, selectedToDate]);

  // Sort line efficiency data by actual production (descending)
  const sortedLineData = useMemo(() => {
    if (!lineEfficiencyData || !Array.isArray(lineEfficiencyData)) return [];
    
    return [...lineEfficiencyData].sort((a, b) => b.actual - a.actual);
  }, [lineEfficiencyData]);

  // Get unique line codes for dropdown
  const lineOptions = useMemo(() => {
    if (!lineOperationData || !Array.isArray(lineOperationData)) return [];
    
    const lines = [...new Set(lineOperationData.map(item => item.line_code))];
    return lines.sort();
  }, [lineOperationData]);

  // Filter line operation data based on selected line
  const filteredOperationData = useMemo(() => {
    if (!lineOperationData || !Array.isArray(lineOperationData)) return [];
    
    if (selectedLine === 'all') {
      return lineOperationData;
    }
    return lineOperationData.filter(item => item.line_code === selectedLine);
  }, [lineOperationData, selectedLine]);

  // Sort operation data by actual production for chart
  const sortedOperationData = useMemo(() => {
    return [...filteredOperationData].sort((a, b) => b.actual - a.actual);
  }, [filteredOperationData]);

  // Process Top Line Operation Data for horizontal bar chart
  const processedTopLineData = useMemo(() => {
    if (!topLineOperationData || !Array.isArray(topLineOperationData)) return [];
    
    return topLineOperationData.map(item => ({
      ...item,
      displayName: `${item.line_code} - Op${item.operation_id}`,
      fullDescription: `${item.line_code} - ${item.operation_description}`
    }));
  }, [topLineOperationData]);

  // Process Low Line Operation Data for horizontal bar chart
  const processedLowLineData = useMemo(() => {
    if (!lowLineOperationData || !Array.isArray(lowLineOperationData)) return [];
    
    return lowLineOperationData.map(item => ({
      ...item,
      displayName: `${item.line_code} - Op${item.operation_id}`,
      fullDescription: `${item.line_code} - ${item.operation_description}`
    }));
  }, [lowLineOperationData]);

  // Generate date options (from 1 Feb to 2 March 2026)
  const dateOptions = useMemo(() => {
    const options = [];
    const startDate = new Date('2026-02-01');
    const endDate = new Date('2026-03-02');
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      options.push(dateStr);
    }
    return options;
  }, []);

  // Handle apply button click
  const handleApplyRange = () => {
    setSelectedFromDate(tempFromDate);
    setSelectedToDate(tempToDate);
  };

  // Handle line change
  const handleLineChange = (event: any) => {
    setSelectedLine(event.target.value);
  };

  // Custom Tooltip for Bar Chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    
    const data = payload[0].payload;
    const workerCode = data.WorkerCode?.toString().trim();
    const details = workerDetailsMap.get(workerCode);
    
    return (
      <Paper sx={{ p: 1.5, bgcolor: '#212121', color: 'white', minWidth: 200 }}>
        <Typography variant="subtitle2" sx={{ borderBottom: '1px solid #424242', pb: 0.5, fontSize: '0.75rem' }}>
          Worker Details
        </Typography>
        <Box sx={{ mt: 0.5 }}>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Code: {workerCode}</Typography>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Name: {details?.WorkerDescription || 'N/A'}</Typography>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Company: {details?.CompanyId || 'N/A'}</Typography>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Branch: {details?.BrId || 'N/A'}</Typography>
        </Box>
        <Box sx={{ mt: 0.5, pt: 0.5, borderTop: '1px solid #424242' }}>
          <Typography variant="body2" color="#ffd700" sx={{ fontSize: '0.75rem' }}>
            Production: {data.production_qty?.toLocaleString() || 0} Qty
          </Typography>
        </Box>
      </Paper>
    );
  };

  // Custom Tooltip for Pie Chart
  const PieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    
    const data = payload[0].payload;
    return (
      <Paper sx={{ p: 1.5, bgcolor: '#212121', color: 'white' }}>
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{data.department_name}</Typography>
        <Typography variant="body2" color="#ffd700" sx={{ fontSize: '0.75rem' }}>
          Production: {data.total_production.toLocaleString()} Qty
        </Typography>
      </Paper>
    );
  };

  // Custom Tooltip for Scatter Chart
  const ScatterTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    
    const data = payload[0].payload;
    
    return (
      <Paper sx={{ p: 1.5, bgcolor: '#212121', color: 'white', minWidth: 180 }}>
        <Typography variant="subtitle2" sx={{ borderBottom: '1px solid #424242', pb: 0.5, fontSize: '0.75rem' }}>
          {data.scanning_date}
        </Typography>
        <Box sx={{ mt: 0.5 }}>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Actual: {data.actual?.toLocaleString() || 0}</Typography>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Target: {data.target?.toLocaleString() || 0}</Typography>
          <Typography variant="h6" color="#ffd700" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
            Efficiency: {data.efficiency || 0}%
          </Typography>
        </Box>
      </Paper>
    );
  };

  // Custom Tooltip for Line Efficiency Horizontal Bar
  const LineBarTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    
    const data = payload[0].payload;
    
    return (
      <Paper sx={{ p: 1.5, bgcolor: '#212121', color: 'white', minWidth: 200 }}>
        <Typography variant="subtitle2" sx={{ borderBottom: '1px solid #424242', pb: 0.5, fontSize: '0.75rem' }}>
          Line Details
        </Typography>
        <Box sx={{ mt: 0.5 }}>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Line: {data.line_code}</Typography>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Company: {data.company_id}</Typography>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Branch: {data.branch_id}</Typography>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Actual: {data.actual?.toLocaleString() || 0}</Typography>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Target: {data.target?.toLocaleString() || 0}</Typography>
          <Typography variant="body2" color="#ffd700" sx={{ fontSize: '0.75rem' }}>Efficiency: {data.efficiency || 0}%</Typography>
        </Box>
      </Paper>
    );
  };

  // Custom Tooltip for Operation Bar Chart
  const OperationTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    
    const data = payload[0].payload;
    
    return (
      <Paper sx={{ p: 1.5, bgcolor: '#212121', color: 'white', minWidth: 250 }}>
        <Typography variant="subtitle2" sx={{ borderBottom: '1px solid #424242', pb: 0.5, fontSize: '0.75rem' }}>
          Operation Details
        </Typography>
        <Box sx={{ mt: 0.5 }}>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Operation: {data.operation_id}</Typography>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Description: {data.operation_description}</Typography>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Line: {data.line_code}</Typography>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Company: {data.company_id}</Typography>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Branch: {data.branch_id}</Typography>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Actual: {data.actual?.toLocaleString() || 0}</Typography>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Target: {data.target?.toLocaleString() || 0}</Typography>
          <Box sx={{ mt: 0.5 }}>
            <Typography variant="body2" color="#ffd700" sx={{ fontSize: '0.75rem' }}>Efficiency: {data.efficiency?.toFixed(2) || 0}%</Typography>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(data.efficiency || 0, 100)} 
              sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
            />
          </Box>
        </Box>
      </Paper>
    );
  };

  // Custom Tooltip for Top/Low Line Operation
  const TopLowLineTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    
    const data = payload[0].payload;
    
    return (
      <Paper sx={{ p: 1.5, bgcolor: '#212121', color: 'white', minWidth: 250 }}>
        <Typography variant="subtitle2" sx={{ borderBottom: '1px solid #424242', pb: 0.5, fontSize: '0.75rem' }}>
          Line Operation Details
        </Typography>
        <Box sx={{ mt: 0.5 }}>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Line ID: {data.line_id}</Typography>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Line Code: {data.line_code}</Typography>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Operation ID: {data.operation_id}</Typography>
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Description: {data.operation_description}</Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: '#ffd700', fontSize: '0.75rem' }}>
            Production: {data.production_qty?.toLocaleString() || 0} Qty
          </Typography>
        </Box>
      </Paper>
    );
  };

  // Show loading state
  if ((topLoading && !topWorkers) || (lowLoading && !lowWorkers) || (deptLoading && !departmentData) || (trendLoading && !dailyTrendData) || (lineLoading && !lineEfficiencyData) || (operationLoading && !lineOperationData) || (topLineLoading && !topLineOperationData) || (lowLineLoading && !lowLineOperationData)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (topError || lowError) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 1 }}>
          Error loading data: {topError?.message || lowError?.message}
        </Alert>
        <Typography>Please check console for details</Typography>
      </Paper>
    );
  }

  // Check if data exists and is an array
  const hasTopData = topWorkers && Array.isArray(topWorkers) && topWorkers.length > 0;
  const hasLowData = lowWorkers && Array.isArray(lowWorkers) && lowWorkers.length > 0;
  const hasDeptData = departmentData && Array.isArray(departmentData) && departmentData.length > 0;
  const hasTrendData = filteredTrendData && filteredTrendData.length > 0;
  const hasLineData = sortedLineData && sortedLineData.length > 0;
  const hasOperationData = filteredOperationData && filteredOperationData.length > 0;
  const hasTopLineData = processedTopLineData && processedTopLineData.length > 0;
  const hasLowLineData = processedLowLineData && processedLowLineData.length > 0;

  if (!hasTopData && !hasLowData && !hasDeptData && !hasTrendData && !hasLineData && !hasOperationData && !hasTopLineData && !hasLowLineData) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>No Data Available</Typography>
        <Typography color="text.secondary" gutterBottom>
          For date range: {selectedFromDate} to {selectedToDate}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          No records found for selected date range
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ p: 1.5 }}>
      {/* Date Range Display */}
      <Chip 
        label={`${date_from} to ${date_to}`} 
        color="primary" 
        sx={{ mb: 1.5, fontSize: '0.7rem', height: 24 }} 
      />

      <Grid container spacing={1.5}>
        {/* ****************************** TOP 10 WORKERS ****************************** */}
        {hasTopData && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: { xs: 400, sm: 450, md: 500 }, background: 'linear-gradient(135deg, rgba(46,125,50,0.08) 0%, rgba(76,175,80,0.08) 100%)', backdropFilter: 'blur(10px)', border: '1px solid rgba(46,125,50,0.2)', boxShadow: '0 8px 32px rgba(46,125,50,0.1)' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }, background: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Top 10 Performers</Typography>
                <Chip label="⭐ High Output" size="small" sx={{ bgcolor: '#2e7d32', color: 'white', fontWeight: 600, height: 20, fontSize: '0.6rem' }} />
              </Box>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={topWorkers}
                  margin={{ top: 10, right: 10, left: 0, bottom: 50 }}
                  onMouseMove={(state: any) => {
                    if (state.activeTooltipIndex !== undefined) {
                      setHoveredBar(topWorkers?.[state.activeTooltipIndex]?.WorkerCode || null);
                    }
                  }}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <CartesianGrid strokeDasharray="5 5" stroke="rgba(46,125,50,0.15)" />
                  <XAxis
                    dataKey="WorkerCode"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{ fill: '#555', fontSize: 10 }}
                  />
                  <YAxis tick={{ fill: '#555', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="production_qty" barSize={20}>
                    {topWorkers?.map((entry: WorkerPerformance, index: number) => (
                      <Cell
                        key={`top-${index}-${entry.WorkerCode}`}
                        fill={hoveredBar === entry.WorkerCode ? '#66bb6a' : '#2e7d32'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {topWorkers && topWorkers[0] && (
                <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: '#2e7d32', fontWeight: 600, fontSize: '0.6rem' }}>
                  🏆 Top: {topWorkers[0].WorkerCode} ({topWorkers[0].production_qty?.toLocaleString() || 0} Qty)
                </Typography>
              )}
            </Paper>
          </Grid>
        )}

        {/* ****************************** LOW 10 WORKERS ****************************** */}
        {hasLowData && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: { xs: 400, sm: 450, md: 500 }, background: 'linear-gradient(135deg, rgba(237,108,2,0.08) 0%, rgba(255,152,0,0.08) 100%)', backdropFilter: 'blur(10px)', border: '1px solid rgba(237,108,2,0.2)', boxShadow: '0 8px 32px rgba(237,108,2,0.1)' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }, background: 'linear-gradient(135deg, #ed6c02 0%, #ffb74d 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Needs Improvement</Typography>
                <Chip label="⚠️ Low Output" size="small" sx={{ bgcolor: '#ed6c02', color: 'white', fontWeight: 600, height: 20, fontSize: '0.6rem' }} />
              </Box>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={lowWorkers}
                  margin={{ top: 10, right: 10, left: 0, bottom: 50 }}
                  onMouseMove={(state: any) => {
                    if (state.activeTooltipIndex !== undefined) {
                      setHoveredBar(lowWorkers?.[state.activeTooltipIndex]?.WorkerCode || null);
                    }
                  }}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <CartesianGrid strokeDasharray="5 5" stroke="rgba(237,108,2,0.15)" />
                  <XAxis
                    dataKey="WorkerCode"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{ fill: '#555', fontSize: 10 }}
                  />
                  <YAxis tick={{ fill: '#555', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="production_qty" barSize={20}>
                    {lowWorkers?.map((entry: WorkerPerformance, index: number) => (
                      <Cell
                        key={`low-${index}-${entry.WorkerCode}`}
                        fill={hoveredBar === entry.WorkerCode ? '#ffb74d' : '#ed6c02'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {lowWorkers && lowWorkers[0] && (
                <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: '#ed6c02', fontWeight: 600, fontSize: '0.6rem' }}>
                  📉 Lowest: {lowWorkers[0].WorkerCode} ({lowWorkers[0].production_qty || 0} Qty)
                </Typography>
              )}
            </Paper>
          </Grid>
        )}

        {/* ****************************** DEPARTMENT WISE PIE CHART ****************************** */}
        {hasDeptData && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: { xs: 400, sm: 450, md: 500 }, background: 'linear-gradient(135deg, rgba(25,118,210,0.08) 0%, rgba(66,165,245,0.08) 100%)', backdropFilter: 'blur(10px)', border: '1px solid rgba(25,118,210,0.2)', boxShadow: '0 8px 32px rgba(25,118,210,0.1)' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Department Wise Production</Typography>
                <Chip label="📊 Pie" size="small" sx={{ bgcolor: '#1976d2', color: 'white', fontWeight: 600, height: 20, fontSize: '0.6rem' }} />
              </Box>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    label={(entry: any) => `${entry.department_name}: ${entry.total_production}`}
                    outerRadius={80}
                    dataKey="total_production"
                    nameKey="department_name"
                    isAnimationActive={false}
                  >
                    {departmentData.map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.department_name as keyof typeof COLORS] || COLORS.DEFAULT} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.65rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* ****************************** DAILY TREND SCATTER CHART ****************************** */}
        {hasTrendData && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: { xs: 420, sm: 450, md: 500 }, background: 'linear-gradient(135deg, rgba(156,39,176,0.08) 0%, rgba(186,104,200,0.08) 100%)', backdropFilter: 'blur(10px)', border: '1px solid rgba(156,39,176,0.2)', boxShadow: '0 8px 32px rgba(156,39,176,0.1)' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }, background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Daily Efficiency Trend</Typography>
                <Chip
                  label={`📈 ${selectedFromDate} to ${selectedToDate}`}
                  size="small"
                  sx={{ bgcolor: '#9c27b0', color: 'white', fontWeight: 600, height: 20, fontSize: '0.55rem' }}
                />
              </Box>

              {/* Two dropdowns for date range selection */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                <FormControl size="small" sx={{ minWidth: { xs: 80, sm: 120 }, flex: { xs: 1, sm: 'none' } }}>
                  <InputLabel sx={{ fontSize: '0.7rem' }}>From</InputLabel>
                  <Select
                    value={tempFromDate}
                    label="From"
                    onChange={(e) => setTempFromDate(e.target.value)}
                    sx={{ fontSize: '0.7rem', height: 32 }}
                  >
                    {dateOptions.map((date) => (
                      <MenuItem key={date} value={date} sx={{ fontSize: '0.7rem' }}>{date}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: { xs: 80, sm: 120 }, flex: { xs: 1, sm: 'none' } }}>
                  <InputLabel sx={{ fontSize: '0.7rem' }}>To</InputLabel>
                  <Select
                    value={tempToDate}
                    label="To"
                    onChange={(e) => setTempToDate(e.target.value)}
                    sx={{ fontSize: '0.7rem', height: 32 }}
                  >
                    {dateOptions.map((date) => (
                      <MenuItem key={date} value={date} sx={{ fontSize: '0.7rem' }}>{date}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button 
                  variant="contained" 
                  size="small"
                  onClick={handleApplyRange}
                  sx={{ minWidth: '60px', height: 32, bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' }, fontSize: '0.65rem', padding: '0 10px' }}
                >
                  Apply
                </Button>
              </Box>

              <ResponsiveContainer width="100%" height={240}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="5 5" stroke="rgba(156,39,176,0.2)" />
                  <XAxis
                    dataKey="scanning_date"
                    angle={-45}
                    textAnchor="end"
                    height={55}
                    tick={{ fill: '#666', fontSize: 10 }}
                  />
                  <YAxis
                    dataKey="efficiency"
                    domain={[0, 200]}
                    label={{ value: 'Efficiency %', angle: -90, position: 'insideLeft', style: { fontSize: '0.65rem' } }}
                    tick={{ fill: '#666', fontSize: 10 }}
                  />
                  <Tooltip content={<ScatterTooltip />} />
                  <Scatter
                    name="Efficiency"
                    data={filteredTrendData}
                    fill="#9c27b0"
                    line={false}
                    shape="circle"
                  />
                </ScatterChart>
              </ResponsiveContainer>

              <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: 'center', fontSize: '0.6rem' }}>
                Showing {filteredTrendData.length} days
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* ****************************** LINE EFFICIENCY HORIZONTAL BAR CHART ****************************** */}
        {hasLineData && !lineLoading && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: { xs: 400, sm: 450, md: 500 }, background: 'linear-gradient(135deg, rgba(25,118,210,0.08) 0%, rgba(66,165,245,0.08) 100%)', backdropFilter: 'blur(10px)', border: '1px solid rgba(25,118,210,0.2)', boxShadow: '0 8px 32px rgba(25,118,210,0.1)' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Line Efficiency</Typography>
                <Chip label="⚙️ By Line" size="small" sx={{ bgcolor: '#1976d2', color: 'white', fontWeight: 600, height: 20, fontSize: '0.6rem' }} />
              </Box>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={sortedLineData}
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 80, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="5 5" stroke="rgba(25,118,210,0.2)" />
                  <XAxis type="number" tick={{ fill: '#666', fontSize: 10 }} />
                  <YAxis
                    dataKey="line_code"
                    type="category"
                    width={60}
                    tick={{ fontSize: 10, fill: '#666' }}
                  />
                  <Tooltip content={<LineBarTooltip />} />
                  <Bar dataKey="actual" barSize={16}>
                    {sortedLineData.map((_: LineEfficiencyData, index: number) => (
                      <Cell 
                        key={`line-${index}`} 
                        fill={LINE_BAR_COLORS[index % LINE_BAR_COLORS.length]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: 'center', color: '#1976d2', fontWeight: 600, fontSize: '0.6rem' }}>
                📊 Total Lines: {sortedLineData.length} | Total: {sortedLineData.reduce((sum, item) => sum + item.actual, 0).toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* ****************************** LINE OPERATION SCANNING ****************************** */}
        {hasOperationData && !operationLoading && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: { xs: 420, sm: 450, md: 500 }, display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, rgba(25,118,210,0.08) 0%, rgba(66,165,245,0.08) 100%)', backdropFilter: 'blur(10px)', border: '1px solid rgba(25,118,210,0.2)', boxShadow: '0 8px 32px rgba(25,118,210,0.1)' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 0.5, mb: 1 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Line Operations</Typography>
                  <Chip label={`📋 ${filteredOperationData.length}`} size="small" sx={{ bgcolor: '#1976d2', color: 'white', fontWeight: 600, height: 20, fontSize: '0.6rem' }} />
                </Box>
              </Box>

              {/* Line Dropdown and View Toggle */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <FormControl size="small" sx={{ minWidth: { xs: 100, sm: 140 }, flex: { xs: 1, sm: 'none' } }}>
                  <InputLabel sx={{ fontSize: '0.7rem' }}>Select Line</InputLabel>
                  <Select
                    value={selectedLine}
                    label="Select Line"
                    onChange={handleLineChange}
                    sx={{ fontSize: '0.7rem', height: 32 }}
                  >
                    <MenuItem value="all" sx={{ fontSize: '0.7rem' }}>All Lines</MenuItem>
                    {lineOptions.map((line) => (
                      <MenuItem key={line} value={line} sx={{ fontSize: '0.7rem' }}>Line {line}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button 
                    variant={viewMode === 'table' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setViewMode('table')}
                    sx={{ 
                      bgcolor: viewMode === 'table' ? '#1976d2' : 'transparent',
                      color: viewMode === 'table' ? 'white' : '#1976d2',
                      borderColor: '#1976d2',
                      fontSize: '0.6rem',
                      padding: '2px 8px',
                      minWidth: '50px',
                      height: 28,
                      '&:hover': { bgcolor: viewMode === 'table' ? '#1565c0' : '#e3f2fd' }
                    }}
                  >
                    Table
                  </Button>
                  <Button 
                    variant={viewMode === 'chart' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setViewMode('chart')}
                    sx={{ 
                      bgcolor: viewMode === 'chart' ? '#9c27b0' : 'transparent',
                      color: viewMode === 'chart' ? 'white' : '#9c27b0',
                      borderColor: '#9c27b0',
                      fontSize: '0.6rem',
                      padding: '2px 8px',
                      minWidth: '50px',
                      height: 28,
                      '&:hover': { bgcolor: viewMode === 'chart' ? '#7b1fa2' : '#f3e5f5' }
                    }}
                  >
                    Chart
                  </Button>
                </Box>
              </Box>

              {/* Table View */}
              {viewMode === 'table' && (
                <TableContainer sx={{ maxHeight: 230, overflow: 'auto', borderRadius: 1, flex: 1 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.6rem', padding: '4px 6px' }}>Line</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.6rem', padding: '4px 6px' }}>Op ID</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.6rem', padding: '4px 6px' }}>Description</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 600, fontSize: '0.6rem', padding: '4px 6px' }}>Actual</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 600, fontSize: '0.6rem', padding: '4px 6px' }}>Target</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 600, fontSize: '0.6rem', padding: '4px 6px' }}>Eff%</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredOperationData.slice(0, 20).map((row, index) => (
                        <TableRow key={index} hover sx={{ '&:hover': { bgcolor: 'rgba(25,118,210,0.05)' } }}>
                          <TableCell sx={{ fontSize: '0.6rem', padding: '3px 6px', fontWeight: 500 }}>{row.line_code}</TableCell>
                          <TableCell sx={{ fontSize: '0.6rem', padding: '3px 6px' }}>{row.operation_id}</TableCell>
                          <TableCell sx={{ fontSize: '0.6rem', padding: '3px 6px', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {row.operation_description}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.6rem', padding: '3px 6px' }}>{row.actual.toLocaleString()}</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.6rem', padding: '3px 6px' }}>{row.target.toLocaleString()}</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.6rem', padding: '3px 6px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Box sx={{ width: '40px' }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(row.efficiency, 100)}
                                  sx={{ height: 4, borderRadius: 2 }}
                                  color={row.efficiency >= 100 ? 'success' : row.efficiency >= 80 ? 'primary' : 'warning'}
                                />
                              </Box>
                              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.55rem', minWidth: '30px' }}>
                                {row.efficiency.toFixed(1)}%
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Chart View */}
              {viewMode === 'chart' && (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart
                    data={sortedOperationData.slice(0, 10)}
                    margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="5 5" stroke="rgba(25,118,210,0.2)" />
                    <XAxis
                      dataKey="operation_id"
                      angle={-45}
                      textAnchor="end"
                      height={50}
                      interval={0}
                      tick={{ fill: '#666', fontSize: 10 }}
                    />
                    <YAxis tick={{ fill: '#666', fontSize: 10 }} />
                    <Tooltip content={<OperationTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '0.6rem', paddingTop: '5px' }} />
                    <Bar dataKey="target" stackId="a" fill="#ffb74d" name="Target" barSize={20} />
                    <Bar dataKey="actual" stackId="a" fill="#2e7d32" name="Actual" barSize={20} />
                    <Line type="monotone" dataKey="efficiency" stroke="#9c27b0" name="Eff%" strokeWidth={1.5} dot={{ r: 3 }} yAxisId="right" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: 'center', color: '#1976d2', fontWeight: 600, fontSize: '0.55rem' }}>
                📈 Ops: {filteredOperationData.length} | Actual: {filteredOperationData.reduce((sum, item) => sum + item.actual, 0).toLocaleString()} | Target: {filteredOperationData.reduce((sum, item) => sum + item.target, 0).toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* ****************************** TOP 10 LINE OPERATIONS ****************************** */}
        {hasTopLineData && !topLineLoading && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: { xs: 400, sm: 450, md: 500 }, background: 'linear-gradient(135deg, rgba(46,125,50,0.08) 0%, rgba(76,175,80,0.08) 100%)', backdropFilter: 'blur(10px)', border: '1px solid rgba(46,125,50,0.2)', boxShadow: '0 8px 32px rgba(46,125,50,0.1)' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }, background: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Top 10 Line Operations</Typography>
                <Chip label="⭐ High" size="small" sx={{ bgcolor: '#2e7d32', color: 'white', fontWeight: 600, height: 20, fontSize: '0.6rem' }} />
              </Box>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={processedTopLineData}
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 90, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="5 5" stroke="rgba(46,125,50,0.2)" />
                  <XAxis type="number" tick={{ fill: '#666', fontSize: 10 }} />
                  <YAxis
                    dataKey="displayName"
                    type="category"
                    width={70}
                    tick={{ fontSize: 10, fill: '#666' }}
                  />
                  <Tooltip content={<TopLowLineTooltip />} />
                  <Bar dataKey="production_qty" barSize={16} radius={[0, 6, 6, 0]}>
                    {processedTopLineData.map((_: TopLowLineOperationData, index: number) => (
                      <Cell
                        key={`top-line-${index}`}
                        fill={TOP_LINE_COLORS[index % TOP_LINE_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: 'center', color: '#2e7d32', fontWeight: 600, fontSize: '0.6rem' }}>
                🏆 Top: {processedTopLineData.length} | Total: {processedTopLineData.reduce((sum, item) => sum + item.production_qty, 0).toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* ****************************** LOW 10 LINE OPERATIONS ****************************** */}
        {hasLowLineData && !lowLineLoading && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: { xs: 400, sm: 450, md: 500 }, background: 'linear-gradient(135deg, rgba(237,108,2,0.08) 0%, rgba(255,152,0,0.08) 100%)', backdropFilter: 'blur(10px)', border: '1px solid rgba(237,108,2,0.2)', boxShadow: '0 8px 32px rgba(237,108,2,0.1)' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }, background: 'linear-gradient(135deg, #ed6c02 0%, #ffb74d 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Low 10 Line Operations</Typography>
                <Chip label="⚠️ Low" size="small" sx={{ bgcolor: '#ed6c02', color: 'white', fontWeight: 600, height: 20, fontSize: '0.6rem' }} />
              </Box>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={processedLowLineData}
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 90, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="5 5" stroke="rgba(237,108,2,0.2)" />
                  <XAxis type="number" tick={{ fill: '#666', fontSize: 10 }} />
                  <YAxis
                    dataKey="displayName"
                    type="category"
                    width={70}
                    tick={{ fontSize: 10, fill: '#666' }}
                  />
                  <Tooltip content={<TopLowLineTooltip />} />
                  <Bar dataKey="production_qty" barSize={16} radius={[0, 6, 6, 0]}>
                    {processedLowLineData.map((_: TopLowLineOperationData, index: number) => (
                      <Cell
                        key={`low-line-${index}`}
                        fill={LOW_LINE_COLORS[index % LOW_LINE_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: 'center', color: '#ed6c02', fontWeight: 600, fontSize: '0.6rem' }}>
                📉 Low: {processedLowLineData.length} | Total: {processedLowLineData.reduce((sum, item) => sum + item.production_qty, 0).toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Graph;