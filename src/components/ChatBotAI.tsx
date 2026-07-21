// ChatBotAI.tsx - Complete File with Roman Urdu Translations
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Close as CloseIcon, Send as SendIcon, SmartToy as BotIcon, Person as PersonIcon, AutoAwesome as AutoAwesomeIcon, Psychology as PsychologyIcon, RocketLaunch as RocketIcon, Mic as MicIcon, Translate as TranslateIcon, VolumeUp as VolumeUpIcon } from '@mui/icons-material';
import { Paper, Typography, Box, Select, MenuItem, FormControl, InputLabel, IconButton, Tooltip, CircularProgress, Switch, FormControlLabel, Chip } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useGetAllKpiData, useGetAllFilterData, useWorkersPerformance, usegetDepartmentWise, useGetLineEfficiency, useGetLineOperationScanning } from '../services/api';

// ===== IMPORT SERVICES =====
import { formatDepartmentAnalysis, formatLineBottleneckAnalysis, formatCompanyComparison, formatTrendAnalysis, formatQualityAnalysis, formatTargetAnalysis, formatSmartRecommendations, type FormattedResponse } from '../services/chatbotResponseFormatter';
import VoiceInputButton from './VoiceInputButton';
import { initVoiceRecognition, startVoiceListening, stopVoiceListening, checkVoiceSupport, type VoiceState, type VoiceConfig } from '../services/chatbotVoiceHandler';

// ===== TRANSLATIONS (Roman Urdu) =====
const translations = {
  en: {
    welcome: '✨ **Welcome to AI Assistant!**\n\nI can help you with everything:\n\n📊 **Dashboard KPIs** - Production, Efficiency, Quality\n📋 **Table Data** - Workers, Companies, Departments\n👥 **Workers** - Top/Low performers with exact count\n📈 **Graphs** - Bar, Pie, Line charts for any data\n💡 **Analytics** - Departments, Bottlenecks, Trends\n🏢 **Comparisons** - Companies, Lines, Departments\n\n🔊 **Voice:** Click mic or enable "Auto Voice"\n\n💬 **Try:** "top 5 workers bar chart", "best line", "company comparison pie chart"',
    help: '🤖 **Main in cheezon mein madad kar sakta hoon:**\n\n📊 **KPIs:** "total production", "all kpis", "efficiency"\n👥 **Workers:** "top 3 workers", "low 2 workers bar chart"\n🏢 **Lines:** "best line", "line L001 workers"\n📈 **Comparisons:** "company comparison pie chart", "compare lines"\n📋 **Data:** "show table", "workers list"\n💡 **Analytics:** "analyze departments", "quality analysis"\n🔊 **Voice:** Mic click karein ya "Auto Voice" enable karein\n📝 **Exact Count:** "top 2 workers" exact 2 workers deta hai',
    greeting: '👋 Hello! Main kya help kar sakta hoon?\n\n💬 **Try:** "top 5 workers", "best line", "company comparison pie chart"',
    goodbye: '👋 **Goodbye!** Chat band kar raha hoon... Have a great day!',
    noData: '❌ Koi data available nahi hai.',
    loading: '⚠️ Data load ho raha hai. Please wait...',
    close: 'close',
    notFound: '❓ **Mujhe samajh nahi aaya. Ye try karein:**\n\n👥 **Workers:** "top 3 workers", "top 2 workers bar chart"\n🏢 **Lines:** "best line", "line L001 workers"\n📈 **Comparisons:** "company comparison", "company comparison pie chart"\n📊 **KPIs:** "total production", "all kpis"\n📋 **Data:** "show table", "workers list"\n💡 **Analytics:** "analyze departments", "quality analysis"\n🔊 **Voice:** Mic click karein ya Auto Voice enable karein\n\n💬 **Ya "close" type karein exit karne ke liye**',
    sorry: '😅 **Sorry sir, mujhe samajh nahi aaya.** Please in mein se koi try karein:\n\n👥 "top 5 workers"\n🏢 "best line"\n📊 "all kpis"\n📈 "company comparison pie chart"\n📋 "show table"\n💡 "analyze departments"',
    workers: '🏆 TOP {count} Workers',
    lowWorkers: '📉 LOW {count} Workers',
    line: '🏢 Best Line: {line}',
    worstLine: '🏢 Worst Line: {line}',
    comparison: '🏢 Company Comparison',
    deptComparison: '🏢 Department Comparison',
    allKpis: '📊 All KPIs',
    dashboard: '📊 Dashboard KPIs',
    records: '📋 {count} Records show kar raha hoon',
    totalRecords: '📊 Total Records: {count}',
    tip: '💡 **Tip:** "bar chart", "pie chart", ya "line chart" add karein graph ke liye!',
    tipGraph: '💡 **Tip:** Graph dekhne ke liye "graph" type karein!',
    tipWorkers: '💡 **Tip:** Saare workers dekhne ke liye "line {code} workers" poochhein',
    workerInfo: '👤 Worker Details: {name}',
    production: '📊 Production: {qty} Qty',
    efficiency: '📊 Efficiency: {eff}%',
    actual: '📈 Actual: {actual}',
    target: '🎯 Target: {target}',
    workersOnLine: '👥 Is line par workers: **{count}**',
    stopMsg: '🛑 **Ruk gaya!** Kuch aur poochna hai?',
  },
  ur: {
    welcome: '✨ **AI Assistant mein Khush Amdeed!**\n\nMain har cheez mein madad kar sakta hoon:\n\n📊 **Dashboard KPIs** - Production, Efficiency, Quality\n📋 **Table Data** - Workers, Companies, Departments\n👥 **Workers** - Top/Low performers exact count ke saath\n📈 **Graphs** - Bar, Pie, Line charts kisi bhi data ke liye\n💡 **Analytics** - Departments, Bottlenecks, Trends\n🏢 **Comparisons** - Companies, Lines, Departments\n\n🔊 **Voice:** Mic click karein ya "Auto Voice" enable karein\n\n💬 **Try:** "top 5 workers bar chart", "best line", "company comparison pie chart"',
    help: '🤖 **Main in cheezon mein madad kar sakta hoon:**\n\n📊 **KPIs:** "total production", "all kpis", "efficiency"\n👥 **Workers:** "top 3 workers", "low 2 workers bar chart"\n🏢 **Lines:** "best line", "line L001 workers"\n📈 **Comparisons:** "company comparison pie chart", "compare lines"\n📋 **Data:** "show table", "workers list"\n💡 **Analytics:** "analyze departments", "quality analysis"\n🔊 **Voice:** Mic click karein ya "Auto Voice" enable karein\n📝 **Exact Count:** "top 2 workers" exact 2 workers deta hai',
    greeting: '👋 Hello! Main kya help kar sakta hoon?\n\n💬 **Try:** "top 5 workers", "best line", "company comparison pie chart"',
    goodbye: '👋 **Goodbye!** Chat band kar raha hoon... Have a great day!',
    noData: '❌ Koi data available nahi hai.',
    loading: '⚠️ Data load ho raha hai. Please wait...',
    close: 'close',
    notFound: '❓ **Mujhe samajh nahi aaya. Ye try karein:**\n\n👥 **Workers:** "top 3 workers", "top 2 workers bar chart"\n🏢 **Lines:** "best line", "line L001 workers"\n📈 **Comparisons:** "company comparison", "company comparison pie chart"\n📊 **KPIs:** "total production", "all kpis"\n📋 **Data:** "show table", "workers list"\n💡 **Analytics:** "analyze departments", "quality analysis"\n🔊 **Voice:** Mic click karein ya Auto Voice enable karein\n\n💬 **Ya "close" type karein exit karne ke liye**',
    sorry: '😅 **Sorry sir, mujhe samajh nahi aaya.** Please in mein se koi try karein:\n\n👥 "top 5 workers"\n🏢 "best line"\n📊 "all kpis"\n📈 "company comparison pie chart"\n📋 "show table"\n💡 "analyze departments"',
    workers: '🏆 TOP {count} Workers',
    lowWorkers: '📉 LOW {count} Workers',
    line: '🏢 Best Line: {line}',
    worstLine: '🏢 Worst Line: {line}',
    comparison: '🏢 Company Comparison',
    deptComparison: '🏢 Department Comparison',
    allKpis: '📊 All KPIs',
    dashboard: '📊 Dashboard KPIs',
    records: '📋 {count} Records show kar raha hoon',
    totalRecords: '📊 Total Records: {count}',
    tip: '💡 **Tip:** "bar chart", "pie chart", ya "line chart" add karein graph ke liye!',
    tipGraph: '💡 **Tip:** Graph dekhne ke liye "graph" type karein!',
    tipWorkers: '💡 **Tip:** Saare workers dekhne ke liye "line {code} workers" poochhein',
    workerInfo: '👤 Worker Details: {name}',
    production: '📊 Production: {qty} Qty',
    efficiency: '📊 Efficiency: {eff}%',
    actual: '📈 Actual: {actual}',
    target: '🎯 Target: {target}',
    workersOnLine: '👥 Is line par workers: **{count}**',
    stopMsg: '🛑 **Ruk gaya!** Kuch aur poochna hai?',
  }
};

