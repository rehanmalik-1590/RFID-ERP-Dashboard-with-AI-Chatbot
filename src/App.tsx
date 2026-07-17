/* // ......................App.tsx file ............................. */
import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Graph from './components/Graph';
import Filters from './components/FilteredData';
import ListData from './components/ListData';
import { Button } from '@mui/material';
import { ExpandMore, ExpandLess, FilterAlt } from '@mui/icons-material';

function App() {
  const DEFAULT_FROM_DATE = '2026-02-01';
  const DEFAULT_TO_DATE = '2026-02-02';

  const [dateRange, setDateRange] = useState({
    dateFrom: DEFAULT_FROM_DATE,
    dateTo: DEFAULT_TO_DATE
  });

  const [appliedFilters, setAppliedFilters] = useState<any>({
    companies: [],
    branches: [],
    styles: [],
    workOrders: [],
    lineCodes: [],
    workers: [],
    departments: [],
    operations: []
  });

  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const handleApplyFilters = (filters: any) => {
    setDateRange({
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo
    });
    
    setAppliedFilters({
      companies: filters.companies || [],
      branches: filters.branches || [],
      styles: filters.styles || [],
      workOrders: filters.workOrders || [],
      lineCodes: filters.lineCodes || [],
      workers: filters.workers || [],
      departments: filters.departments || [],
      operations: filters.operations || []
    });
  };

  const toggleFilters = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Dashboard 
        date_from={dateRange.dateFrom}
        date_to={dateRange.dateTo}
        filters={appliedFilters}
      />
      
      {/* Filter Button - Shows when filters are hidden */}
      {!isFiltersVisible && (
        <div className="mx-8 my-6 flex justify-end animate-fadeIn">
          <Button
            variant="text"
            startIcon={<FilterAlt className="w-4 h-4" />}
            endIcon={<ExpandMore />}
            onClick={toggleFilters}
            sx={{
              color: '#6366F1',
              borderRadius: '12px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'none',
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Open Filters
          </Button>
        </div>
      )}
      
      {/* Filters Component - Shows when visible with animation */}
      <div className={`transition-all duration-500 ease-in-out ${
        isFiltersVisible ? 'opacity-100 translate-y-0 max-h-[2000px]' : 'opacity-0 translate-y-[-20px] max-h-0 overflow-hidden'
      }`}>
        <div className="mx-8 my-6">
          <div className="relative">
            {/* Close Button inside Filters */}
            <div className="absolute top-4 right-4 z-10">
              <Button
                onClick={toggleFilters}
                sx={{
                  minWidth: 'auto',
                  padding: '8px',
                  borderRadius: '12px',
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    background: '#f5f5f5',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <ExpandLess />
              </Button>
            </div>
            <Filters 
              onApplyFilters={handleApplyFilters}
              initialFromDate={DEFAULT_FROM_DATE}
              initialToDate={DEFAULT_TO_DATE}
            />
          </div>
        </div>
      </div>
      
      <ListData 
        date_from={dateRange.dateFrom}
        date_to={dateRange.dateTo}
        filters={appliedFilters}
      />
      
      <Graph 
        date_from={dateRange.dateFrom}
        date_to={dateRange.dateTo}
        filters={appliedFilters}
      />
    </div>
  );
}

export default App;