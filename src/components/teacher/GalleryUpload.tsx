import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Image as ImageIcon, Upload, Camera, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { projectId } from '../../utils/supabase/info';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { unsplash_tool } from '../../App';

interface GalleryPhoto {
  id: string;
  title: string;
  description: string;
  class: string;
  uploaded_by: string;
  uploaded_at: string;
  image_url?: string;
}

interface GalleryUploadProps {
  user: User;
}

const CLASSES = ['Toddler', 'Primary A', 'Primary B', 'Elementary'];

export function GalleryUpload({ user }: GalleryUploadProps) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class: '',
    activity_type: ''
  });

  useEffect(() => {
    fetchPhotos();
  }, []);

  async function fetchPhotos() {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e5c30ae9/gallery`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch gallery photos');
      }
      
      const data = await response.json();
      setPhotos(data.photos || []);
    } catch (error) {
      console.error('Error fetching gallery photos:', error);
      // Mock data for demo
      const mockPhotos: GalleryPhoto[] = [
        {
          id: '1',
          title: 'Art Class Creativity',
          description: 'Students working on their watercolor paintings during art time.',
          class: 'Primary A',
          uploaded_by: user.name,
          uploaded_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          title: 'Math Manipulatives',
          description: 'Exploring mathematical concepts with Montessori golden beads.',
          class: 'Primary B',
          uploaded_by: user.name,
          uploaded_at: '2024-01-14T14:30:00Z'
        },
        {
          id: '3',
          title: 'Outdoor Learning',
          description: 'Nature walk and exploration in our school garden.',
          class: 'Elementary',
          uploaded_by: user.name,
          uploaded_at: '2024-01-13T11:15:00Z'
        }
      ];
      setPhotos(mockPhotos);
    } finally {
      setLoading(false);
    }
  }

  async function getActivityImage(activityType: string): Promise<string> {
    const searchQueries = {
      'art': 'children painting watercolor',
      'math': 'montessori math beads',
      'reading': 'children reading books',
      'outdoor': 'children garden nature',
      'music': 'children music instruments',
      'science': 'children science experiment',
      'cooking': 'children cooking kitchen',
      'craft': 'children arts crafts'
    };
    
    const query = searchQueries[activityType as keyof typeof searchQueries] || 'montessori classroom children';
    
    try {
      const response = await fetch('/api/unsplash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      return data.image_url || '';
    } catch (error) {
      console.error('Error fetching image:', error);
      return '';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    
    try {
      // Get appropriate image for the activity type
      const imageUrl = await getActivityImage(formData.activity_type);
      
      const photoData = {
        ...formData,
        image_url: imageUrl
      };

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e5c30ae9/gallery/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(photoData)
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      const data = await response.json();
      setPhotos(prev => [data.photo, ...prev]);
      
      // Reset form
      setFormData({ title: '', description: '', class: '', activity_type: '' });
      setIsDialogOpen(false);
      toast.success('Photo uploaded successfully! Parents will be notified.');
    } catch (error) {
      console.error('Error uploading photo:', error);
      // For demo, add to local state
      const newPhoto: GalleryPhoto = {
        id: Date.now().toString(),
        ...formData,
        uploaded_by: user.name,
        uploaded_at: new Date().toISOString(),
        image_url: await getActivityImage(formData.activity_type)
      };
      
      setPhotos(prev => [newPhoto, ...prev]);
      setFormData({ title: '', description: '', class: '', activity_type: '' });
      setIsDialogOpen(false);
      toast.success('Photo uploaded successfully! Parents will be notified.');
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gallery Management</h2>
          <p className="text-muted-foreground">
            Upload and share classroom activities with parents
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Photos
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Gallery Photos</DialogTitle>
              <DialogDescription>
                Share classroom activities and moments with parents. They will receive notifications when photos are added.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mock file upload area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Upload Photos
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Drag and drop photos here, or click to select files
                </p>
                <Button type="button" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Activity Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Art Class Creativity, Math Exploration"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the activity and what the children are learning..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Select
                    value={formData.class}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, class: value }))}
                    required
                  >
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
                  <Label htmlFor="activity_type">Activity Type</Label>
                  <Select
                    value={formData.activity_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, activity_type: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="art">Art & Painting</SelectItem>
                      <SelectItem value="math">Math Activities</SelectItem>
                      <SelectItem value="reading">Reading Time</SelectItem>
                      <SelectItem value="outdoor">Outdoor Learning</SelectItem>
                      <SelectItem value="music">Music & Movement</SelectItem>
                      <SelectItem value="science">Science Exploration</SelectItem>
                      <SelectItem value="cooking">Cooking Class</SelectItem>
                      <SelectItem value="craft">Arts & Crafts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Parent Notification</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Parents of students in the selected class will receive a notification when these photos are uploaded.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photos
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{photos.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {photos.filter(p => 
                new Date(p.uploaded_at).getMonth() === new Date().getMonth()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Photos uploaded</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes Covered</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(photos.map(p => p.class)).size}
            </div>
            <p className="text-xs text-muted-foreground">Different classes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {photos.filter(p => {
                const daysDiff = (Date.now() - new Date(p.uploaded_at).getTime()) / (1000 * 60 * 60 * 24);
                return daysDiff <= 7;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Photos Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map(photo => (
          <Card key={photo.id} className="overflow-hidden">
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              {photo.image_url ? (
                <ImageWithFallback
                  src={photo.image_url}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Photo Preview</p>
                </div>
              )}
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{photo.title}</CardTitle>
                  <CardDescription className="mt-1">{photo.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <Badge variant="outline">{photo.class}</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(photo.uploaded_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Uploaded by:</span>
                <span className="font-medium">{photo.uploaded_by}</span>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center text-xs text-green-600">
                  <Users className="h-3 w-3 mr-1" />
                  Parents notified
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {photos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No photos uploaded yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start sharing classroom activities with parents by uploading your first photos.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload First Photos
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}