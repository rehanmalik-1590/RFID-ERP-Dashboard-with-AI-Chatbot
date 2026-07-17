// ......................api.ts file .............................
import { useQuery } from '@tanstack/react-query';
import {
  generateDummyKPIData,
  generateDummyWorkers,
  generateDummyOperations,
  generateDummyCompanies,
  generateDummyBranches,
  generateDummyStyles,
  generateDummyWorkOrders,
  generateDummyLines,
  generateDummyFilterData,
  generateDummyTopWorkers,
  generateDummyLowWorkers,
  generateDummyDailyTrend,
  generateDummyDepartmentWise,
  generateDummyLineEfficiency,
  generateDummyLineOperationEfficiency,
  generateDummyTopLineOperations,
  generateDummyLowLineOperations,
} from './dummyData';

// Dummy data is now being used instead of API calls

    // *************************** Get All KpiData  ***************************

        export const useGetAllKpiData = (date_from: string, date_to: string) => {
            return useQuery({
                queryKey: ['getkpidata', date_from, date_to],
                queryFn: async () => {
                    return new Promise<any>((resolve) => {
                        setTimeout(() => {
                            resolve(generateDummyKPIData());
                        }, 300);
                    });
                },
                enabled: !!date_from && !!date_to
            });
        };

    // *************************** Company API ***************************

        export const useCompanyNodes = () => {
            return useQuery({
                queryKey: ['companyNodes'],
                queryFn: async () => {
                    return new Promise<any>((resolve) => {
                        setTimeout(() => {
                            resolve(generateDummyCompanies());
                        }, 200);
                    });
                },
            });
        };

    // *************************** Branch API ***************************

        export const useBranchByCompany = (companyIds: string[]) => {

            return useQuery({
                queryKey: ['branches', companyIds],
                queryFn: async () => {
                    return new Promise<any>((resolve) => {
                        setTimeout(() => {
                            if (companyIds.length === 0) {
                                resolve([]);
                            } else {
                                const allBranches = generateDummyBranches();
                                const filtered = allBranches.filter(b =>
                                    companyIds.some(cId => b.Id.includes(cId))
                                );
                                resolve(filtered);
                            }
                        }, 200);
                    });
                },
                enabled: companyIds.length > 0,
            });
        };

    // *************************** Style API ***************************

        export const useStyleByBranchAndCompany = (branchIds: string[], companyIds: string[]) => {

            return useQuery({
                queryKey: ['styles', branchIds, companyIds],
                queryFn: async () => {
                    return new Promise<any>((resolve) => {
                        setTimeout(() => {
                            if (branchIds.length === 0 || companyIds.length === 0) {
                                resolve([]);
                            } else {
                                resolve(generateDummyStyles());
                            }
                        }, 200);
                    });
                },
                enabled: branchIds.length > 0 && companyIds.length > 0,
            });
        };


    //    export const useStyleByBranchAndCompany = (branchIds: string[], companyIds: string[]) => {
    //         const branchParam = branchIds.join(',');
    //         const companyParam = companyIds.join(',');
            
    //         return useQuery({
    //             queryKey: ['styles', branchIds, companyIds],
    //             queryFn: async () => {
    //                 // Case 1: Both empty - fetch all styles
    //                 if (branchIds.length === 0 && companyIds.length === 0) {
    //                     const res = await fetch(`${BASE_URL}/filters/stylebybranchandcompany`);
    //                     const data = await res.json();
    //                     return data.data;
    //                 }
                    
    //                 // Case 2: Only branch selected
    //                 if (branchIds.length > 0 && companyIds.length === 0) {
    //                     const res = await fetch(`${BASE_URL}/filters/stylebybranchandcompany?branch_id=${branchParam}`);
    //                     const data = await res.json();
    //                     return data.data;
    //                 }
                    
    //                 // Case 3: Only company selected
    //                 if (branchIds.length === 0 && companyIds.length > 0) {
    //                     const res = await fetch(`${BASE_URL}/filters/stylebybranchandcompany?company_id=${companyParam}`);
    //                     const data = await res.json();
    //                     return data.data;
    //                 }
                    
    //                 // Case 4: Both selected - original logic
    //                 const res = await fetch(`${BASE_URL}/filters/stylebybranchandcompany?branch_id=${branchParam}&company_id=${companyParam}`);
    //                 const data = await res.json();
    //                 return data.data;
    //             },
    //             enabled: true,
    //         });
    //     };


    // *************************** Work Order API ***************************

        export const useWorkOrdersByStyleAndBranch = (branchIds: string[], companyIds: string[], styleNos: string[]) => {

            return useQuery({
                queryKey: ['workOrders', branchIds, companyIds, styleNos],
                queryFn: async () => {
                    return new Promise<any>((resolve) => {
                        setTimeout(() => {
                            if (branchIds.length === 0 || companyIds.length === 0 || styleNos.length === 0) {
                                resolve([]);
                            } else {
                                resolve(generateDummyWorkOrders());
                            }
                        }, 200);
                    });
                },
                enabled: branchIds.length > 0 && companyIds.length > 0 && styleNos.length > 0,
            });
        };



    // *************************** Line Code API ***************************

        export const useLineByBranch = (branchIds: string[]) => {

            return useQuery({
                queryKey: ['lines', branchIds],
                queryFn: async () => {
                    return new Promise<any>((resolve) => {
                        setTimeout(() => {
                            if (branchIds.length === 0) {
                                resolve([]);
                            } else {
                                resolve(generateDummyLines());
                            }
                        }, 200);
                    });
                },
                enabled: branchIds.length > 0,
            });
        };


    

    //  *************************** Workers API ***************************

        export const useWorkers = () => {
            return useQuery({
                queryKey: ['workers'],
                queryFn: async () => {
                    return new Promise<any>((resolve) => {
                        setTimeout(() => {
                            resolve(generateDummyWorkers());
                        }, 200);
                    });
                },
            });
        };




    // *************************** Operation API ***************************

        export const useOperations = () => {
            return useQuery({
                queryKey: ['operations'],
                queryFn: async () => {
                    return new Promise<any>((resolve) => {
                        setTimeout(() => {
                            resolve(generateDummyOperations());
                        }, 200);
                    });
                },
            });
        };


    // *************************** Dashboard KPI Data API (with 2 params) ***************************

        export const useKpiData = (date_from: string, date_to: string) => {
            return useQuery({
                queryKey: ['kpiData', date_from, date_to],
                queryFn: async () => {
                    return new Promise<any>((resolve) => {
                        setTimeout(() => {
                            const data = generateDummyKPIData();
                            resolve(data[0]);
                        }, 300);
                    });
                },
                enabled: !!date_from && !!date_to,
            });
        };


    // *************************** Workers Performance API (Top/Low) ***************************

        export const useWorkersPerformance = (
            mode: 'top' | 'low',
            date_from: string,
            date_to: string
        ) => {
            return useQuery({
                queryKey: ['workersPerformance', mode, date_from, date_to],
                queryFn: async () => {
                    return new Promise<any>((resolve) => {
                        setTimeout(() => {
                            const data = mode === 'top' ? generateDummyTopWorkers() : generateDummyLowWorkers();
                            resolve(data);
                        }, 300);
                    });
                },
                enabled: !!mode && !!date_from && !!date_to,
            });
        };


    // *************************** DailyTrend API ***************************

        export const usegetDailyTrend = (date_from: string, date_to: string) => {
            return useQuery({
                queryKey: ['dailyTrend', date_from, date_to],
                queryFn: async () => {
                    return new Promise<any>((resolve) => {
                        setTimeout(() => {
                            resolve(generateDummyDailyTrend());
                        }, 300);
                    });
                },
                enabled: !!date_from && !!date_to,
            });
        };


     // *************************** DepartmentWise API ***************************

        export const usegetDepartmentWise = (date_from: string, date_to: string) => {
            return useQuery({
                queryKey: ['dailytrend', date_from, date_to],
                queryFn: async () => {
                    return new Promise<any>((resolve) => {
                        setTimeout(() => {
                            resolve(generateDummyDepartmentWise());
                        }, 300);
                    });
                },
                enabled: !!date_from && !!date_to,
            });
        };



     // *************************** LineEfficiency API ***************************

        export const useGetLineEfficiency = (date_from: string, date_to: string) => {
            return useQuery({
                queryKey: ['lineefficiency', date_from, date_to],
                queryFn: async () => {
                    return new Promise<any>((resolve) => {
                        setTimeout(() => {
                            resolve(generateDummyLineEfficiency());
                        }, 300);
                    });
                },
                enabled: !!date_from && !!date_to
            });
        };





     // *************************** Line Operation Scanning API ***************************

        export const useGetLineOperationScanning = (date_from: string, date_to: string) => {
            return useQuery({
                queryKey: ['lineoperation', date_from, date_to],
                queryFn: async () => {
                    return new Promise<any>((resolve) => {
                        setTimeout(() => {
                            resolve(generateDummyLineOperationEfficiency());
                        }, 300);
                    });
                },
                enabled: !!date_from && !!date_to
            });
        };
    



    // *************************** Get all APIs for list table ***************************

        export const useGetAllData = (date_from: string, date_to: string) => {
            return useQuery({
                queryKey: ['all-data', date_from, date_to],
                queryFn: async () => {
                    return new Promise<any>((resolve) => {
                        setTimeout(() => {
                            resolve(generateDummyFilterData());
                        }, 500);
                    });
                },
                enabled: !!date_from && !!date_to,
            });
        };





    // *************************** Get Operation By Line ***************************

        export const useGetTopAndLowLinePerformance = (mode: string, date_from: string, date_to: string) => {
            return useQuery({
                queryKey: ['lineperformance', mode, date_from, date_to],
                queryFn: async () => {
                    return new Promise<any>((resolve) => {
                        setTimeout(() => {
                            const data = mode === 'top' ? generateDummyTopLineOperations() : generateDummyLowLineOperations();
                            resolve(data);
                        }, 300);
                    });
                },
                enabled: !!mode && !!date_from && !!date_to
            });
        };


    // *************************** Get All Data for Filters ***************************

        export const useGetAllFilterData = (date_from: string, date_to: string) => {
            return useQuery({
                queryKey: ['allFilterData', date_from, date_to],
                queryFn: async () => {
                    return new Promise<any>((resolve) => {
                        setTimeout(() => {
                            resolve(generateDummyFilterData());
                        }, 500);
                    });
                },
                enabled: !!date_from && !!date_to,
            });
        };

    // *************************** Dashboard KPI Data API (all params) *************************** 
    // export const useKpiData = (
    //     date_from: string,
    //     date_to: string,
    //     company_id?: string,
    //     branch_id?: string,
    //     line_code?: string,
    //     style_no?: string,
    //     worker_code?: string,
    //     operation_id?: string,
    //     department_name?: string,
    //     work_order?: string
    // ) => {
    //     const params = new URLSearchParams();
    //     params.append('date_from', date_from);
    //     params.append('date_to', date_to);
        
    //     if (company_id) params.append('company_id', company_id);
    //     if (branch_id) params.append('branch_id', branch_id);
    //     if (line_code) params.append('line_code', line_code);
    //     if (style_no) params.append('style_no', style_no);
    //     if (worker_code) params.append('worker_code', worker_code);
    //     if (operation_id) params.append('operation_id', operation_id);
    //     if (department_name) params.append('department_name', department_name);
    //     if (work_order) params.append('work_order', work_order);
    
    //     return useQuery({
    //             queryKey: ['kpiData', date_from, date_to, company_id, branch_id, line_code, style_no, worker_code, operation_id, department_name, work_order],
    //             queryFn: async () => {
    //             const res = await fetch(`${BASE_URL}/dashboard/operations/getkpidata?${params.toString()}`);
    //             const data = await res.json();
    //             return data.data[0];
    //         },
    //         enabled: !!date_from && !!date_to,
    //     });
    // };