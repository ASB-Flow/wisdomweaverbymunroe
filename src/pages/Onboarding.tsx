import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, ArrowRight, Check, User, Mail, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const steps = [
  { id: 1, title: 'Bienvenue', icon: BookOpen },
  { id: 2, title: 'Connexion', icon: User },
  { id: 3, title: 'Terminé', icon: Check },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    // Store admin session
    localStorage.setItem('teachingsHub_admin', JSON.stringify({
      email: formData.email,
      role: 'admin',
      loggedIn: true
    }));

    setCurrentStep(3);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      handleLogin();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-2xl bg-gold flex items-center justify-center mx-auto mb-8">
            <BookOpen className="w-10 h-10 text-navy" />
          </div>
          <h1 className="font-display text-4xl font-bold text-cream mb-4">
            Teachings Hub
          </h1>
          <p className="text-cream/70 text-lg">
            Espace administrateur pour gérer les enseignements de Myles Munroe.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 bg-cream rounded-l-3xl">
        {/* Progress Steps */}
        <div className="w-full max-w-md mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  currentStep >= step.id 
                    ? "bg-gold text-navy" 
                    : "bg-navy/10 text-navy/40"
                )}>
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div className={cn(
                    "w-16 md:w-24 h-1 mx-2 rounded-full transition-colors",
                    currentStep > step.id ? "bg-gold" : "bg-navy/10"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="w-full max-w-md">
          {currentStep === 1 && (
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold text-navy mb-4">
                Bienvenue, Administrateur
              </h2>
              <p className="text-navy/70 mb-8">
                Connectez-vous pour accéder à l'espace de gestion des enseignements.
              </p>
              <div className="bg-gold/10 rounded-2xl p-6 mb-8">
                <blockquote className="font-display text-lg text-navy italic">
                  "Tu ne deviens pas ce que tu entends, tu deviens ce que tu as stocké."
                </blockquote>
                <p className="text-navy/60 text-sm mt-2">— Myles Munroe</p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-navy mb-2">
                Connexion Admin
              </h2>
              <p className="text-navy/70 mb-8">
                Entrez vos identifiants administrateur.
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-navy">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy/40" />
                    <Input 
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="admin@teachingshub.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password" className="text-navy">Mot de passe</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy/40" />
                    <Input 
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="font-display text-3xl font-bold text-navy mb-4">
                Connexion réussie !
              </h2>
              <p className="text-navy/70 mb-8">
                Vous êtes maintenant connecté en tant qu'administrateur. 
                Accédez au dashboard pour gérer vos enseignements.
              </p>
            </div>
          )}

          {/* Navigation Button */}
          <div className="mt-8">
            <Button 
              variant="gold" 
              onClick={handleNext}
              disabled={isLoading}
              className="w-full gap-2"
            >
              {isLoading ? (
                'Connexion en cours...'
              ) : currentStep === 3 ? (
                <>Accéder au dashboard <ArrowRight className="w-4 h-4" /></>
              ) : currentStep === 2 ? (
                <>Se connecter <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Continuer <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
