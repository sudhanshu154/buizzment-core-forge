import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  MoreHorizontal,
  Users,
  Mail,
  Phone,
  Calendar
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

// Mock worker data - replace with API call
const mockWorkers = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@company.com",
    phone: "+1 234-567-8901",
    role: "Senior Developer",
    department: "Engineering",
    joinDate: "2023-01-15",
    status: "active",
    avatar: "",
    projects: ["E-commerce Platform", "Mobile App", "Dashboard"],
    salary: 95000
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com", 
    phone: "+1 234-567-8902",
    role: "Project Manager",
    department: "Management",
    joinDate: "2022-08-20",
    status: "active",
    avatar: "",
    projects: ["E-commerce Platform", "Data Analytics", "CRM System"],
    salary: 85000
  },
  {
    id: "3",
    name: "Mike Chen",
    email: "mike.chen@company.com",
    phone: "+1 234-567-8903", 
    role: "UI/UX Designer",
    department: "Design",
    joinDate: "2023-03-10",
    status: "active",
    avatar: "",
    projects: ["Mobile App", "Website Redesign"],
    salary: 75000
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@company.com",
    phone: "+1 234-567-8904",
    role: "QA Engineer",
    department: "Quality Assurance",
    joinDate: "2023-06-01",
    status: "inactive",
    avatar: "",
    projects: ["E-commerce Platform"],
    salary: 70000
  },
  {
    id: "5",
    name: "Alex Rodriguez",
    email: "alex.rodriguez@company.com",
    phone: "+1 234-567-8905",
    role: "Backend Developer",
    department: "Engineering",
    joinDate: "2022-11-15",
    status: "active",
    avatar: "",
    projects: ["API Development", "Database Design"],
    salary: 88000
  }
];

export default function WorkerManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState(mockWorkers);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = mockWorkers.filter(worker =>
      worker.name.toLowerCase().includes(term.toLowerCase()) ||
      worker.email.toLowerCase().includes(term.toLowerCase()) ||
      worker.role.toLowerCase().includes(term.toLowerCase()) ||
      worker.department.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredWorkers(filtered);
  };

  const handleSelectWorker = (workerId: string, checked: boolean) => {
    if (checked) {
      setSelectedWorkers([...selectedWorkers, workerId]);
    } else {
      setSelectedWorkers(selectedWorkers.filter(id => id !== workerId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedWorkers(filteredWorkers.map(worker => worker.id));
    } else {
      setSelectedWorkers([]);
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-success text-success-foreground" 
      : "bg-muted text-muted-foreground";
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
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Worker
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Worker Management</h1>
              <p className="text-muted-foreground">
                Manage your workforce, track performance, and handle HR operations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                <Users className="h-4 w-4 mr-1" />
                {filteredWorkers.length} Workers
              </Badge>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{mockWorkers.length}</div>
                <p className="text-sm text-muted-foreground">Total Workers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {mockWorkers.filter(w => w.status === "active").length}
                </div>
                <p className="text-sm text-muted-foreground">Active Workers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {new Set(mockWorkers.map(w => w.department)).size}
                </div>
                <p className="text-sm text-muted-foreground">Departments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  ${Math.round(mockWorkers.reduce((sum, w) => sum + w.salary, 0) / 1000)}K
                </div>
                <p className="text-sm text-muted-foreground">Total Payroll</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Employee Directory</CardTitle>
                <CardDescription>Search and manage your team members</CardDescription>
              </div>
              {selectedWorkers.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedWorkers.length} selected
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Bulk Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search workers by name, email, role, or department..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Workers Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedWorkers.length === filteredWorkers.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role & Department</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkers.map((worker) => (
                    <TableRow key={worker.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedWorkers.includes(worker.id)}
                          onCheckedChange={(checked) => 
                            handleSelectWorker(worker.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={worker.avatar} />
                            <AvatarFallback>
                              {worker.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{worker.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {worker.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{worker.role}</div>
                          <div className="text-sm text-muted-foreground">
                            {worker.department}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            {worker.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            {worker.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {worker.projects.slice(0, 2).map((project, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {project}
                            </Badge>
                          ))}
                          {worker.projects.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{worker.projects.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3" />
                          {worker.joinDate}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(worker.status)}>
                          {worker.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredWorkers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No workers found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or add new workers.
                </p>
                <Button className="bg-gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Worker
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}