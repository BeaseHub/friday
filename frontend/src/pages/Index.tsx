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
  const dispatch = useAppDispatch();
  const [userAgents, setUserAgents] = useState([]);

  useEffect(() => {
    // Animated text interval
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % animatedTexts.length);
    }, 4000);

    // Fetch agents for user subscriptions
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

    // Cleanup
    return () => clearInterval(interval);
  }, []);


  const handleWorkspaceClick = () => {
    // Redirect to workspace if authenticated and user has at least one agent
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white font-medium">IA Révolutionnaire</span>
            </div>
            
            {/* Animated Text */}
            <div className="mb-6">
              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                <span 
                  key={currentTextIndex}
                  className="block animate-fade-in"
                >
                  {animatedTexts[currentTextIndex]}
                </span>
              </h1>
            </div>
            
            {/* Static Text */}
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
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
          
          {/* Right Content - Friday Character with Sparks */}
          <div className="relative flex justify-center">
            <div className="relative">
              {/* Main Character */}
              <div className="w-80 h-80 relative">
                <img
                  src="/lovable-uploads/720676f9-5147-4b32-be13-a2a317bb7f0e.png"
                  alt="Friday - AI Manager"
                  className="w-full h-full object-cover animate-pulse"
                />
                
                {/* Animated Sparks around Friday */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Spark 1 - Top Right */}
                  <Sparkles 
                    className="absolute top-8 right-8 w-4 h-4 text-white animate-ping" 
                    style={{ animationDelay: '0s', animationDuration: '2s' }}
                  />
                  <Sparkles 
                    className="absolute top-12 right-12 w-3 h-3 text-orange-200 animate-pulse" 
                    style={{ animationDelay: '0.5s', animationDuration: '3s' }}
                  />
                  
                  {/* Spark 2 - Top Left */}
                  <Sparkles 
                    className="absolute top-16 left-8 w-5 h-5 text-yellow-200 animate-ping" 
                    style={{ animationDelay: '1s', animationDuration: '2.5s' }}
                  />
                  <Sparkles 
                    className="absolute top-6 left-16 w-3 h-3 text-white animate-pulse" 
                    style={{ animationDelay: '1.8s', animationDuration: '2s' }}
                  />
                  
                  {/* Spark 3 - Middle Right */}
                  <Sparkles 
                    className="absolute top-1/2 right-4 w-4 h-4 text-orange-300 animate-ping" 
                    style={{ animationDelay: '2.2s', animationDuration: '3s' }}
                  />
                  <Sparkles 
                    className="absolute top-1/3 right-2 w-2 h-2 text-white animate-pulse" 
                    style={{ animationDelay: '0.8s', animationDuration: '2.5s' }}
                  />
                  
                  {/* Spark 4 - Bottom Left */}
                  <Sparkles 
                    className="absolute bottom-16 left-12 w-4 h-4 text-yellow-300 animate-ping" 
                    style={{ animationDelay: '3s', animationDuration: '2s' }}
                  />
                  <Sparkles 
                    className="absolute bottom-8 left-6 w-3 h-3 text-orange-200 animate-pulse" 
                    style={{ animationDelay: '2.5s', animationDuration: '3.5s' }}
                  />
                  
                  {/* Spark 5 - Bottom Right */}
                  <Sparkles 
                    className="absolute bottom-20 right-16 w-5 h-5 text-white animate-ping" 
                    style={{ animationDelay: '1.5s', animationDuration: '2.8s' }}
                  />
                  <Sparkles 
                    className="absolute bottom-12 right-20 w-2 h-2 text-yellow-200 animate-pulse" 
                    style={{ animationDelay: '3.2s', animationDuration: '2.2s' }}
                  />
                  
                  {/* Additional floating sparks */}
                  <Sparkles 
                    className="absolute top-1/4 left-1/4 w-3 h-3 text-orange-100 animate-ping" 
                    style={{ animationDelay: '4s', animationDuration: '3s' }}
                  />
                  <Sparkles 
                    className="absolute top-3/4 right-1/3 w-4 h-4 text-white animate-pulse" 
                    style={{ animationDelay: '2.8s', animationDuration: '2.5s' }}
                  />
                </div>
              </div>
              
              {/* Manager Label */}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <div className="relative">
                  <div 
                    className="bg-gradient-to-r from-white/95 via-white/90 to-white/95 backdrop-blur-md px-8 py-4 shadow-2xl"
                    style={{
                      clipPath: 'polygon(20% 0%, 80% 0%, 100% 30%, 95% 70%, 80% 100%, 20% 100%, 5% 70%, 0% 30%)',
                      minWidth: '320px',
                      color: '#D2840C'
                    }}
                  >
                    <div className="text-center">
                      <span className="text-sm font-semibold tracking-wide">
                        Voici Friday, la manager de cette Équipe IA
                      </span>
                    </div>
                  </div>
                  
                  <div 
                    className="absolute inset-0 blur-sm -z-10"
                    style={{
                      clipPath: 'polygon(20% 0%, 80% 0%, 100% 30%, 95% 70%, 80% 100%, 20% 100%, 5% 70%, 0% 30%)',
                      minWidth: '320px',
                      background: 'linear-gradient(to right, rgba(210, 132, 12, 0.2), rgba(210, 132, 12, 0.3), rgba(210, 132, 12, 0.2))'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
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
