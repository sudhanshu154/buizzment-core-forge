import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, FileDown, Printer, Plus, Loader2, Trash2, Edit } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { workerService } from "@/services/workerService";
import { WorkerResponse } from "@/lib/api";

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
  const [data, setData] = useState(mockAttendanceData);
  const [isAddWorkerDialogOpen, setIsAddWorkerDialogOpen] = useState(false);
  const [availableWorkers, setAvailableWorkers] = useState<WorkerResponse[]>([]);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<Set<string>>(new Set());
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(false);
  
  // Change worker dialog state
  const [isChangeWorkerDialogOpen, setIsChangeWorkerDialogOpen] = useState(false);
  const [workerToChange, setWorkerToChange] = useState<{ id: string; name: string } | null>(null);
  const [availableWorkersForChange, setAvailableWorkersForChange] = useState<WorkerResponse[]>([]);
  const [selectedReplacementWorkerId, setSelectedReplacementWorkerId] = useState<string | null>(null);
  const [isLoadingWorkersForChange, setIsLoadingWorkersForChange] = useState(false);
  
  // Remove worker confirmation dialog state
  const [isRemoveConfirmDialogOpen, setIsRemoveConfirmDialogOpen] = useState(false);
  const [workerToRemove, setWorkerToRemove] = useState<{ id: string; name: string } | null>(null);
  
  const dateColumns = generateDateColumns(data.startDate, data.endDate);
  
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
  const openRemoveConfirmDialog = (workerId: string, workerName: string) => {
    setWorkerToRemove({ id: workerId, name: workerName });
    setIsRemoveConfirmDialogOpen(true);
  };
  
  // Confirm and remove worker from attendance sheet
  const confirmRemoveWorker = () => {
    if (!workerToRemove) return;
    
    setData(prevData => ({
      ...prevData,
      workers: prevData.workers.filter(w => w.id !== workerToRemove.id)
    }));
    
    // Reset and close dialog
    setWorkerToRemove(null);
    setIsRemoveConfirmDialogOpen(false);
  };
  
  // Open change worker dialog
  const openChangeWorkerDialog = (workerId: string, workerName: string) => {
    setWorkerToChange({ id: workerId, name: workerName });
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
  const replaceWorker = () => {
    if (!workerToChange || !selectedReplacementWorkerId) {
      return;
    }
    
    const replacementWorker = availableWorkersForChange.find(w => w.id === selectedReplacementWorkerId);
    if (!replacementWorker) {
      return;
    }
    
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
                            onClick={() => openChangeWorkerDialog(worker.id, worker.name)}
                            title="Change worker"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => openRemoveConfirmDialog(worker.id, worker.name)}
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
            >
              Cancel
            </Button>
            <Button
              onClick={replaceWorker}
              disabled={!selectedReplacementWorkerId || isLoadingWorkersForChange}
              className="bg-gradient-primary"
            >
              Change Worker
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
            <AlertDialogCancel onClick={() => {
              setIsRemoveConfirmDialogOpen(false);
              setWorkerToRemove(null);
            }}>
              No, Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveWorker}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Remove
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
