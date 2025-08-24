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
  LogOut
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

// Mock data - replace with API calls
const mockOrgData = {
  name: "Tech Innovations Inc",
  role: "Admin",
  totalProjects: 12,
  activeProjects: 8,
  totalWorkers: 45,
  activeWorkers: 42,
  monthlyRevenue: 125000,
  completedTasks: 89
};

const mockProjects = [
  {
    id: "1",
    name: "E-commerce Platform",
    status: "active",
    progress: 75,
    dueDate: "2024-03-15",
    team: 8,
    priority: "high"
  },
  {
    id: "2", 
    name: "Mobile App Development",
    status: "active",
    progress: 45,
    dueDate: "2024-04-20",
    team: 6,
    priority: "medium"
  },
  {
    id: "3",
    name: "Data Analytics Dashboard",
    status: "completed",
    progress: 100,
    dueDate: "2024-02-28",
    team: 4,
    priority: "low"
  }
];

const mockWorkers = [
  {
    id: "1",
    name: "John Smith",
    role: "Senior Developer",
    status: "online",
    avatar: "",
    projects: 3
  },
  {
    id: "2",
    name: "Sarah Johnson", 
    role: "Project Manager",
    status: "online",
    avatar: "",
    projects: 5
  },
  {
    id: "3",
    name: "Mike Chen",
    role: "Designer",
    status: "offline",
    avatar: "",
    projects: 2
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "completed": return "bg-primary text-primary-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-error text-error-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-success text-success-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

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
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
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
                {mockOrgData.name}
              </h1>
              <p className="text-muted-foreground">
                Welcome back! Here's what's happening with your organization.
              </p>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              <Building2 className="h-4 w-4 mr-1" />
              {mockOrgData.role}
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
              <div className="text-2xl font-bold">{mockOrgData.activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                of {mockOrgData.totalProjects} total projects
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockOrgData.activeWorkers}</div>
              <p className="text-xs text-muted-foreground">
                of {mockOrgData.totalWorkers} total workers
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
                ${mockOrgData.monthlyRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-success flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockOrgData.completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                This month
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
                <Button size="sm" className="bg-gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover-lift cursor-pointer"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{project.name}</h4>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {project.team} members
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due {project.dueDate}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">
                          {project.progress}% complete
                        </span>
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
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Worker
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover-lift cursor-pointer"
                    onClick={() => navigate("/workers")}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={worker.avatar} />
                        <AvatarFallback>
                          {worker.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{worker.name}</h4>
                        <p className="text-sm text-muted-foreground">{worker.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">{worker.projects} projects</p>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${
                            worker.status === "online" ? "bg-success" : "bg-muted-foreground"
                          }`} />
                          <span className="text-xs text-muted-foreground capitalize">
                            {worker.status}
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
    </div>
  );
}