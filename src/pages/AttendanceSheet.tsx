import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, FileDown, Printer, Plus, Loader2, Trash2, Edit, Save } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { workerService } from "@/services/workerService";
import { projectService } from "@/services/projectService";
import { attendanceService, AttendanceDataResponse } from "@/services/attendanceService";
import { WorkerResponse, ProjectResponse } from "@/lib/api";

// Mock data - will be replaced with actual API calls
const mockAttendanceData = {
  sheetId: "sheet-1",
  projectName: "M/S G.S. CONSTRUCTION",
  location: "CAMP-BIRSINGHPUR",
  workOrder: "work order for round the clock operation of fire tenders by engaging 10 nos. skilled drivers and maintenance/ cleaning of vehicle i.e. track, cranes tipper, tailor fire tenders by engaging 02 nos. unskilled labour & operation of 15/10 ton mobile crane by engaging 02 nos. highly skilled drivers & 02 Nos. unskilled labour for assistance at SGTPS, MPPGCL, Birsinghpur.",
  loaNumber: "LoA. No. 511-0100/SGTPS/P&W/ENIT-10/2024_MPPGC_349966_1/LoA/ 3189 Dtd. 22/10/2024.",
  orderNumber: "Order No. 511-0100/SGTPS/P&W/ENIT-10/2024_MPPGC_349966_1/W.O.-149/3401 Dtd. 07/11/2024.",
  startDate: "2025-07-24",
  endDate: "2025-08-23",
  workers: [
    {
      id: "1",
      name: "RAJENDRA VISHWAKARMA",
      designation: "High Skilled",
      attendance: ["A", "O", "P", "P", "P", "P", "P", "P", "O", "P", "P", "P", "P", "P", "P", "O", "P", "P", "P", "P", "P", "P", "O", "P", "P", "P", "P", "P", "A", "O", "P"],
      present: 25,
      ncp: 1
    },
    {
      id: "2",
      name: "RAMDAS TANDIA",
      designation: "High Skilled",
      attendance: ["P", "P", "O", "P", "P", "P", "A", "A", "P", "O", "P", "P", "P", "P", "A", "P", "O", "P", "P", "A", "P", "P", "P", "O", "P", "P", "P", "P", "P", "P", "O"],
      present: 22,
      ncp: 4
    },
    {
      id: "3",
      name: "SUNNY SURYAVANSHI",
      designation: "High Skilled",
      attendance: ["A", "P", "P", "O", "A", "A", "P", "P", "P", "P", "O", "A", "A", "A", "P", "P", "P", "O", "A", "P", "A", "A", "P", "P", "O", "A", "A", "A", "P", "P", "P"],
      present: 15,
      ncp: 12
    },
    {
      id: "4",
      name: "UMESH KUMAR RAJAK",
      designation: "Skilled",
      attendance: ["P", "P", "P", "O", "P", "P", "P", "P", "P", "P", "O", "P", "P", "P", "P", "P", "P", "O", "P", "P", "P", "P", "P", "P", "O", "P", "P", "P", "P", "P", "P"],
      present: 27,
      ncp: 0
    },
    {
      id: "5",
      name: "GULZAR SINGH",
      designation: "Skilled",
      attendance: ["P", "P", "P", "P", "O", "P", "P", "P", "P", "P", "P", "O", "P", "P", "P", "P", "P", "P", "O", "P", "P", "P", "P", "P", "P", "O", "P", "P", "P", "P", "P"],
      present: 27,
      ncp: 0
    },
    {
      id: "6",
      name: "MAN SINGH",
      designation: "Skilled",
      attendance: ["P", "P", "P", "P", "P", "O", "P", "P", "P", "P", "P", "P", "O", "P", "P", "P", "P", "P", "P", "O", "P", "P", "P", "P", "P", "P", "O", "P", "P", "P", "P"],
      present: 27,
      ncp: 0
    }
  ]
};

