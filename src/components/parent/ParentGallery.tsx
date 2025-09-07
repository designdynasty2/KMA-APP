import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Image as ImageIcon, Calendar, Search, Heart, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { User } from '../../App';
import { projectId } from '../../utils/supabase/info';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface GalleryPhoto {
  id: string;
  title: string;
  description: string;
  class: string;
  uploaded_by: string;
  uploaded_at: string;
  image_url?: string;
  likes?: number;
  liked_by_parent?: boolean;
}

interface ParentGalleryProps {
  user: User;
}

const CLASSES = ['All Classes', 'Toddler', 'Primary A', 'Primary B', 'Elementary'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most_liked', label: 'Most Liked' }
];

export function ParentGallery({ user }: ParentGalleryProps) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('All Classes');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

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
      // Mock data for demo with realistic child activities
      const mockPhotos: GalleryPhoto[] = [
        {
          id: '1',
          title: 'Art Class Creativity',
          description: 'Emma and her classmates created beautiful watercolor paintings during our weekly art session. They explored color mixing and learned about different painting techniques.',
          class: 'Primary A',
          uploaded_by: 'Ms. Johnson',
          uploaded_at: '2024-01-15T10:00:00Z',
          image_url: 'https://images.unsplash.com/photo-1617080090911-91409e3496ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMHBhaW50aW5nJTIwd2F0ZXJjb2xvcnxlbnwxfHx8fDE3NTcxOTQxMDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
          likes: 12,
          liked_by_parent: true
        },
        {
          id: '2',
          title: 'Math with Golden Beads',
          description: 'Students working with Montessori golden bead materials to understand place value and decimal system concepts.',
          class: 'Primary B',
          uploaded_by: 'Ms. Smith',
          uploaded_at: '2024-01-14T14:30:00Z',
          image_url: 'https://images.unsplash.com/photo-1632160103859-b70e3e9e8238?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMG1hdGglMjBtb250ZXNzb3JpfGVufDF8fHx8MTc1NzE5NDE2N3ww&ixlib=rb-4.1.0&q=80&w=1080',
          likes: 8,
          liked_by_parent: false
        },
        {
          id: '3',
          title: 'Garden Exploration',
          description: 'Children discovering nature in our school garden, learning about plants, insects, and the environment around them.',
          class: 'Elementary',
          uploaded_by: 'Ms. Davis',
          uploaded_at: '2024-01-13T11:15:00Z',
          image_url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMGdhcmRlbiUyMG5hdHVyZXxlbnwxfHx8fDE3NTcxOTQyMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
          likes: 15,
          liked_by_parent: true
        },
        {
          id: '4',
          title: 'Reading Circle',
          description: 'Daily reading time where children share stories and develop their language skills through literature.',
          class: 'Primary A',
          uploaded_by: 'Ms. Johnson',
          uploaded_at: '2024-01-12T09:45:00Z',
          image_url: 'https://images.unsplash.com/photo-1618979503853-3b3fb89e0d98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMHJlYWRpbmclMjBib29rc3xlbnwxfHx8fDE3NTcxOTQyMzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
          likes: 10,
          liked_by_parent: false
        },
        {
          id: '5',
          title: 'Science Discovery',
          description: 'Young scientists exploring magnets and learning about magnetic properties through hands-on experiments.',
          class: 'Elementary',
          uploaded_by: 'Ms. Wilson',
          uploaded_at: '2024-01-11T15:20:00Z',
          image_url: 'https://images.unsplash.com/photo-1606002785742-25b88eab8fec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMHNjaWVuY2UlMjBleHBlcmltZW50fGVufDF8fHx8MTc1NzE5NDI2OHww&ixlib=rb-4.1.0&q=80&w=1080',
          likes: 7,
          liked_by_parent: false
        },
        {
          id: '6',
          title: 'Music and Movement',
          description: 'Children enjoying music class with various instruments, developing rhythm and musical expression.',
          class: 'Toddler',
          uploaded_by: 'Ms. Brown',
          uploaded_at: '2024-01-10T10:30:00Z',
          image_url: 'https://images.unsplash.com/photo-1615880484746-a9d6b7c19a15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMG11c2ljJTIwaW5zdHJ1bWVudHN8ZW58MXx8fHwxNzU3MTk0MzAxfDA&ixlib=rb-4.1.0&q=80&w=1080',
          likes: 9,
          liked_by_parent: true
        }
      ];
      setPhotos(mockPhotos);
    } finally {
      setLoading(false);
    }
  }

  const filteredAndSortedPhotos = photos
    .filter(photo => {
      const matchesClass = selectedClass === 'All Classes' || photo.class === selectedClass;
      const matchesSearch = photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           photo.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesClass && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
        case 'oldest':
          return new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
        case 'most_liked':
          return (b.likes || 0) - (a.likes || 0);
        default:
          return 0;
      }
    });

  async function handleLike(photoId: string) {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId 
        ? { 
            ...photo, 
            liked_by_parent: !photo.liked_by_parent,
            likes: (photo.likes || 0) + (photo.liked_by_parent ? -1 : 1)
          }
        : photo
    ));
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return formatDate(dateString);
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Photo Gallery</h2>
        <p className="text-muted-foreground">
          View photos of your child's activities and classroom moments
        </p>
      </div>

      {/* Filter and Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Filter Photos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              Showing {filteredAndSortedPhotos.length} of {photos.length} photos
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setSearchTerm('');
                setSelectedClass('All Classes');
                setSortBy('newest');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedPhotos.map(photo => (
          <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gray-100 relative group">
              {photo.image_url ? (
                <ImageWithFallback
                  src={photo.image_url}
                  alt={photo.title}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              {/* Overlay with quick actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      View Full Size
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>{photo.title}</DialogTitle>
                      <DialogDescription>
                        {photo.class} • Uploaded by {photo.uploaded_by} • {formatDate(photo.uploaded_at)}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        {photo.image_url ? (
                          <ImageWithFallback
                            src={photo.image_url}
                            alt={photo.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-16 w-16 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(photo.id)}
                            className={photo.liked_by_parent ? 'text-red-500' : ''}
                          >
                            <Heart 
                              className={`h-4 w-4 mr-1 ${
                                photo.liked_by_parent ? 'fill-current' : ''
                              }`} 
                            />
                            {photo.likes || 0}
                          </Button>
                          <Badge variant="outline">{photo.class}</Badge>
                        </div>
                        
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      </div>
                      
                      <div>
                        <p className="text-sm leading-relaxed">{photo.description}</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{photo.title}</CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {photo.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <Badge variant="outline">{photo.class}</Badge>
                <span className="text-muted-foreground">{getTimeAgo(photo.uploaded_at)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  by {photo.uploaded_by}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(photo.id)}
                  className={photo.liked_by_parent ? 'text-red-500' : ''}
                >
                  <Heart 
                    className={`h-4 w-4 mr-1 ${
                      photo.liked_by_parent ? 'fill-current' : ''
                    }`} 
                  />
                  {photo.likes || 0}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Gallery Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{photos.length}</div>
              <p className="text-sm text-muted-foreground">Total Photos</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {photos.filter(p => 
                  (Date.now() - new Date(p.uploaded_at).getTime()) / (1000 * 60 * 60 * 24) <= 7
                ).length}
              </div>
              <p className="text-sm text-muted-foreground">This Week</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(photos.map(p => p.class)).size}
              </div>
              <p className="text-sm text-muted-foreground">Classes</p>
            </div>
            <div className="text-2xl font-bold text-red-600 text-center">
              <div>{photos.filter(p => p.liked_by_parent).length}</div>
              <p className="text-sm text-muted-foreground">Your Favorites</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredAndSortedPhotos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No photos found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || selectedClass !== 'All Classes'
                ? 'Try adjusting your search criteria'
                : 'Photos will appear here as teachers upload classroom activities.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}