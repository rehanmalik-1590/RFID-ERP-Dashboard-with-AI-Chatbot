// Pakistan-based Dummy Data for RFID ERP Dashboard
// ......................dummyData.ts file .............................
const PAKISTAN_NAMES = [
  "Saad Hussain",
  "Nadia Malik",
  "Bilal Raza",
  "Huma Nasir",
  "Imran Siddiqui",
  "Zara Khan",
  "Adnan Farooq",
  "Shabana Ali",
  "Waseem Ahmed",
  "Rida Hassan",
  "Junaid Iqbal",
  "Aqsa Mehmood",
  "Fahad Khan",
  "Maha Rizvi",
  "Salman Haider",
  "Nadia Farooq",
  "Kamran Mirza",
  "Aisha Malik",
  "Hamza Aziz",
  "Samina Khan",
];

const PAKISTAN_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Multan",
  "Faisalabad",
  "Peshawar",
  "Quetta",
  "Hyderabad",
  "Gujranwala",
];

const PAKISTAN_COMPANIES = [
  { Id: "SHG", Name: "Shaheen Heritage Garments" },
  { Id: "MGI", Name: "Maqbool Global Industries" },
  { Id: "ARF", Name: "Arifeen Retail Fabrics" },
  { Id: "ZIM", Name: "Zaman International Mills" },
];

const PAKISTAN_DEPARTMENTS = [
  "CUTTING",
  "SEWING",
  "FINISHING",
  "QUALITY CONTROL",
  "PACKING",
  "DYEING",
  "PRESSING",
];

const OPERATIONS = [
  { OperationId: 1, OperationDescriptions: "Cutting" },
  { OperationId: 2, OperationDescriptions: "Seam Stitching" },
  { OperationId: 3, OperationDescriptions: "Button Attachment" },
  { OperationId: 4, OperationDescriptions: "Hemming" },
  { OperationId: 5, OperationDescriptions: "Pressing" },
  { OperationId: 6, OperationDescriptions: "Quality Check" },
  { OperationId: 7, OperationDescriptions: "Packaging" },
  { OperationId: 8, OperationDescriptions: "Dyeing" },
];

// Generate dummy KPI data
export const generateDummyKPIData = () => {
  return [
    {
      total_output_units: 45320,
      productivity_rate: "92.5%",
      quality_deviation: 3.2,
      total_operations: 8,
      workforce_strength: 24,
      avg_operation_capacity: 5665,
      waste_units: 2150,
      initial_stage_count: 6,
      final_stage_count: 6,
      initial_production: 8500,
      final_production: 7820,
      initial_avg_rate: 1417,
      final_avg_rate: 1303,
      production_line_total: 12,
      design_variants: 15,
      planned_production: 50000,
    },
  ];
};

// Generate dummy workers with Pakistan names
export const generateDummyWorkers = () => {
  return PAKISTAN_NAMES.map((name, i) => ({
    WorkerCode: `PAK-W${String(i + 1).padStart(5, "0")}`,
    WorkerName: name,
    department: PAKISTAN_DEPARTMENTS[i % PAKISTAN_DEPARTMENTS.length],
    Department: PAKISTAN_DEPARTMENTS[i % PAKISTAN_DEPARTMENTS.length],
  }));
};

// Generate dummy operations
export const generateDummyOperations = () => OPERATIONS;

// Generate dummy companies
export const generateDummyCompanies = () => PAKISTAN_COMPANIES;

// Generate dummy branches
export const generateDummyBranches = () => {
  const branches: any[] = [];
  PAKISTAN_COMPANIES.forEach((company) => {
    PAKISTAN_CITIES.slice(0, 3).forEach((city, i) => {
      branches.push({
        Id: `BR-${company.Id}-${String(i + 1).padStart(3, "0")}`,
        Name: `${company.Name} - ${city}`,
      });
    });
  });
  return branches;
};

// Generate dummy styles
export const generateDummyStyles = () => {
  return Array.from({ length: 15 }, (_, i) => ({
    StyleNo: `STYLE-PAK-${String(i + 1).padStart(4, "0")}`,
  }));
};

