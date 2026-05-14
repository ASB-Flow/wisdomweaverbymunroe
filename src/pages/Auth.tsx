import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, ArrowRight, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

const signupSchema = loginSchema.extend({
  displayName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
});

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signIn, signUp, isLoading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/home');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form
      if (isLogin) {
        loginSchema.parse(formData);
      } else {
        signupSchema.parse(formData);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Erreur de validation",
          description: err.errors[0].message,
          variant: "destructive"
        });
        return;
      }
    }

    setIsLoading(true);

    if (isLogin) {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message === 'Invalid login credentials' 
            ? 'Email ou mot de passe incorrect' 
            : error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue !",
        });
        navigate('/home');
      }
    } else {
      const { error } = await signUp(formData.email, formData.password, formData.displayName);
      if (error) {
        const errorMessage = error.message.includes('already registered')
          ? 'Cet email est déjà utilisé'
          : error.message;
        toast({
          title: "Erreur d'inscription",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé. Vous êtes maintenant connecté.",
        });
        navigate('/home');
      }
    }

    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-navy-light to-navy">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

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
          <p className="text-cream/70 text-lg mb-8">
            Espace administrateur pour gérer les enseignements de Enseignements.
          </p>
          <div className="bg-gold/10 rounded-2xl p-6">
            <blockquote className="font-display text-lg text-cream italic">
              "Tu ne deviens pas ce que tu entends, tu deviens ce que tu as stocké."
            </blockquote>
            <p className="text-cream/60 text-sm mt-2">— Enseignements</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 bg-cream rounded-l-3xl">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-navy" />
            </div>
            <h1 className="font-display text-2xl font-bold text-navy">Teachings Hub</h1>
          </div>

          {/* Toggle */}
          <div className="flex bg-navy/5 rounded-xl p-1 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                isLogin ? 'bg-gold text-navy' : 'text-navy/60 hover:text-navy'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                !isLogin ? 'bg-gold text-navy' : 'text-navy/60 hover:text-navy'
              }`}
            >
              Inscription
            </button>
          </div>

          <h2 className="font-display text-2xl font-bold text-navy mb-2">
            {isLogin ? 'Bon retour !' : 'Créer un compte'}
          </h2>
          <p className="text-navy/70 mb-8">
            {isLogin 
              ? 'Connectez-vous pour accéder à votre espace.'
              : 'Inscrivez-vous pour commencer à gérer vos enseignements.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="displayName" className="text-navy">Nom</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy/40" />
                  <Input 
                    id="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Votre nom"
                    className="pl-10"
                  />
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="email" className="text-navy">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy/40" />
                <Input 
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="votre@email.com"
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

            <Button 
              type="submit"
              variant="gold" 
              disabled={isLoading}
              className="w-full gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isLogin ? 'Connexion...' : 'Inscription...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Se connecter' : "S'inscrire"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-navy/60 text-sm mt-6">
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-gold hover:underline ml-1 font-medium"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
