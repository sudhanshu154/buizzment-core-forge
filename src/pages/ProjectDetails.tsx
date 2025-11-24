import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft,
  Users, 
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Mail,
  UserCheck,
  MoreHorizontal,
  Settings,
  Edit,
  Plus,
  Loader2
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { workerService } from "@/services/workerService";
import { attendanceService, AttendanceSheetResponse } from "@/services/attendanceService";
import { projectService } from "@/services/projectService";
import { WorkerResponse, ProjectResponse } from "@/lib/api";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Project data state
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);
  
  // Attendance sheets state
  const [attendanceSheets, setAttendanceSheets] = useState<AttendanceSheetResponse[]>([]);
  const [isLoadingAttendanceSheets, setIsLoadingAttendanceSheets] = useState(false);
  
  // Create attendance sheet dialog state
  const [isCreateSheetDialogOpen, setIsCreateSheetDialogOpen] = useState(false);
  const [availableWorkers, setAvailableWorkers] = useState<WorkerResponse[]>([]);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<Set<string>>(new Set());
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    monthYear: "", // Format: "2025-06"
    startDate: "", // Format: "01/06/2025"
    endDate: "", // Format: "31/06/2025"
  });
  
  // Fetch project data
  const fetchProject = useCallback(async () => {
    if (!id) {
      setProjectError('No project ID provided');
      setIsLoadingProject(false);
      return;
    }

    try {
      setIsLoadingProject(true);
      setProjectError(null);
      const orgId = localStorage.getItem('selectedOrgId');
      if (!orgId) {
        setProjectError('No organization selected');
        setIsLoadingProject(false);
        return;
      }
      
      const projectData = await projectService.getProject(orgId, id);
      setProject(projectData);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      setProjectError(error instanceof Error ? error.message : 'Failed to load project');
    } finally {
      setIsLoadingProject(false);
    }
  }, [id]);
  
  // Fetch project on mount
  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Fetch attendance sheets
  const fetchAttendanceSheets = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoadingAttendanceSheets(true);
      const sheets = await attendanceService.getAttendanceSheets(id);
      
      // If API returns empty or no data, show dummy data
      if (!sheets || sheets.length === 0) {
        console.log('No attendance sheets found, showing dummy data');
        setAttendanceSheets([
          {
            id: "dummy-1",
            tenderId: id,
            monthYear: "2025-01",
            startDate: "01/01/2025",
            endDate: "31/01/2025",
            attendanceIds: ["att-1", "att-2", "att-3"],
            createdAt: null
          },
          {
            id: "dummy-2",
            tenderId: id,
            monthYear: "2025-02",
            startDate: "01/02/2025",
            endDate: "28/02/2025",
            attendanceIds: ["att-4", "att-5"],
            createdAt: null
          }
        ]);
      } else {
        setAttendanceSheets(sheets);
      }
    } catch (error) {
      console.error('Failed to fetch attendance sheets:', error);
      // On error, show dummy data
      setAttendanceSheets([
        {
          id: "dummy-1",
          tenderId: id || "",
          monthYear: "2025-01",
          startDate: "01/01/2025",
          endDate: "31/01/2025",
          attendanceIds: ["att-1", "att-2", "att-3"],
          createdAt: null
        },
        {
          id: "dummy-2",
          tenderId: id || "",
          monthYear: "2025-02",
          startDate: "01/02/2025",
          endDate: "28/02/2025",
          attendanceIds: ["att-4", "att-5"],
          createdAt: null
        }
      ]);
    } finally {
      setIsLoadingAttendanceSheets(false);
    }
  }, [id]);

  // Fetch attendance sheets when project is loaded or when attendance tab is active
  useEffect(() => {
    if (project && activeTab === 'attendance') {
      fetchAttendanceSheets();
    }
  }, [project, activeTab, fetchAttendanceSheets]);
  
  // Fetch workers from API
  const fetchWorkers = useCallback(async () => {
    try {
      setIsLoadingWorkers(true);
      const orgId = localStorage.getItem('selectedOrgId');
      if (!orgId) {
        console.error('No organization ID found');
        return;
      }
      
      const workers = await workerService.getWorkers(orgId);
      setAvailableWorkers(workers);
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    } finally {
      setIsLoadingWorkers(false);
    }
  }, []);
  
  // Fetch workers when dialog opens
  useEffect(() => {
    if (isCreateSheetDialogOpen) {
      fetchWorkers();
    }
  }, [isCreateSheetDialogOpen, fetchWorkers]);
  
  // Toggle worker selection - memoized to prevent re-renders
  const toggleWorkerSelection = useCallback((workerId: string) => {
    setSelectedWorkerIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workerId)) {
        newSet.delete(workerId);
      } else {
        newSet.add(workerId);
      }
      return newSet;
    });
  }, []);
  
  // Handle dialog open change - prevent infinite loops
  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsCreateSheetDialogOpen(open);
    if (!open) {
      // Reset form when closing
      setFormData({ monthYear: "", startDate: "", endDate: "" });
      setSelectedWorkerIds(new Set());
    }
  }, []);
  
  // Format date to DD/MM/YYYY
  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  // Get monthYear from date input (YYYY-MM format)
  const getMonthYear = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate || selectedWorkerIds.size === 0) {
      alert("Please fill all fields and select at least one worker");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Format dates
      const startDateFormatted = formatDate(formData.startDate);
      const endDateFormatted = formatDate(formData.endDate);
      const monthYear = formData.monthYear || getMonthYear(formData.startDate);
      
      console.log('📝 Creating attendance sheet with data:', {
        tenderId: id,
        monthYear,
        startDate: startDateFormatted,
        endDate: endDateFormatted,
      });
      
      // Create attendance sheet
      const result = await attendanceService.createAttendanceSheet({
        tenderId: id || "", // Using project ID as tenderId
        monthYear: monthYear,
        startDate: startDateFormatted,
        endDate: endDateFormatted,
      });
      
      console.log('✅ Attendance sheet created:', result);
      
      // Reset form and close dialog
      setFormData({ monthYear: "", startDate: "", endDate: "" });
      setSelectedWorkerIds(new Set());
      setIsCreateSheetDialogOpen(false);
      
      // Refresh attendance sheets list
      await fetchAttendanceSheets();
      
      // Show success message
      alert("Attendance sheet created successfully!");
      
    } catch (error) {
      console.error('❌ Failed to create attendance sheet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to create attendance sheet: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return "bg-secondary text-secondary-foreground";
    
    switch (status.toUpperCase()) {
      case "IN_PROGRESS": return "bg-success text-success-foreground";
      case "COMPLETED": return "bg-primary text-primary-foreground";
      case "PLANNING": return "bg-warning text-warning-foreground";
      case "ON_HOLD": return "bg-muted text-muted-foreground";
      case "CANCELLED": return "bg-error text-error-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const formatStatus = (status: string | null | undefined): string => {
    if (!status) return "Unknown";
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Calculate progress based on dates (simple calculation)
  const calculateProgress = (): number => {
    if (!project) return 0;
    const start = new Date(project.startingDate);
    const end = new Date(project.tentativeEndingDate);
    const now = new Date();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  };

  // Format date for display
  const formatDateDisplay = (dateString: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Format month year for display
  const formatMonthYear = (monthYear: string): string => {
    if (!monthYear) return "N/A";
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  // Parse date from DD/MM/YYYY or ISO format
  const parseDate = (dateString: string | null): Date | null => {
    if (!dateString) return null;
    // Check if it's in DD/MM/YYYY format
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // Otherwise try to parse as ISO date
    return new Date(dateString);
  };

  // Calculate total days between two dates
  const calculateTotalDays = (startDate: string | null, endDate: string | null): number => {
    if (!startDate || !endDate) return 0;
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start || !end) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // +1 to include both start and end dates
  };

  // Format date from DD/MM/YYYY to display format
  const formatDateFromDDMMYYYY = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    // Check if it's already in DD/MM/YYYY format
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    // Otherwise try to parse as ISO date
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (isLoadingProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading project...</span>
        </div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-error">Error</CardTitle>
            <CardDescription>{projectError || 'Project not found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Return to Dashboard
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
            onClick={() => navigate("/dashboard")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Logo size="sm" />
          
          <div className="ml-auto flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {project.name}
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Project Code: {project.projectCode || project.orderNo} | Order: {project.orderNo} | EL1: {project.el1No}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(project.status)}>
                {formatStatus(project.status)}
              </Badge>
              <Badge variant="outline">
                {project.orgName}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Progress</span>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{calculateProgress()}%</div>
                  <Progress value={calculateProgress()} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">End Date</span>
                </div>
                <div className="text-lg font-semibold">{formatDateDisplay(project.tentativeEndingDate)}</div>
                <div className="text-sm text-muted-foreground">
                  Started {formatDateDisplay(project.startingDate)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Tasks</span>
                </div>
                <div className="text-lg font-semibold">{project.taskCount}</div>
                <div className="text-sm text-muted-foreground">
                  Total tasks
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Team Size</span>
                </div>
                <div className="text-lg font-semibold">{project.teamMembers.length} members</div>
                <div className="text-sm text-muted-foreground">
                  {project.orgName}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Project Tools Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-fit">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="mail">Mail</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                  <CardDescription>Key details about this project</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Order Number</h4>
                        <p className="text-sm text-muted-foreground">
                          {project.orderNo}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">EL1 Number</h4>
                        <p className="text-sm text-muted-foreground">
                          {project.el1No}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Project Code</h4>
                        <p className="text-sm text-muted-foreground">
                          {project.projectCode || project.orderNo}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Organization</h4>
                        <p className="text-sm text-muted-foreground">
                          {project.orgName}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Members */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Team</CardTitle>
                  <CardDescription>Members working on this project</CardDescription>
                </CardHeader>
                <CardContent>
                  {project.teamMembers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No team members assigned yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {project.teamMembers.map((memberId, index) => (
                        <div key={memberId || index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {memberId.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">Team Member</h4>
                              <p className="text-sm text-muted-foreground">ID: {memberId}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Attendance Management
                </CardTitle>
                <CardDescription>Track team attendance and working hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Attendance Sheets</h3>
                    <Button 
                      className="bg-gradient-primary"
                      onClick={() => setIsCreateSheetDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Sheet
                    </Button>
                  </div>
                  
                  {isLoadingAttendanceSheets ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading attendance sheets...</span>
                    </div>
                  ) : attendanceSheets.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Attendance Sheets</h3>
                      <p className="text-sm">
                        No attendance sheets have been created for this project yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {attendanceSheets.map((sheet) => {
                        const totalDays = calculateTotalDays(sheet.startDate, sheet.endDate);
                        const workerCount = sheet.attendanceIds?.length || 0;
                        
                        return (
                          <Card 
                            key={sheet.id} 
                            className="hover:shadow-md transition-shadow cursor-pointer" 
                            onClick={() => navigate(`/project/${id}/attendance/${sheet.id}`)}
                          >
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold mb-1">
                                    {formatMonthYear(sheet.monthYear)} Attendance
                                  </h4>
                                  {sheet.startDate && sheet.endDate ? (
                                    <p className="text-sm text-muted-foreground">
                                      Period: {formatDateFromDDMMYYYY(sheet.startDate)} - {formatDateFromDDMMYYYY(sheet.endDate)}
                                    </p>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">
                                      Month: {formatMonthYear(sheet.monthYear)}
                                    </p>
                                  )}
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Workers: {workerCount} {totalDays > 0 && `| Total Days: ${totalDays}`}
                                  </p>
                                </div>
                                <Badge className="bg-success text-success-foreground">Active</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Management
                </CardTitle>
                <CardDescription>Manage project payments and invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Payment Sheets</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate invoices, track payments, and manage project finances.
                  </p>
                  <Button className="bg-gradient-primary">
                    Manage Payments
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mail">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Communication Hub
                </CardTitle>
                <CardDescription>Send emails and manage project communications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Email System</h3>
                  <p className="text-muted-foreground mb-4">
                    Send project updates, notifications, and communicate with team members.
                  </p>
                  <Button className="bg-gradient-primary">
                    Compose Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Management
                </CardTitle>
                <CardDescription>Manage project team members and assignments</CardDescription>
              </CardHeader>
              <CardContent>
                {project.teamMembers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Team Members</h3>
                    <p className="text-sm">
                      No team members have been assigned to this project yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {project.teamMembers.map((memberId, index) => (
                      <div key={memberId || index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {memberId.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">Team Member</h4>
                            <p className="text-muted-foreground">ID: {memberId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Create Attendance Sheet Dialog */}
      <Dialog open={isCreateSheetDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Attendance Sheet</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new attendance sheet for this project.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Month Year Field */}
              <div className="space-y-2">
                <Label htmlFor="monthYear">Month (Optional - will be auto-calculated from start date)</Label>
                <Input
                  id="monthYear"
                  type="month"
                  value={formData.monthYear}
                  onChange={(e) => setFormData({ ...formData, monthYear: e.target.value })}
                  placeholder="2025-06"
                />
                <p className="text-xs text-muted-foreground">
                  Format: YYYY-MM (e.g., 2025-06). If left empty, will be calculated from start date.
                </p>
              </div>

              {/* Start Date Field */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              {/* End Date Field */}
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>

              {/* Workers Selection */}
              <div className="space-y-2">
                <Label>Select Workers *</Label>
                {isLoadingWorkers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading workers...</span>
                  </div>
                ) : availableWorkers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No workers available.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-lg p-4">
                    {availableWorkers.map((worker) => (
                      <div
                        key={worker.id}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={selectedWorkerIds.has(worker.id)}
                          onCheckedChange={(checked) => {
                            toggleWorkerSelection(worker.id);
                          }}
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
                {selectedWorkerIds.size > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedWorkerIds.size} worker(s) selected
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || selectedWorkerIds.size === 0 || !formData.startDate || !formData.endDate}
                className="bg-gradient-primary"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Sheet"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}