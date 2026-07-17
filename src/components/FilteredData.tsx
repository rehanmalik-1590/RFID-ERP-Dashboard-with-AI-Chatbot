// ....FilteredData.tsx file .......................
import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Close,
  Search,
  CalendarToday,
  ExpandMore,
  Timeline,
  BubbleChart
} from '@mui/icons-material';
import { 
  useCompanyNodes, 
  useBranchByCompany, 
  useStyleByBranchAndCompany,
  useWorkOrdersByStyleAndBranch,
  useLineByBranch,
  useWorkers,
  useOperations
} from '../services/api';
import { Button } from '@mui/material';

interface CompanyNode {
  Id: string;
  Name: string;
}

interface BranchNode {
  Id: string;
  Name: string;
}

interface StyleNode {
  StyleNo: string;
}

interface WorkOrderNode {
  OrId: string;
}

interface LineNode {
  Id: string;
  Name: string;
}

interface WorkerNode {
  WorkerCode: string;
  WorkerName: string;
}

interface OperationNode {
  OperationId: number;
  OperationDescriptions: string;
}

type FilterType = 'company' | 'branch' | 'style' | 'workOrder' | 'lineCode' | 'workers' | 'department' | 'operation';

interface SelectedItems {
  company: CompanyNode[];
  branch: BranchNode[];
  style: StyleNode[];
  workOrder: WorkOrderNode[];
  lineCode: LineNode[];
  workers: WorkerNode[];
  department: string[];
  operation: OperationNode[];
}

interface SearchTerms {
  company: string;
  branch: string;
  style: string;
  workOrder: string;
  lineCode: string;
  workers: string;
  department: string;
  operation: string;
}

interface FiltersProps {
  onApplyFilters: (filters: any) => void;
  initialFromDate?: string;
  initialToDate?: string;
  onGraphUpdate?: (filters: any) => void; 
}

