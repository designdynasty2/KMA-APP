import { Home, BookOpen, Camera, MessageSquare, User } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User as UserType } from '../App';

interface MobileBottomNavProps {
  user: UserType;
  currentSection: string;
  onSectionChange: (section: string) => void;
  notificationCounts?: {
    announcements?: number;
    gallery?: number;
  };
}

export function MobileBottomNav({ 
  user, 
  currentSection, 
  onSectionChange,
  notificationCounts = {} 
}: MobileBottomNavProps) {
  // Bottom navigation items based on user role
  const getBottomNavItems = () => {
    if (['admin', 'principal', 'lead'].includes(user.role)) {
      return [
        { id: 'dashboard', label: 'Home', icon: Home },
        { id: 'study-materials', label: 'Materials', icon: BookOpen },
        { id: 'classrooms', label: 'Classes', icon: Camera },
        { id: 'announcements', label: 'News', icon: MessageSquare, badge: notificationCounts.announcements },
        { id: 'profile', label: 'Profile', icon: User },
      ];
    } else if (['lead_teacher', 'sub_teacher'].includes(user.role)) {
      return [
        { id: 'dashboard', label: 'Home', icon: Home },
        { id: 'study-materials', label: 'Materials', icon: BookOpen },
        { id: 'gallery', label: 'Gallery', icon: Camera },
        { id: 'time-tracking', label: 'Time', icon: MessageSquare },
        { id: 'profile', label: 'Profile', icon: User },
      ];
    } else {
      return [
        { id: 'dashboard', label: 'Home', icon: Home },
        { id: 'child-reports', label: 'Reports', icon: BookOpen },
        { id: 'gallery', label: 'Gallery', icon: Camera, badge: notificationCounts.gallery },
        { id: 'announcements', label: 'News', icon: MessageSquare, badge: notificationCounts.announcements },
        { id: 'profile', label: 'Profile', icon: User },
      ];
    }
  };

  const bottomNavItems = getBottomNavItems();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      {/* Safe area padding for devices with home indicator */}
      <div className="pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {bottomNavItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => onSectionChange(item.id)}
                className={`flex-1 flex flex-col items-center gap-1 h-auto py-2 px-1 relative mobile-touch-target ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <div className="relative">
                  <IconComponent className="h-5 w-5" />
                  {item.badge && item.badge > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium truncate max-w-full">
                  {item.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
      
      {/* Add safe area styles */}
      <style jsx>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </nav>
  );
}