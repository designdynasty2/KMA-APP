import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Calendar } from '../ui/calendar';
import { Badge } from '../ui/badge';
import { Plus, BookOpen, Calendar as CalendarIcon, Download } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { projectId } from '../../utils/supabase/info';
import { demoApiCall } from '../../utils/demo';

interface StudyMaterial {
  id: string;
  name: string;
  weeks: number;
  category: string;
  month: string;
  created_at: string;
}

interface StudyMaterialsProps {
  user: User;
}

const ACADEMIC_MONTHS = [
  'august', 'september', 'october', 'november', 'december',
  'january', 'february', 'march', 'april', 'may'
];

const MATERIAL_CATEGORIES = [
  { value: 'language', label: 'Language Arts' },
  { value: 'math', label: 'Mathematics' },
  { value: 'culture', label: 'Cultural Studies' },
  { value: 'practical', label: 'Practical Life' },
  { value: 'sensorial', label: 'Sensorial' }
];

export function StudyMaterials({ user }: StudyMaterialsProps) {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('august');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    weeks: 1,
    category: '',
    month: 'august'
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    try {
      const data = await demoApiCall(
        `https://${projectId}.supabase.co/functions/v1/make-server-e5c30ae9/study-materials`,
        {
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'Content-Type': 'application/json'
          }
        },
        user
      );
      
      setMaterials(data.materials || []);
    } catch (error) {
      console.error('Error fetching study materials:', error);
      toast.error('Failed to load study materials');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const data = await demoApiCall(
        `https://${projectId}.supabase.co/functions/v1/make-server-e5c30ae9/study-materials`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        },
        user
      );

      // In demo mode, create a mock material
      const newMaterial = {
        id: Date.now().toString(),
        ...formData,
        created_at: new Date().toISOString()
      };
      
      setMaterials(prev => [...prev, newMaterial]);
      setFormData({ name: '', weeks: 1, category: '', month: 'august' });
      setIsDialogOpen(false);
      toast.success('Study material created successfully');
    } catch (error) {
      console.error('Error creating study material:', error);
      toast.error('Failed to create study material');
    }
  }

  const filteredMaterials = materials.filter(material => 
    selectedMonth === 'all' || material.month === selectedMonth
  );

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Study Materials</h2>
          <p className="text-muted-foreground">
            Manage academic materials for the school year (August - May)
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Study Material</DialogTitle>
              <DialogDescription>
                Create a new study material with customizable duration
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Material Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Topic-1: Language Development"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIAL_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weeks">Duration (Weeks)</Label>
                <Input
                  id="weeks"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.weeks}
                  onChange={(e) => setFormData(prev => ({ ...prev, weeks: parseInt(e.target.value) }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="month">Academic Month</Label>
                <Select
                  value={formData.month}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, month: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACADEMIC_MONTHS.map(month => (
                      <SelectItem key={month} value={month}>
                        {month.charAt(0).toUpperCase() + month.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Material</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar View Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Academic Year Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={selectedMonth === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMonth('all')}
            >
              All Months
            </Button>
            {ACADEMIC_MONTHS.map(month => (
              <Button
                key={month}
                variant={selectedMonth === month ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMonth(month)}
              >
                {month.charAt(0).toUpperCase() + month.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map(material => (
          <Card key={material.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{material.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {MATERIAL_CATEGORIES.find(cat => cat.value === material.category)?.label}
                  </CardDescription>
                </div>
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duration:</span>
                <Badge variant="secondary">{material.weeks} weeks</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Month:</span>
                <Badge variant="outline">
                  {material.month.charAt(0).toUpperCase() + material.month.slice(1)}
                </Badge>
              </div>

              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    OneDrive
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Created: {new Date(material.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No materials found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {selectedMonth === 'all' 
                ? 'No study materials have been created yet.'
                : `No materials found for ${selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)}.`
              }
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Material
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}