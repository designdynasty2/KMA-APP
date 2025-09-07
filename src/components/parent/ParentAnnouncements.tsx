import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MessageCircle, Calendar, Bell, Search, Archive, Star } from 'lucide-react';
import { User } from '../../App';
import { projectId } from '../../utils/supabase/info';
import { demoApiCall } from '../../utils/demo';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  target_audience: string;
  send_notification: boolean;
  created_by: string;
  created_at: string;
  read: boolean;
  starred: boolean;
}

interface ParentAnnouncementsProps {
  user: User;
}

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800 border-gray-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  high: 'bg-red-100 text-red-800 border-red-200'
} as const;

const PRIORITY_LABELS = {
  low: 'General Info',
  medium: 'Important',
  high: 'Urgent'
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Announcements' },
  { value: 'unread', label: 'Unread Only' },
  { value: 'starred', label: 'Starred' },
  { value: 'high_priority', label: 'Urgent Only' }
];

export function ParentAnnouncements({ user }: ParentAnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      const data = await demoApiCall(
        `https://${projectId}.supabase.co/functions/v1/make-server-e5c30ae9/announcements`,
        {
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'Content-Type': 'application/json'
          }
        },
        user
      );
      
      // Add parent-specific properties to announcements
      const announcementsWithParentData = (data.announcements || []).map((announcement: any) => ({
        ...announcement,
        read: Math.random() > 0.3, // Randomly assign read status for demo
        starred: Math.random() > 0.7 // Randomly assign starred status for demo
      }));
      
      setAnnouncements(announcementsWithParentData);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      // Mock data for demo
      const mockAnnouncements: Announcement[] = [
        {
          id: '1',
          title: 'Welcome Back to School!',
          content: 'We are excited to welcome all our students back for the new academic year. Please review the updated school policies and calendar. Important dates to remember: Parent orientation on March 15th, and the spring festival on April 20th. We look forward to a wonderful year of learning and growth.',
          priority: 'high',
          target_audience: 'all_parents',
          send_notification: true,
          created_by: 'Principal Johnson',
          created_at: '2024-01-15T10:00:00Z',
          read: false,
          starred: true
        },
        {
          id: '2',
          title: 'Parent-Teacher Conference Scheduling',
          content: 'Parent-teacher conferences for this quarter will be held from March 15-19. Please schedule your appointment through the parent portal or contact your child\'s teacher directly. We encourage all parents to attend these important discussions about your child\'s progress.',
          priority: 'medium',
          target_audience: 'all_parents',
          send_notification: true,
          created_by: 'Ms. Anderson',
          created_at: '2024-01-14T14:30:00Z',
          read: true,
          starred: false
        },
        {
          id: '3',
          title: 'School Health and Safety Updates',
          content: 'We have updated our health and safety protocols for the winter season. Please ensure your child dresses appropriately for outdoor activities. If your child shows any signs of illness, please keep them home and notify the school office.',
          priority: 'medium',
          target_audience: 'all_parents',
          send_notification: false,
          created_by: 'School Nurse',
          created_at: '2024-01-12T09:15:00Z',
          read: true,
          starred: false
        },
        {
          id: '4',
          title: 'Field Trip Permission Forms Due',
          content: 'Permission forms for the upcoming science museum field trip are due by January 20th. Please complete and return the forms to your child\'s teacher. The field trip is scheduled for January 25th from 9 AM to 3 PM.',
          priority: 'high',
          target_audience: 'primary_parents',
          send_notification: true,
          created_by: 'Ms. Johnson',
          created_at: '2024-01-10T16:45:00Z',
          read: false,
          starred: false
        },
        {
          id: '5',
          title: 'Library Reading Program',
          content: 'Our winter reading program has begun! Children can earn reading rewards by completing books at home. Please track reading time in the provided log and return weekly for reward stickers. This program runs through February.',
          priority: 'low',
          target_audience: 'all_parents',
          send_notification: false,
          created_by: 'Librarian Mrs. Smith',
          created_at: '2024-01-08T11:20:00Z',
          read: true,
          starred: true
        },
        {
          id: '6',
          title: 'Snow Day Policy Reminder',
          content: 'As winter weather approaches, please review our snow day policy. School closures will be announced by 6 AM through our notification system, website, and local news. Make sure your contact information is current for emergency notifications.',
          priority: 'medium',
          target_audience: 'all_parents',
          send_notification: true,
          created_by: 'Principal Johnson',
          created_at: '2024-01-05T08:00:00Z',
          read: true,
          starred: false
        }
      ];
      setAnnouncements(mockAnnouncements);
    } finally {
      setLoading(false);
    }
  }

  const filteredAnnouncements = announcements.filter(announcement => {
    // Search filter
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    let matchesFilter = true;
    switch (filter) {
      case 'unread':
        matchesFilter = !announcement.read;
        break;
      case 'starred':
        matchesFilter = announcement.starred;
        break;
      case 'high_priority':
        matchesFilter = announcement.priority === 'high';
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  function handleMarkAsRead(announcementId: string) {
    setAnnouncements(prev => prev.map(announcement =>
      announcement.id === announcementId
        ? { ...announcement, read: true }
        : announcement
    ));
  }

  function handleToggleStar(announcementId: string) {
    setAnnouncements(prev => prev.map(announcement =>
      announcement.id === announcementId
        ? { ...announcement, starred: !announcement.starred }
        : announcement
    ));
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
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

  function getAudienceLabel(audience: string): string {
    const labels: Record<string, string> = {
      'all_parents': 'All Parents',
      'primary_parents': 'Primary Class Parents',
      'toddler_parents': 'Toddler Class Parents',
      'elementary_parents': 'Elementary Class Parents'
    };
    return labels[audience] || audience;
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  const unreadCount = announcements.filter(a => !a.read).length;
  const starredCount = announcements.filter(a => a.starred).length;
  const urgentCount = announcements.filter(a => a.priority === 'high').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">School Announcements</h2>
        <p className="text-muted-foreground">
          Stay updated with important school news and information
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
            <p className="text-xs text-muted-foreground">All messages</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Starred</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{starredCount}</div>
            <p className="text-xs text-muted-foreground">Important to you</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentCount}</div>
            <p className="text-xs text-muted-foreground">High priority</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Filter Announcements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter</label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_OPTIONS.map(option => (
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
              Showing {filteredAnnouncements.length} of {announcements.length} announcements
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setSearchTerm('');
                setFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map(announcement => (
          <Card 
            key={announcement.id} 
            className={`${!announcement.read ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''} transition-colors`}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className={`text-lg ${!announcement.read ? 'font-bold' : ''}`}>
                      {announcement.title}
                    </CardTitle>
                    {!announcement.read && (
                      <Badge variant="default" className="text-xs">
                        New
                      </Badge>
                    )}
                    <Badge 
                      className={`text-xs border ${PRIORITY_COLORS[announcement.priority]}`}
                    >
                      {PRIORITY_LABELS[announcement.priority]}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(announcement.created_at)}
                    </span>
                    <span>From: {announcement.created_by}</span>
                    <span>{getAudienceLabel(announcement.target_audience)}</span>
                    {announcement.send_notification && (
                      <Badge variant="secondary" className="text-xs">
                        <Bell className="h-3 w-3 mr-1" />
                        Push Sent
                      </Badge>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {getTimeAgo(announcement.created_at)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStar(announcement.id)}
                    className={announcement.starred ? 'text-yellow-500' : ''}
                  >
                    <Star 
                      className={`h-4 w-4 ${announcement.starred ? 'fill-current' : ''}`} 
                    />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={`leading-relaxed ${!announcement.read ? 'font-medium' : ''}`}>
                {announcement.content}
              </p>
              
              {!announcement.read && (
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleMarkAsRead(announcement.id)}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No announcements found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || filter !== 'all'
                ? 'Try adjusting your search criteria'
                : 'New announcements will appear here when posted by school staff.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => setFilter('unread')}
            >
              <Bell className="h-6 w-6 mb-2" />
              View Unread
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => setFilter('starred')}
            >
              <Star className="h-6 w-6 mb-2" />
              View Starred
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => setFilter('high_priority')}
            >
              <MessageCircle className="h-6 w-6 mb-2" />
              Urgent Only
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => {
                // Mark all as read
                setAnnouncements(prev => prev.map(a => ({ ...a, read: true })));
              }}
            >
              <Archive className="h-6 w-6 mb-2" />
              Mark All Read
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}