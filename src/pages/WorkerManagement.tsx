import { useState, useEffect, useRef } from "react";
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
  Calendar,
  Loader2
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { workerService } from "@/services/workerService";
import { WorkerResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateWorkerRequest } from "@/lib/api";

const DESIGNATION_OPTIONS = ['High Skilled', 'Skilled', 'UnSkilled'] as const;
type DesignationOption = (typeof DESIGNATION_OPTIONS)[number];

export default function WorkerManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [workers, setWorkers] = useState<WorkerResponse[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<WorkerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Worker creation dialog state
  const [isCreateWorkerDialogOpen, setIsCreateWorkerDialogOpen] = useState(false);
  const [isSubmittingWorker, setIsSubmittingWorker] = useState(false);
  const [workerFormData, setWorkerFormData] = useState<CreateWorkerRequest & { tagsString?: string; includeBankDetails?: boolean }>({
    name: "",
    uanNumber: "",
    contactNumber: "",
    designation: "UnSkilled",
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

  // Fetch workers
  const fetchWorkers = async () => {
    try {
      setIsLoading(true);
      const orgId = localStorage.getItem('selectedOrgId');
      if (!orgId) {
        setError('No organization selected');
        return;
      }

      const data = await workerService.getWorkers(orgId);
      setWorkers(data);
      setFilteredWorkers(data);
    } catch (err) {
      console.error('Failed to fetch workers:', err);
      setError('Failed to load workers');
      toast({
        title: "Error",
        description: "Failed to load workers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [toast]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = workers.filter(worker =>
      worker.name.toLowerCase().includes(term.toLowerCase()) ||
      (worker.designation && worker.designation.toLowerCase().includes(term.toLowerCase())) ||
      (worker.contactNumber && worker.contactNumber.includes(term))
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

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-success text-success-foreground"
      : "bg-muted text-muted-foreground";
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const orgId = localStorage.getItem('selectedOrgId');
    if (!orgId) {
      toast({
        title: "Error",
        description: "No organization selected",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsImporting(true);
      const response = await workerService.bulkImportWorkers(orgId, file);

      toast({
        title: "Success",
        description: response.message || `Successfully imported workers`,
      });

      // Refresh worker list
      fetchWorkers();
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import workers",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();

    const orgId = localStorage.getItem('selectedOrgId');
    if (!orgId) {
      toast({
        title: "Error",
        description: "No organization selected",
        variant: "destructive",
      });
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
        designation: workerFormData.designation,
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

      toast({
        title: "Success",
        description: "Worker created successfully",
      });

      // Reset form and close dialog
      setWorkerFormData({
        name: "",
        uanNumber: "",
        contactNumber: "",
        designation: "UnSkilled",
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
      fetchWorkers();
    } catch (err) {
      console.error('Failed to create worker:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to create worker',
        variant: "destructive",
      });
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
        designation: "UnSkilled",
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
          <span>Loading workers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".xlsx,.xls,.csv"
      />

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
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportClick}
              disabled={isImporting}
            >
              {isImporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isImporting ? "Importing..." : "Import"}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              size="sm"
              className="bg-gradient-primary"
              onClick={() => setIsCreateWorkerDialogOpen(true)}
            >
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
                <div className="text-2xl font-bold">{workers.length}</div>
                <p className="text-sm text-muted-foreground">Total Workers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {workers.filter(w => w.isActive).length}
                </div>
                <p className="text-sm text-muted-foreground">Active Workers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {new Set(workers.map(w => w.designation || 'Unskilled')).size}
                </div>
                <p className="text-sm text-muted-foreground">Designations</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {new Set(workers.map(w => w.orgIds).flat()).size}
                </div>
                <p className="text-sm text-muted-foreground">Organizations</p>
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
                  placeholder="Search workers by name, designation, or contact..."
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
                        checked={selectedWorkers.length === filteredWorkers.length && filteredWorkers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>UAN Number</TableHead>
                    <TableHead>Bank Details</TableHead>
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
                            <AvatarImage src="" />
                            <AvatarFallback>
                              {worker.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{worker.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {worker.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{worker.designation || "Unskilled"}</div>
                          <div className="text-sm text-muted-foreground">
                            {worker.tags.join(", ")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            {worker.contactNumber || "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {worker.uanNumber || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {worker.bankDetails ? (
                            <>
                              <div>{worker.bankDetails.bankName}</div>
                              <div className="text-muted-foreground text-xs">{worker.bankDetails.accountNumber}</div>
                            </>
                          ) : (
                            <span className="text-muted-foreground">Not Available</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(worker.isActive)}>
                          {worker.isActive ? "Active" : "Inactive"}
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
                <Button className="bg-gradient-primary" onClick={() => setIsCreateWorkerDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Worker
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

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

              {/* Designation */}
              <div className="space-y-2">
                <Label htmlFor="designation">Designation *</Label>
                <Select
                  value={workerFormData.designation || DESIGNATION_OPTIONS[2]}
                  onValueChange={(value) =>
                    setWorkerFormData({ ...workerFormData, designation: value as DesignationOption })
                  }
                >
                  <SelectTrigger id="designation">
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGNATION_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                disabled={isSubmittingWorker || !workerFormData.name || !workerFormData.uanNumber || !workerFormData.designation}
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