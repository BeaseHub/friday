import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Header from "@/components/Header";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { clearAgents } from "@/store/slices/agentSlice";
import AuthModal from "@/components/AuthModal";
import { useToast } from "@/hooks/use-toast";
import { createSubscription } from "@/api/subscriptionApi";

const Summary = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { selectedAgents } = useAppSelector((state) => state.agent);
  const { selectedPlan } = useAppSelector((state) => state.plan);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const totalPrice = Array.isArray(selectedAgents)
    ? selectedAgents.reduce((sum, agent) => sum + agent.price, 0)
    : 0;

  const handlePayment = async () => {
    if (!isAuthenticated) {
      setAuthMode("login");
      setAuthModalOpen(true);
      return;
    }

    setProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // Call API to create subscription
      const result = await createSubscription({
        plan_id: Number(selectedPlan.id),
        agent_ids: selectedAgents.map((agent) => Number(agent.id)),
      });
    } catch (error) {
      console.error("Payment failed:", error);
      toast({
        title: "Erreur de paiement",
        description:
          "Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer.",
        variant: "destructive",
      });
      setProcessing(false);
      return;
    }

    toast({
      title: "Paiement réussi!",
      description:
        "Vos agents IA ont été activés. Bienvenue dans votre workspace!",
    });

    dispatch(clearAgents());
    navigate("/workspace");
    // After payment, user navigate to a new page, so the component unmounts and the state is reset.
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    // After successful auth, automatically proceed with payment
    handlePayment();
  };

  if (selectedAgents.length === 0) {
    return (
      <div
        className="min-h-screen"
        style={{
          background:
            "linear-gradient(to bottom right, #D2840C, #B8740A, #A0630A)",
        }}
      >
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              Aucun agent sélectionné
            </h1>
            <p className="text-white/80 mb-8">
              Retournez à la page d'exploration pour choisir vos agents IA.
            </p>
            <Button
              onClick={() => navigate("/explore")}
              className="bg-white hover:bg-orange-50"
              style={{ color: "#D2840C" }}
            >
              Explorer les agents
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <div
        className="min-h-screen"
        style={{
          background:
            "linear-gradient(to bottom right, #D2840C, #B8740A, #A0630A)",
        }}
      >
        <Header />

        <main className="container mx-auto px-6 py-8">
          <div className="mb-6">
            <Button
              onClick={() => navigate("/explore")}
              variant="ghost"
              className="text-white hover:bg-white/20 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'exploration
            </Button>

            <h1 className="text-3xl font-bold text-white mb-2">
              Résumé de votre souscription
            </h1>
            <p className="text-white/80">
              Vérifiez vos agents sélectionnés de valider
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Selected Agents */}
            <div className="lg:col-span-2 space-y-4">
              {selectedAgents.map((agent) => (
                <Card
                  key={agent.id}
                  className="bg-white/10 backdrop-blur-sm border-white/20"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">
                          {agent.name}
                        </CardTitle>
                        <CardDescription className="text-white/80">
                          {agent.description}
                        </CardDescription>
                      </div>
                      {/* <div className="text-white font-bold text-xl">
                        {agent.price}€/mois
                      </div> */}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {agent.feature_list.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-white" />
                          <span className="text-white/80 text-sm">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 sticky top-8">
                <CardHeader>
                  <CardTitle className="text-white">
                    Résumé de la souscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {selectedAgents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex justify-between items-center"
                      >
                        <span className="text-white/80">{agent.name}</span>
                        {/* <span className="text-white">{agent.price}€</span> */}
                      </div>
                    ))}
                  </div>

                  {/* <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-white">Total mensuel</span>
                      <span className="text-white">{totalPrice}€</span>
                    </div>
                  </div> */}

                  {selectedPlan &&
                    selectedPlan.feature_list &&
                    selectedPlan.feature_list.length > 0 && (
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-2 mb-4">
                        <div className="font-semibold text-white mb-2">
                          Fonctionnalités du plan :
                        </div>
                        {selectedPlan.feature_list.map(
                          (feature: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-white" />
                              <span className="text-white/80 text-sm">
                                {feature}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}

                  <Button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-white hover:bg-orange-50 flex items-center gap-2"
                    style={{ color: "#D2840C" }}
                  >
                    {/* <CreditCard className="w-4 h-4" /> */}
                    {/* {processing ? 'Traitement...' : `Payer ${totalPrice}€/mois`} */}
                    {processing ? "Traitement..." : `Valider la souscription`}
                  </Button>

                  <p className="text-xs text-white/60 text-center">
                    En continuant, vous acceptez nos conditions d'utilisation et
                    notre politique de confidentialité.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onToggleMode={() =>
          setAuthMode(authMode === "login" ? "signup" : "login")
        }
      />
    </>
  );
};

export default Summary;
