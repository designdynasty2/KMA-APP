import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { MessageCircle, Send, Users, Calendar, Bell } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
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
  sent_to_count?: number;
}

interface AnnouncementCenterProps {
  user: User;
}

const PRIORITY_COLORS = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive'
} as const;

const TARGET_AUDIENCES = [
  { value: 'all_parents', label: 'All Parents (Current Year)' },
  { value: 'primary_parents', label: 'Primary Class Parents' },
  { value: 'toddler_parents', label: 'Toddler Class Parents' },
  { value: 'elementary_parents', label: 'Elementary Class Parents' },
  { value: 'new_parents', label: 'New Parents Only' }
];

export function AnnouncementCenter({ user }: AnnouncementCenterProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    target_audience: 'all_parents',
    send_notification: true
  });

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
      
      setAnnouncements(data.announcements || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const data = await demoApiCall(
        `https://${projectId}.supabase.co/functions/v1/make-server-e5c30ae9/announcements`,
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

      // Create new announcement for demo mode
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        ...formData,
        created_by: user.id,
        created_at: new Date().toISOString(),
        sent_to_count: getTargetAudienceCount(formData.target_audience)
      };
      
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        priority: 'medium',
        target_audience: 'all_parents',
        send_notification: true
      });
      
      setIsDialogOpen(false);
      toast.success('Announcement sent successfully to parents!');
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to send announcement');
    }
  }

  function getTargetAudienceCount(audience: string): number {
    const counts: Record<string, number> = {
      'all_parents': 156,
      'primary_parents': 85,
      'toddler_parents': 42,
      'elementary_parents': 29,
      'new_parents': 18
    };
    return counts[audience] || 0;
  }

  function getAudienceLabel(audience: string): string {
    const target = TARGET_AUDIENCES.find(t => t.value === audience);
    return target?.label || audience;
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Announcement Center</h2>
          <p className="text-muted-foreground">
            Send notifications to parents of current academic year
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <MessageCircle className="h-4 w-4 mr-2" />
              Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
              <DialogDescription>
                Send important updates to parents based on target audience
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Announcement Title</Label>
                <Input
                  id="title"
                  placeholder="Enter announcement title..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your announcement content here..."
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-32"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setFormData(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - General Info</SelectItem>
                      <SelectItem value="medium">Medium - Important</SelectItem>
                      <SelectItem value="high">High - Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_audience">Target Audience</Label>
                  <Select
                    value={formData.target_audience}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, target_audience: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_AUDIENCES.map(audience => (
                        <SelectItem key={audience.value} value={audience.value}>
                          {audience.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="send_notification"
                  checked={formData.send_notification}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, send_notification: checked }))
                  }
                />
                <Label htmlFor="send_notification">
                  Send push notification to parent devices
                </Label>
              </div>

              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    Will be sent to: {getTargetAudienceCount(formData.target_audience)} parents
                  </span>
                </div>
                {formData.send_notification && (
                  <Badge variant="secondary">
                    <Bell className="h-3 w-3 mr-1" />
                    Push Enabled
                  </Badge>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Send className="h-4 w-4 mr-2" />
                  Send Announcement
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
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
            <p className="text-xs text-muted-foreground">This academic year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {announcements.filter(a => 
                new Date(a.created_at).getMonth() === new Date().getMonth()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Announcements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {announcements.reduce((sum, a) => sum + (a.sent_to_count || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Parent notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {announcements.filter(a => a.priority === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">Urgent messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map(announcement => (
          <Card key={announcement.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    <Badge variant={PRIORITY_COLORS[announcement.priority]}>
                      {announcement.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {getAudienceLabel(announcement.target_audience)}
                    </span>
                    <span className="flex items-center">
                      <Send className="h-4 w-4 mr-1" />
                      Sent to {announcement.sent_to_count} parents
                    </span>
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge variant="outline">
                    {new Date(announcement.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Badge>
                  {announcement.send_notification && (
                    <Badge variant="secondary" className="text-xs">
                      <Bell className="h-3 w-3 mr-1" />
                      Push Sent
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{announcement.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {announcements.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No announcements yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first announcement to communicate with parents
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Create First Announcement
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}