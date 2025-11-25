import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Loader2, FileText, Printer } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { attendanceService, AttendanceDataResponse } from "@/services/attendanceService";
import { workerService } from "@/services/workerService";
import { projectService } from "@/services/projectService";
import { WorkerResponse, ProjectResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Worker skill levels with rates from environment
const SKILL_RATES = {
  'High Skilled': parseInt(import.meta.env.VITE_RATE_HIGH_SKILLED || '633'),
  'Skilled': parseInt(import.meta.env.VITE_RATE_SKILLED || '571'),
  'UnSkilled': parseInt(import.meta.env.VITE_RATE_UNSKILLED || '466'),
} as const;

type SkillLevel = keyof typeof SKILL_RATES;

interface PaymentRecord {
  srNo: number;
  workerId: string;
  workerName: string;
  designation: SkillLevel;
  totalDays: number;
  rate: number;
  totalAmount: number;
  epfDeduction: number;
  balancePayment: number;
  otherPayment: number;
  totalPayment: number;
  signature: string;
  ncpDays: number;
}

export default function PaymentSheet() {
  const { id: projectId, monthYear } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceDataResponse | null>(null);
  const [workers, setWorkers] = useState<Record<string, WorkerResponse>>({});
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId || !monthYear) return;

      try {
        setIsLoading(true);
        setError(null);

        const orgId = localStorage.getItem('selectedOrgId');
        if (!orgId) {
          setError('No organization selected');
          return;
        }

        // Fetch project details
        const projectData = await projectService.getProject(orgId, projectId);
        setProject(projectData);

        // Fetch attendance data
        const attendance = await attendanceService.getAttendanceData(projectId, monthYear);
        setAttendanceData(attendance);

        // Fetch workers
        const workersList = await workerService.getWorkers(orgId);
        const workersMap: Record<string, WorkerResponse> = {};
        workersList.forEach(worker => {
          workersMap[worker.id] = worker;
        });
        setWorkers(workersMap);

        // Generate payment records
        const records: PaymentRecord[] = attendance.attendances.map((att, index) => {
          const worker = workersMap[att.workerId];
          // Determine skill level based on worker tags or default to UnSkilled
          let designation: SkillLevel = 'UnSkilled';
          if (worker?.tags?.includes('high-skilled') || worker?.tags?.includes('supervisor')) {
            designation = 'High Skilled';
          } else if (worker?.tags?.includes('skilled') || worker?.tags?.includes('operator')) {
            designation = 'Skilled';
          }

          const totalDays = att.presentDays;
          const ncpDays = att.absentDays;
          const rate = SKILL_RATES[designation];
          const totalAmount = totalDays * rate;
          const epfDeduction = Math.ceil((totalAmount / 100) * 12);
          const balancePayment = totalAmount - epfDeduction;
          const otherPayment = 0; // Default to 0, user can edit
          const totalPayment = balancePayment + otherPayment;

          return {
            srNo: index + 1,
            workerId: att.workerId,
            workerName: worker?.name || 'Unknown Worker',
            designation,
            totalDays,
            rate,
            totalAmount,
            epfDeduction,
            balancePayment,
            otherPayment,
            totalPayment,
            signature: 'A/C Transfer',
            ncpDays,
          };
        });

        setPaymentRecords(records);
      } catch (err) {
        console.error('Failed to fetch payment data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load payment data');
        toast({
          title: "Error",
          description: "Failed to load payment sheet data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId, monthYear, toast]);

  // Update other payment for a record
  const updateOtherPayment = (index: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setPaymentRecords(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        otherPayment: numValue,
        totalPayment: updated[index].balancePayment + numValue,
      };
      return updated;
    });
  };

  // Calculate totals
  const totals = useMemo(() => {
    const totalDaysSum = paymentRecords.reduce((sum, r) => sum + r.totalDays, 0);
    const totalAmountSum = paymentRecords.reduce((sum, r) => sum + r.totalAmount, 0);
    const epfSum = paymentRecords.reduce((sum, r) => sum + r.epfDeduction, 0);
    const balanceSum = paymentRecords.reduce((sum, r) => sum + r.balancePayment, 0);
    const otherSum = paymentRecords.reduce((sum, r) => sum + r.otherPayment, 0);
    const totalPaymentSum = paymentRecords.reduce((sum, r) => sum + r.totalPayment, 0);
    const ncpSum = paymentRecords.reduce((sum, r) => sum + r.ncpDays, 0);

    return {
      totalDays: totalDaysSum,
      totalAmount: totalAmountSum,
      epfDeduction: epfSum,
      balancePayment: balanceSum,
      otherPayment: otherSum,
      totalPayment: totalPaymentSum,
      ncpDays: ncpSum,
    };
  }, [paymentRecords]);

  // Calculate skill-based summary
  const skillSummary = useMemo(() => {
    const summary: Record<SkillLevel, number> = {
      'High Skilled': 0,
      'Skilled': 0,
      'UnSkilled': 0,
    };

    paymentRecords.forEach(record => {
      summary[record.designation] += record.totalDays;
    });

    return summary;
  }, [paymentRecords]);

  // Format month year for display
  const formatMonthYear = (monthYear: string): string => {
    if (!monthYear) return "N/A";
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading payment sheet...</span>
        </div>
      </div>
    );
  }

  if (error || !project || !attendanceData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-error">Error</CardTitle>
            <CardDescription>{error || 'Payment sheet not found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(`/project/${projectId}`)} className="w-full">
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
      <header className="border-b bg-card sticky top-0 z-40 print:hidden">
        <div className="flex h-16 items-center px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/project/${projectId}`)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>
          
          <Logo size="sm" />
          
          <div className="ml-auto flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Payment Sheet Header */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="text-2xl font-bold mb-2">{project.orgName}</div>
            <div className="text-lg font-semibold text-error mb-2">
              PERIOD: {formatMonthYear(monthYear || '')}
            </div>
            <div className="text-sm space-y-1">
              <p>Work order for {project.name}</p>
              <p>LoA No. {project.el1No}</p>
              <p>Order No. {project.orderNo}</p>
            </div>
          </CardHeader>
        </Card>

        {/* Payment Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="text-center border font-bold">Sr. No.</TableHead>
                    <TableHead className="text-center border font-bold min-w-[200px]">NAME OF EMPLOYEE</TableHead>
                    <TableHead className="text-center border font-bold">DESIGN.</TableHead>
                    <TableHead className="text-center border font-bold">TOTAL DAYS</TableHead>
                    <TableHead className="text-center border font-bold">RATE</TableHead>
                    <TableHead className="text-center border font-bold">TOTAL AMOUNT</TableHead>
                    <TableHead className="text-center border font-bold">EPF DEDUCTION @12%</TableHead>
                    <TableHead className="text-center border font-bold">BALANCE PAYMENT</TableHead>
                    <TableHead className="text-center border font-bold">OTHER PAYMENT & NH</TableHead>
                    <TableHead className="text-center border font-bold">TOTAL PAYMENT</TableHead>
                    <TableHead className="text-center border font-bold">SIGNATURE</TableHead>
                    <TableHead className="text-center border font-bold">NCP DAYS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentRecords.map((record, index) => (
                    <TableRow key={record.workerId}>
                      <TableCell className="text-center border">{record.srNo}</TableCell>
                      <TableCell className="border">{record.workerName}</TableCell>
                      <TableCell className="text-center border">{record.designation}</TableCell>
                      <TableCell className="text-center border">{record.totalDays}</TableCell>
                      <TableCell className="text-center border">{record.rate}</TableCell>
                      <TableCell className="text-center border">{record.totalAmount}</TableCell>
                      <TableCell className="text-center border">{record.epfDeduction}</TableCell>
                      <TableCell className="text-center border">{record.balancePayment}</TableCell>
                      <TableCell className="text-center border p-1">
                        <Input
                          type="number"
                          value={record.otherPayment}
                          onChange={(e) => updateOtherPayment(index, e.target.value)}
                          className="h-8 text-center border-0"
                          min="0"
                        />
                      </TableCell>
                      <TableCell className="text-center border font-semibold">{record.totalPayment}</TableCell>
                      <TableCell className="text-center border">{record.signature}</TableCell>
                      <TableCell className="text-center border">{record.ncpDays}</TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Total Row */}
                  <TableRow className="bg-muted font-bold">
                    <TableCell className="border" colSpan={3}>Total</TableCell>
                    <TableCell className="text-center border">{totals.totalDays}</TableCell>
                    <TableCell className="text-center border">-</TableCell>
                    <TableCell className="text-center border">{totals.totalAmount}</TableCell>
                    <TableCell className="text-center border">{totals.epfDeduction}</TableCell>
                    <TableCell className="text-center border">{totals.balancePayment}</TableCell>
                    <TableCell className="text-center border">{totals.otherPayment}</TableCell>
                    <TableCell className="text-center border">{totals.totalPayment}</TableCell>
                    <TableCell className="border" colSpan={2}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Skill Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Designation-wise Summary</CardTitle>
            <CardDescription>Total days by skill level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(skillSummary).map(([skill, days]) => (
                <div key={skill} className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">{skill}</div>
                  <div className="text-2xl font-bold">{days} days</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Rate: ₹{SKILL_RATES[skill as SkillLevel]}/day
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
