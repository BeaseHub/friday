import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Computer, Brain, MessageSquare, Search, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { useAppSelector,useAppDispatch } from '@/hooks/useRedux';
import {getActiveSubscriptionsByUser} from '@/api/subscriptionApi';

const animatedTexts = [
  "Multipliez vos revenus par 10",
  "Travaillez plus efficacement", 
  "Automatisez vos processus",
  "Optimisez votre productivité"
];

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const dispatch = useAppDispatch();
  const [userAgents, setUserAgents] = useState([]);

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

    fetchAgents();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-orange-700 via-orange-800 to-red-900" style={{background: 'linear-gradient(to bottom right, #D2840C, #B8740A, #A0630A)'}}>
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        {/* Upper Content - Centered vertically with text wrapping */}
        <div className="flex flex-col items-center justify-center text-center mb-24">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white font-medium">IA Révolutionnaire</span>
          </div>
          
          {/* Animated Text with wrapping */}
          <div className="mb-6 w-full max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight break-words">
              <span>{displayedText}<span className="animate-pulse">|</span></span>
            </h1>
          </div>
          
          {/* Static Text */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl">
            Transformez votre activité avec la première Équipe IA Business du pays
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
              Aller à l'espace de travail
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
              Explorer les assistants
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Features Section - Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <Computer className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Agents Spécialisés</h3>
            <p className="text-white/80">Des IA expertes dans chaque domaine de votre entreprise</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <Brain className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Intelligence Avancée</h3>
            <p className="text-white/80">Technologies d'IA de pointe pour maximiser vos résultats</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <MessageSquare className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Interface Intuitive</h3>
            <p className="text-white/80">Communiquez naturellement avec vos agents IA</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;