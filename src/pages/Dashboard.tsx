import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  FolderOpen, 
  Plus, 
  MoreHorizontal, 
  TrendingUp, 
  Clock,
  DollarSign,
  CheckCircle,
  Building2,
  Bell,
  Settings,
  LogOut,
  Loader2
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentOrganization } from "@/hooks/useCurrentOrganization";
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
import { projectService } from "@/services/projectService";
import { CreateProjectRequest, CreateWorkerRequest } from "@/lib/api";
import { workerService } from "@/services/workerService";


export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { organization, projects, workers, isLoading, error, refetchData } = useCurrentOrganization();
  
  // Project creation dialog state
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);
  const [projectFormData, setProjectFormData] = useState<CreateProjectRequest & { initialTeamMembersString?: string }>({
    name: "",
    orderNo: "",
    el1No: "",
    startingDate: "",
    tentativeEndingDate: "",
    initialTeamMembers: [],
    initialTeamMembersString: "",
  });

  // Worker creation dialog state
  const [isCreateWorkerDialogOpen, setIsCreateWorkerDialogOpen] = useState(false);
  const [isSubmittingWorker, setIsSubmittingWorker] = useState(false);
  const [workerFormData, setWorkerFormData] = useState<CreateWorkerRequest & { tagsString?: string; includeBankDetails?: boolean }>({
    name: "",
    uanNumber: "",
    contactNumber: "",
    tags: [],
    tagsString: "",
    orgIds: [],
    includeBankDetails: false,
    bankDetails: {
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      branch: "",
    },
  });

  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return "bg-secondary text-secondary-foreground";
    
    switch (status.toLowerCase()) {
      case "in_progress": return "bg-success text-success-foreground";
      case "completed": return "bg-primary text-primary-foreground";
      case "planning": return "bg-warning text-warning-foreground";
      case "on_hold": return "bg-muted text-muted-foreground";
      case "cancelled": return "bg-error text-error-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const orgId = localStorage.getItem('selectedOrgId');
    if (!orgId) {
      alert('No organization selected');
      return;
    }

    try {
      setIsSubmittingProject(true);
      
      // Parse initialTeamMembers from comma-separated string
      const teamMembers = projectFormData.initialTeamMembers && projectFormData.initialTeamMembers.length > 0
        ? projectFormData.initialTeamMembers
        : projectFormData.initialTeamMembersString
        ? projectFormData.initialTeamMembersString.split(',').map(id => id.trim()).filter(id => id.length > 0)
        : [];

      const projectData: CreateProjectRequest = {
        name: projectFormData.name,
        orderNo: projectFormData.orderNo,
        el1No: projectFormData.el1No,
        startingDate: projectFormData.startingDate,
        tentativeEndingDate: projectFormData.tentativeEndingDate,
        initialTeamMembers: teamMembers.length > 0 ? teamMembers : undefined,
      };

      await projectService.createProject(orgId, projectData);
      
      // Reset form and close dialog
      setProjectFormData({
        name: "",
        orderNo: "",
        el1No: "",
        startingDate: "",
        tentativeEndingDate: "",
        initialTeamMembers: [],
        initialTeamMembersString: "",
      });
      setIsCreateProjectDialogOpen(false);
      
      // Refresh projects list
      await refetchData();
    } catch (err) {
      console.error('Failed to create project:', err);
      alert(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsSubmittingProject(false);
    }
  };

  const handleProjectDialogOpenChange = (open: boolean) => {
    setIsCreateProjectDialogOpen(open);
    if (!open) {
      // Reset form when dialog closes
      setProjectFormData({
        name: "",
        orderNo: "",
        el1No: "",
        startingDate: "",
        tentativeEndingDate: "",
        initialTeamMembers: [],
        initialTeamMembersString: "",
      });
    }
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const orgId = localStorage.getItem('selectedOrgId');
    if (!orgId) {
      alert('No organization selected');
      return;
    }

    try {
      setIsSubmittingWorker(true);
      
      // Parse tags from comma-separated string
      const tags = workerFormData.tagsString
        ? workerFormData.tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : workerFormData.tags || [];

      // Prepare worker data - transform orgIds to org_ids for API
      const workerData: any = {
        name: workerFormData.name,
        uanNumber: workerFormData.uanNumber,
        contactNumber: workerFormData.contactNumber || undefined,
        tags: tags.length > 0 ? tags : undefined,
        org_ids: [orgId], // API expects snake_case
      };

      // Add bank details if provided
      if (workerFormData.includeBankDetails && workerFormData.bankDetails) {
        const { accountNumber, ifscCode, bankName, branch } = workerFormData.bankDetails;
        if (accountNumber && ifscCode && bankName && branch) {
          workerData.bankDetails = {
            accountNumber,
            ifscCode,
            bankName,
            branch,
          };
        }
      }

      // Use fetch directly to send org_ids in snake_case
      const token = localStorage.getItem('buizzment_token');
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(`${apiBaseUrl}/workers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(workerData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      await response.json();
      
      // Reset form and close dialog
      setWorkerFormData({
        name: "",
        uanNumber: "",
        contactNumber: "",
        tags: [],
        tagsString: "",
        orgIds: [],
        includeBankDetails: false,
        bankDetails: {
          accountNumber: "",
          ifscCode: "",
          bankName: "",
          branch: "",
        },
      });
      setIsCreateWorkerDialogOpen(false);
      
      // Refresh workers list
      await refetchData();
    } catch (err) {
      console.error('Failed to create worker:', err);
      alert(err instanceof Error ? err.message : 'Failed to create worker');
    } finally {
      setIsSubmittingWorker(false);
    }
  };

  const handleWorkerDialogOpenChange = (open: boolean) => {
    setIsCreateWorkerDialogOpen(open);
    if (!open) {
      // Reset form when dialog closes
      setWorkerFormData({
        name: "",
        uanNumber: "",
        contactNumber: "",
        tags: [],
        tagsString: "",
        orgIds: [],
        includeBankDetails: false,
        bankDetails: {
          accountNumber: "",
          ifscCode: "",
          bankName: "",
          branch: "",
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
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
            <Button onClick={() => navigate("/")} className="w-full">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats from real data
  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
  const activeWorkers = workers.filter(w => w.isActive).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-6">
          <Logo size="sm" />
          
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Organization Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {organization?.name}
              </h1>
              <p className="text-muted-foreground">
                Welcome back! Here's what's happening with your organization.
              </p>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              <Building2 className="h-4 w-4 mr-1" />
              Organization
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                of {projects.length} total projects
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeWorkers}</div>
              <p className="text-xs text-muted-foreground">
                of {workers.length} total workers
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${completedProjects * 25000}
              </div>
              <p className="text-xs text-success flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Based on completed projects
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedProjects}</div>
              <p className="text-xs text-muted-foreground">
                Completed projects
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Projects and Workers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Projects Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Manage your active projects</CardDescription>
                </div>
                <Button 
                  size="sm" 
                  className="bg-gradient-primary"
                  onClick={() => setIsCreateProjectDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.slice(0, 3).map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover-lift cursor-pointer"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{project.name}</h4>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status ? project.status.replace('_', ' ') : 'Unknown'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {project.teamMembers.length} members
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due {new Date(project.tentativeEndingDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-xs text-muted-foreground">
                          Code: {project.projectCode || project.orderNo}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate("/projects")}
              >
                View All Projects
              </Button>
            </CardContent>
          </Card>

          {/* Workers Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage your workforce</CardDescription>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setIsCreateWorkerDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Worker
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workers.slice(0, 3).map((worker) => (
                  <div
                    key={worker.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover-lift cursor-pointer"
                    onClick={() => navigate("/workers")}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {worker.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{worker.name}</h4>
                        <p className="text-sm text-muted-foreground">UAN: {worker.uanNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">{worker.orgIds.length} org(s)</p>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${
                            worker.isActive ? "bg-success" : "bg-muted-foreground"
                          }`} />
                          <span className="text-xs text-muted-foreground">
                            {worker.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate("/workers")}
              >
                View All Workers
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Create Project Dialog */}
      <Dialog open={isCreateProjectDialogOpen} onOpenChange={handleProjectDialogOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new project for your organization.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateProject} className="space-y-6">
            <div className="space-y-4">
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={projectFormData.name}
                  onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                  placeholder="e.g., Mill 1,2"
                  required
                />
              </div>

              {/* Order Number */}
              <div className="space-y-2">
                <Label htmlFor="orderNo">Order Number *</Label>
                <Input
                  id="orderNo"
                  type="text"
                  value={projectFormData.orderNo}
                  onChange={(e) => setProjectFormData({ ...projectFormData, orderNo: e.target.value })}
                  placeholder="e.g., ORD-2023-001"
                  required
                />
              </div>

              {/* EL1 Number */}
              <div className="space-y-2">
                <Label htmlFor="el1No">EL1 Number *</Label>
                <Input
                  id="el1No"
                  type="text"
                  value={projectFormData.el1No}
                  onChange={(e) => setProjectFormData({ ...projectFormData, el1No: e.target.value })}
                  placeholder="e.g., EL1-2023-001"
                  required
                />
              </div>

              {/* Starting Date */}
              <div className="space-y-2">
                <Label htmlFor="startingDate">Starting Date *</Label>
                <Input
                  id="startingDate"
                  type="date"
                  value={projectFormData.startingDate}
                  onChange={(e) => setProjectFormData({ ...projectFormData, startingDate: e.target.value })}
                  required
                />
              </div>

              {/* Tentative Ending Date */}
              <div className="space-y-2">
                <Label htmlFor="tentativeEndingDate">Tentative Ending Date *</Label>
                <Input
                  id="tentativeEndingDate"
                  type="date"
                  value={projectFormData.tentativeEndingDate}
                  onChange={(e) => setProjectFormData({ ...projectFormData, tentativeEndingDate: e.target.value })}
                  required
                />
              </div>

              {/* Initial Team Members */}
              <div className="space-y-2">
                <Label htmlFor="initialTeamMembers">Initial Team Members (Optional)</Label>
                <Input
                  id="initialTeamMembers"
                  type="text"
                  value={projectFormData.initialTeamMembersString || ""}
                  onChange={(e) => setProjectFormData({ ...projectFormData, initialTeamMembersString: e.target.value })}
                  placeholder="e.g., user1, user2 (comma-separated user IDs)"
                />
                <p className="text-xs text-muted-foreground">
                  Enter comma-separated user IDs to add initial team members to the project.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleProjectDialogOpenChange(false)}
                disabled={isSubmittingProject}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingProject || !projectFormData.name || !projectFormData.orderNo || !projectFormData.el1No || !projectFormData.startingDate || !projectFormData.tentativeEndingDate}
                className="bg-gradient-primary"
              >
                {isSubmittingProject ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Worker Dialog */}
      <Dialog open={isCreateWorkerDialogOpen} onOpenChange={handleWorkerDialogOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Worker</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new worker to your organization.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateWorker} className="space-y-6">
            <div className="space-y-4">
              {/* Worker Name */}
              <div className="space-y-2">
                <Label htmlFor="workerName">Name *</Label>
                <Input
                  id="workerName"
                  type="text"
                  value={workerFormData.name}
                  onChange={(e) => setWorkerFormData({ ...workerFormData, name: e.target.value })}
                  placeholder="e.g., test002"
                  required
                />
              </div>

              {/* UAN Number */}
              <div className="space-y-2">
                <Label htmlFor="uanNumber">UAN Number *</Label>
                <Input
                  id="uanNumber"
                  type="text"
                  value={workerFormData.uanNumber}
                  onChange={(e) => setWorkerFormData({ ...workerFormData, uanNumber: e.target.value })}
                  placeholder="e.g., 123456789120"
                  required
                />
              </div>

              {/* Contact Number */}
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  value={workerFormData.contactNumber}
                  onChange={(e) => setWorkerFormData({ ...workerFormData, contactNumber: e.target.value })}
                  placeholder="e.g., 9999999999"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (Optional)</Label>
                <Input
                  id="tags"
                  type="text"
                  value={workerFormData.tagsString || ""}
                  onChange={(e) => setWorkerFormData({ ...workerFormData, tagsString: e.target.value })}
                  placeholder="e.g., electrician, senior (comma-separated)"
                />
                <p className="text-xs text-muted-foreground">
                  Enter comma-separated tags to categorize the worker.
                </p>
              </div>

              {/* Bank Details Toggle */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeBankDetails"
                    checked={workerFormData.includeBankDetails}
                    onCheckedChange={(checked) => setWorkerFormData({ ...workerFormData, includeBankDetails: !!checked })}
                  />
                  <Label htmlFor="includeBankDetails" className="cursor-pointer">
                    Include Bank Details
                  </Label>
                </div>
              </div>

              {/* Bank Details Section */}
              {workerFormData.includeBankDetails && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium text-sm">Bank Details</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number *</Label>
                    <Input
                      id="accountNumber"
                      type="text"
                      value={workerFormData.bankDetails?.accountNumber || ""}
                      onChange={(e) => setWorkerFormData({
                        ...workerFormData,
                        bankDetails: { ...workerFormData.bankDetails!, accountNumber: e.target.value }
                      })}
                      placeholder="e.g., 1234567890"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ifscCode">IFSC Code *</Label>
                    <Input
                      id="ifscCode"
                      type="text"
                      value={workerFormData.bankDetails?.ifscCode || ""}
                      onChange={(e) => setWorkerFormData({
                        ...workerFormData,
                        bankDetails: { ...workerFormData.bankDetails!, ifscCode: e.target.value }
                      })}
                      placeholder="e.g., SBIN0001234"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      type="text"
                      value={workerFormData.bankDetails?.bankName || ""}
                      onChange={(e) => setWorkerFormData({
                        ...workerFormData,
                        bankDetails: { ...workerFormData.bankDetails!, bankName: e.target.value }
                      })}
                      placeholder="e.g., State Bank of India"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch *</Label>
                    <Input
                      id="branch"
                      type="text"
                      value={workerFormData.bankDetails?.branch || ""}
                      onChange={(e) => setWorkerFormData({
                        ...workerFormData,
                        bankDetails: { ...workerFormData.bankDetails!, branch: e.target.value }
                      })}
                      placeholder="e.g., Main Branch"
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleWorkerDialogOpenChange(false)}
                disabled={isSubmittingWorker}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingWorker || !workerFormData.name || !workerFormData.uanNumber}
                className="bg-gradient-primary"
              >
                {isSubmittingWorker ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Worker"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}