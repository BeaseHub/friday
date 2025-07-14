
import React, { useState, useEffect } from 'react';
import { Bell, User, Globe } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { logout,updateUser } from '@/store/slices/authSlice';
import { setLanguage } from '@/store/slices/languageSlice';
import { clearAgents } from '@/store/slices/agentSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import AuthModal from './AuthModal';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { currentLanguage } = useAppSelector((state) => state.language);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'update' | 'changePassword'>('login');
  const {t, i18n }=useTranslation();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleAuthClick = (mode: 'login' | 'signup' | 'update' | 'changePassword') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    // Clear user data and selected agents on logout
    dispatch(logout());
    dispatch(clearAgents());
  };

  const handleSubscriptionsClick = () => {
    if (!isAuthenticated) {
      handleAuthClick('login');
      return;
    }
    // Navigate to explore page with subscription=true to show user's active plans
    navigate('/explore?subscription=true');
  };

  const handleLanguageChange = () => {
    const newLanguage = currentLanguage === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(currentLanguage === 'en' ? 'fr' : 'en').then(() => {
      dispatch(setLanguage(newLanguage));
    });
  };

  // ...inside Header component, after hooks:
  useEffect(() => {
    if (!user) {
      const stored = localStorage.getItem('auth');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.user) {
            dispatch(updateUser(parsed.user));
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [user, dispatch]);


  const [notifications, setNotifications] = useState([
  {
    id: 1,
    title: "New message from Friday",
    message: "Click to open your latest conversation.",
    link: "/workspace",
     time: new Date().toISOString()  // or a fixed string for testing
  },
  {
    id: 2,
    title: "Subscription activated",
    message: "Your subscription to Pro Plan is now active.",
    link: "/explore?subscription=true",
    time: new Date().toISOString()
  },
  // Add more...
]);

  return (
    <>
      <header className="flex items-center justify-between p-6 bg-transparent backdrop-blur-sm">
        <div className="flex items-center space-x-2" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="text-2xl font-bold text-white">Friday</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-white/20 text-white">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-white rounded-full"></span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto bg-white border border-gray-200 shadow-lg">
              <div className="text-sm font-semibold px-4 py-2 border-b border-gray-100 text-gray-700">
                {t("notifications")}
              </div>

              {notifications.length === 0 ? (
                <div className="text-gray-500 px-4 py-4 text-sm">{t("noNotifications")}</div>
              ) : (
                notifications.slice(0, 5).map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    onClick={() => navigate(notif.link)}
                    className="flex flex-col items-start gap-1 text-sm text-left text-gray-700 hover:bg-orange-50 cursor-pointer px-4 py-2"
                  >
                    <div className="font-semibold text-gray-900 truncate w-full">
                      {notif.title}
                    </div>
                    <div className="text-gray-600 text-xs line-clamp-2 w-full overflow-hidden text-ellipsis break-words">
                      {notif.message}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1 self-end text-right">
                      {new Date(notif.time).toLocaleString()} {/* Or use date-fns format() */}
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/20">
                {user ? (
                  user.profilePicturePath ? (
                    <img 
                      src={user.profilePicturePath ? `${API_URL}/${user.profilePicturePath.replace(/^\/+/, '')}` : ''} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover border border-white/30"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                      <span className="text-white text-sm font-medium">{user.initials}</span>
                    </div>
                  )
                ) : (
                  <User className="h-5 w-5 text-white" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg">
              {isAuthenticated ? (
                <>
                  <div className="px-2 py-1.5 text-sm">
                    <div className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</div>
                    <div className="text-orange-700 text-xs">{user?.email}</div>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem 
                    onClick={() => handleAuthClick('update')}
                    className="text-gray-700 hover:bg-orange-50 hover:text-orange-800"
                  >
                    {t("updateInformation")}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleAuthClick('changePassword')}
                    className="text-gray-700 hover:bg-orange-50 hover:text-orange-800"
                  >
                    {t("changePassword")}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleSubscriptionsClick}
                    className="text-gray-700 hover:bg-orange-50 hover:text-orange-800"
                  >
                    {t("subscriptions")}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleLanguageChange}
                    className="text-gray-700 hover:bg-orange-50 hover:text-orange-800"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    {t("language")}: {currentLanguage.toUpperCase()}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                  >
                    {t("logout")}
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem 
                    onClick={() => handleAuthClick('login')}
                    className="text-gray-700 hover:bg-orange-50 hover:text-orange-800"
                  >
                    {t("login")}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleAuthClick('signup')}
                    className="text-gray-700 hover:bg-orange-50 hover:text-orange-800"
                  >
                    {t("signUp")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem 
                    onClick={handleLanguageChange}
                    className="text-gray-700 hover:bg-orange-50 hover:text-orange-800"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    {t("language")}: {currentLanguage.toUpperCase()}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <AuthModal 
        open={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        mode={authMode}
        onToggleMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
      />
    </>
  );
};

export default Header;
