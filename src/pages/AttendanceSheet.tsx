import { useState } from "react";
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
import { ArrowLeft, FileDown, Printer, Plus } from "lucide-react";
import { Logo } from "@/components/ui/logo";

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
      attendance: ["P", "O", "P", "P", "P", "P", "P", "P", "O", "P", "P", "P", "P", "P", "P", "O", "P", "P", "P", "P", "P", "P", "O", "P", "P", "P", "P", "P", "A", "O", "P"],
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

export default function AttendanceSheet() {
  const { id, sheetId } = useParams();
  const navigate = useNavigate();
  const [data] = useState(mockAttendanceData);
  
  const dateColumns = generateDateColumns(data.startDate, data.endDate);
  
  // Calculate totals for each date
  const calculateDateTotal = (dateIndex: number) => {
    return data.workers.reduce((sum, worker) => {
      return sum + (worker.attendance[dateIndex] === "P" ? 1 : 0);
    }, 0);
  };
  
  const totalPresent = data.workers.reduce((sum, worker) => sum + worker.present, 0);
  const totalNCP = data.workers.reduce((sum, worker) => sum + worker.ncp, 0);
  const totalAttendance = dateColumns.reduce((sum, _, index) => sum + calculateDateTotal(index), 0);

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
                          className={`text-center font-medium border-r p-2 ${
                            status === "P" ? "bg-green-50 dark:bg-green-900/20" : 
                            status === "A" ? "bg-red-50 dark:bg-red-900/20" : 
                            "bg-blue-50 dark:bg-blue-900/20"
                          }`}
                        >
                          {status}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-bold border-r bg-yellow-50 dark:bg-yellow-900/10">
                        {worker.present}
                      </TableCell>
                      <TableCell className="text-center font-bold border-r bg-yellow-50 dark:bg-yellow-900/10">
                        {worker.ncp}
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
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
