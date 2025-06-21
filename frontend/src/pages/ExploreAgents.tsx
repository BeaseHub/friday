
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, Minus, ShoppingCart, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { addAgent, removeAgent } from '@/store/slices/subscriptionSlice';

const agents = [
  {
    id: '1',
    name: 'Productivity Pro',
    price: 8,
    description: 'Your personal assistant for organization and efficiency',
    keyFeature: 'Smart task prioritization',
    category: 'Productivity',
    features: ['Calendar integration', 'Automated reminders', '+3 more features'],
    languages: ['English', 'Spanish', 'French', '+2 more']
  },
  {
    id: '2',
    name: 'Creative Canvas',
    price: 12,
    description: 'Unleash your creativity with AI-powered inspiration',
    keyFeature: 'Idea generation',
    category: 'Creativity',
    features: ['Style exploration', 'Reference collection', '+3 more features'],
    languages: ['English', 'Spanish', 'French', '+2 more']
  },
  {
    id: '3',
    name: 'Finance Advisor',
    price: 15,
    description: 'Smart financial insights and budgeting recommendations',
    keyFeature: 'Real-time reporting',
    category: 'Finance',
    features: ['Budget analysis', 'Investment advice', '+3 more features'],
    languages: ['English', 'Spanish', 'French', '+2 more']
  },
  {
    id: '4',
    name: 'Learning Companion',
    price: 10,
    description: 'Personalized learning and educational support',
    keyFeature: 'Adaptive learning paths',
    category: 'Education',
    features: ['Progress tracking', 'Custom curricula', '+3 more features'],
    languages: ['English', 'Spanish', 'French', '+2 more']
  }
];

const ExploreAgents = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSubscriptionView = searchParams.get('subscription') === 'true';
  const { selectedAgents, activePlans } = useAppSelector((state) => state.subscription);
  const { currentLanguage } = useAppSelector((state) => state.language);
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedAgentDetails = agents.filter(agent => selectedAgents.includes(agent.id));
  const totalPrice = selectedAgentDetails.reduce((sum, agent) => sum + agent.price, 0);

  const toggleAgent = (agentId: string) => {
    if (selectedAgents.includes(agentId)) {
      dispatch(removeAgent(agentId));
    } else {
      dispatch(addAgent(agentId));
    }
  };

  const handleProceed = () => {
    if (selectedAgents.length > 0) {
      navigate('/summary');
    }
  };

  const isAgentActive = (agentId: string) => {
    return activePlans.some(plan => plan.id === agentId && plan.isActive);
  };

  const translations = {
    en: {
      backButton: 'Back',
      selectAgents: 'Select Your AI Assistants',
      manageSubscription: 'Manage Your Subscriptions',
      selectUpTo: 'Choose up to 2 agents for your plan.',
      viewActive: 'View and manage your active subscriptions below.',
      searchPlaceholder: 'Search assistants...',
      active: 'ACTIVE',
      agentsSelected: 'agents selected',
      continue: 'Continue',
      addMore: 'Add More Agents'
    },
    fr: {
      backButton: 'Retour',
      selectAgents: 'Sélectionnez vos Assistants IA',
      manageSubscription: 'Gérer vos Abonnements',
      selectUpTo: 'Choisissez jusqu\'à 2 agents pour votre plan.',
      viewActive: 'Consultez et gérez vos abonnements actifs ci-dessous.',
      searchPlaceholder: 'Rechercher des assistants...',
      active: 'ACTIF',
      agentsSelected: 'agents sélectionnés',
      continue: 'Continuer',
      addMore: 'Ajouter plus d\'Agents'
    }
  };

  const t = translations[currentLanguage];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.backButton}
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-amber-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">Friday</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSubscriptionView ? t.manageSubscription : t.selectAgents}
          </h1>
          <p className="text-gray-600 mb-6">
            {isSubscriptionView ? t.viewActive : t.selectUpTo}
          </p>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {filteredAgents.map((agent) => {
            const isSelected = selectedAgents.includes(agent.id);
            const isActive = isAgentActive(agent.id);
            const isDisabled = isSubscriptionView && isActive;
            
            return (
              <Card key={agent.id} className={`bg-white border transition-all duration-300 ${
                isSelected ? 'border-orange-400 ring-2 ring-orange-100' : 
                isActive ? 'border-green-400 ring-2 ring-green-100' : 
                'border-gray-200 hover:border-orange-200'
              } ${isDisabled ? 'opacity-75' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        agent.category === 'Productivity' ? 'bg-blue-100' :
                        agent.category === 'Creativity' ? 'bg-purple-100' :
                        agent.category === 'Finance' ? 'bg-green-100' :
                        'bg-gray-100'
                      }`}>
                        <div className={`w-6 h-6 rounded-full ${
                          agent.category === 'Productivity' ? 'bg-blue-500' :
                          agent.category === 'Creativity' ? 'bg-purple-500' :
                          agent.category === 'Finance' ? 'bg-green-500' :
                          'bg-gray-500'
                        }`}></div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-gray-900 text-lg">{agent.name}</CardTitle>
                          {isActive && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                              {t.active}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-orange-600 font-medium">{agent.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">${agent.price}/mo</div>
                      {!isDisabled && (
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
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{agent.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Key Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        {agent.features.map((feature, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            ⭐ {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600">Languages supported: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {agent.languages.map((lang, index) => (
                          <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                    <p className="text-orange-700 text-sm font-medium">✨ {agent.keyFeature}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Cart Summary */}
        {selectedAgents.length > 0 && !isSubscriptionView && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 shadow-lg">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-900 font-medium">
                    {selectedAgents.length} {t.agentsSelected}
                  </span>
                </div>
                <div className="text-orange-600 font-bold text-xl">
                  ${totalPrice}/month
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="hidden sm:flex flex-wrap gap-2 max-w-md">
                  {selectedAgentDetails.slice(0, 2).map((agent) => (
                    <span key={agent.id} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                      {agent.name}
                    </span>
                  ))}
                  {selectedAgentDetails.length > 2 && (
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                      +{selectedAgentDetails.length - 2} more
                    </span>
                  )}
                </div>
                
                <Button
                  onClick={handleProceed}
                  className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white px-6 py-2"
                >
                  {t.continue}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Add More Agents for Subscription View */}
        {isSubscriptionView && selectedAgents.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 shadow-lg">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-900 font-medium">
                    {selectedAgents.length} new {t.agentsSelected}
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
        )}
      </main>
    </div>
  );
};

export default ExploreAgents;