const Filters = ({ onApplyFilters, initialFromDate = '', initialToDate = '' }: FiltersProps) => {
  const [activeDropdown, setActiveDropdown] = useState<FilterType | null>(null);
  
  const [fromDate, setFromDate] = useState<string>(initialFromDate);
  const [toDate, setToDate] = useState<string>(initialToDate);
  const [searchTerms, setSearchTerms] = useState<SearchTerms>({
    company: '',
    branch: '',
    style: '',
    workOrder: '',
    lineCode: '',
    workers: '',
    department: '',
    operation: ''
  });

  const [selectedItems, setSelectedItems] = useState<SelectedItems>({
    company: [],
    branch: [],
    style: [],
    workOrder: [],
    lineCode: [],
    workers: [],
    department: [],
    operation: []
  });

  useEffect(() => {
    setFromDate(initialFromDate);
    setToDate(initialToDate);
  }, [initialFromDate, initialToDate]);

  const { data: companies, isLoading: companiesLoading } = useCompanyNodes();
  const { data: branches, isLoading: branchesLoading } = useBranchByCompany(
    selectedItems.company.map(c => c.Id)
  );

  const { data: styles, isLoading: stylesLoading } = useStyleByBranchAndCompany(
    selectedItems.branch.map(b => b.Id),
    selectedItems.company.map(c => c.Id)
  );

  const { data: workOrders, isLoading: workOrdersLoading } = useWorkOrdersByStyleAndBranch(
    selectedItems.branch.map(b => b.Id),
    selectedItems.company.map(c => c.Id),
    selectedItems.style.map(s => s.StyleNo)
  );
  const { data: lines, isLoading: linesLoading } = useLineByBranch(
    selectedItems.branch.map(b => b.Id)
  );
  const { data: workers, isLoading: workersLoading } = useWorkers();
  const { data: operations, isLoading: operationsLoading } = useOperations();

  const departments: string[] = ['CUTTING', 'SEWING', 'FINISHING'];

  useEffect(() => {
    if (selectedItems.company.length === 0) {
      setSelectedItems(prev => ({
        ...prev,
        branch: [],
        style: [],
        workOrder: [],
        lineCode: []
      }));
    }
  }, [selectedItems.company.length]);

  useEffect(() => {
    if (selectedItems.branch.length === 0) {
      setSelectedItems(prev => ({
        ...prev,
        style: [],
        workOrder: [],
        lineCode: []
      }));
    }
  }, [selectedItems.branch.length]);

  useEffect(() => {
    if (selectedItems.style.length === 0) {
      setSelectedItems(prev => ({
        ...prev,
        workOrder: []
      }));
    }
  }, [selectedItems.style.length]);

  const addItem = useCallback((type: keyof SelectedItems, item: any) => {
    setSelectedItems(prev => {
      const exists = prev[type].some((existing: any) => {
        if (type === 'company') return existing.Id === item.Id;
        if (type === 'branch') return existing.Id === item.Id;
        if (type === 'style') return existing.StyleNo === item.StyleNo;
        if (type === 'workOrder') return existing.OrId === item.OrId;
        if (type === 'lineCode') return existing.Id === item.Id;
        if (type === 'workers') return existing.WorkerCode === item.WorkerCode;
        if (type === 'operation') return existing.OperationId === item.OperationId;
        return existing === item;
      });

      if (!exists) {
        return {
          ...prev,
          [type]: [...prev[type], item]
        };
      }
      return prev;
    });
    
    setActiveDropdown(null);
    setSearchTerms(prev => ({ ...prev, [type]: '' }));
  }, []);

  const removeItem = useCallback((type: keyof SelectedItems, item: any) => {
    setSelectedItems(prev => ({
      ...prev,
      [type]: prev[type].filter((existing: any) => {
        if (type === 'company') return existing.Id !== item.Id;
        if (type === 'branch') return existing.Id !== item.Id;
        if (type === 'style') return existing.StyleNo !== item.StyleNo;
        if (type === 'workOrder') return existing.OrId !== item.OrId;
        if (type === 'lineCode') return existing.Id !== item.Id;
        if (type === 'workers') return existing.WorkerCode !== item.WorkerCode;
        if (type === 'operation') return existing.OperationId !== item.OperationId;
        return existing !== item;
      })
    }));
  }, []);

  const clearAll = useCallback(() => {
    setSelectedItems({
      company: [],
      branch: [],
      style: [],
      workOrder: [],
      lineCode: [],
      workers: [],
      department: [],
      operation: []
    });
    setSearchTerms({
      company: '',
      branch: '',
      style: '',
      workOrder: '',
      lineCode: '',
      workers: '',
      department: '',
      operation: ''
    });
  }, []);

  const handleApplyFilters = (e: React.FormEvent) => {  
    e.preventDefault(); 
    
    const filters = {
      dateFrom: fromDate,
      dateTo: toDate,
      companies: selectedItems.company.map(c => ({ id: String(c.Id).trim(), name: c.Name })),
      branches: selectedItems.branch.map(b => ({ id: String(b.Id).trim(), name: b.Name })),
      styles: selectedItems.style.map(s => ({ styleNo: String(s.StyleNo).trim() })),
      workOrders: selectedItems.workOrder.map(w => ({ orId: String(w.OrId).trim() })),
      lineCodes: selectedItems.lineCode.map(l => ({ id: String(l.Id).trim(), name: l.Name })),
      workers: selectedItems.workers.map(w => ({ code: String(w.WorkerCode).trim(), name: w.WorkerName })),
      departments: selectedItems.department.map(d => String(d).trim()),
      operations: selectedItems.operation.map(o => ({ id: String(o.OperationId).trim(), desc: o.OperationDescriptions }))
    };
    
    onApplyFilters(filters);
  };

  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    return (companies as CompanyNode[]).filter(c => 
      c.Name.toLowerCase().includes(searchTerms.company.toLowerCase()) ||
      c.Id.toLowerCase().includes(searchTerms.company.toLowerCase())
    );
  }, [companies, searchTerms.company]);

  const filteredBranches = useMemo(() => {
    if (!branches) return [];
    return (branches as BranchNode[]).filter(b => 
      b.Name.toLowerCase().includes(searchTerms.branch.toLowerCase()) ||
      b.Id.toLowerCase().includes(searchTerms.branch.toLowerCase())
    );
  }, [branches, searchTerms.branch]);

  const filteredStyles = useMemo(() => {
    if (!styles) return [];
    return (styles as StyleNode[]).filter(s => 
      s.StyleNo.toLowerCase().includes(searchTerms.style.toLowerCase())
    );
  }, [styles, searchTerms.style]);

  const filteredWorkOrders = useMemo(() => {
    if (!workOrders) return [];
    return (workOrders as WorkOrderNode[]).filter(w => 
      w.OrId.toLowerCase().includes(searchTerms.workOrder.toLowerCase())
    );
  }, [workOrders, searchTerms.workOrder]);

  const filteredLines = useMemo(() => {
    if (!lines) return [];
    return (lines as LineNode[]).filter(l => 
      l.Name.toLowerCase().includes(searchTerms.lineCode.toLowerCase()) ||
      l.Id.toLowerCase().includes(searchTerms.lineCode.toLowerCase())
    );
  }, [lines, searchTerms.lineCode]);

  const filteredWorkers = useMemo(() => {
    if (!workers) return [];
    return (workers as WorkerNode[]).filter(w => 
      w.WorkerName.toLowerCase().includes(searchTerms.workers.toLowerCase()) ||
      w.WorkerCode.toLowerCase().includes(searchTerms.workers.toLowerCase())
    );
  }, [workers, searchTerms.workers]);

  const filteredDepartments = useMemo(() => 
    departments.filter(d => d.toLowerCase().includes(searchTerms.department.toLowerCase())),
    [searchTerms.department]
  );

  const filteredOperations = useMemo(() => {
    if (!operations) return [];
    return (operations as OperationNode[]).filter(o => 
      o.OperationDescriptions.toLowerCase().includes(searchTerms.operation.toLowerCase())
    );
  }, [operations, searchTerms.operation]);

  const isBranchDisabled = selectedItems.company.length === 0;
  const isStyleDisabled = selectedItems.branch.length === 0 || selectedItems.company.length === 0;
  const isWorkOrderDisabled = selectedItems.style.length === 0 || selectedItems.branch.length === 0 || selectedItems.company.length === 0;
  const isLineCodeDisabled = selectedItems.branch.length === 0;

  const hasSelectedFilters = 
    selectedItems.company.length > 0 ||
    selectedItems.branch.length > 0 ||
    selectedItems.style.length > 0 ||
    selectedItems.workOrder.length > 0 ||
    selectedItems.lineCode.length > 0 ||
    selectedItems.workers.length > 0 ||
    selectedItems.department.length > 0 ||
    selectedItems.operation.length > 0 ||
    fromDate !== '' || 
    toDate !== '';

  const renderDropdown = (
    type: keyof SelectedItems,
    label: string,
    items: any[],
    loading: boolean = false,
    disabled: boolean = false,
    displayFn: (item: any) => string,
    getId: (item: any) => string,
    placeholder: string = "Search..."
  ) => (
    <div className='w-full group'>
      <label className="block text-[10px] sm:text-xs font-semibold text-indigo-700 mb-1 uppercase tracking-wider flex items-center">
        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mr-1.5 sm:mr-2 animate-pulse"></span>
        {label}
        {loading && (
          <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
            Loading...
          </span>
        )}
      </label>
      <div className="relative">
        <div 
          className={`w-full min-h-[36px] sm:min-h-[40px] md:min-h-[44px] px-2 sm:px-3 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm border-2 rounded-lg sm:rounded-xl flex flex-wrap gap-1 items-center transition-all duration-300 ${
            disabled 
              ? 'border-gray-200 bg-gray-50/50 opacity-60 cursor-not-allowed' 
              : 'border-indigo-100 hover:border-indigo-300 shadow-lg shadow-indigo-100/50 hover:shadow-xl hover:shadow-indigo-200/50 cursor-pointer focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100'
          }`}
          onClick={() => !disabled && setActiveDropdown(type)}
        >
          {selectedItems[type].map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-lg text-[10px] sm:text-xs border border-indigo-200 group/tag shadow-sm"
            >
              <span className="text-[10px] sm:text-xs font-medium truncate max-w-[80px] sm:max-w-none">{displayFn(item)}</span>
              <Close 
                className="text-sm cursor-pointer hover:text-red-500 transition-colors w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400 hover:text-red-500" 
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(type, item);
                }} 
              />
            </div>
          ))}
          <div className="flex-1 relative min-w-[60px]">
            <input
              type="text"
              placeholder={disabled ? `Select ${label} first` : placeholder}
              className={`w-full bg-transparent outline-none text-[11px] sm:text-sm text-gray-700 placeholder-gray-400 ${
                disabled ? 'cursor-not-allowed' : ''
              }`}
              value={searchTerms[type]}
              onChange={e => setSearchTerms(prev => ({ ...prev, [type]: e.target.value }))}
              onFocus={() => !disabled && setActiveDropdown(type)}
              onClick={e => e.stopPropagation()}
              disabled={disabled}
            />
            {!disabled && activeDropdown !== type && (
              <ExpandMore className="absolute right-0 top-1/2 -translate-y-1/2 text-indigo-400 w-3 h-3 sm:w-4 sm:h-4 group-hover:text-indigo-600 transition-colors" />
            )}
          </div>
        </div>

        {activeDropdown === type && !disabled && (
          <div className="absolute z-30 w-full mt-1 sm:mt-2 bg-white/95 backdrop-blur-xl border-2 border-indigo-100 rounded-lg sm:rounded-xl shadow-2xl shadow-indigo-200/50 max-h-48 sm:max-h-64 overflow-auto scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
            {items.length > 0 ? (
              items.map((item, index) => (
                <div 
                  key={getId(item) || index} 
                  className="px-2 sm:px-4 py-1.5 sm:py-2.5 cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 text-[11px] sm:text-sm text-gray-700 border-b border-indigo-50 last:border-0 transition-all duration-150"
                  onClick={() => addItem(type, item)}
                >
                  {displayFn(item)}
                </div>
              ))
            ) : (
              <div className="px-2 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-sm text-gray-500 text-center">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                    <span className="text-indigo-500 text-[10px] sm:text-xs">Loading...</span>
                  </div>
                ) : (
                  'No results found'
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className='mx-2 sm:mx-4 md:mx-6 lg:mx-8 my-3 sm:my-4 md:my-6 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 md:p-6 lg:p-8 border-2 border-indigo-100/50 backdrop-blur-sm'>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4 md:mb-6">
        <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
          Filters
          <BubbleChart className='w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 text-purple-400 animate-pulse' />
        </h2>
        <button 
          className="text-[10px] sm:text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl bg-white/80 hover:bg-white transition-all duration-300 border border-indigo-100 hover:border-red-200 shadow-md hover:shadow-lg group"
          onClick={clearAll}
        >
          <Close className='w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-90 transition-transform duration-300' />
          Clear All
        </button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6'>
        {/* Date From */}
        <div className="group">
          <label className='block text-[10px] sm:text-xs font-semibold text-indigo-700 mb-1 uppercase tracking-wider flex items-center'>
            <CalendarToday className='w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-2 text-indigo-500' />
            Date From
          </label>
          <div className="relative">
            <input
              type="date"
              className="w-full bg-white/80 backdrop-blur-sm border-2 border-indigo-100 rounded-lg sm:rounded-xl px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-[11px] sm:text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 shadow-lg shadow-indigo-100/50"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 pointer-events-none transition-all duration-500"></div>
          </div>
        </div>

        {/* Date To */}
        <div className="group">
          <label className='block text-[10px] sm:text-xs font-semibold text-purple-700 mb-1 uppercase tracking-wider flex items-center'>
            <CalendarToday className='w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-2 text-purple-500' />
            Date To
          </label>
          <div className="relative">
            <input
              type="date"
              className="w-full bg-white/80 backdrop-blur-sm border-2 border-purple-100 rounded-lg sm:rounded-xl px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-[11px] sm:text-sm text-gray-700 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300 shadow-lg shadow-purple-100/50"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
            <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 pointer-events-none transition-all duration-500"></div>
          </div>
        </div>

        {/* Company */}
        {renderDropdown(
          'company',
          'Company ID',
          filteredCompanies,
          companiesLoading,
          false,
          (item) => `${item.Id} - ${item.Name}`,
          (item) => item.Id,
          "Search companies..."
        )}

        {/* Branch */}
        {renderDropdown(
          'branch',
          'Branch ID',
          filteredBranches,
          branchesLoading,
          isBranchDisabled,
          (item) => `${item.Id} - ${item.Name}`,
          (item) => item.Id,
          "Search branches..."
        )}

        {/* Line Code */}
        {renderDropdown(
          'lineCode',
          'Line Code',
          filteredLines,
          linesLoading,
          isLineCodeDisabled,
          (item) => `${item.Id} - ${item.Name}`,
          (item) => item.Id,
          "Search line codes..."
        )}

        {/* Style */}
        {renderDropdown(
          'style',
          'Style No',
          filteredStyles,
          stylesLoading,
          isStyleDisabled,
          (item) => item.StyleNo,
          (item) => item.StyleNo,
          "Search styles..."
        )}

        {/* Work Order */}
        {renderDropdown(
          'workOrder',
          'Work Order',
          filteredWorkOrders,
          workOrdersLoading,
          isWorkOrderDisabled,
          (item) => item.OrId,
          (item) => item.OrId,
          "Search work orders..."
        )}

        {/* Workers */}
        {renderDropdown(
          'workers',
          'Workers',
          filteredWorkers,
          workersLoading,
          false,
          (item) => `${item.WorkerCode} - ${item.WorkerName}`,
          (item) => item.WorkerCode,
          "Search workers..."
        )}

        {/* Department */}
        <div className='sm:col-span-2 lg:col-span-1'>
          {renderDropdown(
            'department',
            'Department',
            filteredDepartments,
            false,
            false,
            (item) => item,
            (item) => item,
            "Search departments..."
          )}
        </div>

        {/* Operation */}
        <div className='sm:col-span-2 lg:col-span-1'>
          {renderDropdown(
            'operation',
            'Operation',
            filteredOperations,
            operationsLoading,
            false,
            (item) => item.OperationDescriptions,
            (item) => item.OperationId.toString(),
            "Search operations..."
          )}
        </div>
      </div>

      {/* Selected Filters Summary */}
      {(selectedItems.company.length > 0 || selectedItems.branch.length > 0 || 
        selectedItems.style.length > 0 || selectedItems.workOrder.length > 0 ||
        selectedItems.lineCode.length > 0 || selectedItems.workers.length > 0 ||
        selectedItems.department.length > 0 || selectedItems.operation.length > 0) && (
        <div className="mt-3 sm:mt-4 md:mt-6 p-3 sm:p-4 md:p-5 bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl border-2 border-indigo-100 shadow-lg">
          <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
            <Timeline className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500" />
            <p className="text-[10px] sm:text-xs font-semibold text-indigo-700 uppercase tracking-wider">Active Filters</p>
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {selectedItems.company.map(item => (
              <span key={item.Id} className="px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-[9px] sm:text-xs font-medium border border-indigo-200 shadow-sm">🏢 {item.Id}</span>
            ))}
            {selectedItems.branch.map(item => (
              <span key={item.Id} className="px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] sm:text-xs font-medium border border-emerald-200 shadow-sm">📍 {item.Id}</span>
            ))}
            {selectedItems.style.map(item => (
              <span key={item.StyleNo} className="px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-purple-50 text-purple-700 rounded-lg text-[9px] sm:text-xs font-medium border border-purple-200 shadow-sm">🎨 {item.StyleNo}</span>
            ))}
            {selectedItems.workOrder.map(item => (
              <span key={item.OrId} className="px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-amber-50 text-amber-700 rounded-lg text-[9px] sm:text-xs font-medium border border-amber-200 shadow-sm">📋 {item.OrId}</span>
            ))}
            {selectedItems.lineCode.map(item => (
              <span key={item.Id} className="px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-cyan-50 text-cyan-700 rounded-lg text-[9px] sm:text-xs font-medium border border-cyan-200 shadow-sm">🔧 {item.Id}</span>
            ))}
            {selectedItems.workers.map(item => (
              <span key={item.WorkerCode} className="px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-green-50 text-green-700 rounded-lg text-[9px] sm:text-xs font-medium border border-green-200 shadow-sm">👤 {item.WorkerCode}</span>
            ))}
            {selectedItems.department.map(item => (
              <span key={item} className="px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-[9px] sm:text-xs font-medium border border-yellow-200 shadow-sm">📁 {item}</span>
            ))}
            {selectedItems.operation.map(item => (
              <span key={item.OperationId} className="px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-pink-50 text-pink-700 rounded-lg text-[9px] sm:text-xs font-medium border border-pink-200 shadow-sm">⚙️ {item.OperationId}</span>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <form onSubmit={handleApplyFilters} className="mt-3 sm:mt-4 md:mt-6 flex justify-end">
        <Button
          type="submit"
          variant="contained"
          disabled={!hasSelectedFilters}
          startIcon={<Search />}
          sx={{
            background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
            color: 'white',
            px: { xs: 3, sm: 4, md: 6 },
            py: { xs: 1, sm: 1.5 },
            textTransform: 'none',
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
            fontWeight: 600,
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4F46E5 0%, #9333EA 100%)',
              boxShadow: '0 15px 30px -5px rgba(99, 102, 241, 0.5)',
              transform: 'translateY(-2px)'
            },
            '&:disabled': {
              background: 'linear-gradient(135deg, #CBD5E1 0%, #94A3B8 100%)',
              boxShadow: 'none'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Apply Filters
        </Button>
      </form>
    </div>
  );
};

export default Filters;