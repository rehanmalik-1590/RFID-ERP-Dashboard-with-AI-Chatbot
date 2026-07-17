// ....ListData.tsx file .......................
import { useMemo, useState } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { useGetAllData } from '../services/api';
import { Chip, Box, Button } from '@mui/material';
import { 
  TableRows,
  FilterAlt,
  Storage,
  Timeline,
  BubbleChart,
  Download
} from '@mui/icons-material';

interface ListDataProps {
  date_from: string;  
  date_to: string;
  filters?: any;
}

const ListData = ({ date_from, date_to, filters }: ListDataProps) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: allData, isLoading } = useGetAllData(date_from || '', date_to || '');

  const tableData = useMemo(() => {
    if (!allData || !Array.isArray(allData)) {
      return [];
    }

    let transformedData = allData.map((item: any, index: number) => ({
      id: `${item.OrId}-${item.WorkerCode}-${item.OperationID}-${index}`,
      scanningDate: item.ScanningDate ? new Date(item.ScanningDate).toLocaleDateString() : '',
      styleNo: item.StyleNo || '',
      buyMonth: item.BuyMonth || '',
      orId: item.OrId || '',
      brId: item.BrId || '',
      companyId: item.CompanyId || '',
      lineId: item.LineId || '',
      lineCode: item.LineCode || '',
      opSeq: item.OpSeq || '',
      operationId: item.OperationID || '',
      operationDescription: item.OperationDescription || '',
      workerCode: item.WorkerCode || '',
      workerDescription: item.WorkerDescription || '',
      departmentName: item.DepartmentName || '',
      isFirst: item.IsFirst,
      isLast: item.IsLast,
      plannedQtyERP: item.PlannedQtyERP,
      scannedQty: item.ScannedQty,
      shiftMinutes: item.ShiftMinutes,
      operationTarget: item.OperationTarget
    }));

    if (filters && Object.keys(filters).length > 0) {
      const hasActiveFilters = 
        (filters.companies?.length > 0) ||
        (filters.branches?.length > 0) ||
        (filters.lineCodes?.length > 0) ||
        (filters.styles?.length > 0) ||
        (filters.workOrders?.length > 0) ||
        (filters.workers?.length > 0) ||
        (filters.departments?.length > 0) ||
        (filters.operations?.length > 0);

      if (hasActiveFilters) {
        transformedData = transformedData.filter(item => {
          if (filters.companies && filters.companies.length > 0) {
            const companyIds = filters.companies.map((c: any) => String(c.id).trim());
            const itemCompanyId = String(item.companyId || '').trim();
            const companyMatch = companyIds.some((filterId: string) => filterId === itemCompanyId);
            if (!companyMatch) return false;
          }

          if (filters.branches && filters.branches.length > 0) {
            const branchIds = filters.branches.map((b: any) => String(b.id).trim());
            const itemBranchId = String(item.brId || '').trim();
            const branchMatch = branchIds.some((filterId: string) => filterId === itemBranchId);
            if (!branchMatch) return false;
          }

          if (filters.lineCodes && filters.lineCodes.length > 0) {
            const lineIds = filters.lineCodes.map((l: any) => String(l.id).trim());
            const itemLineCode = String(item.lineCode || '').trim();
            const lineMatch = lineIds.some((filterId: string) => filterId === itemLineCode);
            if (!lineMatch) return false;
          }

          if (filters.styles && filters.styles.length > 0) {
            const styleNos = filters.styles.map((s: any) => String(s.styleNo).trim());
            const itemStyleNo = String(item.styleNo || '').trim();
            const styleMatch = styleNos.some((filterStyle: string) => filterStyle === itemStyleNo);
            if (!styleMatch) return false;
          }

          if (filters.workOrders && filters.workOrders.length > 0) {
            const orderIds = filters.workOrders.map((w: any) => String(w.orId).trim());
            const itemOrderId = String(item.orId || '').trim();
            const orderMatch = orderIds.some((filterOrder: string) => filterOrder === itemOrderId);
            if (!orderMatch) return false;
          }

          if (filters.workers && filters.workers.length > 0) {
            const workerCodes = filters.workers.map((w: any) => String(w.code).trim());
            const itemWorkerCode = String(item.workerCode || '').trim();
            const workerMatch = workerCodes.some((filterCode: string) => filterCode === itemWorkerCode);
            if (!workerMatch) return false;
          }

          if (filters.departments && filters.departments.length > 0) {
            const itemDepartment = String(item.departmentName || '').trim().toUpperCase();
            const departmentMatch = filters.departments.some((filterDept: string) => {
              const filterDeptStr = String(filterDept || '').trim().toUpperCase();
              return filterDeptStr === itemDepartment;
            });
            if (!departmentMatch) return false;
          }

          if (filters.operations && filters.operations.length > 0) {
            const operationIds = filters.operations.map((o: any) => String(o.id).trim());
            const itemOperationId = String(item.operationId || '').trim();
            const operationMatch = operationIds.some((filterOpId: string) => filterOpId === itemOperationId);
            if (!operationMatch) return false;
          }

          return true;
        });
      }
    }

    return transformedData;
  }, [allData, filters]);

  const handleExportCSV = () => {
    if (!tableData || tableData.length === 0) {
      alert('No data to export');
      return;
    }

    const csvColumns = [
      { key: 'scanningDate', header: 'Scan Date' },
      { key: 'styleNo', header: 'Style No' },
      { key: 'buyMonth', header: 'Buy Month' },
      { key: 'orId', header: 'Work Order' },
      { key: 'brId', header: 'Branch' },
      { key: 'companyId', header: 'Company' },
      { key: 'lineCode', header: 'Line' },
      { key: 'opSeq', header: 'OP Seq' },
      { key: 'operationId', header: 'OP Code' },
      { key: 'operationDescription', header: 'Operation' },
      { key: 'workerCode', header: 'Worker ID' },
      { key: 'workerDescription', header: 'Worker Name' },
      { key: 'departmentName', header: 'Department' },
      { key: 'isFirst', header: 'First' },
      { key: 'isLast', header: 'Last' },
      { key: 'plannedQtyERP', header: 'Planned Qty' },
      { key: 'scannedQty', header: 'Scanned Qty' },
      { key: 'shiftMinutes', header: 'Shift Min' },
      { key: 'operationTarget', header: 'Target' }
    ];

    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const headerRow = csvColumns.map(col => escapeCSV(col.header)).join(',');
    const dataRows = tableData.map(item => {
      return csvColumns.map(col => {
        let value = item[col.key as keyof typeof item];
        if (col.key === 'isFirst' || col.key === 'isLast') {
          value = value === 1 ? 'Yes' : 'No';
        } else if (col.key === 'plannedQtyERP' || col.key === 'scannedQty') {
          value = value?.toLocaleString() || '0';
        } else if (col.key === 'scanningDate') {
          value = value || '';
        }
        return escapeCSV(value);
      }).join(',');
    });

    const csvContent = [headerRow, ...dataRows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const currentDate = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `scanning_data_${currentDate}.csv`;
    
    if ((navigator as any).msSaveBlob) {
      (navigator as any).msSaveBlob(blob, filename);
    } else {
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'scanningDate',
      header: 'SCAN DATE',
      size: 150,
      Cell: ({ cell }: any) => (
        <span className="text-gray-600 font-medium text-[10px] sm:text-xs">{cell.getValue()}</span>
      ),
    },
    {
      accessorKey: 'styleNo',
      header: 'STYLE NO',
      size: 130,
      Cell: ({ cell }: any) => (
        <span className="text-indigo-600 font-mono text-[10px] sm:text-xs font-semibold">{cell.getValue()}</span>
      ),
    },
    {
      accessorKey: 'buyMonth',
      header: 'BUY MONTH',
      size: 150,
      Cell: ({ cell }: any) => (
        <span className="text-purple-600 text-[10px] sm:text-xs font-medium">{cell.getValue()}</span>
      ),
    },
    {
      accessorKey: 'orId',
      header: 'WORK ORDER',
      size: 200,
      Cell: ({ cell }: any) => (
        <span className="text-cyan-600 font-mono text-[10px] sm:text-xs font-semibold">{cell.getValue()}</span>
      ),
    },
    {
      accessorKey: 'brId',
      header: 'BRANCH',
      size: 130,
      Cell: ({ cell }: any) => (
        <Chip 
          label={cell.getValue() || ''} 
          size="small" 
          sx={{
            background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
            color: '#6D28D9',
            border: '1px solid #C7D2FE',
            fontSize: '9px',
            fontWeight: 600,
            borderRadius: '8px',
            height: '22px',
            boxShadow: '0 2px 4px -1px rgba(109, 40, 217, 0.1)',
            '&:hover': {
              background: 'linear-gradient(135deg, #E0E7FF 0%, #EDE9FE 100%)'
            }
          }}
        />
      ),
    },
    {
      accessorKey: 'companyId',
      header: 'COMPANY',
      size: 140,
      Cell: ({ cell }: any) => (
        <Chip 
          label={cell.getValue() || ''} 
          size="small" 
          sx={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%)',
            color: '#2563EB',
            border: '1px solid #BFDBFE',
            fontSize: '9px',
            fontWeight: 600,
            borderRadius: '8px',
            height: '22px',
            boxShadow: '0 2px 4px -1px rgba(37, 99, 235, 0.1)'
          }}
        />
      ),
    },
    {
      accessorKey: 'lineCode',
      header: 'LINE',
      size: 80,
      Cell: ({ cell }: any) => (
        <Chip 
          label={cell.getValue() || ''} 
          size="small" 
          sx={{
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FFEDD5 100%)',
            color: '#D97706',
            border: '1px solid #FCD34D',
            fontSize: '9px',
            fontWeight: 600,
            borderRadius: '8px',
            height: '22px',
            boxShadow: '0 2px 4px -1px rgba(217, 119, 6, 0.1)'
          }}
        />
      ),
    },
    {
      accessorKey: 'opSeq',
      header: 'OP SEQ',
      size: 120,
      Cell: ({ cell }: any) => (
        <span className="text-gray-600 text-[10px] sm:text-xs font-medium">{cell.getValue()}</span>
      ),
    },
    {
      accessorKey: 'operationId',
      header: 'OP CODE',
      size: 130,
      Cell: ({ cell }: any) => (
        <span className="text-pink-600 font-mono text-[10px] sm:text-xs font-semibold">{cell.getValue()}</span>
      ),
    },
    {
      accessorKey: 'operationDescription',
      header: 'OPERATION',
      size: 200,
      Cell: ({ cell }: any) => (
        <span className="text-gray-700 text-[10px] sm:text-xs font-medium">{cell.getValue()}</span>
      ),
    },
    {
      accessorKey: 'workerCode',
      header: 'WORKER ID',
      size: 140,
      Cell: ({ cell }: any) => (
        <span className="text-emerald-600 font-mono text-[10px] sm:text-xs font-semibold">{cell.getValue()}</span>
      ),
    },
    {
      accessorKey: 'workerDescription',
      header: 'WORKER NAME',
      size: 200,
      Cell: ({ cell }: any) => (
        <span className="text-gray-700 text-[10px] sm:text-xs font-medium">{cell.getValue()}</span>
      ),
    },
    {
      accessorKey: 'departmentName',
      header: 'DEPARTMENT',
      size: 160,
      Cell: ({ cell }: any) => (
        <Chip 
          label={cell.getValue() || ''} 
          size="small" 
          sx={{
            background: 'linear-gradient(135deg, #E0F2FE 0%, #CFFAFE 100%)',
            color: '#0891B2',
            border: '1px solid #A5F3FC',
            fontSize: '9px',
            fontWeight: 600,
            borderRadius: '8px',
            height: '22px',
            boxShadow: '0 2px 4px -1px rgba(8, 145, 178, 0.1)'
          }}
        />
      ),
    },
    {
      accessorKey: 'isFirst',
      header: 'FIRST',
      size: 110,
      Cell: ({ cell }: any) => (
        <Chip 
          label={cell.getValue() === 1 ? 'Yes' : 'No'} 
          size="small" 
          sx={{
            background: cell.getValue() === 1 
              ? 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)'
              : 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
            color: cell.getValue() === 1 ? '#059669' : '#64748B',
            border: cell.getValue() === 1 
              ? '1px solid #6EE7B7'
              : '1px solid #CBD5E1',
            fontSize: '9px',
            fontWeight: 600,
            borderRadius: '8px',
            height: '22px'
          }}
        />
      ),
    },
    {
      accessorKey: 'isLast',
      header: 'LAST',
      size: 100,
      Cell: ({ cell }: any) => (
        <Chip 
          label={cell.getValue() === 1 ? 'Yes' : 'No'} 
          size="small" 
          sx={{
            background: cell.getValue() === 1 
              ? 'linear-gradient(135deg, #FEF9C3 0%, #FED7AA 100%)'
              : 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
            color: cell.getValue() === 1 ? '#C2410C' : '#64748B',
            border: cell.getValue() === 1 
              ? '1px solid #FDBA74'
              : '1px solid #CBD5E1',
            fontSize: '9px',
            fontWeight: 600,
            borderRadius: '8px',
            height: '22px'
          }}
        />
      ),
    },
    {
      accessorKey: 'plannedQtyERP',
      header: 'PLANNED QTY',
      size: 160,
      Cell: ({ cell }: any) => (
        <span className="text-blue-600 font-mono text-[10px] sm:text-xs font-semibold">{cell.getValue()?.toLocaleString() || '0'}</span>
      ),
    },
    {
      accessorKey: 'scannedQty',
      header: 'SCANNED QTY',
      size: 170,
      Cell: ({ cell }: any) => (
        <span className="text-green-600 font-mono text-[10px] sm:text-xs font-bold">{cell.getValue()?.toLocaleString() || '0'}</span>
      ),
    },
    {
      accessorKey: 'shiftMinutes',
      header: 'SHIFT MIN',
      size: 140,
      Cell: ({ cell }: any) => (
        <span className="text-gray-600 text-[10px] sm:text-xs font-medium">{cell.getValue()}</span>
      ),
    },
    {
      accessorKey: 'operationTarget',
      header: 'TARGET',
      size: 120,
      Cell: ({ cell }: any) => (
        <span className="text-purple-600 text-[10px] sm:text-xs font-semibold">{cell.getValue()}</span>
      ),
    },
  ], []);

  return (
    <div style={{ 
      padding: '12px 8px',
      margin: '8px',
      background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F3FF 50%, #EEF2FF 100%)',
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
      border: '2px solid rgba(199, 210, 254, 0.5)'
    }}>

      <MaterialReactTable
        columns={columns}
        data={tableData}
        state={{
          isLoading,
          pagination
        }}
        onPaginationChange={setPagination}
        enableSorting={true}
        enableColumnResizing={true}
        enableStickyHeader={true}
        enableRowVirtualization={true}
        initialState={{
          density: 'compact',
          showGlobalFilter: true,
        }}
        muiTableBodyRowProps={{ 
          hover: true,
          sx: {
            '&:hover': {
              background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%) !important',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }
          }
        }}
        muiTableContainerProps={{
          sx: { 
            maxHeight: '400px',
            background: 'white',
            borderRadius: '12px',
            border: '2px solid #E0E7FF',
            boxShadow: 'inset 0 2px 4px 0 rgba(99, 102, 241, 0.06)',
            '&::-webkit-scrollbar': {
              width: '6px',
              height: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#F1F5F9',
              borderRadius: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'linear-gradient(135deg, #C7D2FE 0%, #DDD6FE 100%)',
              borderRadius: '8px',
              border: '2px solid #F1F5F9',
            },
          }
        }}
        muiTableHeadCellProps={{
          sx: {
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
            color: '#475569',
            fontWeight: 700,
            fontSize: '10px',
            letterSpacing: '0.5px',
            borderBottom: '2px solid #E2E8F0',
            padding: '6px 4px',
          }
        }}
        muiTableBodyCellProps={{
          sx: {
            borderBottom: '1px solid #F1F5F9',
            background: 'white',
            padding: '4px 4px',
          }
        }}
        muiTablePaperProps={{
          sx: {
            background: 'transparent',
            boxShadow: 'none',
            borderRadius: '12px',
          }
        }}
        renderTopToolbarCustomActions={() => (
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            alignItems: 'center', 
            gap: 0.5,
            p: 0.5
          }}>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                Scanning Data
                <BubbleChart className='w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 text-purple-400 animate-pulse' />
              </h2>
            </div>
            {tableData.length > 0 && (
              <div className="flex items-center gap-1 sm:gap-2 bg-white/80 backdrop-blur-sm px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-1.5 rounded-lg sm:rounded-xl border border-indigo-100 shadow-sm">
                <Storage className="text-indigo-500 w-3 h-3 sm:w-4 sm:h-4" />
                <Chip 
                  label={`${tableData.length.toLocaleString()} records`} 
                  size="small" 
                  sx={{
                    background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
                    color: '#4F46E5',
                    border: '1px solid #C7D2FE',
                    fontSize: '8px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    height: '18px'
                  }}
                />
              </div>
            )}
            {filters && Object.keys(filters).length > 0 && (
              <div className="flex items-center gap-1 sm:gap-2 bg-white/80 backdrop-blur-sm px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-1.5 rounded-lg sm:rounded-xl border border-purple-100 shadow-sm">
                <FilterAlt className="text-purple-500 w-3 h-3 sm:w-4 sm:h-4" />
                <Chip 
                  label="AI Filters" 
                  size="small" 
                  sx={{
                    background: 'linear-gradient(135deg, #FAF5FF 0%, #F5F3FF 100%)',
                    color: '#9333EA',
                    border: '1px solid #E9D5FF',
                    fontSize: '8px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    height: '18px'
                  }}
                />
              </div>
            )}
            <Button
              variant="contained"
              startIcon={<Download sx={{ fontSize: '14px' }} />}
              onClick={handleExportCSV}
              disabled={!tableData || tableData.length === 0}
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                borderRadius: '10px',
                padding: '2px 10px',
                fontSize: '9px',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                minHeight: '28px',
                letterSpacing: '0.3px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                },
                '&:active': {
                  transform: 'translateY(0)'
                },
                '&:disabled': {
                  background: '#E5E7EB',
                  color: '#9CA3AF',
                  boxShadow: 'none'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Export
            </Button>
          </Box>
        )}
        renderEmptyRowsFallback={() => (
          <div style={{ 
            textAlign: 'center', 
            padding: '30px 20px',
            background: 'white',
            borderRadius: '12px',
            border: '2px dashed #E0E7FF'
          }}>
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-xl"></div>
                </div>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#4F46E5' }}>
                  Loading data streams...
                </p>
              </div>
            ) : filters && Object.keys(filters).length > 0 ? (
              <div>
                <Timeline className="text-indigo-300 w-12 h-12 mx-auto mb-3" />
                <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>
                  No records match the selected filters
                </p>
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                  Total available: {allData?.length?.toLocaleString() || 0} records
                </p>
                <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                  Adjust your filter matrix for different results
                </p>
              </div>
            ) : (
              <div>
                <TableRows className="text-indigo-300 w-12 h-12 mx-auto mb-3" />
                <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>
                  No records to display
                </p>
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                  Total records: {allData?.length?.toLocaleString() || 0}
                </p>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default ListData;