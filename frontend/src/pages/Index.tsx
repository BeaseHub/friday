import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Computer, Brain, MessageSquare, Search, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { useAppSelector,useAppDispatch } from '@/hooks/useRedux';
import {getActiveSubscriptionsByUser} from '@/api/subscriptionApi';
import { useTranslation } from 'react-i18next';


const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated,user } = useAppSelector((state) => state.auth);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const dispatch = useAppDispatch();
  const [userAgents, setUserAgents] = useState([]);
  const { t} = useTranslation();

  const animatedTexts = [
    t("heroTitle1"),
    t("heroTitle2"),
    t("heroTitle3"),
    t("heroTitle4")
  ];

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const userSubscriptions = await getActiveSubscriptionsByUser();
        const userSubscription = userSubscriptions?.[0] || null;
        setUserAgents(userSubscription?.agents || []);
        console.log("User Agents:", userSubscription?.agents);
      } catch (error) {
        setUserAgents([]);
      }
    };

    if (user) {
      fetchAgents(); // 👈 Refetch when user updates
    }
  }, [user]);

  useEffect(() => {
    const currentText = animatedTexts[currentTextIndex];

    if (charIndex < currentText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(currentText.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 50);

      return () => clearTimeout(timeout);
    } else {
      const delay = setTimeout(() => {
        setCharIndex(0);
        setDisplayedText('');
        setCurrentTextIndex((prev) => (prev + 1) % animatedTexts.length);
      }, 2000);
      return () => clearTimeout(delay);
    }
  }, [charIndex, currentTextIndex]);

  const handleWorkspaceClick = () => {
    console.log("user agents ",userAgents);
    if (isAuthenticated && userAgents.length > 0) {
      navigate('/workspace');
    } else {
      navigate('/explore');
    }
  };

  const handleExploreClick = () => {
    navigate('/explore');
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to right, black, #686464)' }}>
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        {/* Upper Content - Centered vertically with text wrapping */}
        <div className="flex flex-col items-center justify-center text-center mb-24">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white font-medium">{t("heroTagline")}</span>
          </div>
          
          {/* Animated Text with wrapping */}
          <div className="mb-6 w-full max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight break-words">
              <span>{displayedText}<span className="animate-pulse">|</span></span>
            </h1>
          </div>
          
          {/* Static Text */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl">
            {t("heroSubtitle")}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleWorkspaceClick}
              className="text-lg font-semibold rounded-lg transition-all transform hover:scale-105 flex items-center gap-2"
              style={{backgroundColor: 'white', color: '#D2840C'}}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f8f8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
               {t("goToWorkspace")}
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            <Button
              onClick={handleExploreClick}
              variant="outline"
              className="border-white text-white hover:bg-white px-8 py-4 text-lg font-semibold rounded-lg transition-all transform hover:scale-105 flex items-center gap-2"
              style={{'--hover-text-color': '#D2840C'} as React.CSSProperties}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#D2840C';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'white';
              }}
            >
              {t("exploreAssistants")}
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Features Section - Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <Computer className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{t("featureAgentsTitle")}</h3>
            <p className="text-white/80">{t("featureAgentsDesc")}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <Brain className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{t("featureAIpowerTitle")}</h3>
            <p className="text-white/80">{t("featureAIpowerDesc")}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <MessageSquare className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{t("featureUIUXTitle")}</h3>
            <p className="text-white/80">{t("featureUIUXDesc")}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;