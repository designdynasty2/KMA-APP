import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';
import { Plus, Users, Image as ImageIcon, FileText, Package, Calendar, Send, Upload } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { projectId } from '../../utils/supabase/info';

interface ClassroomManagementProps {
  user: User;
}

const ACADEMIC_YEARS = ['2024-25', '2025-26', '2026-27'];
const CLASSES = ['Toddler', 'Primary A', 'Primary B', 'Elementary'];

export function ClassroomManagement({ user }: ClassroomManagementProps) {
  const [activeTab, setActiveTab] = useState('students');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Classroom Management</h2>
        <p className="text-muted-foreground">
          Manage students, gallery, reports, inventory, and attendance
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-6">
          <StudentManagement user={user} />
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <GalleryManagement user={user} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportsManagement user={user} />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <InventoryManagement user={user} />
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <AttendanceManagement user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Student Management Component
function StudentManagement({ user }: { user: User }) {
  const [students, setStudents] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    class: '',
    academic_year: '2024-25',
    parent_email: '',
    parent_name: '',
    status: 'enrolled'
  });

  const mockStudents = [
    { id: '1', name: 'Emma Smith', age: 4, class: 'Primary A', academic_year: '2024-25', parent_email: 'parent@montessori.edu', parent_name: 'John Smith', status: 'enrolled' },
    { id: '2', name: 'Liam Johnson', age: 5, class: 'Primary B', academic_year: '2024-25', parent_email: 'parent2@example.com', parent_name: 'Sarah Johnson', status: 'enrolled' },
    { id: '3', name: 'Olivia Davis', age: 3, class: 'Toddler', academic_year: '2025-26', parent_email: 'parent3@example.com', parent_name: 'Mike Davis', status: 'pre_registered' }
  ];

  useEffect(() => {
    setStudents(mockStudents);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const newStudent = {
      id: Date.now().toString(),
      ...formData,
      age: parseInt(formData.age),
      created_at: new Date().toISOString()
    };

    setStudents(prev => [...prev, newStudent]);
    setFormData({ name: '', age: '', class: '', academic_year: '2024-25', parent_email: '', parent_name: '', status: 'enrolled' });
    setIsDialogOpen(false);
    toast.success('Student added successfully');
  }

  async function sendParentInvite(studentId: string) {
    toast.success('Parent invitation sent successfully');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Student Management</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>Add a student for current or future academic year</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Student Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min="2"
                    max="12"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Select value={formData.class} onValueChange={(value) => setFormData(prev => ({ ...prev, class: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASSES.map(cls => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academic_year">Academic Year</Label>
                  <Select value={formData.academic_year} onValueChange={(value) => setFormData(prev => ({ ...prev, academic_year: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACADEMIC_YEARS.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent_name">Parent Name</Label>
                <Input
                  id="parent_name"
                  value={formData.parent_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, parent_name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent_email">Parent Email</Label>
                <Input
                  id="parent_email"
                  type="email"
                  value={formData.parent_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, parent_email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enrolled">Enrolled</SelectItem>
                    <SelectItem value="pre_registered">Pre-registered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Student</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{students.filter(s => s.status === 'enrolled').length}</div>
            <p className="text-xs text-muted-foreground">Enrolled Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{students.filter(s => s.status === 'pre_registered').length}</div>
            <p className="text-xs text-muted-foreground">Pre-registered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{CLASSES.length}</div>
            <p className="text-xs text-muted-foreground">Total Classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">Average Attendance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map(student => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.age}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>{student.academic_year}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{student.parent_name}</p>
                      <p className="text-xs text-muted-foreground">{student.parent_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.status === 'enrolled' ? 'default' : 'secondary'}>
                      {student.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {student.status === 'pre_registered' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => sendParentInvite(student.id)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Invite Parent
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Gallery Management Component
function GalleryManagement({ user }: { user: User }) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const mockPhotos = [
    { id: '1', title: 'Art Class Activity', description: 'Students working on their paintings', uploaded_by: 'Ms. Johnson', uploaded_at: '2024-01-15T10:00:00Z', class: 'Primary A' },
    { id: '2', title: 'Math Learning', description: 'Montessori math materials in use', uploaded_by: 'Mr. Smith', uploaded_at: '2024-01-14T14:30:00Z', class: 'Primary B' },
  ];

  useEffect(() => {
    setPhotos(mockPhotos);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gallery Management</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Photos
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Gallery Photos</DialogTitle>
              <DialogDescription>Share classroom activities with parents</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Drag and drop photos here, or click to select
                </p>
                <Button variant="outline" className="mt-4">
                  Select Photos
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Activity title" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe the activity..." />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSES.map(cls => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => { setIsDialogOpen(false); toast.success('Photos uploaded successfully'); }}>
                  Upload
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map(photo => (
          <Card key={photo.id}>
            <CardHeader>
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <h4 className="font-medium">{photo.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{photo.description}</p>
              <div className="flex justify-between items-center mt-3">
                <Badge variant="outline">{photo.class}</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(photo.uploaded_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Reports Management Component
function ReportsManagement({ user }: { user: User }) {
  const [reports, setReports] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const mockReports = [
    { id: '1', student_name: 'Emma Smith', report_type: 'Monthly Progress', content: 'Emma has shown excellent progress in language development...', created_at: '2024-01-15T10:00:00Z' },
    { id: '2', student_name: 'Liam Johnson', report_type: 'Behavioral Assessment', content: 'Liam demonstrates good social skills and cooperation...', created_at: '2024-01-14T14:30:00Z' },
  ];

  useEffect(() => {
    setReports(mockReports);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Student Reports</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Student Report</DialogTitle>
              <DialogDescription>Generate a progress report for a student</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student">Student</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emma">Emma Smith</SelectItem>
                    <SelectItem value="liam">Liam Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="report_type">Report Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly Progress</SelectItem>
                    <SelectItem value="behavioral">Behavioral Assessment</SelectItem>
                    <SelectItem value="academic">Academic Evaluation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Report Content</Label>
                <Textarea 
                  id="content" 
                  placeholder="Enter detailed report content..." 
                  className="min-h-32"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => { setIsDialogOpen(false); toast.success('Report created successfully'); }}>
                  Create Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {reports.map(report => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{report.student_name}</CardTitle>
                  <CardDescription>{report.report_type}</CardDescription>
                </div>
                <Badge variant="outline">
                  {new Date(report.created_at).toLocaleDateString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{report.content}</p>
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm">
                  View Full Report
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Inventory Management Component
function InventoryManagement({ user }: { user: User }) {
  const [inventory, setInventory] = useState<any[]>([]);

  const mockInventory = [
    { id: '1', item: 'Art Supplies', quantity: 25, min_quantity: 10, status: 'sufficient', requested_by: null },
    { id: '2', item: 'Math Beads', quantity: 5, min_quantity: 15, status: 'low', requested_by: 'Ms. Johnson' },
    { id: '3', item: 'Books', quantity: 100, min_quantity: 50, status: 'sufficient', requested_by: null },
  ];

  useEffect(() => {
    setInventory(mockInventory);
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Inventory Management</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {inventory.filter(i => i.status === 'sufficient').length}
            </div>
            <p className="text-xs text-muted-foreground">Sufficient Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {inventory.filter(i => i.status === 'low').length}
            </div>
            <p className="text-xs text-muted-foreground">Low Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {inventory.filter(i => i.requested_by).length}
            </div>
            <p className="text-xs text-muted-foreground">Pending Requests</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Current Quantity</TableHead>
                <TableHead>Minimum Required</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.item}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.min_quantity}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'sufficient' ? 'default' : 'destructive'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.requested_by || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Attendance Management Component
function AttendanceManagement({ user }: { user: User }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendance, setAttendance] = useState<any[]>([]);

  const mockAttendance = [
    { id: '1', student_name: 'Emma Smith', class: 'Primary A', status: 'present', notes: '' },
    { id: '2', student_name: 'Liam Johnson', class: 'Primary B', status: 'absent', notes: 'Sick' },
    { id: '3', student_name: 'Olivia Davis', class: 'Toddler', status: 'present', notes: '' },
  ];

  useEffect(() => {
    setAttendance(mockAttendance);
  }, []);

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendance(prev => prev.map(a => 
      a.id === studentId ? { ...a, status } : a
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Attendance Management</h3>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">{selectedDate.toLocaleDateString()}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance</CardTitle>
          <CardDescription>Mark attendance for all students</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.map(student => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.student_name}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>
                    <Select 
                      value={student.status} 
                      onValueChange={(value) => handleAttendanceChange(student.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input 
                      placeholder="Notes..." 
                      value={student.notes}
                      onChange={(e) => setAttendance(prev => prev.map(a => 
                        a.id === student.id ? { ...a, notes: e.target.value } : a
                      ))}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="flex justify-end mt-4">
            <Button onClick={() => toast.success('Attendance saved successfully')}>
              Save Attendance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}