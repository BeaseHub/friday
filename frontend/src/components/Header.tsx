
import React, { useState } from 'react';
import { Bell, User, Globe } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { logout } from '@/store/slices/authSlice';
import { setLanguage } from '@/store/slices/languageSlice';
import { clearSelectedAgents } from '@/store/slices/subscriptionSlice';
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

const Header = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { currentLanguage } = useAppSelector((state) => state.language);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    // Clear user data and selected agents on logout
    dispatch(logout());
    dispatch(clearSelectedAgents());
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
    dispatch(setLanguage(newLanguage));
  };

  const translations = {
    en: {
      subscriptions: 'Subscriptions',
      language: 'Language',
      logout: 'Logout',
      login: 'Login',
      signUp: 'Sign Up'
    },
    fr: {
      subscriptions: 'Abonnements',
      language: 'Langue',
      logout: 'Déconnexion',
      login: 'Connexion',
      signUp: 'S\'inscrire'
    }
  };

  const t = translations[currentLanguage];

  return (
    <>
      <header className="flex items-center justify-between p-6 bg-transparent backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="text-2xl font-bold text-white">Friday</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative hover:bg-white/20 text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-white rounded-full"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/20">
                {user ? (
                  user.profilePic ? (
                    <img 
                      src={user.profilePic} 
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
                    onClick={handleSubscriptionsClick}
                    className="text-gray-700 hover:bg-orange-50 hover:text-orange-800"
                  >
                    {"Update information"}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleSubscriptionsClick}
                    className="text-gray-700 hover:bg-orange-50 hover:text-orange-800"
                  >
                    {"Change password"}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    // onClick={handleSubscriptionsClick}
                    className="text-gray-700 hover:bg-orange-50 hover:text-orange-800"
                  >
                    {t.subscriptions}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleLanguageChange}
                    className="text-gray-700 hover:bg-orange-50 hover:text-orange-800"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    {t.language}: {currentLanguage.toUpperCase()}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                  >
                    {t.logout}
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem 
                    onClick={() => handleAuthClick('login')}
                    className="text-gray-700 hover:bg-orange-50 hover:text-orange-800"
                  >
                    {t.login}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleAuthClick('signup')}
                    className="text-gray-700 hover:bg-orange-50 hover:text-orange-800"
                  >
                    {t.signUp}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem 
                    onClick={handleLanguageChange}
                    className="text-gray-700 hover:bg-orange-50 hover:text-orange-800"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    {t.language}: {currentLanguage.toUpperCase()}
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
