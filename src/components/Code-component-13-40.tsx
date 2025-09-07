import { useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, X, Home, User, BookOpen, Camera, MessageSquare, Calendar, Users, Settings, LogOut } from 'lucide-react';
import { User as UserType } from '../App';

interface MobileNavigationProps {
  user: UserType;
  currentSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

export function MobileNavigation({ user, currentSection, onSectionChange, onLogout }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Navigation items based on user role
  const getNavigationItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'profile', label: 'Profile', icon: User },
    ];

    if (['admin', 'principal', 'lead'].includes(user.role)) {
      return [
        ...commonItems,
        { id: 'study-materials', label: 'Study Materials', icon: BookOpen },
        { id: 'teachers', label: 'Teachers', icon: Users },
        { id: 'classrooms', label: 'Classrooms', icon: Calendar },
        { id: 'time-management', label: 'Time Tracking', icon: Calendar },
        { id: 'announcements', label: 'Announcements', icon: MessageSquare },
        { id: 'settings', label: 'Settings', icon: Settings },
      ];
    } else if (['lead_teacher', 'sub_teacher'].includes(user.role)) {
      return [
        ...commonItems,
        { id: 'study-materials', label: 'Study Materials', icon: BookOpen },
        { id: 'gallery', label: 'Gallery Upload', icon: Camera },
        { id: 'time-tracking', label: 'Time Tracking', icon: Calendar },
      ];
    } else {
      return [
        ...commonItems,
        { id: 'child-reports', label: 'Child Reports', icon: BookOpen },
        { id: 'gallery', label: 'Gallery', icon: Camera },
        { id: 'announcements', label: 'Announcements', icon: MessageSquare },
        { id: 'study-materials', label: 'Study Materials', icon: BookOpen },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const handleItemClick = (sectionId: string) => {
    onSectionChange(sectionId);
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="mobile-touch-target">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b bg-primary text-primary-foreground">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Montessori School</h2>
                  <p className="text-sm opacity-90 capitalize">{user.role} Dashboard</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-primary-foreground hover:bg-primary-foreground/20 mobile-touch-target"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* User Info */}
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto py-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors mobile-touch-target ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t">
              <Button
                variant="outline"
                onClick={onLogout}
                className="w-full justify-start gap-3 mobile-touch-target"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}