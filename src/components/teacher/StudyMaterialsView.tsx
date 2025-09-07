import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { BookOpen, Calendar, Eye, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
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

interface StudyMaterialsViewProps {
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

export function StudyMaterialsView({ user }: StudyMaterialsViewProps) {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);

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
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredMaterials = materials.filter(material => {
    const matchesMonth = selectedMonth === 'all' || material.month === selectedMonth;
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMonth && matchesCategory && matchesSearch;
  });

  function getCategoryLabel(category: string): string {
    return MATERIAL_CATEGORIES.find(cat => cat.value === category)?.label || category;
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Study Materials</h2>
        <p className="text-muted-foreground">
          View and access study materials for the academic year
        </p>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search & Filter Materials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Academic Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {ACADEMIC_MONTHS.map(month => (
                    <SelectItem key={month} value={month}>
                      {month.charAt(0).toUpperCase() + month.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {MATERIAL_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              Showing {filteredMaterials.length} of {materials.length} materials
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setSearchTerm('');
                setSelectedMonth('all');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Academic Year Calendar Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Academic Year Overview
          </CardTitle>
          <CardDescription>Materials distribution across the academic year (August - May)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {ACADEMIC_MONTHS.map(month => {
              const monthMaterials = materials.filter(m => m.month === month);
              return (
                <div 
                  key={month}
                  className={`p-3 border rounded-lg text-center cursor-pointer transition-colors ${
                    selectedMonth === month ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedMonth(month)}
                >
                  <div className="text-sm font-medium capitalize">{month}</div>
                  <div className="text-2xl font-bold text-blue-600">{monthMaterials.length}</div>
                  <div className="text-xs text-muted-foreground">materials</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map(material => (
          <Card key={material.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{material.name}</CardTitle>
                  <CardDescription>
                    {getCategoryLabel(material.category)}
                  </CardDescription>
                </div>
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="pt-3 border-t space-y-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSelectedMaterial(material)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Material
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{material.name}</DialogTitle>
                      <DialogDescription>
                        {getCategoryLabel(material.category)} • {material.weeks} weeks • {material.month.charAt(0).toUpperCase() + material.month.slice(1)}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 font-medium">Study Material Preview</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Content is stored securely in OneDrive
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
                          <div>
                            <h4 className="font-medium text-yellow-800">View Only Access</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                              This material is proprietary content. Teachers have view-only access without download or snippet options as per school administration policy.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="font-medium">Category:</span>
                          <Badge variant="outline">{getCategoryLabel(material.category)}</Badge>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="font-medium">Duration:</span>
                          <span>{material.weeks} weeks</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="font-medium">Academic Month:</span>
                          <span className="capitalize">{material.month}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="font-medium">Added:</span>
                          <span>{new Date(material.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex justify-center pt-4">
                        <Button disabled className="w-full">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Access Full Material (OneDrive)
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <p className="text-xs text-muted-foreground text-center">
                  View-only access • No download
                </p>
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
            <p className="text-muted-foreground text-center">
              {searchTerm || selectedMonth !== 'all' || selectedCategory !== 'all'
                ? 'Try adjusting your search criteria'
                : 'No study materials have been added yet.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}