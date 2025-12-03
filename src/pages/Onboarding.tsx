import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, ArrowRight, ArrowLeft, Check, User, Mail, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, title: 'Bienvenue', icon: BookOpen },
  { id: 2, title: 'Profil', icon: User },
  { id: 3, title: 'Objectifs', icon: Target },
  { id: 4, title: 'Terminé', icon: Check },
];

const objectives = [
  { id: 'creator', label: 'Créateur de contenu', description: 'Je veux créer des posts et vidéos à partir d\'enseignements' },
  { id: 'leader', label: 'Leader chrétien', description: 'Je veux approfondir ma compréhension des enseignements' },
  { id: 'student', label: 'Étudiant', description: 'Je veux étudier le leadership et la foi' },
  { id: 'community', label: 'Community Manager', description: 'Je gère les réseaux sociaux d\'une organisation' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    objectives: [] as string[],
  });

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleObjective = (id: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.includes(id) 
        ? prev.objectives.filter(o => o !== id)
        : [...prev.objectives, id]
    }));
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
            Transformez les enseignements de Myles Munroe en contenu impactant pour les réseaux sociaux.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 bg-cream rounded-l-3xl">
        {/* Progress Steps */}
        <div className="w-full max-w-md mb-8">
          <div className="flex items-center justify-between">
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
                    "w-12 md:w-20 h-1 mx-2 rounded-full transition-colors",
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
                Bienvenue sur Teachings Hub
              </h2>
              <p className="text-navy/70 mb-8">
                En quelques étapes, configurez votre espace pour extraire et partager 
                les enseignements les plus impactants.
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
                Créez votre profil
              </h2>
              <p className="text-navy/70 mb-8">
                Ces informations nous aident à personnaliser votre expérience.
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-navy">Nom complet</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy/40" />
                    <Input 
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Jean Dupont"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-navy">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy/40" />
                    <Input 
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="jean@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-navy mb-2">
                Vos objectifs
              </h2>
              <p className="text-navy/70 mb-8">
                Sélectionnez ce qui vous correspond le mieux (plusieurs choix possibles).
              </p>
              <div className="space-y-3">
                {objectives.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => toggleObjective(obj.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all",
                      formData.objectives.includes(obj.id)
                        ? "border-gold bg-gold/10"
                        : "border-navy/10 bg-white hover:border-navy/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                        formData.objectives.includes(obj.id)
                          ? "border-gold bg-gold"
                          : "border-navy/30"
                      )}>
                        {formData.objectives.includes(obj.id) && (
                          <Check className="w-4 h-4 text-navy" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-navy">{obj.label}</p>
                        <p className="text-sm text-navy/60">{obj.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="font-display text-3xl font-bold text-navy mb-4">
                Vous êtes prêt !
              </h2>
              <p className="text-navy/70 mb-8">
                Votre espace Teachings Hub est configuré. Commencez à explorer 
                les enseignements et à créer du contenu impactant.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="flex-1 gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Retour
              </Button>
            )}
            <Button 
              variant="gold" 
              onClick={handleNext}
              className="flex-1 gap-2"
            >
              {currentStep === 4 ? 'Accéder au dashboard' : 'Continuer'} 
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
