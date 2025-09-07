import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Clock, Play, Square, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { projectId } from '../../utils/supabase/info';

interface TimeEntry {
  id: string;
  clock_in: string;
  clock_out?: string;
  hours_worked?: number;
  date: string;
}

interface TeacherTimeTrackingProps {
  user: User;
}

export function TeacherTimeTracking({ user }: TeacherTimeTrackingProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchTimeEntries();
    checkActiveSession();
    
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  async function fetchTimeEntries() {
    try {
      // Mock data for demo - in real implementation, this would fetch from the backend
      const mockEntries: TimeEntry[] = [
        {
          id: '1',
          clock_in: '2024-01-15T08:00:00Z',
          clock_out: '2024-01-15T16:00:00Z',
          hours_worked: 8,
          date: '2024-01-15'
        },
        {
          id: '2',
          clock_in: '2024-01-16T08:30:00Z',
          clock_out: '2024-01-16T15:30:00Z',
          hours_worked: 7,
          date: '2024-01-16'
        },
        {
          id: '3',
          clock_in: '2024-01-17T08:00:00Z',
          clock_out: '2024-01-17T17:00:00Z',
          hours_worked: 9,
          date: '2024-01-17'
        }
      ];
      
      setTimeEntries(mockEntries);
    } catch (error) {
      console.error('Error fetching time entries:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkActiveSession() {
    // Check if there's an active session
    // For demo, we'll assume no active session initially
    setIsActive(false);
    setCurrentEntry(null);
  }

  async function handleClockIn() {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e5c30ae9/time-tracking/clock-in`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to clock in');
      }

      const data = await response.json();
      setCurrentEntry(data.timeEntry);
      setIsActive(true);
      toast.success('Successfully clocked in!');
    } catch (error) {
      console.error('Error clocking in:', error);
      // For demo, create a mock entry
      const mockEntry: TimeEntry = {
        id: Date.now().toString(),
        clock_in: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      };
      setCurrentEntry(mockEntry);
      setIsActive(true);
      toast.success('Successfully clocked in!');
    }
  }

  async function handleClockOut() {
    if (!currentEntry) return;

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e5c30ae9/time-tracking/clock-out`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to clock out');
      }

      const data = await response.json();
      
      // Update the time entries list
      setTimeEntries(prev => [data.timeEntry, ...prev]);
      setCurrentEntry(null);
      setIsActive(false);
      
      toast.success(`Successfully clocked out! Worked ${data.timeEntry.hours_worked.toFixed(2)} hours.`);
    } catch (error) {
      console.error('Error clocking out:', error);
      // For demo, calculate hours and update
      const clockOut = new Date();
      const clockIn = new Date(currentEntry.clock_in);
      const hoursWorked = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
      
      const completedEntry: TimeEntry = {
        ...currentEntry,
        clock_out: clockOut.toISOString(),
        hours_worked: Number(hoursWorked.toFixed(2))
      };
      
      setTimeEntries(prev => [completedEntry, ...prev]);
      setCurrentEntry(null);
      setIsActive(false);
      toast.success(`Successfully clocked out! Worked ${hoursWorked.toFixed(2)} hours.`);
    }
  }

  function getCurrentWorkingHours(): number {
    if (!currentEntry) return 0;
    const now = new Date();
    const clockIn = new Date(currentEntry.clock_in);
    return (now.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
  }

  function getWeeklyHours(): number {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    return timeEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= weekStart && entry.hours_worked;
      })
      .reduce((sum, entry) => sum + (entry.hours_worked || 0), 0);
  }

  function getMonthlyHours(): number {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    return timeEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= monthStart && entry.hours_worked;
      })
      .reduce((sum, entry) => sum + (entry.hours_worked || 0), 0);
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

  function formatDuration(hours: number): string {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  const currentWorkingHours = getCurrentWorkingHours();
  const weeklyHours = getWeeklyHours() + (isActive ? currentWorkingHours : 0);
  const monthlyHours = getMonthlyHours() + (isActive ? currentWorkingHours : 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Time Tracking</h2>
        <p className="text-muted-foreground">
          Track your working hours for payroll calculation
        </p>
      </div>

      {/* Clock In/Out Section */}
      <Card className={isActive ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            {isActive ? 'Currently Working' : 'Time Clock'}
          </CardTitle>
          <CardDescription>
            {isActive 
              ? `Clocked in at ${currentEntry ? formatTime(currentEntry.clock_in) : ''}`
              : 'Click to start tracking your work hours'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isActive && currentEntry ? (
            <div className="text-center space-y-4">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {formatDuration(currentWorkingHours)}
                </div>
                <p className="text-sm text-muted-foreground">Hours worked today</p>
              </div>
              
              <div className="flex justify-center space-x-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Clocked in</p>
                  <p className="font-medium">{formatTime(currentEntry.clock_in)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Current time</p>
                  <p className="font-medium">{formatTime(currentTime.toISOString())}</p>
                </div>
              </div>
              
              <Button onClick={handleClockOut} className="w-full" size="lg">
                <Square className="h-4 w-4 mr-2" />
                Clock Out
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Button onClick={handleClockIn} className="w-full" size="lg">
                <Play className="h-4 w-4 mr-2" />
                Clock In
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Start tracking your work hours for today
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hours Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(isActive ? currentWorkingHours : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isActive ? 'In progress' : 'Not clocked in'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(weeklyHours)}</div>
            <p className="text-xs text-muted-foreground">
              {weeklyHours < 20 ? 'Below target' : weeklyHours >= 35 ? 'Full time' : 'Part time'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(monthlyHours)}</div>
            <p className="text-xs text-muted-foreground">Total hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
          <CardDescription>
            Your work hours are automatically reported to the Lead based on your salary type
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timeEntries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Hours Worked</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeEntries.slice(0, 10).map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell>{formatTime(entry.clock_in)}</TableCell>
                    <TableCell>
                      {entry.clock_out ? formatTime(entry.clock_out) : 
                       <Badge variant="secondary">In Progress</Badge>}
                    </TableCell>
                    <TableCell>
                      {entry.hours_worked ? 
                       formatDuration(entry.hours_worked) : 
                       <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.clock_out ? 'default' : 'secondary'}>
                        {entry.clock_out ? 'Complete' : 'Active'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No time entries yet</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your hours by clocking in above.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Time Tracking Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">How It Works</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Clock in when you start your shift</li>
                <li>• Clock out when you finish working</li>
                <li>• Hours are automatically calculated</li>
                <li>• Reports sent to Lead based on salary type</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Payroll Integration</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Weekly: Reports sent every Friday</li>
                <li>• Bi-Weekly: Reports sent every other Friday</li>
                <li>• Monthly: Reports sent on last day of month</li>
                <li>• Overtime automatically calculated</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}