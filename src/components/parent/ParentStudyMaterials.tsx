import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BookOpen, Calendar, Search, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
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

interface ParentStudyMaterialsProps {
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

export function ParentStudyMaterials({ user }: ParentStudyMaterialsProps) {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  function getCurrentMonth(): string {
    const currentDate = new Date();
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    
    // Adjust for academic year (Aug-May)
    let currentAcademicMonth = monthNames[currentDate.getMonth()];
    if (['june', 'july'].includes(currentAcademicMonth)) {
      currentAcademicMonth = 'august'; // Default to start of academic year
    }
    
    return currentAcademicMonth;
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  const currentMonth = getCurrentMonth();
  const currentMaterials = materials.filter(m => m.month === currentMonth);
  const upcomingMaterials = materials.filter(m => {
    const monthIndex = ACADEMIC_MONTHS.indexOf(m.month);
    const currentMonthIndex = ACADEMIC_MONTHS.indexOf(currentMonth);
    return monthIndex > currentMonthIndex && monthIndex <= currentMonthIndex + 2;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Study Materials</h2>
        <p className="text-muted-foreground">
          View your child's learning materials and curriculum overview
        </p>
      </div>

      {/* Current Learning Section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <Calendar className="h-5 w-5 mr-2" />
            Current Learning - {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}
          </CardTitle>
          <CardDescription className="text-blue-700">
            Materials your child is currently working on
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentMaterials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentMaterials.map(material => (
                <Card key={material.id} className="bg-white">
                  <CardHeader>
                    <CardTitle className="text-base">{material.name}</CardTitle>
                    <CardDescription>{getCategoryLabel(material.category)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <Badge variant="default">{material.weeks} weeks</Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{material.name}</DialogTitle>
                            <DialogDescription>
                              Learning objectives and overview for parents
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-medium mb-2">What Your Child Will Learn</h4>
                              <p className="text-sm text-gray-600">
                                This material focuses on {getCategoryLabel(material.category).toLowerCase()} development
                                over a {material.weeks}-week period. Your child will engage with carefully designed
                                Montessori materials that encourage independent learning and discovery.
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-medium">Key Learning Areas:</h4>
                              <ul className="text-sm space-y-1 text-gray-600">
                                {material.category === 'language' && (
                                  <>
                                    <li>• Vocabulary development</li>
                                    <li>• Reading readiness skills</li>
                                    <li>• Communication and expression</li>
                                  </>
                                )}
                                {material.category === 'math' && (
                                  <>
                                    <li>• Number recognition and counting</li>
                                    <li>• Mathematical concepts and operations</li>
                                    <li>• Problem-solving skills</li>
                                  </>
                                )}
                                {material.category === 'practical' && (
                                  <>
                                    <li>• Daily life skills</li>
                                    <li>• Fine motor development</li>
                                    <li>• Independence and responsibility</li>
                                  </>
                                )}
                                {material.category === 'culture' && (
                                  <>
                                    <li>• Geography and world awareness</li>
                                    <li>• History and time concepts</li>
                                    <li>• Science and nature exploration</li>
                                  </>
                                )}
                              </ul>
                            </div>
                            
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <h5 className="font-medium text-blue-900">How You Can Support at Home</h5>
                              <p className="text-sm text-blue-800 mt-1">
                                Ask your child about their activities, read together daily, and encourage
                                independent problem-solving. Your teacher will share specific ways to reinforce
                                these concepts at home.
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <BookOpen className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-blue-700">No materials currently active for this month.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Learning Section */}
      {upcomingMaterials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Coming Soon
            </CardTitle>
            <CardDescription>
              Materials your child will be working on in upcoming months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingMaterials.map(material => (
                <Card key={material.id} className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-base">{material.name}</CardTitle>
                    <CardDescription>{getCategoryLabel(material.category)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">
                        {material.month.charAt(0).toUpperCase() + material.month.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {material.weeks} weeks
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter and Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Explore All Materials
          </CardTitle>
          <CardDescription>
            Browse the complete academic year curriculum
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Materials</label>
              <Input
                placeholder="Search by topic..."
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
              <label className="text-sm font-medium">Learning Area</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {MATERIAL_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Year Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Year Timeline</CardTitle>
          <CardDescription>
            Materials distribution across the school year (August - May)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ACADEMIC_MONTHS.map(month => {
              const monthMaterials = filteredMaterials.filter(m => m.month === month);
              const isCurrentMonth = month === currentMonth;
              
              return (
                <div 
                  key={month}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    isCurrentMonth ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      isCurrentMonth ? 'bg-blue-500' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <h4 className={`font-medium ${isCurrentMonth ? 'text-blue-900' : ''}`}>
                        {month.charAt(0).toUpperCase() + month.slice(1)}
                        {isCurrentMonth && <Badge className="ml-2" variant="default">Current</Badge>}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {monthMaterials.length} materials
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {monthMaterials.slice(0, 3).map(material => (
                      <Badge key={material.id} variant="outline" className="text-xs">
                        {getCategoryLabel(material.category)}
                      </Badge>
                    ))}
                    {monthMaterials.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{monthMaterials.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {filteredMaterials.length === 0 && (searchTerm || selectedMonth !== 'all' || selectedCategory !== 'all') && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No materials found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your search criteria to find relevant materials.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}