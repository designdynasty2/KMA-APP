import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Clock, Download, Calendar } from 'lucide-react';
import { User } from '../../App';
import { projectId } from '../../utils/supabase/info';

interface TimeEntry {
  id: string;
  user_id: string;
  email: string;
  clock_in: string;
  clock_out?: string;
  hours_worked?: number;
  date: string;
}

interface TeacherSummary {
  name: string;
  email: string;
  total_hours: number;
  salary_type: string;
  wage_per_hour: number;
  total_earnings: number;
}

interface TimeManagementProps {
  user: User;
}

export function TimeManagement({ user }: TimeManagementProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [teacherSummaries, setTeacherSummaries] = useState<TeacherSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());

  function getCurrentWeek() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  }

  useEffect(() => {
    fetchTimeData();
  }, [selectedWeek]);

  async function fetchTimeData() {
    try {
      // Mock data for demonstration
      const mockTimeEntries: TimeEntry[] = [
        {
          id: '1',
          user_id: 'teacher1',
          email: 'teacher@montessori.edu',
          clock_in: '2024-01-15T08:00:00Z',
          clock_out: '2024-01-15T16:00:00Z',
          hours_worked: 8,
          date: '2024-01-15'
        },
        {
          id: '2',
          user_id: 'teacher1',
          email: 'teacher@montessori.edu',
          clock_in: '2024-01-16T08:30:00Z',
          clock_out: '2024-01-16T15:30:00Z',
          hours_worked: 7,
          date: '2024-01-16'
        },
        {
          id: '3',
          user_id: 'teacher1',
          email: 'teacher@montessori.edu',
          clock_in: '2024-01-17T08:00:00Z',
          clock_out: '2024-01-17T17:00:00Z',
          hours_worked: 9,
          date: '2024-01-17'
        }
      ];

      const mockTeacherSummaries: TeacherSummary[] = [
        {
          name: 'Ms. Sarah Johnson',
          email: 'teacher@montessori.edu',
          total_hours: 32.5,
          salary_type: 'Bi-Weekly',
          wage_per_hour: 25.50,
          total_earnings: 828.75
        },
        {
          name: 'Ms. Emily Davis',
          email: 'teacher2@montessori.edu',
          total_hours: 40,
          salary_type: 'Weekly',
          wage_per_hour: 22.00,
          total_earnings: 880.00
        }
      ];

      setTimeEntries(mockTimeEntries);
      setTeacherSummaries(mockTeacherSummaries);
    } catch (error) {
      console.error('Error fetching time data:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  function exportTimeReport(format: 'csv' | 'pdf') {
    // Mock export functionality
    const fileName = `time_report_${selectedWeek.toISOString().split('T')[0]}.${format}`;
    console.log(`Exporting ${fileName}`);
    // In a real implementation, this would generate and download the file
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Time Management</h2>
          <p className="text-muted-foreground">
            Track teacher hours and generate payroll reports
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => exportTimeReport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportTimeReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Week Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teacherSummaries.reduce((sum, teacher) => sum + teacher.total_hours, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all teachers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${teacherSummaries.reduce((sum, teacher) => sum + teacher.total_earnings, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">This pay period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherSummaries.length}</div>
            <p className="text-xs text-muted-foreground">With logged hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours/Teacher</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teacherSummaries.length > 0 
                ? (teacherSummaries.reduce((sum, teacher) => sum + teacher.total_hours, 0) / teacherSummaries.length).toFixed(1)
                : '0'
              }
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Teacher Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Teacher Weekly Summary
          </CardTitle>
          <CardDescription>
            Hours worked and earnings by salary type for week of {selectedWeek.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Salary Type</TableHead>
                <TableHead>Hourly Rate</TableHead>
                <TableHead>Total Earnings</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teacherSummaries.map((teacher, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground">{teacher.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{teacher.total_hours} hrs</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{teacher.salary_type}</Badge>
                  </TableCell>
                  <TableCell>${teacher.wage_per_hour.toFixed(2)}</TableCell>
                  <TableCell className="font-medium">
                    ${teacher.total_earnings.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={teacher.total_hours >= 35 ? 'default' : 
                              teacher.total_hours >= 20 ? 'secondary' : 'destructive'}
                    >
                      {teacher.total_hours >= 35 ? 'Full Time' : 
                       teacher.total_hours >= 20 ? 'Part Time' : 'Under Hours'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detailed Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Time Entries</CardTitle>
          <CardDescription>Individual clock-in and clock-out records</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Hours Worked</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>{entry.email}</TableCell>
                  <TableCell>{formatTime(entry.clock_in)}</TableCell>
                  <TableCell>
                    {entry.clock_out ? formatTime(entry.clock_out) : 
                     <Badge variant="secondary">Still Clocked In</Badge>}
                  </TableCell>
                  <TableCell>
                    {entry.hours_worked ? 
                     `${entry.hours_worked.toFixed(2)} hrs` : 
                     <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={entry.clock_out ? 'default' : 'secondary'}>
                      {entry.clock_out ? 'Complete' : 'In Progress'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payroll Information */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Information</CardTitle>
          <CardDescription>
            Reports are automatically sent to Lead based on teacher salary types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium text-green-600">Weekly</h4>
              <p className="text-2xl font-bold">
                {teacherSummaries.filter(t => t.salary_type === 'Weekly').length}
              </p>
              <p className="text-sm text-muted-foreground">Teachers</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium text-blue-600">Bi-Weekly</h4>
              <p className="text-2xl font-bold">
                {teacherSummaries.filter(t => t.salary_type === 'Bi-Weekly').length}
              </p>
              <p className="text-sm text-muted-foreground">Teachers</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium text-purple-600">Monthly</h4>
              <p className="text-2xl font-bold">
                {teacherSummaries.filter(t => t.salary_type === 'Monthly').length}
              </p>
              <p className="text-sm text-muted-foreground">Teachers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}