// Generate dummy work orders
export const generateDummyWorkOrders = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    OrId: `WO-PAK-${String(i + 1).padStart(5, "0")}`,
    WorkerCode: `PAK-W${String((i % 20) + 1).padStart(5, "0")}`,
    Quantity: Math.floor(Math.random() * 2000) + 500,
    OperationId: (i % 8) + 1,
    LineId: `L${String((i % 12) + 1).padStart(3, "0")}`,
    Date: new Date(2026, Math.floor(Math.random() * 2), Math.floor(Math.random() * 28) + 1)
      .toISOString()
      .split("T")[0],
  }));
};

// Generate dummy line codes
export const generateDummyLines = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    Id: `L${String(i + 1).padStart(3, "0")}`,
    Name: `Production Line ${i + 1}`,
  }));
};

// Generate comprehensive filter data - 50 records only (fast & efficient)
export const generateDummyFilterData = () => {
  const filterData: any[] = [];
  const workers = generateDummyWorkers();
  const operations = generateDummyOperations();
  const companies = generateDummyCompanies();
  const lines = generateDummyLines();
  const styles = generateDummyStyles();

  // Only 50 records for better performance
  for (let i = 0; i < 50; i++) {
    const workerIdx = i % workers.length;
    const operationIdx = i % operations.length;
    const companyIdx = i % companies.length;
    const lineIdx = i % lines.length;
    const styleIdx = i % styles.length;
    const deptIdx = i % PAKISTAN_DEPARTMENTS.length;
    const lineNumber = lineIdx + 1;

    filterData.push({
      ScanningDate: new Date(2026, Math.floor(Math.random() * 2), Math.floor(Math.random() * 28) + 1)
        .toISOString().split('T')[0],
      StyleNo: styles[styleIdx].StyleNo,
      BuyMonth: `FG${String(i % 12 + 1).padStart(2, "0")}2026`,
      OrId: `WO-PAK-${String(i + 1).padStart(5, "0")}`,
      BrId: `BR-${companies[companyIdx].Id}-${String((i % 3) + 1).padStart(3, "0")}`,
      CompanyId: companies[companyIdx].Id,
      LineId: lineNumber,
      LineCode: `${lineNumber}`,
      OpSeq: operationIdx + 1,
      OperationID: operations[operationIdx].OperationId,
      OperationDescription: operations[operationIdx].OperationDescriptions,
      WorkerCode: workers[workerIdx].WorkerCode,
      WorkerDescription: workers[workerIdx].WorkerName,
      DepartmentName: PAKISTAN_DEPARTMENTS[deptIdx],
      IsFirst: i % 5 === 0 ? 1 : 0,
      IsLast: i % 7 === 0 ? 1 : 0,
      PlannedQtyERP: Math.floor(Math.random() * 3000) + 1000,
      ScannedQty: Math.floor(Math.random() * 2500) + 500,
      ShiftMinutes: 480,
      OperationTarget: Math.floor(Math.random() * 2000) + 800,
    });
  }

  return filterData;
};

// Generate top performers - 10 workers only
export const generateDummyTopWorkers = () => {
  const workers = generateDummyWorkers();
  return workers.slice(0, 10).map((worker, i) => ({
    WorkerCode: worker.WorkerCode,
    production_qty: 15000 - i * 800,
  }));
};

// Generate low performers - 10 workers only
export const generateDummyLowWorkers = () => {
  const workers = generateDummyWorkers();
  return workers.slice(10, 20).map((worker, i) => ({
    WorkerCode: worker.WorkerCode,
    production_qty: 2000 + i * 100,
  }));
};

// Generate daily trend data - 29 days
export const generateDummyDailyTrend = () => {
  return Array.from({ length: 29 }, (_, i) => {
    const actual = Math.floor(Math.random() * 5000) + 3000;
    const target = Math.floor(Math.random() * 4000) + 3000;
    const efficiency = (actual / target) * 100;
    return {
      scanning_date: `2026-02-${String(i + 1).padStart(2, "0")}`,
      actual: actual,
      target: target,
      efficiency: parseFloat(efficiency.toFixed(1)),
    };
  });
};

// Generate department-wise data - all departments
export const generateDummyDepartmentWise = () => {
  return PAKISTAN_DEPARTMENTS.map((dept) => ({
    department_name: dept,
    total_production: Math.floor(Math.random() * 8000) + 2000,
  }));
};

