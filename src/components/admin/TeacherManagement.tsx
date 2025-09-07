import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Users, Edit, Trash2, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { projectId } from '../../utils/supabase/info';
import { demoApiCall } from '../../utils/demo';

interface Teacher {
  id: string;
  name: string;
  employee_number: string;
  email: string;
  address: string;
  work_authorization: string;
  designation: string;
  salary_type: string;
  wage_per_hour: number;
  created_at: string;
}

interface TeacherManagementProps {
  user: User;
}

const DESIGNATIONS = [
  'Principal',
  'Lead Teacher',
  'Sub-Teacher',
  'Lead'
];

const SALARY_TYPES = [
  'Weekly',
  'Bi-Weekly',
  'Monthly'
];

const WORK_AUTHORIZATION_OPTIONS = [
  'Authorized',
  'Pending',
  'Expired'
];

export function TeacherManagement({ user }: TeacherManagementProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    employee_number: '',
    email: '',
    address: '',
    work_authorization: 'Authorized',
    designation: 'Sub-Teacher',
    salary_type: 'Bi-Weekly',
    wage_per_hour: 15.00
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    try {
      const data = await demoApiCall(
        `https://${projectId}.supabase.co/functions/v1/make-server-e5c30ae9/teachers`,
        {
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'Content-Type': 'application/json'
          }
        },
        user
      );
      
      setTeachers(data.teachers || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const url = editingTeacher 
        ? `https://${projectId}.supabase.co/functions/v1/make-server-e5c30ae9/teachers/${editingTeacher.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-e5c30ae9/teachers`;
      
      const method = editingTeacher ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingTeacher ? 'update' : 'create'} teacher`);
      }

      const data = await response.json();
      
      if (editingTeacher) {
        setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? data.teacher : t));
        toast.success('Teacher updated successfully');
      } else {
        setTeachers(prev => [...prev, data.teacher]);
        toast.success('Teacher created successfully');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving teacher:', error);
      toast.error(`Failed to ${editingTeacher ? 'update' : 'create'} teacher`);
    }
  }

  async function handleDelete(teacherId: string) {
    if (!confirm('Are you sure you want to delete this teacher?')) {
      return;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e5c30ae9/teachers/${teacherId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete teacher');
      }

      setTeachers(prev => prev.filter(t => t.id !== teacherId));
      toast.success('Teacher deleted successfully');
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast.error('Failed to delete teacher');
    }
  }

  function handleEdit(teacher: Teacher) {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      employee_number: teacher.employee_number,
      email: teacher.email,
      address: teacher.address,
      work_authorization: teacher.work_authorization,
      designation: teacher.designation,
      salary_type: teacher.salary_type,
      wage_per_hour: teacher.wage_per_hour
    });
    setIsDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      name: '',
      employee_number: '',
      email: '',
      address: '',
      work_authorization: 'Authorized',
      designation: 'Sub-Teacher',
      salary_type: 'Bi-Weekly',
      wage_per_hour: 15.00
    });
    setEditingTeacher(null);
    setIsDialogOpen(false);
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Teacher Management</h2>
          <p className="text-muted-foreground">
            Manage teacher profiles and employment details
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
              </DialogTitle>
              <DialogDescription>
                {editingTeacher ? 'Update teacher information' : 'Create a new teacher profile with employment details'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employee_number">Employee Number *</Label>
                  <Input
                    id="employee_number"
                    placeholder="EMP001"
                    value={formData.employee_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, employee_number: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="teacher@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Full address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="work_authorization">Work Authorization</Label>
                  <Select
                    value={formData.work_authorization}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, work_authorization: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_AUTHORIZATION_OPTIONS.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Select
                    value={formData.designation}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, designation: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DESIGNATIONS.map(designation => (
                        <SelectItem key={designation} value={designation}>
                          {designation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary_type">Salary Type</Label>
                  <Select
                    value={formData.salary_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, salary_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SALARY_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wage_per_hour">Wage per Hour ($)</Label>
                  <Input
                    id="wage_per_hour"
                    type="number"
                    min="10"
                    step="0.25"
                    value={formData.wage_per_hour}
                    onChange={(e) => setFormData(prev => ({ ...prev, wage_per_hour: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTeacher ? 'Update Teacher' : 'Create Teacher'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teachers Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lead Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teachers.filter(t => t.designation === 'Lead Teacher').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sub-Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teachers.filter(t => t.designation === 'Sub-Teacher').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Hourly Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${teachers.length > 0 
                ? (teachers.reduce((sum, t) => sum + t.wage_per_hour, 0) / teachers.length).toFixed(2)
                : '0.00'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Teachers Directory</CardTitle>
          <CardDescription>Manage all teacher profiles and employment details</CardDescription>
        </CardHeader>
        <CardContent>
          {teachers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Employee #</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Salary Type</TableHead>
                  <TableHead>Hourly Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map(teacher => (
                  <TableRow key={teacher.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{teacher.name}</p>
                        {teacher.address && (
                          <p className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {teacher.address.split(',')[0]}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{teacher.employee_number}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        {teacher.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{teacher.designation}</Badge>
                    </TableCell>
                    <TableCell>{teacher.salary_type}</TableCell>
                    <TableCell>${teacher.wage_per_hour.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={teacher.work_authorization === 'Authorized' ? 'default' : 
                               teacher.work_authorization === 'Pending' ? 'secondary' : 'destructive'}
                      >
                        {teacher.work_authorization}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(teacher)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(teacher.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No teachers found</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first teacher to the system.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Teacher
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}