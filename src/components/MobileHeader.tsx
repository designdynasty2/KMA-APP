import { Bell, Search, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MobileNavigation } from './MobileNavigation';
import { User } from '../App';
import { usePWA } from '../hooks/usePWA';

interface MobileHeaderProps {
  user: User;
  title: string;
  currentSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
  showSearch?: boolean;
  onSearchClick?: () => void;
  showShare?: boolean;
  onShareClick?: () => void;
}

export function MobileHeader({
  user,
  title,
  currentSection,
  onSectionChange,
  onLogout,
  notificationCount = 0,
  onNotificationClick,
  showSearch = false,
  onSearchClick,
  showShare = false,
  onShareClick,
}: MobileHeaderProps) {
  const { capabilities, shareContent } = usePWA();

  const handleShare = async () => {
    if (onShareClick) {
      onShareClick();
      return;
    }

    // Default share behavior
    const shareData = {
      title: 'Montessori School Management',
      text: 'Check out this amazing Montessori school management app!',
      url: window.location.href,
    };

    const success = await shareContent(shareData);
    if (!success) {
      console.log('Share not supported or failed');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Navigation and Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <MobileNavigation
            user={user}
            currentSection={currentSection}
            onSectionChange={onSectionChange}
            onLogout={onLogout}
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold truncate">{title}</h1>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2">
          {/* Search button */}
          {showSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSearchClick}
              className="mobile-touch-target"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {/* Share button */}
          {(showShare || capabilities.canShare) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="mobile-touch-target"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          )}

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onNotificationClick}
            className="relative mobile-touch-target"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}