// Generate line efficiency data - 12 lines
export const generateDummyLineEfficiency = () => {
  const companies = PAKISTAN_COMPANIES;
  const result: any[] = [];

  Array.from({ length: 12 }, (_, i) => ({
    Id: `L${String(i + 1).padStart(3, "0")}`,
  })).forEach((line, lineIdx) => {
    const actual = Math.floor(Math.random() * 8000) + 3000;
    const target = Math.floor(Math.random() * 6000) + 4000;
    const efficiency = (actual / target) * 100;
    const companyIdx = lineIdx % companies.length;

    result.push({
      company_id: companies[companyIdx].Id,
      branch_id: `BR-${companies[companyIdx].Id}-${String((lineIdx % 3) + 1).padStart(3, "0")}`,
      line_code: line.Id,
      actual: actual,
      target: target,
      efficiency: parseFloat(efficiency.toFixed(1)),
    });
  });

  return result;
};

// Generate line operation efficiency data
export const generateDummyLineOperationEfficiency = () => {
  const lines = generateDummyLines();
  const operations = generateDummyOperations();
  const companies = PAKISTAN_COMPANIES;
  const result: any[] = [];

  lines.forEach((line, lineIdx) => {
    operations.forEach((op) => {
      const actual = Math.floor(Math.random() * 2500) + 800;
      const target = Math.floor(Math.random() * 2000) + 1000;
      const efficiency = (actual / target) * 100;
      const companyIdx = lineIdx % companies.length;

      result.push({
        company_id: companies[companyIdx].Id,
        branch_id: `BR-${companies[companyIdx].Id}-${String((lineIdx % 3) + 1).padStart(3, "0")}`,
        line_code: line.Id,
        operation_id: op.OperationId,
        operation_description: op.OperationDescriptions,
        efficiency: parseFloat(efficiency.toFixed(1)),
        actual: actual,
        target: target,
      });
    });
  });

  return result;
};

// Generate top line operations - 10 records
export const generateDummyTopLineOperations = () => {
  const lines = generateDummyLines();
  const operations = generateDummyOperations();
  const result: any[] = [];

  lines.forEach((line, lineIdx) => {
    operations.slice(0, 3).forEach((op) => {
      result.push({
        line_id: lineIdx + 1,
        line_code: line.Id,
        operation_id: op.OperationId,
        operation_description: op.OperationDescriptions,
        production_qty: Math.floor(Math.random() * 5000) + 3000,
      });
    });
  });

  return result.sort((a, b) => b.production_qty - a.production_qty).slice(0, 10);
};

// Generate low line operations - 10 records
export const generateDummyLowLineOperations = () => {
  const lines = generateDummyLines();
  const operations = generateDummyOperations();
  const result: any[] = [];

  lines.forEach((line, lineIdx) => {
    operations.slice(0, 3).forEach((op) => {
      result.push({
        line_id: lineIdx + 1,
        line_code: line.Id,
        operation_id: op.OperationId,
        operation_description: op.OperationDescriptions,
        production_qty: Math.floor(Math.random() * 2000) + 200,
      });
    });
  });

  return result.sort((a, b) => a.production_qty - b.production_qty).slice(0, 10);
};

// Export all dummy data generators
export const dummyDataService = {
  getKPIData: generateDummyKPIData,
  getWorkers: generateDummyWorkers,
  getOperations: generateDummyOperations,
  getCompanies: generateDummyCompanies,
  getBranches: generateDummyBranches,
  getStyles: generateDummyStyles,
  getWorkOrders: generateDummyWorkOrders,
  getLines: generateDummyLines,
  getFilterData: generateDummyFilterData,
  getTopWorkers: generateDummyTopWorkers,
  getLowWorkers: generateDummyLowWorkers,
  getDailyTrend: generateDummyDailyTrend,
  getDepartmentWise: generateDummyDepartmentWise,
  getLineEfficiency: generateDummyLineEfficiency,
  getLineOperationEfficiency: generateDummyLineOperationEfficiency,
  getTopLineOperations: generateDummyTopLineOperations,
  getLowLineOperations: generateDummyLowLineOperations,
};