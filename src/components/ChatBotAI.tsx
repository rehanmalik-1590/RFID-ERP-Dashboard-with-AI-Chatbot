// ChatBotAI.tsx - Complete Fixed File with All Features
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Close as CloseIcon, Send as SendIcon, SmartToy as BotIcon, Person as PersonIcon, AutoAwesome as AutoAwesomeIcon, Psychology as PsychologyIcon, RocketLaunch as RocketIcon, Mic as MicIcon, VolumeUp as VolumeUpIcon, Download as DownloadIcon, Share as ShareIcon, History as HistoryIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { Paper, Typography, Box, Select, MenuItem, FormControl, InputLabel, IconButton, Tooltip, CircularProgress, Switch, FormControlLabel, Chip, Snackbar, Alert, Drawer, List, ListItem, ListItemText, ListItemIcon, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useGetAllKpiData, useGetAllFilterData, useWorkersPerformance, usegetDepartmentWise, useGetLineEfficiency, useGetLineOperationScanning } from '../services/api';

import { formatDepartmentAnalysis, formatLineBottleneckAnalysis, formatCompanyComparison, formatTrendAnalysis, formatQualityAnalysis, formatTargetAnalysis, formatSmartRecommendations, type FormattedResponse } from '../services/chatbotResponseFormatter';
import VoiceInputButton from './VoiceInputButton';
import { initVoiceRecognition, startVoiceListening, stopVoiceListening, checkVoiceSupport, type VoiceState, type VoiceConfig } from '../services/chatbotVoiceHandler';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'error' | 'success' | 'warning' | 'analysis' | 'chart';
  chartData?: any;
  showChart?: boolean;
  chartType?: 'bar' | 'pie' | 'line';
  chartTitle?: string;
  isLoading?: boolean;
  isTyping?: boolean;
}

interface ApiResponse_KPI {
  total_output_units?: number;
  productivity_rate?: string;
  quality_deviation?: number;
  total_operations?: number;
  workforce_strength?: number;
  avg_operation_capacity?: number;
  waste_units?: number;
  initial_stage_count?: number;
  final_stage_count?: number;
  initial_production?: number;
  final_production?: number;
  initial_avg_rate?: number;
  final_avg_rate?: number;
  production_line_total?: number;
  design_variants?: number;
  planned_production?: number;
  total_efficiency?: number;
  total_variance?: number;
}

interface WorkerPerformance {
  WorkerCode: string;
  production_qty: number;
  WorkerDescription?: string;
  CompanyId?: string;
  BrId?: string;
  DepartmentName?: string;
}

interface QueryHistory {
  question: string;
  answer: string;
  timestamp: Date;
  type: string;
}