// ===== INTERFACES =====
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'error' | 'success' | 'warning' | 'analysis';
  chartData?: any;
  showChart?: boolean;
  chartType?: 'bar' | 'pie' | 'line';
  chartTitle?: string;
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
}

interface WorkerPerformance {
  WorkerCode: string;
  production_qty: number;
}

type Language = 'en' | 'ur';

// ===== MAIN COMPONENT =====
const ChatBotAI: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  // ===== UNIQUE ID GENERATOR =====
  const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // ===== STATES =====
  const [language, setLanguage] = useState<Language>('en');
  const [speakEnabled, setSpeakEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechQueue, setSpeechQueue] = useState<string[]>([]);
  const [isSpeechStopped, setIsSpeechStopped] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateUniqueId(),
      text: translations.en.welcome,
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
    'top 5 workers bar chart',
    'best line',
    'company comparison pie chart',
    'department wise production',
    'smart recommendations',
    'close'
  ]);
  const [autoVoiceEnabled, setAutoVoiceEnabled] = useState(false);
  
  // Context tracking for follow-up questions
  const [lastContext, setLastContext] = useState<{
    type: string;
    data: any;
    lineCode?: string;
    workers?: any[];
    chartType?: string;
  } | null>(null);
  
  // Worker states
  const [companyBranches, setCompanyBranches] = useState<Map<string, string[]>>(new Map());
  const [lastWorkerQuery, setLastWorkerQuery] = useState<{ type: 'top' | 'low'; workers: WorkerPerformance[]; limit: number } | null>(null);
  const [showGraph, setShowGraph] = useState(false);
  const [graphData, setGraphData] = useState<any>(null);
  const [graphType, setGraphType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [graphTitle, setGraphTitle] = useState<string>('');
  
  // Voice states
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    transcript: '',
    isFinal: false,
    confidence: 0,
  });
  const recognitionRef = useRef<any>(null);

  // Data states
  const [apiData_KPI, setApiData_KPI] = useState<ApiResponse_KPI | null>(null);
  const [apiData_Filter, setApiData_Filter] = useState<any[] | null>(null);
  const [departmentData, setDepartmentData] = useState<any[] | null>(null);
  const [lineEfficiencyData, setLineEfficiencyData] = useState<any[] | null>(null);
  const [lineOperationData, setLineOperationData] = useState<any[] | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);

  // ===== FIXED DATE RANGE =====
  const fixedDateFrom = '2024-01-01';
  const fixedDateTo = '2024-12-31';

  // ===== API HOOKS =====
  const { data: kpiResponse, refetch: refetchKPI, isSuccess: kpiSuccess } = useGetAllKpiData(fixedDateFrom, fixedDateTo);
  const { data: filterResponse, refetch: refetchFilter, isSuccess: filterSuccess } = useGetAllFilterData(fixedDateFrom, fixedDateTo);
  const { data: topWorkers, refetch: refetchTop, isSuccess: topSuccess } = useWorkersPerformance('top', fixedDateFrom, fixedDateTo);
  const { data: lowWorkers, refetch: refetchLow, isSuccess: lowSuccess } = useWorkersPerformance('low', fixedDateFrom, fixedDateTo);
  const { data: deptData, refetch: refetchDept, isSuccess: deptSuccess } = usegetDepartmentWise(fixedDateFrom, fixedDateTo);
  const { data: lineData, refetch: refetchLine, isSuccess: lineSuccess } = useGetLineEfficiency(fixedDateFrom, fixedDateTo);
  const { data: opData, refetch: refetchOp, isSuccess: opSuccess } = useGetLineOperationScanning(fixedDateFrom, fixedDateTo);

  // ===== SPEECH SYNTHESIS =====
  const speakText = (text: string, lang: Language = 'en') => {
    if (!speakEnabled || !window.speechSynthesis || isSpeechStopped) return;
    
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/[📊📋👥🏢💡🔊💬📈📉📏👤🏆⭐⚠️✅❌🔴🟡🟢💡🔧🎯]/g, '')
      .replace(/\n/g, '. ')
      .trim();
    
    if (!cleanText) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'ur' ? 'ur-PK' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (speechQueue.length > 0 && !isSpeechStopped) {
        const next = speechQueue.shift();
        if (next) speakText(next, lang);
      }
    };
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsSpeechStopped(true);
      setSpeechQueue([]);
      setTimeout(() => setIsSpeechStopped(false), 1000);
    }
  };

  // ===== TRANSLATION HELPER =====
  const t = (key: string, params?: any): string => {
    let text = translations[language][key as keyof typeof translations.en] || key;
    if (params) {
      Object.keys(params).forEach(k => {
        text = text.replace(`{${k}}`, params[k]);
      });
    }
    return text;
  };

  // ===== UPDATE WELCOME ON LANGUAGE CHANGE =====
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === '1') {
      const welcomeMsg = {
        ...messages[0],
        text: t('welcome')
      };
      setMessages([welcomeMsg]);
    }
  }, [language]);

  // ===== EFFECTS =====
  useEffect(() => {
    const loadData = async () => {
      setIsTyping(true);
      await Promise.all([refetchKPI(), refetchFilter(), refetchTop(), refetchLow(), refetchDept(), refetchLine(), refetchOp()]);
      setIsTyping(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (kpiSuccess && kpiResponse && kpiResponse.length > 0) setApiData_KPI(kpiResponse[0]);
  }, [kpiSuccess, kpiResponse]);

  useEffect(() => {
    if (filterSuccess && filterResponse && filterResponse.length > 0) setApiData_Filter(filterResponse);
  }, [filterSuccess, filterResponse]);

  useEffect(() => {
    if (deptSuccess && deptData && deptData.length > 0) setDepartmentData(deptData);
  }, [deptSuccess, deptData]);

  useEffect(() => {
    if (lineSuccess && lineData && lineData.length > 0) setLineEfficiencyData(lineData);
  }, [lineSuccess, lineData]);

  useEffect(() => {
    if (opSuccess && opData && opData.length > 0) setLineOperationData(opData);
  }, [opSuccess, opData]);

  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(savedCursorPosition, savedCursorPosition);
      setShouldAutoScroll(false);
    }
  }, [isOpen, savedCursorPosition]);

  // ===== VOICE RECOGNITION =====
  useEffect(() => {
    const support = checkVoiceSupport();
    if (support.speechRecognition) {
      const init = initVoiceRecognition();
      if (init.supported) recognitionRef.current = init.recognition;
    }
  }, []);

  useEffect(() => {
    if (autoVoiceEnabled && recognitionRef.current) startAutoVoice();
    else if (!autoVoiceEnabled && recognitionRef.current) stopAutoVoice();
  }, [autoVoiceEnabled]);

  const startAutoVoice = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.language = language === 'ur' ? 'ur-PK' : 'en-US';
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
      recognitionRef.current.onerror = () => { if (autoVoiceEnabled) setTimeout(() => { try { recognitionRef.current?.start(); } catch(e) {} }, 1000); };
      recognitionRef.current.onend = () => { if (autoVoiceEnabled) setTimeout(() => { try { recognitionRef.current?.start(); } catch(e) {} }, 500); };
      recognitionRef.current.start();
    } catch(e) {}
  };

  const stopAutoVoice = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); recognitionRef.current.continuous = false; } catch(e) {}
    }
  };

  const handleVoiceStart = () => {
    if (!recognitionRef.current) return;
    setIsVoiceListening(true);
    const config: VoiceConfig = { 
      language: language === 'ur' ? 'ur-PK' : 'en-US', 
      continuous: false, 
      interimResults: true, 
      maxAlternatives: 1 
    };
    startVoiceListening(recognitionRef.current, config, (state) => setVoiceState(state), (transcript) => {
      setIsVoiceListening(false);
      if (transcript?.trim()) { setInputText(transcript); setTimeout(() => handleSendMessage(transcript), 300); }
    });
  };

  const handleVoiceStop = () => {
    if (recognitionRef.current) { stopVoiceListening(recognitionRef.current); setIsVoiceListening(false); }
  };

  // ===== COLOR CONSTANTS =====
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

  // ===== WORKER DETAILS MAP =====
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

  // ===== SMART QUERY PARSER =====
  const parseSmartQuery = (question: string) => {
    const q = question.toLowerCase();
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
      lineCode: null,
      workerCode: null,
      exactCount: false,
      raw: question,
      stopSpeech: false
    };

    // Check for speech stop commands
    if (q.includes('ok enough') || q.includes('enough') || q.includes('bas karo') || q.includes('bas') || q.includes('stop') || q.includes('ruk jao') || q.includes('ruff')) {
      result.type = 'stop_speech';
      result.stopSpeech = true;
      return result;
    }

    // Check for close
    if (q.includes('close') || q.includes('band') || q === 'close' || q === 'ok close') {
      result.type = 'close';
      result.isClose = true;
      return result;
    }

    // Check for chart type
    if (q.includes('pie')) result.chartType = 'pie';
    else if (q.includes('line')) result.chartType = 'line';
    else if (q.includes('bar') || q.includes('graph') || q.includes('chart')) result.chartType = 'bar';

    // Check for graph
    if (q.includes('graph') || q.includes('chart') || q.includes('show') || q.includes('visualize') || result.chartType) {
      result.isGraph = true;
    }

    // Check for comparison
    if (q.includes('comparison') || q.includes('compare') || q.includes('vs') || q.includes('versus')) {
      result.isComparison = true;
    }

    // Check for info request
    if (q.includes('info') || q.includes('information') || q.includes('details') || q.includes('detail')) {
      result.isInfo = true;
    }

    // Check for line query
    if (q.includes('line') || q.includes('best line') || q.includes('top line') || q.includes('worst line')) {
      result.isLineQuery = true;
      const lineMatch = q.match(/line\s*([a-z0-9\-]+)/i);
      if (lineMatch) result.lineCode = lineMatch[1].toUpperCase();
    }

    // Check for worker info
    if (q.includes('worker info') || q.includes('worker details') || q.includes('about worker')) {
      result.isWorkerInfo = true;
      const workerMatch = q.match(/worker\s*([a-z0-9\-]+)/i);
      if (workerMatch) result.workerCode = workerMatch[1];
    }

    // Extract count
    const countMatch = q.match(/(\d+)/);
    if (countMatch) {
      result.count = parseInt(countMatch[0]);
      result.exactCount = true;
    }

    // Determine type
    if (q.includes('top') || q.includes('best') || q.includes('highest')) result.type = 'top';
    else if (q.includes('low') || q.includes('worst') || q.includes('lowest')) result.type = 'low';
    else if (q.includes('comparison') || q.includes('compare') || q.includes('vs')) result.type = 'comparison';
    else if (q.includes('quality') || q.includes('waste')) result.type = 'quality';
    else if (q.includes('trend') || q.includes('forecast')) result.type = 'trend';
    else if (q.includes('recommendation') || q.includes('suggestion')) result.type = 'recommendation';
    else if (q.includes('target') || q.includes('goal')) result.type = 'target';
    else if (q.includes('department') || q.includes('dept')) result.type = 'department';
    else if (q.includes('line')) result.type = 'line';
    else if (q.includes('worker') || q.includes('employee')) result.type = 'worker';
    else if (q.includes('total production') || q.includes('production total') || q.includes('all kpi')) result.type = 'all_kpis';
    else if (q.includes('total') || q.includes('all') || q.includes('overview') || q.includes('summary')) result.type = 'overview';

    // Data source
    if (q.includes('company') || q.includes('companies')) result.dataSource = 'companies';
    else if (q.includes('department') || q.includes('dept')) result.dataSource = 'departments';
    else if (q.includes('line')) result.dataSource = 'lines';
    else if (q.includes('operation')) result.dataSource = 'operations';
    else if (q.includes('worker') || q.includes('employee')) result.dataSource = 'workers';
    else result.dataSource = 'general';

    return result;
  };

  // ===== GET WORKERS FOR A LINE =====
  const getWorkersForLine = (lineCode: string) => {
    if (!apiData_Filter) return [];
    const workers = new Map();
    apiData_Filter.forEach((item: any) => {
      if (item.LineCode === lineCode || item.LineCode === lineCode.toString()) {
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
  };

  // ===== GENERATE RESPONSE =====
  const generateResponse = (question: string): string | FormattedResponse | Message => {
    const parsed = parseSmartQuery(question);
    const q = question.toLowerCase();

    // ===== STOP SPEECH =====
    if (parsed.stopSpeech) {
      stopSpeaking();
      return t('stopMsg');
    }

    // ===== CLOSE =====
    if (parsed.isClose) {
      if (speakEnabled) speakText(t('goodbye'), language);
      setTimeout(() => onClose(), 500);
      return t('goodbye');
    }

    // ===== GREETINGS =====
    if (q.includes('hi') || q.includes('hello') || q === 'hi') {
      const msg = t('greeting');
      if (speakEnabled) speakText(msg, language);
      return msg;
    }

    // ===== HELP =====
    if (q.includes('help') || q.includes('what can you do') || q.includes('how to use')) {
      const msg = t('help');
      if (speakEnabled) speakText(msg, language);
      return msg;
    }

    // ===== ALL KPIS =====
    if (parsed.type === 'all_kpis' || (q.includes('total production') && !q.includes('chart') && !q.includes('graph'))) {
      if (!apiData_KPI) return t('noData');
      let response = t('allKpis') + '\n\n';
      const allFields = [
        { key: 'total_output_units', label: 'Total Output', emoji: '🏭' },
        { key: 'productivity_rate', label: 'Productivity Rate', emoji: '⚡' },
        { key: 'quality_deviation', label: 'Quality Deviation', emoji: '📊' },
        { key: 'total_operations', label: 'Total Operations', emoji: '⚙️' },
        { key: 'workforce_strength', label: 'Workforce Strength', emoji: '👥' },
        { key: 'avg_operation_capacity', label: 'Avg Operation Capacity', emoji: '📈' },
        { key: 'waste_units', label: 'Waste Units', emoji: '✂️' },
        { key: 'planned_production', label: 'Planned Production', emoji: '🎯' }
      ];
      allFields.forEach(f => {
        const val = apiData_KPI[f.key as keyof ApiResponse_KPI];
        if (val !== undefined) response += `${f.emoji} ${f.label}: ${typeof val === 'number' ? val.toLocaleString() : val}\n`;
      });
      if (speakEnabled) speakText(response.replace(/\*\*/g, ''), language);
      return response;
    }

    // ===== LINE QUERY =====
    if (parsed.isLineQuery || q.includes('best line') || q.includes('top line') || q.includes('worst line')) {
      if (!lineEfficiencyData || lineEfficiencyData.length === 0) return t('noData');
      
      const sorted = [...lineEfficiencyData].sort((a, b) => b.efficiency - a.efficiency);
      const isWorst = q.includes('worst') || q.includes('low');
      const bestOrWorst = isWorst ? sorted[sorted.length - 1] : sorted[0];
      
      if (!bestOrWorst) return t('noData');
      
      setLastContext({
        type: 'line',
        data: bestOrWorst,
        lineCode: bestOrWorst.line_code,
        workers: getWorkersForLine(bestOrWorst.line_code)
      });

      const lineLabel = isWorst ? t('worstLine', { line: bestOrWorst.line_code }) : t('line', { line: bestOrWorst.line_code });
      let response = lineLabel + '\n\n';
      response += t('efficiency', { eff: bestOrWorst.efficiency }) + '\n';
      response += t('actual', { actual: bestOrWorst.actual?.toLocaleString() || 0 }) + '\n';
      response += t('target', { target: bestOrWorst.target?.toLocaleString() || 0 }) + '\n';
      
      const workers = getWorkersForLine(bestOrWorst.line_code);
      if (workers.length > 0) {
        response += `\n${t('workersOnLine', { count: workers.length })}\n`;
        response += `💡 ${t('tipWorkers', { code: bestOrWorst.line_code })}`;
      }
      
      if (speakEnabled) speakText(response.replace(/\*\*/g, ''), language);
      return response;
    }

    // ===== LINE WORKERS QUERY =====
    if (q.includes('line') && q.includes('workers') && parsed.lineCode) {
      const lineCode = parsed.lineCode;
      const workers = getWorkersForLine(lineCode);
      
      if (workers.length === 0) return `❌ No workers found for line ${lineCode}.`;
      
      setLastContext({
        type: 'lineWorkers',
        data: workers,
        lineCode: lineCode,
        workers: workers
      });
      
      let response = `👥 **Workers on Line ${lineCode}** (${workers.length} workers):\n\n`;
      workers.forEach((w: any, i: number) => {
        response += `${i+1}. ${w.WorkerDescription} (${w.WorkerCode})\n`;
        response += `   🏢 ${w.CompanyId} - ${w.BrId}\n`;
        if (w.DepartmentName) response += `   📋 ${w.DepartmentName}\n`;
        response += '\n';
      });
      response += `💡 ${t('tipGraph')}`;
      
      if (speakEnabled) {
        const names = workers.map((w: any) => w.WorkerDescription).join(', ');
        speakText(`Workers on line ${lineCode}: ${names}`, language);
      }
      return response;
    }

    // ===== WORKER INFO =====
    if (parsed.isWorkerInfo && parsed.workerCode) {
      const code = parsed.workerCode;
      const details = workerDetailsMap.get(code);
      if (!details) return `❌ Worker ${code} not found.`;
      
      let production = 0;
      if (topWorkers) {
        const found = topWorkers.find((w: any) => w.WorkerCode === code);
        if (found) production = found.production_qty;
      }
      
      let response = t('workerInfo', { name: details.WorkerDescription || code }) + '\n\n';
      response += `🆔 Worker Code: ${code}\n`;
      response += `🏢 Company: ${details.CompanyId || 'N/A'}\n`;
      response += `🏬 Branch: ${details.BrId || 'N/A'}\n`;
      response += `📋 Department: ${details.DepartmentName || 'N/A'}\n`;
      if (production > 0) response += t('production', { qty: production.toLocaleString() }) + '\n';
      response += `\n💡 ${t('tipGraph')}`;
      
      if (speakEnabled) speakText(response.replace(/\*\*/g, ''), language);
      return response;
    }

    // ===== COMPARISON =====
    if (parsed.isComparison) {
      if (q.includes('company') || q.includes('companies')) {
        if (!apiData_Filter || apiData_Filter.length === 0) return t('noData');
        
        const companies = new Map();
        apiData_Filter.forEach((item: any) => {
          const comp = item.CompanyId || 'Unknown';
          if (!companies.has(comp)) {
            companies.set(comp, { name: comp, count: 0, production: 0 });
          }
          const data = companies.get(comp);
          data.count += 1;
          data.production += item.ScannedQty || 0;
        });
        
        const chartData = Array.from(companies.values()).map((c: any) => ({
          name: c.name,
          value: c.production || c.count
        }));
        
        setLastContext({
          type: 'comparison',
          data: chartData,
          chartType: parsed.chartType || 'bar'
        });
        
        if (parsed.isGraph && parsed.chartType) {
          setGraphData(chartData);
          setGraphType(parsed.chartType);
          setGraphTitle(`${t('comparison')} - ${parsed.chartType.toUpperCase()} Chart`);
          setShowGraph(true);
          const msg = `📊 **${t('comparison')}**\n\nShowing production by company.`;
          if (speakEnabled) speakText(msg, language);
          return {
            id: generateUniqueId(),
            text: msg,
            sender: 'bot',
            timestamp: new Date(),
            type: 'analysis',
            chartData: chartData,
            showChart: true,
            chartType: parsed.chartType,
            chartTitle: graphTitle
          } as Message;
        }
        
        let response = t('comparison') + '\n\n';
        const sorted = Array.from(companies.values()).sort((a: any, b: any) => b.production - a.production);
        sorted.forEach((c: any, i: number) => {
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
          response += `${medal} ${c.name}: ${c.production?.toLocaleString() || 0} units\n`;
        });
        response += `\n💡 ${t('tip')}`;
        
        if (speakEnabled) speakText(response.replace(/\*\*/g, ''), language);
        return response;
      }
      
      if (q.includes('department') || q.includes('dept')) {
        if (!departmentData || departmentData.length === 0) return t('noData');
        
        const chartData = departmentData.map((d: any) => ({
          name: d.department_name || 'Unknown',
          value: d.total_production || 0
        }));
        
        if (parsed.isGraph && parsed.chartType) {
          setGraphData(chartData);
          setGraphType(parsed.chartType);
          setGraphTitle(`${t('deptComparison')} - ${parsed.chartType.toUpperCase()} Chart`);
          setShowGraph(true);
          const msg = `📊 **${t('deptComparison')}**\n\nShowing production by department.`;
          if (speakEnabled) speakText(msg, language);
          return {
            id: generateUniqueId(),
            text: msg,
            sender: 'bot',
            timestamp: new Date(),
            type: 'analysis',
            chartData: chartData,
            showChart: true,
            chartType: parsed.chartType,
            chartTitle: graphTitle
          } as Message;
        }
        
        let response = t('deptComparison') + '\n\n';
        const sorted = [...departmentData].sort((a, b) => b.total_production - a.total_production);
        sorted.forEach((d: any, i: number) => {
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
          response += `${medal} ${d.department_name}: ${d.total_production?.toLocaleString() || 0} units\n`;
        });
        response += `\n💡 ${t('tip')}`;
        
        if (speakEnabled) speakText(response.replace(/\*\*/g, ''), language);
        return response;
      }
    }

    // ===== WORKERS =====
    if (parsed.dataSource === 'workers' || parsed.type === 'worker' || q.includes('worker') || q.includes('employee')) {
      const data = parsed.type === 'low' ? lowWorkers : topWorkers;
      if (!data || data.length === 0) return t('noData');
      
      const count = parsed.exactCount ? Math.min(parsed.count, data.length) : Math.min(parsed.count || 5, data.length);
      const workers = data.slice(0, count);
      
      setLastWorkerQuery({ type: parsed.type || 'top', workers, limit: count });
      setLastContext({
        type: 'workers',
        data: workers,
        workers: workers
      });

      if (parsed.isGraph && parsed.chartType) {
        const chartData = workers.map((w: WorkerPerformance) => ({
          name: workerDetailsMap.get(w.WorkerCode?.toString().trim())?.WorkerDescription || w.WorkerCode,
          value: w.production_qty || 0,
          WorkerCode: w.WorkerCode
        }));
        setGraphData(chartData);
        setGraphType(parsed.chartType);
        const title = parsed.type === 'top' ? t('workers', { count }) : t('lowWorkers', { count });
        setGraphTitle(`${title} - ${parsed.chartType.toUpperCase()} Chart`);
        setShowGraph(true);
        const msg = `📊 **${title} - ${parsed.chartType.toUpperCase()} Chart**\n\nExactly ${count} ${parsed.type} performers show kar raha hoon.`;
        if (speakEnabled) speakText(msg, language);
        return {
          id: generateUniqueId(),
          text: msg,
          sender: 'bot',
          timestamp: new Date(),
          type: 'analysis',
          chartData: chartData,
          showChart: true,
          chartType: parsed.chartType,
          chartTitle: graphTitle
        } as Message;
      }

      let response = `${parsed.type === 'top' ? '🏆 TOP' : '📉 LOW'} ${count} Workers (Exact):\n\n`;
      workers.forEach((w: WorkerPerformance, i: number) => {
        const details = workerDetailsMap.get(w.WorkerCode?.toString().trim());
        const name = details?.WorkerDescription || w.WorkerCode;
        response += `**${i+1}.** ${name}\n   🆔 ${w.WorkerCode}\n   📊 ${w.production_qty?.toLocaleString()} Qty\n`;
        if (details?.CompanyId && details.CompanyId !== 'N/A') response += `   🏢 ${details.CompanyId} - ${details.BrId}\n`;
        response += '\n';
      });
      response += `💡 ${t('tip')}`;
      
      if (speakEnabled) {
        const names = workers.map((w: WorkerPerformance) => workerDetailsMap.get(w.WorkerCode?.toString().trim())?.WorkerDescription || w.WorkerCode).join(', ');
        speakText(`${parsed.type === 'top' ? 'Top' : 'Low'} ${count} workers: ${names}`, language);
      }
      return response;
    }

    // ===== DEPARTMENT GRAPH =====
    if ((q.includes('department') || q.includes('dept')) && parsed.isGraph) {
      if (!departmentData || departmentData.length === 0) return t('noData');
      const chartData = departmentData.map((d: any) => ({
        name: d.department_name || 'Unknown',
        value: d.total_production || 0
      }));
      setGraphData(chartData);
      setGraphType(parsed.chartType || 'bar');
      setGraphTitle(`Department Wise Production - ${(parsed.chartType || 'bar').toUpperCase()} Chart`);
      setShowGraph(true);
      const msg = `📊 **Department Wise Production - ${(parsed.chartType || 'bar').toUpperCase()} Chart**\n\nShowing production by department.`;
      if (speakEnabled) speakText(msg, language);
      return {
        id: generateUniqueId(),
        text: msg,
        sender: 'bot',
        timestamp: new Date(),
        type: 'analysis',
        chartData: chartData,
        showChart: true,
        chartType: parsed.chartType || 'bar',
        chartTitle: graphTitle
      } as Message;
    }

    // ===== LINE EFFICIENCY GRAPH =====
    if ((q.includes('line') || q.includes('efficiency')) && parsed.isGraph) {
      if (!lineEfficiencyData || lineEfficiencyData.length === 0) return t('noData');
      const chartData = lineEfficiencyData.map((l: any) => ({
        name: l.line_code || 'Unknown',
        value: l.efficiency || 0,
        actual: l.actual || 0,
        target: l.target || 0
      }));
      setGraphData(chartData);
      setGraphType(parsed.chartType || 'bar');
      setGraphTitle(`Line Efficiency - ${(parsed.chartType || 'bar').toUpperCase()} Chart`);
      setShowGraph(true);
      const msg = `📊 **Line Efficiency - ${(parsed.chartType || 'bar').toUpperCase()} Chart**\n\nShowing efficiency by line.`;
      if (speakEnabled) speakText(msg, language);
      return {
        id: generateUniqueId(),
        text: msg,
        sender: 'bot',
        timestamp: new Date(),
        type: 'analysis',
        chartData: chartData,
        showChart: true,
        chartType: parsed.chartType || 'bar',
        chartTitle: graphTitle
      } as Message;
    }

    // ===== DASHBOARD =====
    if (q.includes('dashboard') || q.includes('kpi') || q.includes('overview') || q.includes('summary')) {
      if (!apiData_KPI) return t('noData');
      let response = t('dashboard') + '\n\n';
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
      if (speakEnabled) speakText(response.replace(/\*\*/g, ''), language);
      return response;
    }

    // ===== TABLE DATA =====
    if (q.includes('table') || q.includes('list') || q.includes('records') || q.includes('data') || q.includes('show me')) {
      if (!apiData_Filter || apiData_Filter.length === 0) return t('noData');
      const count = parsed.exactCount ? Math.min(parsed.count, apiData_Filter.length) : Math.min(5, apiData_Filter.length);
      let response = t('records', { count }) + '\n\n';
      apiData_Filter.slice(0, count).forEach((record: any, i: number) => {
        response += `**${i+1}.** 📅 ${record.ScanningDate || 'N/A'} | 👕 ${record.StyleNo || 'N/A'} | 👤 ${record.WorkerDescription || record.WorkerCode || 'N/A'} | 📊 ${record.ScannedQty || 0}\n`;
      });
      response += `\n${t('totalRecords', { count: apiData_Filter.length.toLocaleString() })}`;
      if (speakEnabled) speakText(response.replace(/\*\*/g, ''), language);
      return response;
    }

    // ===== ANALYTICS =====
    if (q.includes('analyze') || q.includes('analysis') || parsed.type === 'department' || parsed.type === 'quality' || parsed.type === 'trend' || parsed.type === 'recommendation' || parsed.type === 'target') {
      if (!apiData_Filter || apiData_Filter.length === 0) return t('noData');
      
      if (q.includes('department') || q.includes('dept')) {
        const result = formatDepartmentAnalysis(apiData_Filter, apiData_KPI || {});
        if (speakEnabled) speakText(result.text.replace(/\*\*/g, ''), language);
        return result;
      }
      if (q.includes('bottleneck') || q.includes('line issue')) {
        const result = formatLineBottleneckAnalysis(apiData_Filter, apiData_KPI || {});
        if (speakEnabled) speakText(result.text.replace(/\*\*/g, ''), language);
        return result;
      }
      if (q.includes('quality') || q.includes('waste')) {
        const result = formatQualityAnalysis(apiData_Filter, apiData_KPI || {});
        if (speakEnabled) speakText(result.text.replace(/\*\*/g, ''), language);
        return result;
      }
      if (q.includes('trend') || q.includes('forecast')) {
        const result = formatTrendAnalysis(apiData_Filter, apiData_KPI || {});
        if (speakEnabled) speakText(result.text.replace(/\*\*/g, ''), language);
        return result;
      }
      if (q.includes('recommendation') || q.includes('suggestion')) {
        const result = formatSmartRecommendations(apiData_Filter, apiData_KPI || {});
        if (speakEnabled) speakText(result.text.replace(/\*\*/g, ''), language);
        return result;
      }
      if (q.includes('target') || q.includes('goal')) {
        const result = formatTargetAnalysis(apiData_Filter, apiData_KPI || {});
        if (speakEnabled) speakText(result.text.replace(/\*\*/g, ''), language);
        return result;
      }
      return '💡 **Analytics Options:**\n• "analyze departments"\n• "line bottlenecks"\n• "quality analysis"\n• "smart recommendations"\n• "target achievement"';
    }

    // ===== FOLLOW-UP: SHOW GRAPH =====
    if (parsed.isGraph && lastContext) {
      let dataToShow = lastContext.data;
      let title = `Graph for ${lastContext.type}`;
      
      if (lastContext.type === 'workers' && lastContext.workers) {
        dataToShow = lastContext.workers.map((w: any) => ({
          name: workerDetailsMap.get(w.WorkerCode?.toString().trim())?.WorkerDescription || w.WorkerCode,
          value: w.production_qty || 0,
          WorkerCode: w.WorkerCode
        }));
        title = `${lastWorkerQuery?.type === 'top' ? '🏆 TOP' : '📉 LOW'} ${lastContext.workers.length} Workers`;
      } else if (lastContext.type === 'line' && lastContext.lineCode) {
        if (lineEfficiencyData) {
          dataToShow = lineEfficiencyData.map((l: any) => ({
            name: l.line_code || 'Unknown',
            value: l.efficiency || 0
          }));
          title = 'Line Efficiency';
        }
      } else if (lastContext.type === 'comparison') {
        title = 'Comparison Chart';
      }
      
      if (dataToShow && Array.isArray(dataToShow) && dataToShow.length > 0) {
        const chartType = parsed.chartType || lastContext.chartType || 'bar';
        setGraphData(dataToShow);
        setGraphType(chartType);
        setGraphTitle(`${title} - ${chartType.toUpperCase()} Chart`);
        setShowGraph(true);
        const msg = `📊 **${title} - ${chartType.toUpperCase()} Chart**\n\nShowing ${dataToShow.length} items.`;
        if (speakEnabled) speakText(msg, language);
        return {
          id: generateUniqueId(),
          text: msg,
          sender: 'bot',
          timestamp: new Date(),
          type: 'analysis',
          chartData: dataToShow,
          showChart: true,
          chartType: chartType,
          chartTitle: graphTitle
        } as Message;
      }
    }

    // ===== DEFAULT =====
    const msg = t('notFound');
    if (speakEnabled) speakText(t('sorry'), language);
    setSuggestions([
      'top 5 workers bar chart',
      'best line',
      'company comparison pie chart',
      'department wise production',
      'all kpis',
      'smart recommendations',
      'show table',
      'close'
    ]);
    return msg;
  };

  // ===== HANDLE SEND MESSAGE =====
  const handleSendMessage = async (voiceText?: string) => {
    const question = voiceText || inputText;
    if (!question.trim()) return;

    // Check for stop speech
    const q = question.toLowerCase();
    if (q.includes('ok enough') || q.includes('enough') || q.includes('bas karo') || q.includes('bas') || q.includes('stop') || q.includes('ruk jao')) {
      stopSpeaking();
      const stopMsg = t('stopMsg');
      setMessages(prev => [...prev, {
        id: generateUniqueId(),
        text: question,
        sender: 'user',
        timestamp: new Date()
      }]);
      setMessages(prev => [...prev, {
        id: generateUniqueId(),
        text: stopMsg,
        sender: 'bot',
        timestamp: new Date(),
        type: 'success'
      }]);
      setInputText('');
      return;
    }

    // Check for close
    if (q.includes('close') || q === 'close') {
      setMessages(prev => [...prev, {
        id: generateUniqueId(),
        text: '👋 **Goodbye!** Closing chat...',
        sender: 'user',
        timestamp: new Date()
      }]);
      if (speakEnabled) speakText(t('goodbye'), language);
      setTimeout(() => onClose(), 500);
      setInputText('');
      return;
    }

    const userMessage: Message = {
      id: generateUniqueId(),
      text: question,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setShouldAutoScroll(true);

    // Check data
    if (!apiData_Filter && !apiData_KPI && !topWorkers) {
      setMessages(prev => [...prev, {
        id: generateUniqueId(),
        text: t('loading'),
        sender: 'bot',
        timestamp: new Date(),
        type: 'warning'
      }]);
      setIsTyping(false);
      return;
    }

    const result = generateResponse(question);

    // Handle different result types
    if (typeof result === 'string') {
      setMessages(prev => [...prev, {
        id: generateUniqueId(),
        text: result,
        sender: 'bot',
        timestamp: new Date(),
        type: result.includes('❌') ? 'error' : result.includes('⚠️') ? 'warning' : 'success'
      }]);
      
      const suggestionOptions = [
        'top 5 workers bar chart',
        'best line',
        'company comparison pie chart',
        'department wise production',
        'all kpis',
        'smart recommendations',
        'show table',
        'close'
      ];
      setSuggestions(suggestionOptions);
    } else if ('chartData' in result && result.showChart) {
      setMessages(prev => [...prev, result as Message]);
      const suggestionOptions = [
        'bar chart',
        'pie chart',
        'line chart',
        'show table',
        'best line',
        'close'
      ];
      setSuggestions(suggestionOptions);
    } else if ('text' in result && 'type' in result) {
      const formattedResult = result as FormattedResponse;
      setMessages(prev => [...prev, {
        id: generateUniqueId(),
        text: formattedResult.text,
        sender: 'bot',
        timestamp: new Date(),
        type: formattedResult.type === 'analysis' ? 'analysis' : 'success',
        chartData: formattedResult.chartData,
        showChart: formattedResult.showChart || false,
        chartType: formattedResult.showChart ? 'bar' : undefined
      }]);
      const suggestionOptions = [
        'company comparison',
        'analyze departments',
        'quality analysis',
        'best line',
        'close'
      ];
      setSuggestions(suggestionOptions);
    }

    setIsTyping(false);
  };

  // ===== HANDLE SUGGESTION CLICK =====
  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    setTimeout(() => handleSendMessage(suggestion), 100);
  };

  // ===== HANDLE COPY =====
  const handleCopyMessage = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    }
  };

  // ===== HANDLE CLOSE =====
  const handleClose = () => {
    if (autoVoiceEnabled) {
      stopAutoVoice();
      setAutoVoiceEnabled(false);
    }
    if (speakEnabled) {
      stopSpeaking();
    }
    if (inputRef.current) {
      setSavedCursorPosition(inputRef.current.selectionStart || 0);
    }
    onClose();
  };

  // ===== RENDER CHART =====
  const renderChart = (message: Message) => {
    if (!message.chartData || !message.showChart) return null;
    const data = Array.isArray(message.chartData) ? message.chartData : [];
    if (data.length === 0) return null;

    const chartType = message.chartType || 'bar';

    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip />
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
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Default: Bar chart
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" strokeOpacity={0.3} />
          <XAxis dataKey="name" tick={{ fill: '#aaa', fontSize: 10 }} />
          <YAxis tick={{ fill: '#aaa', fontSize: 10 }} />
          <RechartsTooltip />
          <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // ===== STYLE HELPERS =====
  const getGradientColors = () => 'from-purple-600/90 via-indigo-600/90 to-blue-600/90';
  const getInputFocusRing = () => 'focus:ring-purple-500';
  const getButtonGradient = () => 'from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600';
  const getBotIconGradient = () => 'from-purple-500 to-indigo-500';
  const getUserMessageGradient = () => 'from-indigo-600 to-purple-600';
  const getHighlightColor = () => 'text-purple-300';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
      <div className="relative w-full max-w-[450px] h-[98dvh] max-h-[98dvh] sm:h-[95dvh] sm:max-h-[95dvh] md:h-[90dvh] md:max-h-[90dvh] lg:h-[88dvh] lg:max-h-[88dvh] bg-gradient-to-br from-gray-900 via-gray-900/90 to-gray-900/90 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col">
        
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        {/* Header with Toggles */}
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
                  {language === 'en' ? 'Smart Chatbot' : 'Smart Chatbot'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              {/* Language Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={language === 'ur'}
                    onChange={(e) => setLanguage(e.target.checked ? 'ur' : 'en')}
                    size="small"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#8b5cf6',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#8b5cf6',
                      },
                    }}
                  />
                }
                label={
                  <span className="text-white/80 text-[8px] sm:text-[10px] flex items-center gap-0.5">
                    <TranslateIcon className="text-[10px] sm:text-sm" />
                    {language === 'en' ? 'EN' : 'UR'}
                  </span>
                }
              />

              {/* Speak Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={speakEnabled}
                    onChange={(e) => {
                      setSpeakEnabled(e.target.checked);
                      if (!e.target.checked) stopSpeaking();
                    }}
                    size="small"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#10b981',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#10b981',
                      },
                    }}
                  />
                }
                label={
                  <span className="text-white/80 text-[8px] sm:text-[10px] flex items-center gap-0.5">
                    <VolumeUpIcon className="text-[10px] sm:text-sm" />
                    {isSpeaking ? '🔊' : ''}
                  </span>
                }
              />

              {/* Auto Voice Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={autoVoiceEnabled}
                    onChange={(e) => setAutoVoiceEnabled(e.target.checked)}
                    size="small"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#8b5cf6',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#8b5cf6',
                      },
                    }}
                  />
                }
                label={
                  <span className="text-white/80 text-[8px] sm:text-[10px] flex items-center gap-0.5">
                    <MicIcon className="text-[10px] sm:text-sm" />
                    {autoVoiceEnabled && <span className="text-green-400 text-[6px] sm:text-[8px] animate-pulse">●</span>}
                  </span>
                }
              />

              <button onClick={handleClose} className="w-6 h-6 sm:w-7 sm:h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all hover:rotate-90">
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

        {/* Messages Area */}
        <div className="relative flex-1 min-h-0 overflow-y-auto p-2 sm:p-3 space-y-2 sm:space-y-3 custom-scrollbar">
          {messages.map((message) => (
            <div key={message.id}>
              <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-messageSlide`}>
                {message.sender === 'bot' && (
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r ${getBotIconGradient()} flex items-center justify-center mr-1 sm:mr-1.5 shadow-lg flex-shrink-0`}>
                    <BotIcon className="text-white text-[8px] sm:text-[10px]" />
                  </div>
                )}
                <div className={`max-w-[85%] sm:max-w-[80%] ${
                  message.sender === 'user'
                    ? `bg-gradient-to-r ${getUserMessageGradient()} text-white rounded-2xl rounded-tr-none`
                    : message.type === 'error'
                    ? 'bg-red-500/20 backdrop-blur-sm text-white border border-red-500/30 rounded-2xl rounded-tl-none'
                    : message.type === 'warning'
                    ? 'bg-yellow-500/20 backdrop-blur-sm text-white border border-yellow-500/30 rounded-2xl rounded-tl-none'
                    : message.type === 'analysis'
                    ? 'bg-blue-500/10 backdrop-blur-sm text-white border border-blue-500/30 rounded-2xl rounded-tl-none'
                    : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-2xl rounded-tl-none'
                } p-2 sm:p-2.5 shadow-xl`}>
                  <div className="text-[10px] sm:text-xs whitespace-pre-line">
                    {message.text.split('\n').map((line, i) => {
                      if (line.includes('**') && message.sender === 'bot') {
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                          <p key={i} className={line.startsWith('•') ? 'ml-1 sm:ml-2' : ''}>
                            {parts.map((part, j) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <span key={j} className={`${getHighlightColor()} font-bold bg-purple-500/20 px-0.5 sm:px-1 rounded`}>
                                    {part.replace(/\*\*/g, '')}
                                  </span>
                                );
                              }
                              return <span key={j}>{part}</span>;
                            })}
                          </p>
                        );
                      }
                      return <p key={i} className={line.startsWith('•') ? 'ml-1 sm:ml-2' : ''}>{line}</p>;
                    })}
                  </div>

                  {/* Chart */}
                  {message.showChart && message.chartData && (
                    <div className="mt-2">
                      {message.chartTitle && (
                        <p className="text-white/60 text-[8px] sm:text-[10px] text-center mb-1">{message.chartTitle}</p>
                      )}
                      {renderChart(message)}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-1">
                    <div className={`text-[7px] sm:text-[9px] ${message.sender === 'user' ? 'text-white/50' : 'text-white/40'}`}>
                      {(message.timestamp || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {message.sender === 'bot' && (
                      <button onClick={() => handleCopyMessage(message.text, message.id)} className="text-white/40 hover:text-white/80 transition-colors ml-1 sm:ml-2">
                        {copiedMessageId === message.id ? (
                          <span className="text-green-400 text-[8px] sm:text-[10px]">✓ Copied!</span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 sm:h-2.5 sm:w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    )}
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

        {/* Input Area */}
        <div className="flex-shrink-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent p-1.5 sm:p-3">
          <div className="relative flex items-center gap-1 sm:gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setSavedCursorPosition(e.target.selectionStart || 0);
                  setShouldAutoScroll(false);
                }}
                onFocus={() => setShouldAutoScroll(false)}
                onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder={isVoiceListening || autoVoiceEnabled ? '🎤 Listening...' : (language === 'ur' ? 'Kuch poochhein...' : 'Ask me anything...')}
                className={`w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl pl-2.5 sm:pl-4 pr-6 sm:pr-10 py-1.5 sm:py-2 text-white text-[10px] sm:text-xs placeholder-white/50 focus:outline-none focus:ring-2 ${getInputFocusRing()} focus:border-transparent transition-all`}
                disabled={isVoiceListening}
              />
            </div>

            {/* Voice Button */}
            <VoiceInputButton
              onTranscript={(text) => {
                setInputText(text);
                setTimeout(() => handleSendMessage(text), 300);
              }}
              disabled={isTyping || autoVoiceEnabled}
              language={language === 'ur' ? 'ur-PK' : 'en-US'}
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
  );
};

export default ChatBotAI;