// Generate date columns for the period
const generateDateColumns = (startDate: string, endDate: string) => {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let current = new Date(start);
  while (current <= end) {
    dates.push({
      day: current.getDate(),
      month: current.getMonth() + 1
    });
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

// Helper function to calculate present and NCP from attendance array
const calculateWorkerStats = (attendance: string[]) => {
  const present = attendance.filter(status => status === "P").length;
  const ncp = attendance.filter(status => status === "A").length;
  return { present, ncp };
};

export default function AttendanceSheet() {
  const { id, sheetId } = useParams();
  const navigate = useNavigate();
  
  // Data state
  const [data, setData] = useState(mockAttendanceData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [attendanceSheet, setAttendanceSheet] = useState<{ monthYear: string; startDate: string | null; endDate: string | null } | null>(null);
  
  const [isAddWorkerDialogOpen, setIsAddWorkerDialogOpen] = useState(false);
  const [availableWorkers, setAvailableWorkers] = useState<WorkerResponse[]>([]);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<Set<string>>(new Set());
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(false);
  
  // Change worker dialog state
  const [isChangeWorkerDialogOpen, setIsChangeWorkerDialogOpen] = useState(false);
  const [workerToChange, setWorkerToChange] = useState<{ id: string; attendanceId?: string; name: string } | null>(null);
  const [availableWorkersForChange, setAvailableWorkersForChange] = useState<WorkerResponse[]>([]);
  const [selectedReplacementWorkerId, setSelectedReplacementWorkerId] = useState<string | null>(null);
  const [isLoadingWorkersForChange, setIsLoadingWorkersForChange] = useState(false);
  const [isChangingWorker, setIsChangingWorker] = useState(false);
  
  // Remove worker confirmation dialog state
  const [isRemoveConfirmDialogOpen, setIsRemoveConfirmDialogOpen] = useState(false);
  const [workerToRemove, setWorkerToRemove] = useState<{ id: string; attendanceId?: string; name: string } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  
  // Save state
  const [isSaving, setIsSaving] = useState(false);
  
  const dateColumns = generateDateColumns(data.startDate, data.endDate);
  
  // Fetch attendance data
  const fetchAttendanceData = useCallback(async () => {
    if (!id) {
      setError('No project ID provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const orgId = localStorage.getItem('selectedOrgId');
      if (!orgId) {
        setError('No organization selected');
        setIsLoading(false);
        return;
      }

      // Fetch project details
      const projectData = await projectService.getProject(orgId, id);
      setProject(projectData);

      // Fetch attendance sheets to get the sheet details
      const sheets = await attendanceService.getAttendanceSheets(id);
      const currentSheet = sheets.find(s => s.id === sheetId);
      
      if (!currentSheet) {
        setError('Attendance sheet not found');
        setIsLoading(false);
        return;
      }

      setAttendanceSheet(currentSheet);
      const monthYear = currentSheet.monthYear;

      // Fetch attendance data
      const attendanceData = await attendanceService.getAttendanceData(id, monthYear);

      // Fetch all workers to get names and designations
      const allWorkers = await workerService.getWorkers(orgId);
      const workerMap = new Map(allWorkers.map(w => [w.id, w]));

      // Calculate start and end dates
      let startDate = currentSheet.startDate;
      let endDate = currentSheet.endDate;
      
      // If dates are not available, calculate from monthYear
      if (!startDate || !endDate) {
        const [year, month] = monthYear.split('-');
        startDate = `${year}-${month}-01`;
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        endDate = `${year}-${month}-${lastDay}`;
      } else if (startDate.includes('/')) {
        // Convert DD/MM/YYYY to YYYY-MM-DD
        const [day, month, year] = startDate.split('/');
        startDate = `${year}-${month}-${day}`;
      }
      if (endDate && endDate.includes('/')) {
        const [day, month, year] = endDate.split('/');
        endDate = `${year}-${month}-${day}`;
      }

      // Generate date columns
      const dates = generateDateColumns(startDate, endDate);
      
      // Create a map of date strings to indices for quick lookup
      const dateIndexMap = new Map<string, number>();
      dates.forEach((dateCol, index) => {
        const year = monthYear.split('-')[0];
        const dateStr = `${year}-${String(dateCol.month).padStart(2, '0')}-${String(dateCol.day).padStart(2, '0')}`;
        dateIndexMap.set(dateStr, index);
      });
      
      // Transform attendance data to match component format
      const transformedWorkers = attendanceData.attendances.map(attendance => {
        const worker = workerMap.get(attendance.workerId);
        const workerName = worker?.name.toUpperCase() || `Worker ${attendance.workerId.substring(0, 8)}`;
        const designation = worker?.tags?.[0] || "Unskilled";
        
        // Initialize attendance array with "O" (Off) for all dates
        const attendanceArray = new Array(dates.length).fill("O");
        
        // Fill in the attendance records from dailyRecords
        Object.entries(attendance.dailyRecords).forEach(([dateStr, status]) => {
          const index = dateIndexMap.get(dateStr);
          if (index !== undefined) {
            attendanceArray[index] = status;
          }
        });

        return {
          id: attendance.workerId,
          attendanceId: attendance.id, // Store the attendance record ID for API calls
          name: workerName,
          designation: designation,
          attendance: attendanceArray,
          present: attendance.presentDays,
          ncp: attendance.absentDays
        };
      });

      // Update data state
      setData({
        sheetId: sheetId || "",
        projectName: projectData.orgName || projectData.name,
        location: "", // Not available in API
        workOrder: "", // Not available in API
        loaNumber: "", // Not available in API
        orderNumber: projectData.orderNo || "",
        startDate: startDate,
        endDate: endDate || startDate,
        workers: transformedWorkers
      });

    } catch (err) {
      console.error('Failed to fetch attendance data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load attendance data');
    } finally {
      setIsLoading(false);
    }
  }, [id, sheetId]);

  // Fetch data on mount
  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);
  
  // Fetch workers from API
  const fetchWorkers = async () => {
    try {
      setIsLoadingWorkers(true);
      const orgId = localStorage.getItem('selectedOrgId');
      if (!orgId) {
        console.error('No organization ID found');
        return;
      }
      
      const workers = await workerService.getWorkers(orgId);
      // Filter out workers that are already in the attendance sheet
      const existingWorkerIds = new Set(data.workers.map(w => w.id));
      const filteredWorkers = workers.filter(w => !existingWorkerIds.has(w.id));
      setAvailableWorkers(filteredWorkers);
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    } finally {
      setIsLoadingWorkers(false);
    }
  };
  
  // Fetch workers when dialog opens
  useEffect(() => {
    if (isAddWorkerDialogOpen) {
      fetchWorkers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddWorkerDialogOpen]);
  
  // Toggle worker selection
  const toggleWorkerSelection = (workerId: string) => {
    setSelectedWorkerIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workerId)) {
        newSet.delete(workerId);
      } else {
        newSet.add(workerId);
      }
      return newSet;
    });
  };
  
  // Add selected workers to attendance sheet
  const addSelectedWorkers = () => {
    const selectedWorkers = availableWorkers.filter(w => selectedWorkerIds.has(w.id));
    const numDays = dateColumns.length;
    
    const newWorkers = selectedWorkers.map(worker => ({
      id: worker.id,
      name: worker.name.toUpperCase(),
      designation: worker.tags?.[0] || "Unskilled", // Use first tag as designation or default
      attendance: new Array(numDays).fill("O"), // Initialize with "O" (Off)
      present: 0,
      ncp: 0
    }));
    
    setData(prevData => ({
      ...prevData,
      workers: [...prevData.workers, ...newWorkers]
    }));
    
    // Reset and close dialog
    setSelectedWorkerIds(new Set());
    setIsAddWorkerDialogOpen(false);
  };
  
  // Open remove confirmation dialog
  const openRemoveConfirmDialog = (workerId: string, workerName: string, attendanceId?: string) => {
    setWorkerToRemove({ id: workerId, attendanceId, name: workerName });
    setIsRemoveConfirmDialogOpen(true);
  };

  // Confirm and remove worker from attendance sheet
  const confirmRemoveWorker = async () => {
    if (!workerToRemove || !sheetId) {
      alert('Missing worker information or sheet ID');
      return;
    }

    // If there's no attendanceId, it means the worker was just added and hasn't been saved yet
    // In this case, we can just remove it from the local state
    if (!workerToRemove.attendanceId) {
      setData(prevData => ({
        ...prevData,
        workers: prevData.workers.filter(w => w.id !== workerToRemove.id)
      }));
      
      // Reset and close dialog
      setWorkerToRemove(null);
      setIsRemoveConfirmDialogOpen(false);
      return;
    }

    try {
      setIsRemoving(true);

      // Call the API to remove the worker
      await attendanceService.removeWorker(workerToRemove.attendanceId, sheetId);

      // Remove from local state
      setData(prevData => ({
        ...prevData,
        workers: prevData.workers.filter(w => w.id !== workerToRemove.id)
      }));

      // Reset and close dialog
      setWorkerToRemove(null);
      setIsRemoveConfirmDialogOpen(false);

      alert('Worker removed successfully!');
    } catch (error) {
      console.error('Failed to remove worker:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove worker';
      alert(`Failed to remove worker: ${errorMessage}`);
    } finally {
      setIsRemoving(false);
    }
  };
  
  // Open change worker dialog
  const openChangeWorkerDialog = (workerId: string, workerName: string, attendanceId?: string) => {
    setWorkerToChange({ id: workerId, attendanceId, name: workerName });
    setIsChangeWorkerDialogOpen(true);
  };
  
  // Fetch workers for change dialog
  const fetchWorkersForChange = async () => {
    try {
      setIsLoadingWorkersForChange(true);
      const orgId = localStorage.getItem('selectedOrgId');
      if (!orgId) {
        console.error('No organization ID found');
        return;
      }
      
      const workers = await workerService.getWorkers(orgId);
      // Filter out workers that are already in the attendance sheet (including the current worker being changed)
      const existingWorkerIds = new Set(data.workers.map(w => w.id));
      const filteredWorkers = workers.filter(w => !existingWorkerIds.has(w.id));
      setAvailableWorkersForChange(filteredWorkers);
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    } finally {
      setIsLoadingWorkersForChange(false);
    }
  };
  
  // Fetch workers when change dialog opens
  useEffect(() => {
    if (isChangeWorkerDialogOpen && workerToChange) {
      fetchWorkersForChange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChangeWorkerDialogOpen, workerToChange]);
  
  // Replace worker - replace existing worker with new one
  const replaceWorker = async () => {
    if (!workerToChange || !selectedReplacementWorkerId) {
      return;
    }
    
    const replacementWorker = availableWorkersForChange.find(w => w.id === selectedReplacementWorkerId);
    if (!replacementWorker) {
      return;
    }

    // If there's no attendanceId, it means the worker was just added and hasn't been saved yet
    // In this case, we can just update the local state
    if (!workerToChange.attendanceId) {
      setData(prevData => {
        const updatedWorkers = prevData.workers.map(worker => {
          if (worker.id === workerToChange.id) {
            // Replace worker but keep the attendance data
            return {
              id: replacementWorker.id,
              name: replacementWorker.name.toUpperCase(),
              designation: replacementWorker.tags?.[0] || worker.designation,
              attendance: worker.attendance, // Keep existing attendance
              present: worker.present, // Keep existing stats
              ncp: worker.ncp
            };
          }
          return worker;
        });
        
        return {
          ...prevData,
          workers: updatedWorkers
        };
      });
      
      // Reset and close dialog
      setWorkerToChange(null);
      setSelectedReplacementWorkerId(null);
      setIsChangeWorkerDialogOpen(false);
      return;
    }

    try {
      setIsChangingWorker(true);

      // Call the API to change the worker
      await attendanceService.changeWorker(workerToChange.attendanceId, selectedReplacementWorkerId);

      // Update local state
      setData(prevData => {
        const updatedWorkers = prevData.workers.map(worker => {
          if (worker.id === workerToChange.id) {
            // Replace worker but keep the attendance data
            return {
              id: replacementWorker.id,
              attendanceId: workerToChange.attendanceId, // Keep the same attendance record ID
              name: replacementWorker.name.toUpperCase(),
              designation: replacementWorker.tags?.[0] || worker.designation,
              attendance: worker.attendance, // Keep existing attendance
              present: worker.present, // Keep existing stats
              ncp: worker.ncp
            };
          }
          return worker;
        });
        
        return {
          ...prevData,
          workers: updatedWorkers
        };
      });
      
      // Reset and close dialog
      setWorkerToChange(null);
      setSelectedReplacementWorkerId(null);
      setIsChangeWorkerDialogOpen(false);

      alert('Worker changed successfully!');
    } catch (error) {
      console.error('Failed to change worker:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to change worker';
      alert(`Failed to change worker: ${errorMessage}`);
    } finally {
      setIsChangingWorker(false);
    }
  };
  
  // Update attendance status when user types P, A, or O
  const updateAttendance = (workerId: string, dateIndex: number, newStatus: string) => {
    // Only accept P, A, or O (case-insensitive)
    const validStatus = newStatus.toUpperCase();
    if (!["P", "A", "O"].includes(validStatus)) {
      return;
    }
    
    setData(prevData => {
      const updatedWorkers = prevData.workers.map(worker => {
        if (worker.id === workerId) {
          const updatedAttendance = [...worker.attendance];
          updatedAttendance[dateIndex] = validStatus;
          
          // Recalculate present and NCP
          const { present, ncp } = calculateWorkerStats(updatedAttendance);
          
          return {
            ...worker,
            attendance: updatedAttendance,
            present,
            ncp
          };
        }
        return worker;
      });
      
      return {
        ...prevData,
        workers: updatedWorkers
      };
    });
  };
  
  // Handle key press to update attendance
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, workerId: string, dateIndex: number) => {
    const key = e.key.toUpperCase();
    if (["P", "A", "O"].includes(key)) {
      e.preventDefault();
      updateAttendance(workerId, dateIndex, key);
      // Blur the input after typing
      e.currentTarget.blur();
    } else if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      updateAttendance(workerId, dateIndex, "O");
      e.currentTarget.blur();
    }
  };
  
  // Calculate totals for each date
  const calculateDateTotal = (dateIndex: number) => {
    return data.workers.reduce((sum, worker) => {
      return sum + (worker.attendance[dateIndex] === "P" ? 1 : 0);
    }, 0);
  };
  
  // Calculate totals using useMemo for performance
  const { totalPresent, totalNCP, totalAttendance } = useMemo(() => {
    const present = data.workers.reduce((sum, worker) => sum + worker.present, 0);
    const ncp = data.workers.reduce((sum, worker) => sum + worker.ncp, 0);
    const attendance = dateColumns.reduce((sum, _, index) => {
      return sum + data.workers.reduce((dateSum, worker) => {
        return dateSum + (worker.attendance[index] === "P" ? 1 : 0);
      }, 0);
    }, 0);
    return { totalPresent: present, totalNCP: ncp, totalAttendance: attendance };
  }, [data.workers, dateColumns]);

  // Save attendance changes
  const handleSave = async () => {
    if (!id || !sheetId) {
      alert('Missing project ID or sheet ID');
      return;
    }

    try {
      setIsSaving(true);

      // Generate date strings for each column (matching the format used in fetchAttendanceData)
      const year = attendanceSheet?.monthYear 
        ? attendanceSheet.monthYear.split('-')[0] 
        : new Date(data.startDate).getFullYear().toString();
      
      const dateStrings = dateColumns.map((dateCol) => {
        const month = String(dateCol.month).padStart(2, '0');
        const day = String(dateCol.day).padStart(2, '0');
        return `${year}-${month}-${day}`;
      });

      // Build workerAttendance object
      const workerAttendance: Record<string, Record<string, string>> = {};
      
      data.workers.forEach((worker) => {
        const workerRecords: Record<string, string> = {};
        
        worker.attendance.forEach((status, index) => {
          const dateStr = dateStrings[index];
          if (dateStr && status) {
            // Only include non-empty statuses (P, A, or O)
            workerRecords[dateStr] = status;
          }
        });
        
        if (Object.keys(workerRecords).length > 0) {
          workerAttendance[worker.id] = workerRecords;
        }
      });

      // Prepare the request payload
      const payload = {
        tenderId: id,
        attendanceSheetId: sheetId,
        workerAttendance: workerAttendance
      };

      console.log('Saving attendance data:', payload);

      // Call the API
      await attendanceService.bulkUpdateAttendance(payload);

      alert('Attendance saved successfully!');
    } catch (error) {
      console.error('Failed to save attendance:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save attendance';
      alert(`Failed to save attendance: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading attendance sheet...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-error">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(`/project/${id}`)} className="w-full">
              Return to Project
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="flex h-16 items-center px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/project/${id}`)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>
          
          <Logo size="sm" />
          
          <div className="ml-auto flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setIsAddWorkerDialogOpen(true)}
              className="bg-gradient-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Workers
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-primary"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
            <Button variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Sheet Header */}
        <Card className="mb-6">
          <CardHeader className="border-b">
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold">
                {data.projectName}
              </CardTitle>
              <p className="text-sm font-medium">{data.location}</p>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">{data.workOrder}</p>
              <p className="font-medium">{data.loaNumber}</p>
              <p className="font-medium">{data.orderNumber}</p>
              <div className="flex items-center justify-center gap-4 pt-2 font-bold text-base">
                <span>Period - {new Date(data.startDate).toLocaleDateString('en-GB')} TO {new Date(data.endDate).toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold text-center border-r min-w-[60px] sticky left-0 bg-muted/50 z-10">S No</TableHead>
                    <TableHead className="font-bold border-r min-w-[200px] sticky left-[60px] bg-muted/50 z-10">NAME</TableHead>
                    <TableHead className="font-bold text-center border-r min-w-[150px]">Designation</TableHead>
                    {dateColumns.map((date, index) => (
                      <TableHead key={index} className="font-bold text-center border-r min-w-[40px] p-2">
                        {date.day}
                      </TableHead>
                    ))}
                    <TableHead className="font-bold text-center border-r min-w-[80px] bg-yellow-100 dark:bg-yellow-900/20">Total Present</TableHead>
                    <TableHead className="font-bold text-center border-r min-w-[80px] bg-yellow-100 dark:bg-yellow-900/20">NCP</TableHead>
                    <TableHead className="font-bold text-center border-r min-w-[100px] sticky right-0 bg-muted/50 z-10">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.workers.map((worker, workerIndex) => (
                    <TableRow key={worker.id} className="hover:bg-muted/50">
                      <TableCell className="text-center font-medium border-r sticky left-0 bg-background z-10">
                        {workerIndex + 1}
                      </TableCell>
                      <TableCell className="font-medium border-r sticky left-[60px] bg-background z-10">
                        {worker.name}
                      </TableCell>
                      <TableCell className="text-center border-r">{worker.designation}</TableCell>
                      {worker.attendance.map((status, dateIndex) => (
                        <TableCell 
                          key={dateIndex} 
                          className={`text-center border-r p-0 ${
                            status === "P" ? "bg-green-50 dark:bg-green-900/20" : 
                            status === "A" ? "bg-red-50 dark:bg-red-900/20" : 
                            "bg-blue-50 dark:bg-blue-900/20"
                          }`}
                        >
                          <input
                            type="text"
                            value={status}
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase();
                              if (["P", "A", "O", ""].includes(value)) {
                                if (value === "") {
                                  updateAttendance(worker.id, dateIndex, "O");
                                } else {
                                  updateAttendance(worker.id, dateIndex, value);
                                }
                              }
                            }}
                            onKeyDown={(e) => handleKeyDown(e, worker.id, dateIndex)}
                            onFocus={(e) => e.target.select()}
                            className={`w-full h-full py-2 px-1 text-center font-medium border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer ${
                              status === "P" ? "text-green-700 dark:text-green-300" : 
                              status === "A" ? "text-red-700 dark:text-red-300" : 
                              "text-blue-700 dark:text-blue-300"
                            }`}
                            maxLength={1}
                            title="Type P, A, or O"
                          />
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-bold border-r bg-yellow-50 dark:bg-yellow-900/10">
                        {worker.present}
                      </TableCell>
                      <TableCell className="text-center font-bold border-r bg-yellow-50 dark:bg-yellow-900/10">
                        {worker.ncp}
                      </TableCell>
                      <TableCell className="text-center border-r sticky right-0 bg-background z-10">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            onClick={() => {
                              const workerWithAttendance = worker as { id: string; name: string; attendanceId?: string; designation: string; attendance: string[]; present: number; ncp: number };
                              openChangeWorkerDialog(workerWithAttendance.id, workerWithAttendance.name, workerWithAttendance.attendanceId);
                            }}
                            title="Change worker"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => {
                              const workerWithAttendance = worker as { id: string; name: string; attendanceId?: string; designation: string; attendance: string[]; present: number; ncp: number };
                              openRemoveConfirmDialog(workerWithAttendance.id, workerWithAttendance.name, workerWithAttendance.attendanceId);
                            }}
                            title="Remove worker"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Total Row */}
                  <TableRow className="bg-muted font-bold border-t-2">
                    <TableCell className="text-center border-r sticky left-0 bg-muted z-10"></TableCell>
                    <TableCell className="border-r sticky left-[60px] bg-muted z-10">TOTAL</TableCell>
                    <TableCell className="border-r"></TableCell>
                    {dateColumns.map((_, dateIndex) => (
                      <TableCell key={dateIndex} className="text-center border-r">
                        {calculateDateTotal(dateIndex)}
                      </TableCell>
                    ))}
                    <TableCell className="text-center border-r bg-yellow-100 dark:bg-yellow-900/20">
                      {totalPresent}
                    </TableCell>
                    <TableCell className="text-center border-r bg-yellow-100 dark:bg-yellow-900/20">
                      {totalNCP}
                    </TableCell>
                    <TableCell className="border-r sticky right-0 bg-muted z-10"></TableCell>
                  </TableRow>
                  
                  {/* Total Attendance Row */}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={3} className="text-center border-r sticky left-0 bg-muted/50 z-10">
                      TOTAL ATTENDANCE
                    </TableCell>
                    <TableCell colSpan={dateColumns.length} className="text-center border-r">
                      {totalAttendance}
                    </TableCell>
                    <TableCell className="text-center border-r bg-yellow-100 dark:bg-yellow-900/20">
                      {totalPresent}
                    </TableCell>
                    <TableCell className="text-center border-r bg-yellow-100 dark:bg-yellow-900/20">
                      {totalNCP}
                    </TableCell>
                    <TableCell className="border-r sticky right-0 bg-muted/50 z-10"></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Change Worker Dialog */}
      <Dialog open={isChangeWorkerDialogOpen} onOpenChange={setIsChangeWorkerDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Change Worker</DialogTitle>
            <DialogDescription>
              Select a replacement worker for <strong>{workerToChange?.name}</strong>. The attendance data will be preserved.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {isLoadingWorkersForChange ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading workers...</span>
              </div>
            ) : availableWorkersForChange.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No workers available to replace with.
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {availableWorkersForChange.map((worker) => (
                  <div
                    key={worker.id}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedReplacementWorkerId === worker.id
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedReplacementWorkerId(worker.id)}
                  >
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-primary bg-background">
                      {selectedReplacementWorkerId === worker.id && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{worker.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {worker.contactNumber && (
                          <span>Contact: {worker.contactNumber}</span>
                        )}
                        {worker.uanNumber && (
                          <span className="ml-2">UAN: {worker.uanNumber}</span>
                        )}
                      </div>
                      {worker.tags && worker.tags.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Tags: {worker.tags.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsChangeWorkerDialogOpen(false);
                setWorkerToChange(null);
                setSelectedReplacementWorkerId(null);
              }}
              disabled={isChangingWorker}
            >
              Cancel
            </Button>
            <Button
              onClick={replaceWorker}
              disabled={!selectedReplacementWorkerId || isLoadingWorkersForChange || isChangingWorker}
              className="bg-gradient-primary"
            >
              {isChangingWorker ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Worker'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Worker Confirmation Dialog */}
      <AlertDialog open={isRemoveConfirmDialogOpen} onOpenChange={setIsRemoveConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Worker</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{workerToRemove?.name}</strong> from the attendance sheet? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setIsRemoveConfirmDialogOpen(false);
                setWorkerToRemove(null);
              }}
              disabled={isRemoving}
            >
              No, Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveWorker}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                'Yes, Remove'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Workers Dialog */}
      <Dialog open={isAddWorkerDialogOpen} onOpenChange={setIsAddWorkerDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Workers to Attendance Sheet</DialogTitle>
            <DialogDescription>
              Select workers to add to the attendance sheet. Workers already in the sheet are not shown.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {isLoadingWorkers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading workers...</span>
              </div>
            ) : availableWorkers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No workers available to add. All workers may already be in the attendance sheet.
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {availableWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleWorkerSelection(worker.id)}
                  >
                    <Checkbox
                      checked={selectedWorkerIds.has(worker.id)}
                      onCheckedChange={() => toggleWorkerSelection(worker.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{worker.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {worker.contactNumber && (
                          <span>Contact: {worker.contactNumber}</span>
                        )}
                        {worker.uanNumber && (
                          <span className="ml-2">UAN: {worker.uanNumber}</span>
                        )}
                      </div>
                      {worker.tags && worker.tags.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Tags: {worker.tags.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddWorkerDialogOpen(false);
                setSelectedWorkerIds(new Set());
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={addSelectedWorkers}
              disabled={selectedWorkerIds.size === 0 || isLoadingWorkers}
              className="bg-gradient-primary"
            >
              Add Selected ({selectedWorkerIds.size})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