const ChatBotAI: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // State Hooks
  const [speakEnabled, setSpeakEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechQueue, setSpeechQueue] = useState<string[]>([]);
  const [isSpeechStopped, setIsSpeechStopped] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateUniqueId(),
      text: '✨ **Welcome to AI Assistant!**\n\nI can help you with everything:\n\n📊 **Dashboard KPIs** - Production, Efficiency, Quality\n📋 **Table Data** - Workers, Companies, Departments\n👥 **Workers** - Top/Low performers with exact count\n📈 **Graphs** - Bar, Pie, Line charts for any data\n💡 **Analytics** - Departments, Bottlenecks, Trends\n🏢 **Comparisons** - Companies, Lines, Departments\n🏭 **Total Efficiency** - Overall factory efficiency\n📊 **Total Variance** - Production variance analysis\n\n🔊 **Voice:** Click mic or enable "Auto Voice"\n📝 **Exact Count:** "top 2 workers" gives exactly 2 workers\n🎯 **Only Names:** "only names of top 5 workers"\n\n💬 **Try:** "top 5 workers", "only names of top 3 workers", "bar chart of top workers"',
      sender: 'bot',
      timestamp: new Date(),
      type: 'success'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [savedCursorPosition, setSavedCursorPosition] = useState(0);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([
    'top 5 workers',
    'only names of top 3 workers',
    'bar chart of top workers',
    'department comparison pie chart',
    'company comparison',
    'total efficiency',
    'total variance',
    'show table'
  ]);
  const [autoVoiceEnabled, setAutoVoiceEnabled] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  
  const [lastContext, setLastContext] = useState<{
    type: string;
    data: any;
    lineCode?: string;
    workers?: any[];
    chartType?: string;
    askedNames?: boolean;
    askedGraph?: boolean;
    askedTotal?: boolean;
    askedCount?: number;
    departmentData?: any[];
    companyData?: any[];
    efficiencyData?: any;
    varianceData?: any;
  } | null>(null);
  
  const [companyBranches, setCompanyBranches] = useState<Map<string, string[]>>(new Map());
  const [lastWorkerQuery, setLastWorkerQuery] = useState<{ type: 'top' | 'low'; workers: WorkerPerformance[]; limit: number } | null>(null);
  const [showGraph, setShowGraph] = useState(false);
  const [graphData, setGraphData] = useState<any>(null);
  const [graphType, setGraphType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [graphTitle, setGraphTitle] = useState<string>('');
  
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    transcript: '',
    isFinal: false,
    confidence: 0,
  });
  const recognitionRef = useRef<any>(null);

  const [apiData_KPI, setApiData_KPI] = useState<ApiResponse_KPI | null>(null);
  const [apiData_Filter, setApiData_Filter] = useState<any[] | null>(null);
  const [departmentData, setDepartmentData] = useState<any[] | null>(null);
  const [lineEfficiencyData, setLineEfficiencyData] = useState<any[] | null>(null);
  const [lineOperationData, setLineOperationData] = useState<any[] | null>(null);
  const [topWorkersData, setTopWorkersData] = useState<WorkerPerformance[] | null>(null);
  const [lowWorkersData, setLowWorkersData] = useState<WorkerPerformance[] | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fixedDateFrom = '2024-01-01';
  const fixedDateTo = '2024-12-31';

  // API Hooks
  const { data: kpiResponse, refetch: refetchKPI, isSuccess: kpiSuccess } = useGetAllKpiData(fixedDateFrom, fixedDateTo);
  const { data: filterResponse, refetch: refetchFilter, isSuccess: filterSuccess } = useGetAllFilterData(fixedDateFrom, fixedDateTo);
  const { data: topWorkers, refetch: refetchTop, isSuccess: topSuccess } = useWorkersPerformance('top', fixedDateFrom, fixedDateTo);
  const { data: lowWorkers, refetch: refetchLow, isSuccess: lowSuccess } = useWorkersPerformance('low', fixedDateFrom, fixedDateTo);
  const { data: deptData, refetch: refetchDept, isSuccess: deptSuccess } = usegetDepartmentWise(fixedDateFrom, fixedDateTo);
  const { data: lineData, refetch: refetchLine, isSuccess: lineSuccess } = useGetLineEfficiency(fixedDateFrom, fixedDateTo);
  const { data: opData, refetch: refetchOp, isSuccess: opSuccess } = useGetLineOperationScanning(fixedDateFrom, fixedDateTo);

  // Speech Functions
  const speakText = useCallback((text: string) => {
    if (!speakEnabled || !window.speechSynthesis || isSpeechStopped) return;
    
    const cleanText = text.replace(/\*\*/g, '').replace(/[📊📋👥🏢💡🔊💬📈📉📏👤🏆⭐⚠️✅❌🔴🟡🟢💡🔧🎯🏭🏬🎯📝👥⚡🔍🎯📋📊🏆📈📉📏]/g, '').replace(/\n/g, '. ').trim();
    if (!cleanText) return;
    
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { 
        setIsSpeaking(false); 
        if (speechQueue.length > 0 && !isSpeechStopped) { 
          const next = speechQueue.shift(); 
          if (next) speakText(next); 
        } 
      };
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
    }
  }, [speakEnabled, isSpeechStopped, speechQueue]);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsSpeechStopped(true);
        setSpeechQueue([]);
        setTimeout(() => setIsSpeechStopped(false), 1000);
      } catch (error) {
        console.error('Stop speech error:', error);
      }
    }
  }, []);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsTyping(true);
        await Promise.all([refetchKPI(), refetchFilter(), refetchTop(), refetchLow(), refetchDept(), refetchLine(), refetchOp()]);
        setIsTyping(false);
      } catch (error) {
        console.error('Load data error:', error);
        setIsTyping(false);
        setSnackbarMessage('Error loading data');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };
    loadData();
  }, []);

  // Update state from API responses
  useEffect(() => {
    if (kpiSuccess && kpiResponse && kpiResponse.length > 0) {
      const data = kpiResponse[0];
      // Calculate total efficiency and variance
      const totalEfficiency = data.productivity_rate ? parseFloat(data.productivity_rate.replace('%', '')) : 0;
      const totalVariance = data.planned_production && data.total_output_units 
        ? ((data.total_output_units - data.planned_production) / data.planned_production) * 100 
        : 0;
      
      setApiData_KPI({
        ...data,
        total_efficiency: totalEfficiency,
        total_variance: totalVariance
      });
    }
  }, [kpiSuccess, kpiResponse]);

  useEffect(() => {
    if (filterSuccess && filterResponse && filterResponse.length > 0) {
      setApiData_Filter(filterResponse);
    }
  }, [filterSuccess, filterResponse]);

  useEffect(() => {
    if (topSuccess && topWorkers && topWorkers.length > 0) {
      setTopWorkersData(topWorkers);
    }
  }, [topSuccess, topWorkers]);

  useEffect(() => {
    if (lowSuccess && lowWorkers && lowWorkers.length > 0) {
      setLowWorkersData(lowWorkers);
    }
  }, [lowSuccess, lowWorkers]);

  useEffect(() => {
    if (deptSuccess && deptData && deptData.length > 0) {
      const mappedData = deptData.map((d: any) => ({
        department_name: d.department_name || d.DepartmentName || d.dept_name || d.name || 'Unknown',
        total_production: d.total_production || d.production || d.TotalProduction || 0
      }));
      setDepartmentData(mappedData);
    }
  }, [deptSuccess, deptData]);

  useEffect(() => {
    if (lineSuccess && lineData && lineData.length > 0) {
      setLineEfficiencyData(lineData);
    }
  }, [lineSuccess, lineData]);

  useEffect(() => {
    if (opSuccess && opData && opData.length > 0) {
      setLineOperationData(opData);
    }
  }, [opSuccess, opData]);

  // Auto-scroll
  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll]);

  // Focus input
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(savedCursorPosition, savedCursorPosition);
      setShouldAutoScroll(false);
    }
  }, [isOpen, savedCursorPosition]);

  // Voice initialization
  useEffect(() => {
    const support = checkVoiceSupport();
    if (support.speechRecognition) {
      const init = initVoiceRecognition();
      if (init.supported) {
        recognitionRef.current = init.recognition;
      }
    }
  }, []);

  // Auto voice control
  useEffect(() => {
    if (autoVoiceEnabled && recognitionRef.current) {
      startAutoVoice();
    } else if (!autoVoiceEnabled && recognitionRef.current) {
      stopAutoVoice();
    }
  }, [autoVoiceEnabled]);

  const startAutoVoice = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.language = 'en-US';
      recognitionRef.current.onresult = (event: any) => {
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript;
        }
        if (final.trim()) {
          setIsVoiceListening(true);
          setTimeout(() => {
            handleSendMessage(final.trim());
            setIsVoiceListening(false);
            if (autoVoiceEnabled) setTimeout(() => { try { recognitionRef.current?.start(); } catch(e) {} }, 500);
          }, 300);
        }
      };
      recognitionRef.current.onerror = () => { 
        if (autoVoiceEnabled) setTimeout(() => { try { recognitionRef.current?.start(); } catch(e) {} }, 1000); 
      };
      recognitionRef.current.onend = () => { 
        if (autoVoiceEnabled) setTimeout(() => { try { recognitionRef.current?.start(); } catch(e) {} }, 500); 
      };
      recognitionRef.current.start();
    } catch(e) {
      console.error('Auto voice start error:', e);
    }
  }, [autoVoiceEnabled]);

  const stopAutoVoice = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); recognitionRef.current.continuous = false; } catch(e) {}
    }
  }, []);

  // Voice handlers
  const handleVoiceStart = useCallback(() => {
    if (!recognitionRef.current) return;
    setIsVoiceListening(true);
    const config: VoiceConfig = { language: 'en-US', continuous: false, interimResults: true, maxAlternatives: 1 };
    startVoiceListening(recognitionRef.current, config, (state) => setVoiceState(state), (transcript) => {
      setIsVoiceListening(false);
      if (transcript?.trim()) { setInputText(transcript); setTimeout(() => handleSendMessage(transcript), 300); }
    });
  }, []);

  const handleVoiceStop = useCallback(() => {
    if (recognitionRef.current) { stopVoiceListening(recognitionRef.current); setIsVoiceListening(false); }
  }, []);

  // Worker details map
  const workerDetailsMap = useMemo(() => {
    const map = new Map();
    if (apiData_Filter && Array.isArray(apiData_Filter)) {
      apiData_Filter.forEach((item: any) => {
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
  }, [apiData_Filter]);

  // COLORS for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE'];

  // ===== COMPLETE QUERY PARSER =====
  const parseSmartQuery = useCallback((question: string) => {
    const q = question.toLowerCase().trim();
    const result: any = {
      type: 'unknown',
      count: 5,
      chartType: null,
      dataSource: null,
      isGraph: false,
      isComparison: false,
      isClose: false,
      isInfo: false,
      isLineQuery: false,
      isWorkerInfo: false,
      isOnlyNames: false,
      isBestWorker: false,
      isTotalRecords: false,
      isTodayProduction: false,
      isTotalWorkers: false,
      isDepartmentComparison: false,
      isCompanyComparison: false,
      isTotalEfficiency: false,
      isTotalVariance: false,
      lineCode: null,
      workerCode: null,
      exactCount: false,
      raw: question,
      stopSpeech: false,
      isFollowUp: false,
      isKitny: false,
      isNameBtaDo: false,
      isShowTable: false,
      isAnalytics: false,
      isQuality: false,
      isTrend: false,
      isTarget: false,
      isBottleneck: false,
      isWorkerOptimization: false,
      isAllKPIs: false,
      isHelp: false
    };

    // Stop speech
    if (q.includes('ok enough') || q.includes('enough') || q.includes('bas karo') || q.includes('bas') || q.includes('stop') || q.includes('ruk jao') || q.includes('stop talking')) {
      result.type = 'stop_speech';
      result.stopSpeech = true;
      return result;
    }

    // Close
    if (q.includes('close') || q.includes('band') || q === 'close' || q === 'ok close' || q.includes('exit') || q === 'bye') {
      result.type = 'close';
      result.isClose = true;
      return result;
    }

    // Help
    if (q.includes('help') || q.includes('what can you do') || q.includes('how to use') || q.includes('commands')) {
      result.type = 'help';
      result.isHelp = true;
      return result;
    }

    // Chart type detection
    if (q.includes('pie') || q.includes('pie chart')) result.chartType = 'pie';
    else if (q.includes('line') || q.includes('line chart')) result.chartType = 'line';
    else if (q.includes('bar') || q.includes('bar chart') || q.includes('graph') || q.includes('chart')) result.chartType = 'bar';

    // Graph detection
    if (q.includes('graph') || q.includes('chart') || q.includes('show') || q.includes('visualize') || result.chartType) {
      result.isGraph = true;
    }

    // Only names
    if (q.includes('only names') || q.includes('tell me names') || q.includes('worker names') || q.includes('names only') || q.includes('name bta do') || q.includes('only name')) {
      result.isOnlyNames = true;
      result.isNameBtaDo = true;
    }

    // Best worker
    if (q.includes('best worker') || q.includes('best performer') || q.includes('top worker') || q.includes('top performer') || q.includes('number 1 worker')) {
      result.isBestWorker = true;
      result.type = 'best_worker';
    }

    // Total records
    if (q.includes('total records') || q.includes('total data') || q.includes('kitny records') || q.includes('how many records') || q.includes('kitne records')) {
      result.isTotalRecords = true;
      result.type = 'total_records';
    }

    // Total workers
    if (q.includes('total workers') || q.includes('kitny workers') || q.includes('kitne workers') || q.includes('how many workers') || q.includes('total workforce')) {
      result.isTotalWorkers = true;
      result.type = 'total_workers';
    }

    // Total efficiency
    if (q.includes('total efficiency') || q.includes('overall efficiency') || q.includes('factory efficiency') || q.includes('total productivity')) {
      result.isTotalEfficiency = true;
      result.type = 'total_efficiency';
    }

    // Total variance
    if (q.includes('total variance') || q.includes('variance') || q.includes('production variance') || q.includes('target variance') || q.includes('plan vs actual')) {
      result.isTotalVariance = true;
      result.type = 'total_variance';
    }

    // Department comparison
    if (q.includes('department comparison') || q.includes('compare departments') || q.includes('dept comparison') || q.includes('department wise')) {
      result.isDepartmentComparison = true;
      result.type = 'department_comparison';
    }

    // Company comparison
    if (q.includes('company comparison') || q.includes('compare companies') || q.includes('company wise') || q.includes('company performance')) {
      result.isCompanyComparison = true;
      result.type = 'company_comparison';
    }

    // Today production
    if (q.includes('today production') || q.includes('today\'s production') || q.includes('aj ki production') || q.includes('today output')) {
      result.isTodayProduction = true;
      result.type = 'today_production';
    }

    // Show table
    if (q.includes('show table') || q.includes('table') || q.includes('list data') || q.includes('show records') || q.includes('show all data')) {
      result.isShowTable = true;
      result.type = 'show_table';
    }

    // Analytics
    if (q.includes('analyze') || q.includes('analysis') || q.includes('insights') || q.includes('analytics')) {
      result.isAnalytics = true;
      result.type = 'analytics';
    }

    // Quality
    if (q.includes('quality') || q.includes('waste') || q.includes('defect') || q.includes('quality control')) {
      result.isQuality = true;
      result.type = 'quality';
    }

    // Trend
    if (q.includes('trend') || q.includes('forecast') || q.includes('prediction') || q.includes('trend analysis')) {
      result.isTrend = true;
      result.type = 'trend';
    }

    // Target
    if (q.includes('target') || q.includes('goal') || q.includes('achievement') || q.includes('target analysis')) {
      result.isTarget = true;
      result.type = 'target';
    }

    // Bottleneck
    if (q.includes('bottleneck') || q.includes('slow line') || q.includes('line issue') || q.includes('bottleneck analysis')) {
      result.isBottleneck = true;
      result.type = 'bottleneck';
    }

    // Worker optimization
    if (q.includes('worker optimization') || q.includes('optimize workers') || q.includes('worker placement')) {
      result.isWorkerOptimization = true;
      result.type = 'worker_optimization';
    }

    // All KPIs
    if (q.includes('all kpis') || q.includes('all kpi') || q.includes('show all metrics') || q.includes('complete dashboard')) {
      result.isAllKPIs = true;
      result.type = 'all_kpis';
    }

    // Count extraction - FIXED: exact count
    const countMatch = q.match(/top\s*(\d+)|(\d+)\s*(workers|records|lines|departments|operations)/i);
    if (countMatch) {
      const count = parseInt(countMatch[1] || countMatch[2]);
      if (!isNaN(count) && count > 0) {
        result.count = count;
        result.exactCount = true;
      }
    }

    // Kitny/Kitne
    if (q.includes('kitny') || q.includes('kitne') || q.includes('how many') || q.includes('count')) {
      result.isKitny = true;
    }

    // Name bta do
    if (q.includes('name bta do') || q.includes('names') || q.includes('tell me names')) {
      result.isNameBtaDo = true;
    }

    // Follow-up
    if (q === 'yes' || q === 'ok' || q === 'y' || q === 'okay' || q === 'han' || q === 'acha' || q === 'ji' || q === 'haan' || q === 'yeah') {
      result.isFollowUp = true;
    }

    // Line query
    if (q.includes('line') || q.includes('best line') || q.includes('top line') || q.includes('worst line')) {
      result.isLineQuery = true;
      const lineMatch = q.match(/line\s*([a-z0-9\-]+)/i);
      if (lineMatch) result.lineCode = lineMatch[1].toUpperCase();
    }

    // Worker info
    if (q.includes('worker info') || q.includes('worker details') || q.includes('about worker')) {
      result.isWorkerInfo = true;
      const workerMatch = q.match(/worker\s*([a-z0-9\-]+)/i);
      if (workerMatch) result.workerCode = workerMatch[1];
    }

    // Data source detection
    if (q.includes('worker') || q.includes('employee') || q.includes('staff')) result.dataSource = 'workers';
    else if (q.includes('department') || q.includes('dept')) result.dataSource = 'departments';
    else if (q.includes('line')) result.dataSource = 'lines';
    else if (q.includes('operation')) result.dataSource = 'operations';
    else if (q.includes('company') || q.includes('companies')) result.dataSource = 'companies';
    else if (q.includes('quality') || q.includes('waste')) result.dataSource = 'quality';
    else if (q.includes('trend') || q.includes('forecast')) result.dataSource = 'trends';
    else result.dataSource = 'general';

    // Type detection (fallback)
    if (result.type === 'unknown') {
      if (q.includes('top') || q.includes('best') || q.includes('highest')) result.type = 'top';
      else if (q.includes('low') || q.includes('worst') || q.includes('lowest')) result.type = 'low';
      else if (q.includes('comparison') || q.includes('compare') || q.includes('vs')) result.type = 'comparison';
      else if (q.includes('worker') || q.includes('employee')) result.type = 'worker';
      else if (q.includes('department') || q.includes('dept')) result.type = 'department';
      else if (q.includes('line')) result.type = 'line';
      else if (q.includes('total') || q.includes('all') || q.includes('overview') || q.includes('summary')) result.type = 'overview';
    }

    return result;
  }, []);

  // ===== GET WORKERS FOR LINE =====
  const getWorkersForLine = useCallback((lineCode: string) => {
    if (!apiData_Filter) return [];
    const workers = new Map();
    apiData_Filter.forEach((item: any) => {
      const itemLineCode = item.LineCode || item.line_code || item.LineId;
      if (itemLineCode && itemLineCode.toString().trim() === lineCode.toString().trim()) {
        const code = item.WorkerCode;
        if (code && !workers.has(code)) {
          workers.set(code, {
            WorkerCode: code,
            WorkerDescription: item.WorkerDescription || item.WorkerName || code,
            CompanyId: item.CompanyId || 'N/A',
            BrId: item.BrId || 'N/A',
            DepartmentName: item.DepartmentName || 'N/A'
          });
        }
      }
    });
    return Array.from(workers.values());
  }, [apiData_Filter]);

  // ===== GENERATE RESPONSE =====
  const generateResponse = useCallback((question: string): string | FormattedResponse | Message => {
    const parsed = parseSmartQuery(question);
    const q = question.toLowerCase();

    // Stop speech
    if (parsed.stopSpeech) {
      stopSpeaking();
      const msg = '🛑 **Stopped!** Anything else?';
      if (speakEnabled) speakText(msg);
      return msg;
    }

    // Close
    if (parsed.isClose) {
      if (speakEnabled) speakText('Goodbye! Have a great day!');
      setTimeout(() => onClose(), 500);
      return '👋 **Goodbye!** Closing chat... Have a great day!';
    }

    // Help
    if (parsed.isHelp) {
      const msg = '🤖 **I can help you with:**\n\n' +
        '📊 **KPIs:** "total production", "all kpis", "efficiency"\n' +
        '👥 **Workers:** "top 3 workers", "only names of top 5 workers", "top 2 workers bar chart"\n' +
        '🏢 **Lines:** "best line", "line L001 workers"\n' +
        '📈 **Comparisons:** "company comparison", "department comparison pie chart"\n' +
        '📋 **Data:** "show table", "workers list"\n' +
        '🏭 **Metrics:** "total efficiency", "total variance"\n' +
        '💡 **Analytics:** "analyze departments", "quality analysis", "trend analysis"\n' +
        '🔊 **Voice:** Click mic or enable Auto Voice\n' +
        '📝 **Exact Count:** "top 2 workers" gives exactly 2 workers\n' +
        '🎯 **Only Names:** "only names of top 3 workers"\n\n' +
        '💬 **Try these commands now!**';
      if (speakEnabled) speakText(msg);
      return msg;
    }

    // ===== TOTAL EFFICIENCY =====
    if (parsed.isTotalEfficiency) {
      if (!apiData_KPI) {
        const msg = '❌ KPI data not available.';
        if (speakEnabled) speakText(msg);
        return msg;
      }
      const efficiency = apiData_KPI.total_efficiency || 0;
      const productivity = apiData_KPI.productivity_rate || '0%';
      const output = apiData_KPI.total_output_units || 0;
      const planned = apiData_KPI.planned_production || 0;
      const status = efficiency >= 90 ? '🟢 Excellent' : efficiency >= 70 ? '🟡 Good' : '🔴 Needs Improvement';
      
      const msg = `🏭 **Total Factory Efficiency:**\n\n` +
        `📊 Efficiency: ${efficiency.toFixed(1)}%\n` +
        `⚡ Productivity Rate: ${productivity}\n` +
        `🏭 Total Output: ${output.toLocaleString()} units\n` +
        `🎯 Planned Production: ${planned.toLocaleString()} units\n` +
        `📈 Status: ${status}\n\n` +
        `💡 **Insight:** ${efficiency >= 90 ? 'Excellent performance! Keep it up!' : efficiency >= 70 ? 'Good performance with room for improvement.' : 'Focus on process improvement to boost efficiency.'}`;
      
      if (speakEnabled) speakText(`Total factory efficiency is ${efficiency.toFixed(1)} percent. ${status}`);
      return msg;
    }

    // ===== TOTAL VARIANCE =====
    if (parsed.isTotalVariance) {
      if (!apiData_KPI) {
        const msg = '❌ KPI data not available.';
        if (speakEnabled) speakText(msg);
        return msg;
      }
      const actual = apiData_KPI.total_output_units || 0;
      const planned = apiData_KPI.planned_production || 0;
      const variance = actual - planned;
      const variancePercent = planned > 0 ? (variance / planned) * 100 : 0;
      const status = variance >= 0 ? '🟢 Positive' : '🔴 Negative';
      
      const msg = `📊 **Total Production Variance:**\n\n` +
        `🎯 Planned: ${planned.toLocaleString()} units\n` +
        `🏭 Actual: ${actual.toLocaleString()} units\n` +
        `📈 Variance: ${variance >= 0 ? '+' : ''}${variance.toLocaleString()} units\n` +
        `📊 Variance %: ${variancePercent >= 0 ? '+' : ''}${variancePercent.toFixed(1)}%\n` +
        `📈 Status: ${status}\n\n` +
        `💡 **Insight:** ${variance >= 0 ? 'Production is on track! Exceeding targets.' : 'Production is below target. Focus on improvement.'}`;
      
      if (speakEnabled) speakText(`Total variance is ${variancePercent >= 0 ? 'positive' : 'negative'} ${Math.abs(variancePercent).toFixed(1)} percent.`);
      return msg;
    }

    // ===== COMPANY COMPARISON =====
    if (parsed.isCompanyComparison) {
      if (!apiData_Filter || apiData_Filter.length === 0) {
        const msg = '❌ No company data available.';
        if (speakEnabled) speakText(msg);
        return msg;
      }

      // Group by company
      const companyMap = new Map();
      apiData_Filter.forEach((item: any) => {
        const companyId = item.CompanyId || 'Unknown';
        if (!companyMap.has(companyId)) {
          companyMap.set(companyId, {
            name: companyId,
            totalProduction: 0,
            workerCount: 0,
            totalEfficiency: 0,
            efficiencyCount: 0
          });
        }
        const comp = companyMap.get(companyId);
        comp.totalProduction += item.ScannedQty || item.production || 0;
        comp.workerCount += 1;
        const eff = item.efficiency || item.Efficiency || 0;
        if (eff > 0) {
          comp.totalEfficiency += eff;
          comp.efficiencyCount += 1;
        }
      });

      const companyData = Array.from(companyMap.values()).map((comp: any) => ({
        ...comp,
        avgEfficiency: comp.efficiencyCount > 0 ? comp.totalEfficiency / comp.efficiencyCount : 0
      })).sort((a, b) => b.totalProduction - a.totalProduction);

      if (companyData.length === 0) {
        const msg = '❌ No company data available.';
        if (speakEnabled) speakText(msg);
        return msg;
      }

      // Store for context
      setLastContext({
        type: 'company_comparison',
        data: companyData,
        companyData: companyData,
        askedGraph: true,
        chartType: parsed.chartType || 'bar'
      });

      let response = '🏢 **Company Performance Comparison:**\n\n';
      companyData.forEach((comp: any, i: number) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
        response += `${medal} **${comp.name}**\n`;
        response += `   📊 Production: ${comp.totalProduction.toLocaleString()} units\n`;
        response += `   👥 Workers: ${comp.workerCount}\n`;
        response += `   ⚡ Avg Efficiency: ${comp.avgEfficiency.toFixed(1)}%\n\n`;
      });

      // Chart data
      const chartData = companyData.map((comp: any) => ({
        name: comp.name,
        value: comp.totalProduction,
        efficiency: comp.avgEfficiency
      }));

      // If graph requested
      if (parsed.isGraph && parsed.chartType) {
        setGraphData(chartData);
        setGraphType(parsed.chartType as 'bar' | 'pie' | 'line');
        setGraphTitle(`Company Comparison - ${parsed.chartType.toUpperCase()} Chart`);
        setShowGraph(true);
        const msg = `📊 **Company Comparison - ${parsed.chartType.toUpperCase()} Chart**\n\nShowing production by company.`;
        if (speakEnabled) speakText(msg);
        return {
          id: generateUniqueId(),
          text: msg,
          sender: 'bot',
          timestamp: new Date(),
          type: 'chart',
          chartData: chartData,
          showChart: true,
          chartType: parsed.chartType as 'bar' | 'pie' | 'line',
          chartTitle: graphTitle
        } as Message;
      }

      response += `\n💡 **Tip:** Add "bar chart", "pie chart", or "line chart" for graph!`;
      if (speakEnabled) speakText(response.replace(/\*\*/g, ''));
      return response;
    }

    // ===== DEPARTMENT COMPARISON =====
    if (parsed.isDepartmentComparison) {
      if (!departmentData || departmentData.length === 0) {
        const msg = '❌ No department data available.';
        if (speakEnabled) speakText(msg);
        return msg;
      }

      const sorted = [...departmentData].sort((a, b) => b.total_production - a.total_production);
      
      // Store for context
      setLastContext({
        type: 'department_comparison',
        data: sorted,
        departmentData: sorted,
        askedGraph: true,
        chartType: parsed.chartType || 'bar'
      });

      let response = '🏢 **Department Performance Comparison:**\n\n';
      sorted.forEach((d: any, i: number) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
        response += `${medal} ${d.department_name}: ${d.total_production.toLocaleString()} units\n`;
      });
      
      const chartData = departmentData.map((d: any) => ({
        name: d.department_name || 'Unknown',
        value: d.total_production || 0
      }));
      
      // If graph requested
      if (parsed.isGraph && parsed.chartType) {
        setGraphData(chartData);
        setGraphType(parsed.chartType as 'bar' | 'pie' | 'line');
        setGraphTitle(`Department Comparison - ${parsed.chartType.toUpperCase()} Chart`);
        setShowGraph(true);
        const msg = `📊 **Department Comparison - ${parsed.chartType.toUpperCase()} Chart**\n\nShowing production by department.`;
        if (speakEnabled) speakText(msg);
        return {
          id: generateUniqueId(),
          text: msg,
          sender: 'bot',
          timestamp: new Date(),
          type: 'chart',
          chartData: chartData,
          showChart: true,
          chartType: parsed.chartType as 'bar' | 'pie' | 'line',
          chartTitle: graphTitle
        } as Message;
      }
      
      response += `\n💡 **Tip:** Add "bar chart", "pie chart", or "line chart" for graph!`;
      if (speakEnabled) speakText(response.replace(/\*\*/g, ''));
      return response;
    }

    // ===== FOLLOW-UP: YES/OK =====
    if (parsed.isFollowUp && lastContext) {
      if (lastContext.askedGraph && lastContext.data) {
        const chartType = lastContext.chartType || 'bar';
        let dataToShow = lastContext.data;
        
        // If workers data, format properly
        if (lastContext.type === 'workers' && lastContext.workers) {
          dataToShow = lastContext.workers.map((w: any) => ({
            name: workerDetailsMap.get(w.WorkerCode?.toString().trim())?.WorkerDescription || w.WorkerCode,
            value: w.production_qty || 0,
            WorkerCode: w.WorkerCode
          }));
        }
        
        setGraphData(dataToShow);
        setGraphType(chartType as 'bar' | 'pie' | 'line');
        setGraphTitle(`Graph - ${chartType.toUpperCase()} Chart`);
        setShowGraph(true);
        const msg = `📊 **Showing Graph**\n\nHere is your ${chartType} chart.`;
        if (speakEnabled) speakText(msg);
        return {
          id: generateUniqueId(),
          text: msg,
          sender: 'bot',
          timestamp: new Date(),
          type: 'chart',
          chartData: dataToShow,
          showChart: true,
          chartType: chartType as 'bar' | 'pie' | 'line',
          chartTitle: graphTitle
        } as Message;
      }
      
      if (lastContext.askedNames && lastContext.workers) {
        let response = `👥 **Workers:**\n\n`;
        lastContext.workers.forEach((w: any, i: number) => {
          const details = workerDetailsMap.get(w.WorkerCode?.toString().trim());
          const name = details?.WorkerDescription || w.WorkerCode;
          response += `${i+1}. ${name} (${w.WorkerCode})\n`;
        });
        if (speakEnabled) {
          const names = lastContext.workers.map((w: any) => workerDetailsMap.get(w.WorkerCode?.toString().trim())?.WorkerDescription || w.WorkerCode).join(', ');
          speakText(`Workers: ${names}`);
        }
        return response;
      }
    }

    // ===== TOTAL WORKERS =====
    if (parsed.isTotalWorkers || (parsed.isKitny && q.includes('worker') && !q.includes('top') && !q.includes('low'))) {
      const allWorkers = [...(topWorkersData || []), ...(lowWorkersData || [])];
      const uniqueWorkers = new Map();
      allWorkers.forEach(w => {
        if (!uniqueWorkers.has(w.WorkerCode)) {
          uniqueWorkers.set(w.WorkerCode, w);
        }
      });
      const total = uniqueWorkers.size;
      const msg = `👥 **Total Workers:** ${total} workers hain.\n\n💡 **Sir, kia ap in workers ka graph dekhna chahenge?**\nOr try: "top ${Math.min(5, total)} workers" or "only names of top ${Math.min(5, total)} workers"`;
      if (speakEnabled) speakText(`Sir, total ${total} workers hain.`);
      setLastContext({
        type: 'total_workers',
        data: Array.from(uniqueWorkers.values()),
        workers: Array.from(uniqueWorkers.values()),
        askedGraph: true,
        chartType: 'bar'
      });
      return msg;
    }

    // ===== TODAY'S PRODUCTION =====
    if (parsed.isTodayProduction) {
      if (!apiData_KPI) {
        const msg = '❌ KPI data not available.';
        if (speakEnabled) speakText(msg);
        return msg;
      }
      const msg = `📊 **Sir, main check kar k bata raha hoon.**\n\n` +
        `🏭 Total Output: ${apiData_KPI.total_output_units?.toLocaleString() || 0} units\n` +
        `⚡ Productivity Rate: ${apiData_KPI.productivity_rate || '0%'}\n` +
        `📊 Quality Deviation: ${apiData_KPI.quality_deviation || 0}%\n` +
        `🎯 Planned Production: ${apiData_KPI.planned_production?.toLocaleString() || 0} units\n\n` +
        `💡 **Sir, kya aur kuch poochna hai?**`;
      if (speakEnabled) speakText(`Sir, today's production is ${apiData_KPI.total_output_units?.toLocaleString() || 0} units. Productivity rate is ${apiData_KPI.productivity_rate || '0%'}.`);
      return msg;
    }

    // ===== TOTAL RECORDS =====
    if (parsed.isTotalRecords || (parsed.isKitny && q.includes('records'))) {
      const totalRecords = apiData_Filter?.length || 0;
      const msg = `📊 **Sir, hamaray pass total ${totalRecords.toLocaleString()} records hain.**\n\n💡 **Kya ap in records ko table mein dekhna chahenge?**\nTry: "show table" to see all records.`;
      if (speakEnabled) speakText(`Sir, hamaray pass total ${totalRecords} records hain.`);
      setLastContext({
        type: 'total_records',
        data: apiData_Filter,
        askedGraph: false
      });
      return msg;
    }

    // ===== BEST WORKER =====
    if (parsed.isBestWorker) {
      if (!topWorkersData || topWorkersData.length === 0) {
        const msg = '❌ No worker data available.';
        if (speakEnabled) speakText(msg);
        return msg;
      }
      const best = topWorkersData[0];
      const details = workerDetailsMap.get(best.WorkerCode?.toString().trim());
      const name = details?.WorkerDescription || best.WorkerCode;
      const msg = `🏆 **Best Worker:**\n\n` +
        `👤 Name: ${name}\n` +
        `🆔 Code: ${best.WorkerCode}\n` +
        `📊 Production: ${best.production_qty?.toLocaleString() || 0} Qty\n` +
        `🏢 Company: ${details?.CompanyId || 'N/A'}\n` +
        `🏬 Branch: ${details?.BrId || 'N/A'}\n` +
        `📋 Department: ${details?.DepartmentName || 'N/A'}\n\n` +
        `💡 **Sir, kya ap is worker ka graph dekhna chahenge?**`;
      if (speakEnabled) speakText(`Best worker is ${name} with production of ${best.production_qty} quantity.`);
      setLastContext({
        type: 'best_worker',
        data: best,
        workers: [best],
        askedGraph: true,
        chartType: 'bar'
      });
      return msg;
    }

    // ===== SHOW TABLE =====
    if (parsed.isShowTable) {
      if (!apiData_Filter || apiData_Filter.length === 0) {
        const msg = '❌ No table data available.';
        if (speakEnabled) speakText(msg);
        return msg;
      }
      const count = parsed.exactCount ? Math.min(parsed.count, apiData_Filter.length) : Math.min(5, apiData_Filter.length);
      let response = `📋 **Showing ${count} Records:**\n\n`;
      apiData_Filter.slice(0, count).forEach((record: any, i: number) => {
        response += `**${i+1}.** 📅 ${record.ScanningDate || 'N/A'} | 👕 ${record.StyleNo || 'N/A'} | 👤 ${record.WorkerDescription || record.WorkerCode || 'N/A'} | 📊 ${record.ScannedQty || 0}\n`;
      });
      response += `\n📊 Total Records: ${apiData_Filter.length.toLocaleString()}`;
      if (speakEnabled) speakText(`Showing ${count} records. Total records are ${apiData_Filter.length}`);
      return response;
    }

    // ===== WORKERS (with exact count and only names) =====
    if (parsed.dataSource === 'workers' || parsed.type === 'worker' || parsed.type === 'top' || parsed.type === 'low' || q.includes('worker') || q.includes('employee')) {
      const data = parsed.type === 'low' ? lowWorkersData : topWorkersData;
      if (!data || data.length === 0) {
        const msg = '❌ No worker data available.';
        if (speakEnabled) speakText(msg);
        return msg;
      }
      
      // EXACT COUNT - FIXED
      let count = parsed.exactCount ? parsed.count : 5;
      count = Math.min(count, data.length);
      const workers = data.slice(0, count);
      
      setLastWorkerQuery({ type: parsed.type || 'top', workers, limit: count });
      setLastContext({
        type: 'workers',
        data: workers,
        workers: workers,
        askedNames: parsed.isOnlyNames,
        askedGraph: parsed.isGraph,
        chartType: parsed.chartType || 'bar'
      });

      // ONLY NAMES - FIXED
      if (parsed.isOnlyNames || parsed.isNameBtaDo) {
        let response = `👥 **Worker Names (${count}):**\n\n`;
        workers.forEach((w: WorkerPerformance, i: number) => {
          const details = workerDetailsMap.get(w.WorkerCode?.toString().trim());
          const name = details?.WorkerDescription || w.WorkerCode;
          response += `${i+1}. ${name} (${w.WorkerCode})\n`;
        });
        response += `\n💡 **Tip:** Add "bar chart" or "production" for more details.`;
        if (speakEnabled) {
          const names = workers.map((w: WorkerPerformance) => workerDetailsMap.get(w.WorkerCode?.toString().trim())?.WorkerDescription || w.WorkerCode).join(', ');
          speakText(`${parsed.type === 'top' ? 'Top' : 'Low'} ${count} workers: ${names}`);
        }
        return response;
      }

      // GRAPH WITH EXACT COUNT - FIXED
      if (parsed.isGraph && parsed.chartType) {
        const chartData = workers.map((w: WorkerPerformance) => ({
          name: workerDetailsMap.get(w.WorkerCode?.toString().trim())?.WorkerDescription || w.WorkerCode,
          value: w.production_qty || 0,
          WorkerCode: w.WorkerCode
        }));
        setGraphData(chartData);
        setGraphType(parsed.chartType as 'bar' | 'pie' | 'line');
        const title = parsed.type === 'top' ? `🏆 TOP ${count} Workers` : `📉 LOW ${count} Workers`;
        setGraphTitle(`${title} - ${parsed.chartType.toUpperCase()} Chart`);
        setShowGraph(true);
        const msg = `📊 **${title} - ${parsed.chartType.toUpperCase()} Chart**\n\nExactly ${count} ${parsed.type} performers.`;
        if (speakEnabled) speakText(msg);
        return {
          id: generateUniqueId(),
          text: msg,
          sender: 'bot',
          timestamp: new Date(),
          type: 'chart',
          chartData: chartData,
          showChart: true,
          chartType: parsed.chartType as 'bar' | 'pie' | 'line',
          chartTitle: graphTitle
        } as Message;
      }

      // DEFAULT RESPONSE WITH EXACT COUNT
      let response = `${parsed.type === 'top' ? '🏆 TOP' : '📉 LOW'} ${count} Workers (Exact):\n\n`;
      workers.forEach((w: WorkerPerformance, i: number) => {
        const details = workerDetailsMap.get(w.WorkerCode?.toString().trim());
        const name = details?.WorkerDescription || w.WorkerCode;
        response += `**${i+1}.** ${name}\n   🆔 ${w.WorkerCode}\n   📊 ${w.production_qty?.toLocaleString()} Qty\n`;
        if (details?.CompanyId && details.CompanyId !== 'N/A') response += `   🏢 ${details.CompanyId} - ${details.BrId}\n`;
        response += '\n';
      });
      response += `💡 **Tip:** Add "bar chart", "pie chart", or "line chart" for graph!\n`;
      response += `💡 **Tip:** Add "only names" to show just the names!`;
      
      if (speakEnabled) {
        const names = workers.map((w: WorkerPerformance) => workerDetailsMap.get(w.WorkerCode?.toString().trim())?.WorkerDescription || w.WorkerCode).join(', ');
        speakText(`${parsed.type === 'top' ? 'Top' : 'Low'} ${count} workers: ${names}`);
      }
      
      setLastContext({
        type: 'workers',
        data: workers,
        workers: workers,
        askedGraph: true,
        chartType: parsed.chartType || 'bar'
      });
      
      return response;
    }

    // ===== ALL KPIS =====
    if (parsed.isAllKPIs || (q.includes('total production') && !q.includes('chart') && !q.includes('graph')) || parsed.type === 'overview') {
      if (!apiData_KPI) return '❌ KPI data not available.';
      let response = '📊 **All KPIs:**\n\n';
      const allFields = [
        { key: 'total_output_units', label: 'Total Output', emoji: '🏭' },
        { key: 'productivity_rate', label: 'Productivity Rate', emoji: '⚡' },
        { key: 'quality_deviation', label: 'Quality Deviation', emoji: '📊' },
        { key: 'total_operations', label: 'Total Operations', emoji: '⚙️' },
        { key: 'workforce_strength', label: 'Workforce Strength', emoji: '👥' },
        { key: 'avg_operation_capacity', label: 'Avg Operation Capacity', emoji: '📈' },
        { key: 'waste_units', label: 'Waste Units', emoji: '✂️' },
        { key: 'planned_production', label: 'Planned Production', emoji: '🎯' },
        { key: 'total_efficiency', label: 'Total Efficiency', emoji: '🏭' },
        { key: 'total_variance', label: 'Total Variance', emoji: '📊' }
      ];
      allFields.forEach(f => {
        const val = apiData_KPI[f.key as keyof ApiResponse_KPI];
        if (val !== undefined) {
          const displayVal = typeof val === 'number' ? val.toLocaleString() : val;
          response += `${f.emoji} ${f.label}: ${displayVal}\n`;
        }
      });
      if (speakEnabled) speakText(response.replace(/\*\*/g, ''));
      return response;
    }

    // ===== LINE QUERY =====
    if (parsed.isLineQuery || q.includes('best line') || q.includes('top line') || q.includes('worst line')) {
      if (!lineEfficiencyData || lineEfficiencyData.length === 0) return '❌ No line data available.';
      
      const sorted = [...lineEfficiencyData].sort((a, b) => b.efficiency - a.efficiency);
      const isWorst = q.includes('worst') || q.includes('low');
      const bestOrWorst = isWorst ? sorted[sorted.length - 1] : sorted[0];
      
      if (!bestOrWorst) return '❌ No line found.';
      
      const workers = getWorkersForLine(bestOrWorst.line_code);
      
      setLastContext({
        type: 'line',
        data: bestOrWorst,
        lineCode: bestOrWorst.line_code,
        workers: workers,
        askedNames: true,
        askedGraph: false
      });

      const lineLabel = isWorst ? `🏢 Worst Line: ${bestOrWorst.line_code}` : `🏢 Best Line: ${bestOrWorst.line_code}`;
      let response = lineLabel + '\n\n';
      response += `📊 Efficiency: ${bestOrWorst.efficiency}%\n`;
      response += `📈 Actual: ${bestOrWorst.actual?.toLocaleString() || 0}\n`;
      response += `🎯 Target: ${bestOrWorst.target?.toLocaleString() || 0}\n`;
      
      if (workers && workers.length > 0) {
        response += `\n👥 Workers on this line: **${workers.length}**\n`;
        response += `💡 **Sir, kia ap is line ke workers janna chahenge?**\n`;
        response += `   - "kitny workers" for count\n`;
        response += `   - "name bta do" for names`;
      }
      
      if (speakEnabled) {
        speakText(`The ${isWorst ? 'worst' : 'best'} line is ${bestOrWorst.line_code} with efficiency of ${bestOrWorst.efficiency} percent.`);
      }
      return response;
    }

    // ===== LINE WORKERS QUERY (Follow-up) =====
    if ((q.includes('line') && q.includes('workers') && parsed.lineCode) || 
        (parsed.isKitny && lastContext?.type === 'line') ||
        (parsed.isNameBtaDo && lastContext?.type === 'line')) {
      const lineCode = parsed.lineCode || lastContext?.lineCode;
      if (!lineCode) return '❌ No line selected.';
      
      const workers = getWorkersForLine(lineCode);
      
      if (!workers || workers.length === 0) return `❌ No workers found for line ${lineCode}.`;
      
      if (parsed.isKitny || q.includes('count') || q.includes('kitny')) {
        const msg = `👥 Line ${lineCode} par **${workers.length}** workers hain.`;
        if (speakEnabled) speakText(`Line ${lineCode} par ${workers.length} workers hain.`);
        return msg;
      }
      
      if (parsed.isNameBtaDo || q.includes('names') || q.includes('workers')) {
        let response = `👥 **Line ${lineCode} Workers (${workers.length}):**\n\n`;
        workers.forEach((w: any, i: number) => {
          response += `${i+1}. ${w.WorkerDescription} (${w.WorkerCode})\n`;
        });
        if (speakEnabled) {
          const names = workers.map((w: any) => w.WorkerDescription).join(', ');
          speakText(`Line ${lineCode} par workers hain: ${names}`);
        }
        return response;
      }
      
      let response = `👥 **Line ${lineCode} Workers (${workers.length}):**\n\n`;
      workers.forEach((w: any, i: number) => {
        response += `${i+1}. ${w.WorkerDescription} (${w.WorkerCode})\n`;
      });
      if (speakEnabled) {
        const names = workers.map((w: any) => w.WorkerDescription).join(', ');
        speakText(`Line ${lineCode} par ${workers.length} workers hain: ${names}`);
      }
      return response;
    }

    // ===== ANALYTICS =====
    if (parsed.isAnalytics || parsed.isQuality || parsed.isTrend || parsed.isTarget || parsed.isBottleneck || parsed.isWorkerOptimization) {
      if (!apiData_Filter || apiData_Filter.length === 0) return '❌ No data for analytics.';
      
      if (parsed.isQuality || q.includes('quality')) {
        const result = formatQualityAnalysis(apiData_Filter, apiData_KPI || {});
        if (speakEnabled) speakText(result.text.replace(/\*\*/g, ''));
        return result;
      }
      if (parsed.isTrend || q.includes('trend') || q.includes('forecast')) {
        const result = formatTrendAnalysis(apiData_Filter, apiData_KPI || {});
        if (speakEnabled) speakText(result.text.replace(/\*\*/g, ''));
        return result;
      }
      if (parsed.isTarget || q.includes('target') || q.includes('goal') || q.includes('achievement')) {
        const result = formatTargetAnalysis(apiData_Filter, apiData_KPI || {});
        if (speakEnabled) speakText(result.text.replace(/\*\*/g, ''));
        return result;
      }
      if (parsed.isBottleneck || q.includes('bottleneck') || q.includes('line issue')) {
        const result = formatLineBottleneckAnalysis(apiData_Filter, apiData_KPI || {});
        if (speakEnabled) speakText(result.text.replace(/\*\*/g, ''));
        return result;
      }
      if (parsed.isWorkerOptimization || q.includes('optimize workers')) {
        // Use existing worker optimization
        const msg = `👥 **Worker Optimization Analysis:**\n\n` +
          `💡 **Suggestions:**\n` +
          `• Cross-train workers in high-demand departments\n` +
          `• Move top performers to critical lines\n` +
          `• Provide additional training to underperformers\n` +
          `• Implement skill-based task allocation\n` +
          `• Regular performance reviews and feedback`;
        if (speakEnabled) speakText(msg);
        return msg;
      }
      // Default analytics
      const result = formatDepartmentAnalysis(apiData_Filter, apiData_KPI || {});
      if (speakEnabled) speakText(result.text.replace(/\*\*/g, ''));
      return result;
    }

    // ===== DEPARTMENT GRAPH =====
    if ((q.includes('department') || q.includes('dept')) && parsed.isGraph) {
      if (!departmentData || departmentData.length === 0) {
        const msg = '❌ No department data available.';
        if (speakEnabled) speakText(msg);
        return msg;
      }
      const chartData = departmentData.map((d: any) => ({
        name: d.department_name || 'Unknown',
        value: d.total_production || 0
      }));
      setGraphData(chartData);
      setGraphType((parsed.chartType || 'bar') as 'bar' | 'pie' | 'line');
      setGraphTitle(`Department Wise Production - ${(parsed.chartType || 'bar').toUpperCase()} Chart`);
      setShowGraph(true);
      const msg = `📊 **Department Wise Production - ${(parsed.chartType || 'bar').toUpperCase()} Chart**\n\nShowing production by department.`;
      if (speakEnabled) speakText(msg);
      return {
        id: generateUniqueId(),
        text: msg,
        sender: 'bot',
        timestamp: new Date(),
        type: 'chart',
        chartData: chartData,
        showChart: true,
        chartType: (parsed.chartType || 'bar') as 'bar' | 'pie' | 'line',
        chartTitle: graphTitle
      } as Message;
    }

    // ===== DEPARTMENT WISE PRODUCTION (Text) =====
    if ((q.includes('department wise production') || q.includes('production by department')) && !parsed.isGraph) {
      if (!departmentData || departmentData.length === 0) {
        const msg = '❌ No department data available.';
        if (speakEnabled) speakText(msg);
        return msg;
      }
      let response = '📊 **Department Wise Production:**\n\n';
      const sorted = [...departmentData].sort((a, b) => b.total_production - a.total_production);
      sorted.forEach((d: any, i: number) => {
        response += `${i+1}. ${d.department_name}: ${d.total_production.toLocaleString()} units\n`;
      });
      response += `\n💡 **Tip:** Add "bar chart", "pie chart", or "line chart" for graph!`;
      if (speakEnabled) speakText(response.replace(/\*\*/g, ''));
      return response;
    }

    // ===== LINE EFFICIENCY GRAPH =====
    if ((q.includes('line') || q.includes('efficiency')) && parsed.isGraph) {
      if (!lineEfficiencyData || lineEfficiencyData.length === 0) return '❌ No line efficiency data available.';
      const chartData = lineEfficiencyData.map((l: any) => ({
        name: l.line_code || 'Unknown',
        value: l.efficiency || 0,
        actual: l.actual || 0,
        target: l.target || 0
      }));
      setGraphData(chartData);
      setGraphType((parsed.chartType || 'bar') as 'bar' | 'pie' | 'line');
      setGraphTitle(`Line Efficiency - ${(parsed.chartType || 'bar').toUpperCase()} Chart`);
      setShowGraph(true);
      const msg = `📊 **Line Efficiency - ${(parsed.chartType || 'bar').toUpperCase()} Chart**\n\nShowing efficiency by line.`;
      if (speakEnabled) speakText(msg);
      return {
        id: generateUniqueId(),
        text: msg,
        sender: 'bot',
        timestamp: new Date(),
        type: 'chart',
        chartData: chartData,
        showChart: true,
        chartType: (parsed.chartType || 'bar') as 'bar' | 'pie' | 'line',
        chartTitle: graphTitle
      } as Message;
    }

    // ===== DASHBOARD =====
    if (q.includes('dashboard') || q.includes('kpi') || q.includes('overview') || q.includes('summary')) {
      if (!apiData_KPI) return '❌ Dashboard data not available.';
      let response = '📊 **Dashboard KPIs:**\n\n';
      const fields = [
        { key: 'total_output_units', label: 'Total Output', emoji: '🏭' },
        { key: 'productivity_rate', label: 'Productivity Rate', emoji: '⚡' },
        { key: 'quality_deviation', label: 'Quality Deviation', emoji: '📊' },
        { key: 'total_operations', label: 'Total Operations', emoji: '⚙️' },
        { key: 'workforce_strength', label: 'Workforce Strength', emoji: '👥' },
        { key: 'waste_units', label: 'Waste Units', emoji: '✂️' },
        { key: 'planned_production', label: 'Planned Production', emoji: '🎯' }
      ];
      fields.forEach(f => {
        const val = apiData_KPI[f.key as keyof ApiResponse_KPI];
        if (val !== undefined) response += `${f.emoji} ${f.label}: ${typeof val === 'number' ? val.toLocaleString() : val}\n`;
      });
      if (speakEnabled) speakText(response.replace(/\*\*/g, ''));
      return response;
    }

    // ===== DEFAULT =====
    const msg = '❓ **I didn\'t understand. Try these:**\n\n' +
      '👥 **Workers:** "top 3 workers", "only names of top 5 workers", "top 2 workers bar chart"\n' +
      '🏢 **Lines:** "best line", "line L001 workers"\n' +
      '📈 **Comparisons:** "company comparison", "department comparison pie chart"\n' +
      '🏭 **Metrics:** "total efficiency", "total variance"\n' +
      '📊 **KPIs:** "total production", "all kpis"\n' +
      '📋 **Data:** "show table", "workers list"\n' +
      '💡 **Analytics:** "analyze departments", "quality analysis", "trend analysis"\n' +
      '🔊 **Voice:** Click mic or enable Auto Voice\n' +
      '📝 **Exact Count:** "top 2 workers" gives exactly 2 workers\n' +
      '🎯 **Only Names:** "only names of top 3 workers"\n\n' +
      '💬 **Or type "close" to exit chat**';
    
    if (speakEnabled) speakText('Sorry sir, mujhe samajh nahi aaya. Please in mein se koi try karein.');
    setSuggestions([
      'top 5 workers',
      'only names of top 3 workers',
      'bar chart of top workers',
      'department comparison pie chart',
      'company comparison',
      'total efficiency',
      'total variance',
      'show table',
      'close'
    ]);
    
    return msg;
  }, [apiData_KPI, apiData_Filter, departmentData, lineEfficiencyData, topWorkersData, lowWorkersData, parseSmartQuery, speakEnabled, speakText, stopSpeaking, onClose, workerDetailsMap, getWorkersForLine, lastContext]);

  // ===== HANDLE SEND MESSAGE =====
  const handleSendMessage = useCallback(async (voiceText?: string) => {
    const question = voiceText || inputText;
    if (!question.trim()) return;

    const q = question.toLowerCase();
    
    // Stop speech
    if (q.includes('ok enough') || q.includes('enough') || q.includes('bas karo') || q.includes('bas') || q.includes('stop') || q.includes('ruk jao') || q.includes('stop talking')) {
      stopSpeaking();
      const stopMsg = '🛑 **Stopped!** Anything else?';
      setMessages(prev => [...prev, { id: generateUniqueId(), text: question, sender: 'user', timestamp: new Date() }]);
      setMessages(prev => [...prev, { id: generateUniqueId(), text: stopMsg, sender: 'bot', timestamp: new Date(), type: 'success' }]);
      setInputText('');
      return;
    }

    // Close
    if (q.includes('close') || q === 'close' || q === 'bye' || q === 'exit') {
      setMessages(prev => [...prev, { id: generateUniqueId(), text: '👋 **Goodbye!** Closing chat...', sender: 'user', timestamp: new Date() }]);
      if (speakEnabled) speakText('Goodbye! Have a great day!');
      setTimeout(() => onClose(), 500);
      setInputText('');
      return;
    }

    // Add user message
    const userMessage: Message = { id: generateUniqueId(), text: question, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setShouldAutoScroll(true);

    // Check data
    if (!apiData_Filter && !apiData_KPI && !topWorkersData) {
      setMessages(prev => [...prev, { 
        id: generateUniqueId(), 
        text: '⚠️ Data is loading. Please wait...', 
        sender: 'bot', 
        timestamp: new Date(), 
        type: 'warning' 
      }]);
      setIsTyping(false);
      return;
    }

    // Generate response
    const result = generateResponse(question);

    // Handle response
    if (typeof result === 'string') {
      const botMessage: Message = { 
        id: generateUniqueId(), 
        text: result, 
        sender: 'bot', 
        timestamp: new Date(), 
        type: result.includes('❌') ? 'error' : result.includes('⚠️') ? 'warning' : 'success' 
      };
      setMessages(prev => [...prev, botMessage]);
      if (speakEnabled && !result.includes('❌')) speakText(result.replace(/\*\*/g, ''));
      
      // Update suggestions based on context
      if (result.includes('workers') || result.includes('Worker')) {
        setSuggestions(['only names', 'bar chart', 'pie chart', 'show table', 'close']);
      } else if (result.includes('department') || result.includes('Department')) {
        setSuggestions(['department comparison pie chart', 'bar chart', 'line chart', 'close']);
      } else if (result.includes('line') || result.includes('Line')) {
        setSuggestions(['line efficiency', 'workers on line', 'bar chart', 'close']);
      } else {
        setSuggestions(['top 5 workers', 'only names of top 3 workers', 'bar chart of top workers', 'department comparison', 'company comparison', 'total efficiency', 'total variance', 'show table', 'close']);
      }
    } else if ('chartData' in result && result.showChart) {
      const chartMessage = result as Message;
      setMessages(prev => [...prev, chartMessage]);
      if (speakEnabled) speakText(chartMessage.text.replace(/\*\*/g, ''));
      setSuggestions(['bar chart', 'pie chart', 'line chart', 'show table', 'close']);
    } else if ('text' in result && 'type' in result) {
      const formattedResult = result as FormattedResponse;
      const botMessage: Message = { 
        id: generateUniqueId(), 
        text: formattedResult.text, 
        sender: 'bot', 
        timestamp: new Date(), 
        type: formattedResult.type === 'analysis' ? 'analysis' : 'success',
        chartData: formattedResult.chartData,
        showChart: formattedResult.showChart || false
      };
      setMessages(prev => [...prev, botMessage]);
      if (speakEnabled) speakText(formattedResult.text.replace(/\*\*/g, ''));
      setSuggestions(['company comparison', 'department comparison', 'analyze departments', 'quality analysis', 'best line', 'close']);
    }

    // Store in history
    const historyEntry: QueryHistory = {
      question,
      answer: typeof result === 'string' ? result : result.text || '',
      timestamp: new Date(),
      type: typeof result === 'string' ? 'text' : 'chart'
    };
    setQueryHistory(prev => [...prev, historyEntry]);

    setIsTyping(false);
  }, [inputText, speakEnabled, speakText, stopSpeaking, onClose, apiData_Filter, apiData_KPI, topWorkersData, generateResponse]);

  // ===== HANDLE SUGGESTION CLICK =====
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputText(suggestion);
    setTimeout(() => handleSendMessage(suggestion), 100);
  }, [handleSendMessage]);

  // ===== HANDLE COPY MESSAGE =====
  const handleCopyMessage = useCallback(async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setSnackbarMessage('Copied to clipboard!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedMessageId(messageId);
      setSnackbarMessage('Copied to clipboard!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setTimeout(() => setCopiedMessageId(null), 2000);
    }
  }, []);

  // ===== EXPORT CHAT HISTORY =====
  const exportChatHistory = useCallback(() => {
    if (queryHistory.length === 0) {
      setSnackbarMessage('No chat history to export');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
      return;
    }

    const content = queryHistory.map(h => 
      `[${h.timestamp.toLocaleString()}] ${h.question}\nAnswer: ${h.answer}\n---`
    ).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_history_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    setSnackbarMessage('Chat history exported!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  }, [queryHistory]);

  // ===== RENDER CHART =====
  const renderChart = useCallback((message: Message) => {
    if (!message.chartData || !message.showChart) return null;
    const data = Array.isArray(message.chartData) ? message.chartData : [];
    if (data.length === 0) return null;

    const chartType = message.chartType || 'bar';

    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie 
              data={data} 
              dataKey="value" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
              outerRadius={80} 
              label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" strokeOpacity={0.3} />
            <XAxis dataKey="name" tick={{ fill: '#aaa', fontSize: 10 }} />
            <YAxis tick={{ fill: '#aaa', fontSize: 10 }} />
            <RechartsTooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Bar chart (default)
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" strokeOpacity={0.3} />
          <XAxis dataKey="name" tick={{ fill: '#aaa', fontSize: 10 }} />
          <YAxis tick={{ fill: '#aaa', fontSize: 10 }} />
          <RechartsTooltip />
          <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
            {data.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }, [COLORS]);

  // ===== GET GRADIENT COLORS =====
  const getGradientColors = useCallback(() => 'from-purple-600/90 via-indigo-600/90 to-blue-600/90', []);
  const getInputFocusRing = useCallback(() => 'focus:ring-purple-500', []);
  const getButtonGradient = useCallback(() => 'from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600', []);
  const getBotIconGradient = useCallback(() => 'from-purple-500 to-indigo-500', []);
  const getUserMessageGradient = useCallback(() => 'from-indigo-600 to-purple-600', []);
  const getHighlightColor = useCallback(() => 'text-purple-300', []);

  // ===== HANDLE CLOSE =====
  const handleClose = useCallback(() => {
    if (autoVoiceEnabled) { stopAutoVoice(); setAutoVoiceEnabled(false); }
    if (speakEnabled) { stopSpeaking(); }
    if (inputRef.current) { setSavedCursorPosition(inputRef.current.selectionStart || 0); }
    onClose();
  }, [autoVoiceEnabled, speakEnabled, stopSpeaking, stopAutoVoice, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
        <div className="relative w-full max-w-[450px] h-[98dvh] max-h-[98dvh] sm:h-[95dvh] sm:max-h-[95dvh] md:h-[90dvh] md:max-h-[90dvh] lg:h-[88dvh] lg:max-h-[88dvh] bg-gradient-to-br from-gray-900 via-gray-900/90 to-gray-900/90 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col">
          
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
          </div>

          {/* Header */}
          <div className={`relative bg-gradient-to-r ${getGradientColors()} backdrop-blur-md border-b border-white/20 px-4 sm:px-6 py-2 sm:py-3 flex-shrink-0`}>
            <div className="flex items-center justify-between flex-wrap gap-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <AutoAwesomeIcon className="text-white text-xs sm:text-sm" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-400 rounded-full border-2 border-white/30 animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-white font-bold text-xs sm:text-base flex items-center gap-1 sm:gap-2">
                    AI Assistant
                    <RocketIcon className="text-yellow-300 text-[10px] sm:text-xs" />
                  </h2>
                  <p className="text-white/70 text-[8px] sm:text-[10px] flex items-center gap-1">
                    <PsychologyIcon className="text-[8px] sm:text-xs" />
                    Smart Chatbot
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                {/* Export History Button */}
                <Tooltip title="Export Chat History">
                  <IconButton 
                    size="small" 
                    onClick={exportChatHistory}
                    sx={{ color: 'white/70', '&:hover': { color: 'white' } }}
                  >
                    <DownloadIcon className="text-sm sm:text-base" />
                  </IconButton>
                </Tooltip>

                {/* History Button */}
                <Tooltip title="View History">
                  <IconButton 
                    size="small" 
                    onClick={() => setShowHistory(true)}
                    sx={{ color: 'white/70', '&:hover': { color: 'white' } }}
                  >
                    <HistoryIcon className="text-sm sm:text-base" />
                  </IconButton>
                </Tooltip>

                <FormControlLabel
                  control={
                    <Switch
                      checked={speakEnabled}
                      onChange={(e) => { 
                        setSpeakEnabled(e.target.checked); 
                        if (!e.target.checked) stopSpeaking(); 
                        if (e.target.checked) {
                          setSnackbarMessage('Voice enabled');
                          setSnackbarSeverity('success');
                          setSnackbarOpen(true);
                        }
                      }}
                      size="small"
                      sx={{ 
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#10b981' }, 
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#10b981' } 
                      }}
                    />
                  }
                  label={<span className="text-white/80 text-[8px] sm:text-[10px] flex items-center gap-0.5">
                    <VolumeUpIcon className="text-[10px] sm:text-sm" />
                    {isSpeaking && <span className="text-green-400 text-[6px] sm:text-[8px] animate-pulse">●</span>}
                  </span>}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={autoVoiceEnabled}
                      onChange={(e) => setAutoVoiceEnabled(e.target.checked)}
                      size="small"
                      sx={{ 
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#8b5cf6' }, 
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#8b5cf6' } 
                      }}
                    />
                  }
                  label={<span className="text-white/80 text-[8px] sm:text-[10px] flex items-center gap-0.5">
                    <MicIcon className="text-[10px] sm:text-sm" />
                    {autoVoiceEnabled && <span className="text-green-400 text-[6px] sm:text-[8px] animate-pulse">●</span>}
                  </span>}
                />

                <button 
                  onClick={handleClose} 
                  className="w-6 h-6 sm:w-7 sm:h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all hover:rotate-90"
                >
                  <CloseIcon className="text-white text-[10px] sm:text-sm" />
                </button>
              </div>
            </div>
          </div>

          {/* Suggestions Bar */}
          <div className="relative bg-white/5 backdrop-blur-sm border-b border-white/10 p-1.5 sm:p-2 flex-shrink-0">
            <div className="flex flex-wrap gap-1 justify-center">
              {suggestions.slice(0, 6).map((suggestion, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleSuggestionClick(suggestion)} 
                  className="bg-white/10 hover:bg-white/20 text-white/80 text-[6px] sm:text-[8px] px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full transition-all border border-white/10 whitespace-nowrap"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="relative flex-1 min-h-0 overflow-y-auto p-2 sm:p-3 space-y-2 sm:space-y-3 custom-scrollbar">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-messageSlide`}>
                  {message.sender === 'bot' && (
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r ${getBotIconGradient()} flex items-center justify-center mr-1 sm:mr-1.5 shadow-lg flex-shrink-0`}>
                      <BotIcon className="text-white text-[8px] sm:text-[10px]" />
                    </div>
                  )}
                  <div className={`max-w-[85%] sm:max-w-[80%] ${message.sender === 'user' ? `bg-gradient-to-r ${getUserMessageGradient()} text-white rounded-2xl rounded-tr-none` : message.type === 'error' ? 'bg-red-500/20 backdrop-blur-sm text-white border border-red-500/30 rounded-2xl rounded-tl-none' : message.type === 'warning' ? 'bg-yellow-500/20 backdrop-blur-sm text-white border border-yellow-500/30 rounded-2xl rounded-tl-none' : message.type === 'analysis' ? 'bg-blue-500/10 backdrop-blur-sm text-white border border-blue-500/30 rounded-2xl rounded-tl-none' : message.type === 'chart' ? 'bg-purple-500/10 backdrop-blur-sm text-white border border-purple-500/30 rounded-2xl rounded-tl-none' : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-2xl rounded-tl-none'} p-2 sm:p-2.5 shadow-xl`}>
                    <div className="text-[10px] sm:text-xs whitespace-pre-line">
                      {message.text.split('\n').map((line, i) => {
                        if (line.includes('**') && message.sender === 'bot') {
                          const parts = line.split(/(\*\*.*?\*\*)/g);
                          return (
                            <p key={i} className={line.startsWith('•') ? 'ml-1 sm:ml-2' : ''}>
                              {parts.map((part, j) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return <span key={j} className={`${getHighlightColor()} font-bold bg-purple-500/20 px-0.5 sm:px-1 rounded`}>{part.replace(/\*\*/g, '')}</span>;
                                }
                                return <span key={j}>{part}</span>;
                              })}
                            </p>
                          );
                        }
                        return <p key={i} className={line.startsWith('•') ? 'ml-1 sm:ml-2' : ''}>{line}</p>;
                      })}
                    </div>

                    {message.showChart && message.chartData && (
                      <div className="mt-2">
                        {message.chartTitle && <p className="text-white/60 text-[8px] sm:text-[10px] text-center mb-1">{message.chartTitle}</p>}
                        {renderChart(message)}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-1">
                      <div className={`text-[7px] sm:text-[9px] ${message.sender === 'user' ? 'text-white/50' : 'text-white/40'}`}>
                        {(message.timestamp || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleCopyMessage(message.text, message.id)} 
                          className="text-white/40 hover:text-white/80 transition-colors"
                        >
                          {copiedMessageId === message.id ? 
                            <span className="text-green-400 text-[8px] sm:text-[10px]">✓</span> : 
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 sm:h-2.5 sm:w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                  {message.sender === 'user' && (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center ml-1 sm:ml-1.5 shadow-lg flex-shrink-0">
                      <PersonIcon className="text-white text-[8px] sm:text-[10px]" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-messageSlide">
                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r ${getBotIconGradient()} flex items-center justify-center mr-1 sm:mr-1.5`}>
                  <BotIcon className="text-white text-[8px] sm:text-[10px]" />
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-none p-2 sm:p-2.5 border border-white/20">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent p-1.5 sm:p-3">
            <div className="relative flex items-center gap-1 sm:gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => { setInputText(e.target.value); setSavedCursorPosition(e.target.selectionStart || 0); setShouldAutoScroll(false); }}
                  onFocus={() => setShouldAutoScroll(false)}
                  onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  placeholder={isVoiceListening || autoVoiceEnabled ? '🎤 Listening...' : 'Ask me anything...'}
                  className={`w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl pl-2.5 sm:pl-4 pr-6 sm:pr-10 py-1.5 sm:py-2 text-white text-[10px] sm:text-xs placeholder-white/50 focus:outline-none focus:ring-2 ${getInputFocusRing()} focus:border-transparent transition-all`}
                  disabled={isVoiceListening}
                />
              </div>

              <VoiceInputButton
                onTranscript={(text) => { setInputText(text); setTimeout(() => handleSendMessage(text), 300); }}
                disabled={isTyping || autoVoiceEnabled}
                language="en-US"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isTyping}
                className={`w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-r ${getButtonGradient()} rounded-xl sm:rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/30 group flex-shrink-0`}
              >
                <SendIcon className="text-white text-[10px] sm:text-sm group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History Drawer */}
      <Drawer anchor="right" open={showHistory} onClose={() => setShowHistory(false)}>
        <Box sx={{ width: 350, p: 2, bgcolor: '#1a1a2e', height: '100%', color: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Chat History</Typography>
            <IconButton onClick={() => setShowHistory(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          {queryHistory.length === 0 ? (
            <Typography sx={{ color: 'gray', textAlign: 'center', mt: 4 }}>
              No chat history yet
            </Typography>
          ) : (
            <List sx={{ maxHeight: 'calc(100vh - 100px)', overflow: 'auto' }}>
              {queryHistory.slice().reverse().map((item, index) => (
                <ListItem key={index} sx={{ borderBottom: '1px solid #333', py: 1 }}>
                  <ListItemIcon>
                    <Box sx={{ color: item.type === 'chart' ? '#8b5cf6' : '#60a5fa', fontSize: '12px' }}>
                      {item.type === 'chart' ? '📊' : '💬'}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>
                        {item.question}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ fontSize: '10px', color: '#94a3b8', mt: 0.5 }}>
                        {item.answer.length > 100 ? item.answer.slice(0, 100) + '...' : item.answer}
                        <br />
                        <span style={{ fontSize: '8px', color: '#64748b' }}>
                          {item.timestamp.toLocaleString()}
                        </span>
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
          {queryHistory.length > 0 && (
            <Button 
              fullWidth 
              variant="contained" 
              onClick={exportChatHistory}
              sx={{ mt: 2, bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}
            >
              Export History
            </Button>
          )}
        </Box>
      </Drawer>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbarSeverity} sx={{ bgcolor: '#1a1a2e', color: 'white' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ChatBotAI;