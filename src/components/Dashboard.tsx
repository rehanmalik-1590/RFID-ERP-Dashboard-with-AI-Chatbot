// ....Dashboard.tsx file .......................
import { useState, useEffect } from 'react';
import {
  Factory,
  TrendingUp,
  BarChart,
  Speed,
  CompareArrows,
  ContentCut,
  PlayArrow,
  Pause,
  People,
  Style,
  ViewModule,
  Notifications as BellIcon,
  AutoAwesome as AutoAwesomeIcon,
} from "@mui/icons-material";

import { useGetAllKpiData } from '../services/api'
import AIChatbot from './ChatBotAI';

interface DashboardProps {
  date_from: string;
  date_to: string;
  filters: any;
}

const Dashboard = ({ date_from, date_to, filters }: DashboardProps) => {
  useEffect(() => {
  }, [date_from, date_to, filters]);

  const [isAIOpen, setIsAIOpen] = useState(false);

  const { data: allData, isLoading, error, refetch } = useGetAllKpiData(date_from, date_to);
  const kpiData = allData?.[0] || null;

  useEffect(() => {
    if (date_from && date_to) {
      refetch();
    }
  }, [date_from, date_to, refetch]);

  if (isLoading && !kpiData) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex justify-center items-center p-4'>
        <div className='text-center'>
          <div className='relative'>
            <div className='absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 blur-xl opacity-20 animate-pulse'></div>
            <div className='relative bg-white/30 backdrop-blur-sm rounded-2xl px-4 sm:px-8 py-4 sm:py-6 shadow-xl border border-white/50'>
              <div className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
                Loading Dashboard Data...
              </div>
              <div className='mt-2 text-gray-600 text-sm sm:text-base'>Please wait while we fetch your data</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if(error && !kpiData) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex justify-center items-center p-4'>
        <div className='bg-white/30 backdrop-blur-sm rounded-2xl px-4 sm:px-8 py-4 sm:py-6 shadow-xl border border-white/50'>
          <div className='text-lg sm:text-xl font-bold text-red-600'>Error Loading Dashboard Data</div>
          <div className='mt-2 text-gray-600 text-sm sm:text-base'>Please try refreshing the page</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
        <header className="bg-white/70 backdrop-blur-md shadow-sm border-b border-indigo-100/50 sticky top-0 z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              RFID ERP Dashboard
            </h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6">
              {/* AI Assistant Button */}
              <button
                onClick={() => setIsAIOpen(true)}
                className="relative group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30 text-xs sm:text-sm"
              >
                <AutoAwesomeIcon className="text-base sm:text-lg animate-pulse" />
                <span className="font-medium hidden sm:inline">Chat</span>
                <span className="font-medium sm:hidden">AI</span>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] sm:text-xs py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden sm:block">
                  Ask anything about factory data
                </div>
              </button>

              {/* Date Range Display */}
              <div className="text-[10px] sm:text-xs md:text-sm bg-white/50 backdrop-blur-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full shadow-sm border border-indigo-100/50 flex flex-wrap items-center gap-1 sm:gap-2">
                <span className="font-semibold text-gray-700">From:</span> 
                <span className="text-indigo-600 font-mono text-[10px] sm:text-xs">{date_from}</span> 
                <span className="text-gray-300 hidden xs:inline">|</span>
                <span className="font-semibold text-gray-700 hidden xs:inline">To:</span> 
                <span className="text-purple-600 font-mono text-[10px] sm:text-xs">{date_to}</span>
              </div>
              
              <button className="p-1.5 sm:p-2 md:p-2.5 hover:bg-white/50 rounded-full transition-all duration-300 relative group">
                <BellIcon className="text-xl sm:text-2xl text-gray-600 group-hover:text-indigo-600 transition-colors" />
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
          </div>
        </header>

        <AIChatbot isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          {kpiData && Object.keys(kpiData).length > 0 ? (
            <>
              {/* Main KPI Cards - Responsive Grid */}
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
                {/* Total Output Units */}
                <div className="group bg-gradient-to-br from-indigo-50 to-indigo-100 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 border-l-4 border-indigo-500 hover:shadow-2xl hover:from-indigo-100 hover:to-indigo-200 transition-all duration-500 hover:-translate-y-1">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-indigo-400 to-indigo-600 p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <BarChart className="text-xl sm:text-2xl text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-indigo-600 uppercase tracking-wider truncate">
                        Total Output Units
                      </p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-900 mt-0.5 sm:mt-1 truncate">
                        {kpiData?.total_output_units?.toLocaleString() || "0"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Planned Production */}
                <div className="group bg-gradient-to-br from-emerald-50 to-emerald-100 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 border-l-4 border-emerald-500 hover:shadow-2xl hover:from-emerald-100 hover:to-emerald-200 transition-all duration-500 hover:-translate-y-1">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <TrendingUp className="text-xl sm:text-2xl text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-emerald-600 uppercase tracking-wider truncate">
                        Planned Production
                      </p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-900 mt-0.5 sm:mt-1 truncate">
                        {kpiData?.planned_production?.toLocaleString() || "0"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Productivity Rate */}
                <div className="group bg-gradient-to-br from-purple-50 to-purple-100 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 border-l-4 border-purple-500 hover:shadow-2xl hover:from-purple-100 hover:to-purple-200 transition-all duration-500 hover:-translate-y-1">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <Speed className="text-xl sm:text-2xl text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-purple-600 uppercase tracking-wider truncate">
                        Productivity Rate
                      </p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-900 mt-0.5 sm:mt-1 truncate">
                        {kpiData?.productivity_rate?.toLocaleString() || "0"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quality Deviation */}
                <div className="group bg-gradient-to-br from-rose-50 to-rose-100 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 border-l-4 border-rose-500 hover:shadow-2xl hover:from-rose-100 hover:to-rose-200 transition-all duration-500 hover:-translate-y-1">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-rose-400 via-pink-400 to-rose-600 p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <CompareArrows className="text-xl sm:text-2xl text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-rose-600 uppercase tracking-wider truncate">
                        Quality Deviation
                      </p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-rose-900 mt-0.5 sm:mt-1 truncate">
                        {kpiData?.quality_deviation?.toLocaleString() || "0"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* More KPI Cards - Responsive Grid */}
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-5 mb-4 sm:mb-6 md:mb-8'>
                {/* Total Operations */}
                <div className='group bg-gradient-to-br from-pink-50 to-pink-100 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-5 hover:shadow-xl hover:from-pink-100 hover:to-pink-200 transition-all duration-300 hover:-translate-y-1 border border-pink-200'>
                  <div className='flex items-center gap-2 sm:gap-3 md:gap-4'>
                    <div className='bg-gradient-to-br from-pink-400 via-rose-400 to-pink-400 p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0'>
                      <Factory className='text-base sm:text-xl md:text-2xl text-white' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-[8px] sm:text-[10px] md:text-xs font-medium text-pink-600 uppercase tracking-wider truncate'>Total Ops</p>
                      <p className='text-sm sm:text-base md:text-xl font-bold text-pink-900 mt-0.5 truncate'>
                        {kpiData?.total_operations?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Avg Operation Capacity */}
                <div className='group bg-gradient-to-br from-pink-50 to-pink-100 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-5 hover:shadow-xl hover:from-pink-100 hover:to-pink-200 transition-all duration-300 hover:-translate-y-1 border border-pink-200'>
                  <div className='flex items-center gap-2 sm:gap-3 md:gap-4'>
                    <div className='bg-gradient-to-br from-pink-400 via-rose-400 to-pink-400 p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0'>
                      <Factory className='text-base sm:text-xl md:text-2xl text-white' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-[8px] sm:text-[10px] md:text-xs font-medium text-pink-600 uppercase tracking-wider truncate'>Avg Op Cap</p>
                      <p className='text-sm sm:text-base md:text-xl font-bold text-pink-900 mt-0.5 truncate'>
                        {kpiData?.avg_operation_capacity?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Waste Units */}
                <div className='group bg-gradient-to-br from-yellow-50 to-yellow-100 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-5 hover:shadow-xl hover:from-yellow-100 hover:to-yellow-200 transition-all duration-300 hover:-translate-y-1 border border-yellow-200'>
                  <div className='flex items-center gap-2 sm:gap-3 md:gap-4'>
                    <div className='bg-gradient-to-br from-yellow-400 to-amber-500 p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0'>
                      <ContentCut className='text-base sm:text-xl md:text-2xl text-white' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-[8px] sm:text-[10px] md:text-xs font-medium text-yellow-600 uppercase tracking-wider truncate'>Waste</p>
                      <p className='text-sm sm:text-base md:text-xl font-bold text-yellow-900 mt-0.5 truncate'>
                        {kpiData?.waste_units?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Initial Stage Count */}
                <div className='group bg-gradient-to-br from-cyan-50 to-cyan-100 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-5 hover:shadow-xl hover:from-cyan-100 hover:to-cyan-200 transition-all duration-300 hover:-translate-y-1 border border-cyan-200'>
                  <div className='flex items-center gap-2 sm:gap-3 md:gap-4'>
                    <div className='bg-gradient-to-br from-cyan-400 to-blue-500 p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0'>
                      <PlayArrow className='text-base sm:text-xl md:text-2xl text-white' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-[8px] sm:text-[10px] md:text-xs font-medium text-cyan-600 uppercase tracking-wider truncate'>Initial</p>
                      <p className='text-sm sm:text-base md:text-xl font-bold text-cyan-900 mt-0.5 truncate'>
                        {kpiData?.initial_stage_count?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Final Stage Count */}
                <div className='group bg-gradient-to-br from-rose-50 to-rose-100 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-5 hover:shadow-xl hover:from-rose-100 hover:to-rose-200 transition-all duration-300 hover:-translate-y-1 border border-rose-200'>
                  <div className='flex items-center gap-2 sm:gap-3 md:gap-4'>
                    <div className='bg-gradient-to-br from-rose-400 to-pink-500 p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0'>
                      <Pause className='text-base sm:text-xl md:text-2xl text-white' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-[8px] sm:text-[10px] md:text-xs font-medium text-rose-600 uppercase tracking-wider truncate'>Final</p>
                      <p className='text-sm sm:text-base md:text-xl font-bold text-rose-900 mt-0.5 truncate'>
                        {kpiData?.final_stage_count?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Initial Production */}
                <div className='group bg-gradient-to-br from-cyan-50 to-cyan-100 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-5 hover:shadow-xl hover:from-cyan-100 hover:to-cyan-200 transition-all duration-300 hover:-translate-y-1 border border-cyan-200'>
                  <div className='flex items-center gap-2 sm:gap-3 md:gap-4'>
                    <div className='bg-gradient-to-br from-cyan-400 to-blue-500 p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0'>
                      <PlayArrow className='text-base sm:text-xl md:text-2xl text-white' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-[8px] sm:text-[10px] md:text-xs font-medium text-cyan-600 uppercase tracking-wider truncate'>Init Prod</p>
                      <p className='text-sm sm:text-base md:text-xl font-bold text-cyan-900 mt-0.5 truncate'>
                        {kpiData?.initial_production?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Final Production */}
                <div className='group bg-gradient-to-br from-rose-50 to-rose-100 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-5 hover:shadow-xl hover:from-rose-100 hover:to-rose-200 transition-all duration-300 hover:-translate-y-1 border border-rose-200'>
                  <div className='flex items-center gap-2 sm:gap-3 md:gap-4'>
                    <div className='bg-gradient-to-br from-rose-400 to-pink-500 p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0'>
                      <Pause className='text-base sm:text-xl md:text-2xl text-white' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-[8px] sm:text-[10px] md:text-xs font-medium text-rose-600 uppercase tracking-wider truncate'>Final Prod</p>
                      <p className='text-sm sm:text-base md:text-xl font-bold text-rose-900 mt-0.5 truncate'>
                        {kpiData?.final_production?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Initial Avg Rate */}
                <div className='group bg-gradient-to-br from-cyan-50 to-cyan-100 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-5 hover:shadow-xl hover:from-cyan-100 hover:to-cyan-200 transition-all duration-300 hover:-translate-y-1 border border-cyan-200'>
                  <div className='flex items-center gap-2 sm:gap-3 md:gap-4'>
                    <div className='bg-gradient-to-br from-cyan-400 to-blue-500 p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0'>
                      <PlayArrow className='text-base sm:text-xl md:text-2xl text-white' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-[8px] sm:text-[10px] md:text-xs font-medium text-cyan-600 uppercase tracking-wider truncate'>Init Avg</p>
                      <p className='text-sm sm:text-base md:text-xl font-bold text-cyan-900 mt-0.5 truncate'>
                        {kpiData?.initial_avg_rate?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Final Avg Rate */}
                <div className='group bg-gradient-to-br from-rose-50 to-rose-100 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-5 hover:shadow-xl hover:from-rose-100 hover:to-rose-200 transition-all duration-300 hover:-translate-y-1 border border-rose-200'>
                  <div className='flex items-center gap-2 sm:gap-3 md:gap-4'>
                    <div className='bg-gradient-to-br from-rose-400 to-pink-500 p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0'>
                      <Pause className='text-base sm:text-xl md:text-2xl text-white' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-[8px] sm:text-[10px] md:text-xs font-medium text-rose-600 uppercase tracking-wider truncate'>Final Avg</p>
                      <p className='text-sm sm:text-base md:text-xl font-bold text-rose-900 mt-0.5 truncate'>
                        {kpiData?.final_avg_rate?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Workforce Strength */}
                <div className='group bg-gradient-to-br from-emerald-50 to-emerald-100 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-5 hover:shadow-xl hover:from-emerald-100 hover:to-emerald-200 transition-all duration-300 hover:-translate-y-1 border border-emerald-200'>
                  <div className='flex items-center gap-2 sm:gap-3 md:gap-4'>
                    <div className='bg-gradient-to-br from-emerald-400 to-green-500 p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0'>
                      <People className='text-base sm:text-xl md:text-2xl text-white' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-[8px] sm:text-[10px] md:text-xs font-medium text-emerald-600 uppercase tracking-wider truncate'>Workforce</p>
                      <p className='text-sm sm:text-base md:text-xl font-bold text-emerald-900 mt-0.5 truncate'>
                        {kpiData?.workforce_strength?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Design Variants */}
                <div className='group bg-gradient-to-br from-indigo-50 to-indigo-100 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-5 hover:shadow-xl hover:from-indigo-100 hover:to-indigo-200 transition-all duration-300 hover:-translate-y-1 border border-indigo-200'>
                  <div className='flex items-center gap-2 sm:gap-3 md:gap-4'>
                    <div className='bg-gradient-to-br from-indigo-400 to-blue-500 p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0'>
                      <Style className='text-base sm:text-xl md:text-2xl text-white' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-[8px] sm:text-[10px] md:text-xs font-medium text-indigo-600 uppercase tracking-wider truncate'>Designs</p>
                      <p className='text-sm sm:text-base md:text-xl font-bold text-indigo-900 mt-0.5 truncate'>
                        {kpiData?.design_variants?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Production Line Total */}
                <div className='group bg-gradient-to-br from-orange-50 to-orange-100 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-5 hover:shadow-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-300 hover:-translate-y-1 border border-orange-200'>
                  <div className='flex items-center gap-2 sm:gap-3 md:gap-4'>
                    <div className='bg-gradient-to-br from-orange-400 to-amber-500 p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0'>
                      <ViewModule className='text-base sm:text-xl md:text-2xl text-white' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-[8px] sm:text-[10px] md:text-xs font-medium text-orange-600 uppercase tracking-wider truncate'>Lines</p>
                      <p className='text-sm sm:text-base md:text-xl font-bold text-orange-900 mt-0.5 truncate'>
                        {kpiData?.production_line_total?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center py-8 sm:py-12">
              <div className='bg-white/30 backdrop-blur-sm rounded-2xl px-4 sm:px-6 md:px-8 py-4 sm:py-6 shadow-xl border border-white/50'>
                <div className='text-base sm:text-lg font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
                  Loading KPI data for {date_from} to {date_to}...
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;