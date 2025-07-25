
import React, { useState, useEffect, act } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, Minus, ShoppingCart, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setPlans,setSelectedPlan,clearPlans } from '@/store/slices/planSlice';
import { setAgents, setFilteredAgents, setSelectedAgents,addSelectedAgent, removeSelectedAgent, clearAgents } from '@/store/slices/agentSlice';
import {
  setSubscriptions,
  setActiveSubscription,
  removeActiveSubscription,
  addSubscription,
  removeSubscription,
  clearSubscriptions
}  from '@/store/slices/subscriptionSlice';
import { getActiveAgents,getAgentById } from '@/api/agentApi';
import { getActivePlans } from '@/api/planApi';
import { getActiveSubscriptionsByUser } from '@/api/subscriptionApi';

import AuthModal from '@/components/AuthModal';
import { useToast } from '@/hooks/use-toast';
import {createSubscription} from '@/api/subscriptionApi';
import { useTranslation } from 'react-i18next';



const ExploreAgents = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSubscriptionView = searchParams.get('subscription') === 'true';
  const {plans,selectedPlan} = useAppSelector((state) => state.plan);
  const { agents,filteredAgents, selectedAgents} = useAppSelector((state) => state.agent);  
  const { currentLanguage } = useAppSelector((state) => state.language);
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { t } = useTranslation();


  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const plans= await getActivePlans();
        dispatch(setPlans(plans || []));
        dispatch(setSelectedPlan(plans[0] || null));

        const agents = await getActiveAgents();
        dispatch(setAgents(agents || []));

        //setselectedagents based on the agents in the subscriptions if the user is connected
        const auth = localStorage.getItem('auth');
        if (!auth) {
          dispatch(setSelectedAgents(agents));
          return;
        };
        const token = JSON.parse(auth)?.user?.token;
        const activeSubscriptions  = await getActiveSubscriptionsByUser();
        const activeSubscription = activeSubscriptions ?.[0] || null;

        dispatch(setActiveSubscription(activeSubscription));
        console.log('Active subscription:', activeSubscription);
        // dispatch(setSelectedAgents(activeSubscription?.agents || [] ));
        dispatch(setSelectedAgents(agents || [] ));
      } catch (error) {
        // Optionally handle error (toast, etc.)
        dispatch(setAgents([]));
        dispatch(setFilteredAgents([]));
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  useEffect(() => {
    const filtered = agents.filter(agent =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    dispatch(setFilteredAgents(filtered));
  }, [searchTerm, agents, dispatch]);

  const totalPrice = selectedAgents.reduce((sum, agent) => sum + agent.price, 0);

  // const toggleAgent = (agentId: string) => {
  //   const isSelected = selectedAgents.some(agent => agent.id === agentId)
  //   if (isSelected) {
  //     dispatch(removeSelectedAgent(agentId));
  //   } else {
  //     // You must have access to the full agent object here
  //     const agent = agents.find(a => a.id === agentId);
  //     if (agent) {
  //       dispatch(addSelectedAgent(agent));
  //     }
  //   }
    
  // };

  // const handleProceed = () => {
  //   if (selectedAgents.length > 0) {
  //     navigate('/summary');
  //   }
  // };
  const handleProceed = async () => {
    if (selectedAgents.length > 0 && !isAuthenticated) {
      setAuthMode('login');
      setAuthModalOpen(true);
      return;
    }

    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Call API to create subscription
      const result= await createSubscription({
        plan_id: Number(selectedPlan.id),
        agent_ids: selectedAgents.map(agent => Number(agent.id))
      });
      
    } catch (error) {
      console.error("Activation  failed:", error);
      toast({
        title: "Erreur d'activation",
        description: "Une erreur est survenue lors de l'activation de votre espace. Veuillez réessayer.",
        variant: 'destructive',
      });
      setProcessing(false);
      return;
    }
    
    toast({
      title: "Bienvenue dans votre espace!",
      description: "Vos agents IA ont été activés. Bienvenue dans votre workspace!",
    });
    
    dispatch(clearAgents());
    navigate('/workspace');
    // After payment, user navigate to a new page, so the component unmounts and the state is reset.


  };

  const isAgentActive = (agentId: string) => {
    return agents.some(agent => agent.id === agentId && agent.is_active);
  };

  return (
    <>
      <div className="min-h-screen" style={{ background: '#F9F5F0' }}>
        {/* Header */}
        <header className="backdrop-blur-sm border-b shadow-sm"
          style={{ background: 'linear-gradient(to right, black, #686464)', borderColor: '#eca581' }}>
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => navigate('/')}
                  variant="ghost"
                  className="text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("backButton")}
                </Button>
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-amber-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">F</span>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">Friday</span>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-6 py-8 ">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("manageSubscription")}
            </h1>
            <p className="text-gray-600 mb-6">
              {t("viewActive")}
            </p>
            
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-32">
            {filteredAgents.map((agent) => {
              const isSelected = selectedAgents.some(a=> a.id === agent.id);
              const isActive = isAgentActive(agent.id);
              const isDisabled = false;
              
              return (
                <Card key={agent.id} className={`bg-white border transition-all duration-300 ${
                  isSelected ? 'border-orange-400 ring-2 ring-orange-100' : 
                  isActive ? 'border-green-400 ring-2 ring-green-100' : 
                  'border-gray-200 hover:border-orange-200'
                } ${isDisabled ? 'opacity-75' : ''}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100">
                          {agent.image_path ? (
                            <img
                              src={agent.image_path ? `${API_URL}/${agent.image_path.replace(/^\/+/, '')}` : ''} 
                              alt={agent.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-400"></div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-gray-900 text-lg">{agent.name}</CardTitle>
                            {isActive && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                                {t("active")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {/* <div className="text-2xl font-bold text-gray-900">${agent.price}/mo</div> */}
                        {/* {!isDisabled && (
                          <Button
                            onClick={() => toggleAgent(agent.id)}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className={isSelected 
                              ? "bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white border-0" 
                              : "border-orange-300 text-orange-600 hover:bg-orange-50"
                            }
                          >
                            {isSelected ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          </Button>
                        )}
                        {isDisabled && (
                          <div className="mt-2">
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          </div>
                        )} */}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{agent.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t("keyFeatures")}</h4>
                        <div className="flex flex-wrap gap-1">
                          {agent.feature_list.map((feature, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              ⭐ {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Cart Summary */}
          {selectedAgents.length > 0  && (
            <div  className="fixed bottom-0 left-0 right-0 p-6 shadow-lg"
              style={{ 
                background: 'linear-gradient(to right, black, #686464)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)' // subtle light border for contrast
              }}>
              <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {/* <ShoppingCart className="w-5 h-5 text-orange-500" /> */}
                    <span className="text-white font-medium">
                      {selectedAgents.length} {t("agentsAvailable")}
                    </span>
                  </div>
                  {/* <div className="text-orange-600 font-bold text-xl">
                    ${totalPrice}/month
                  </div> */}
                </div>
                
                <div className="flex gap-3">
                  <div className="hidden sm:flex flex-wrap gap-2 max-w-md">
                    {selectedAgents.slice(0, 2).map((agent) => (
                      <span 
                        key={agent.id} 
                        className="text-orange-700 px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: '#F9F5F0' }}
                      >
                        {agent.name}
                      </span>
                    ))}
                    {selectedAgents.length > 2 && (
                      <span 
                        className="text-orange-700 px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: '#F9F5F0' }}
                      >
                        +{selectedAgents.length - 2} {t("more")}
                      </span>
                    )}
                  </div>
                  
                  <Button
                    onClick={handleProceed}
                    disabled={processing}
                    className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white px-6 py-2"
                  >
                    {processing ? t("processing") : t("workspaceAccess")}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Add More Agents for Subscription View */}
          {/* {isSubscriptionView && selectedAgents.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 shadow-lg">
              <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-900 font-medium">
                      {selectedAgents.length} new {t.agentsAvailable}
                    </span>
                  </div>
                  <div className="text-orange-600 font-bold text-xl">
                    ${totalPrice}/month additional
                  </div>
                </div>
                
                <Button
                  onClick={handleProceed}
                  className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white px-6 py-2"
                >
                  {t.addMore}
                </Button>
              </div>
            </div>
          )} */}
        </main>
      </div>

      <AuthModal 
          open={authModalOpen} 
          onClose={() => setAuthModalOpen(false)} 
          mode={authMode}
          onToggleMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
        />
      </>
  );
};

export default ExploreAgents;
