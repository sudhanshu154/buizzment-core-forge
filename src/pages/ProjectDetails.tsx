import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Plus
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

// Mock project data - replace with API call
const mockProject = {
  id: "1",
  name: "E-commerce Platform",
  description: "A comprehensive e-commerce solution with modern UI/UX, payment integration, and inventory management.",
  status: "active",
  progress: 75,
  startDate: "2024-01-15",
  dueDate: "2024-03-15",
  budget: 85000,
  spent: 63750,
  priority: "high",
  client: "TechCorp Solutions",
  team: [
    { id: "1", name: "John Smith", role: "Lead Developer", avatar: "", status: "online" },
    { id: "2", name: "Sarah Johnson", role: "UI/UX Designer", avatar: "", status: "online" },
    { id: "3", name: "Mike Chen", role: "Backend Developer", avatar: "", status: "offline" },
    { id: "4", name: "Emily Davis", role: "QA Engineer", avatar: "", status: "online" }
  ],
  tasks: [
    { id: "1", name: "User Authentication System", status: "completed", assignee: "John Smith" },
    { id: "2", name: "Product Catalog Interface", status: "in-progress", assignee: "Sarah Johnson" },
    { id: "3", name: "Payment Gateway Integration", status: "pending", assignee: "Mike Chen" },
    { id: "4", name: "Order Management System", status: "in-progress", assignee: "John Smith" }
  ]
};

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "completed": return "bg-primary text-primary-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      case "in-progress": return "bg-primary text-primary-foreground";
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
                {mockProject.name}
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                {mockProject.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(mockProject.status)}>
                {mockProject.status}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(mockProject.priority)}>
                {mockProject.priority} priority
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
                  <div className="text-2xl font-bold">{mockProject.progress}%</div>
                  <Progress value={mockProject.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Due Date</span>
                </div>
                <div className="text-lg font-semibold">{mockProject.dueDate}</div>
                <div className="text-sm text-muted-foreground">
                  Started {mockProject.startDate}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Budget</span>
                </div>
                <div className="text-lg font-semibold">
                  ${mockProject.spent.toLocaleString()} / ${mockProject.budget.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {Math.round((mockProject.spent / mockProject.budget) * 100)}% spent
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Team Size</span>
                </div>
                <div className="text-lg font-semibold">{mockProject.team.length} members</div>
                <div className="text-sm text-muted-foreground">
                  Client: {mockProject.client}
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
              {/* Tasks Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Tasks</CardTitle>
                  <CardDescription>Track project progress and milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockProject.tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{task.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Assigned to {task.assignee}
                          </p>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </div>
                    ))}
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
                  <div className="space-y-4">
                    {mockProject.team.map((member) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{member.name}</h4>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            member.status === "online" ? "bg-success" : "bg-muted-foreground"
                          }`} />
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
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
                    <Button className="bg-gradient-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Sheet
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/project/${id}/attendance/sheet-1`)}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold mb-1">July-August 2025 Attendance</h4>
                            <p className="text-sm text-muted-foreground">
                              Period: 24/07/2025 - 23/08/2025
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Workers: 6 | Total Days: 31
                            </p>
                          </div>
                          <Badge className="bg-success text-success-foreground">Active</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
                <div className="space-y-6">
                  {mockProject.team.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{member.name}</h4>
                          <p className="text-muted-foreground">{member.role}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${
                              member.status === "online" ? "bg-success" : "bg-muted-foreground"
                            }`} />
                            <span className="text-xs text-muted-foreground capitalize">
                              {member.status}
                            </span>
                          </div>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}