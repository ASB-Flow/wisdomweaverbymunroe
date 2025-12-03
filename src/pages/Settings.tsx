import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { 
  Youtube, 
  Key, 
  Bell, 
  User, 
  Shield, 
  Zap,
  Check,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  onConnect?: () => void;
}

function IntegrationCard({ name, description, icon, connected, onConnect }: IntegrationCardProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {connected ? (
        <div className="flex items-center gap-2 text-sage text-sm font-medium">
          <Check className="w-4 h-4" />
          Connected
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={onConnect}>
          Connect
        </Button>
      )}
    </div>
  );
}

export default function Settings() {
  return (
    <MainLayout>
      <Header 
        title="Settings" 
        subtitle="Manage your account and integrations"
      />
      
      <div className="p-8 max-w-4xl">
        {/* Profile Section */}
        <section className="mb-10 animate-fade-in">
          <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-accent" />
            Profile
          </h2>
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center text-2xl font-display text-foreground">
                A
              </div>
              <div>
                <h3 className="font-semibold text-lg">Admin User</h3>
                <p className="text-sm text-muted-foreground">admin@teachingshub.com</p>
                <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Full Name</label>
                <input type="text" defaultValue="Admin User" className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Email</label>
                <input type="email" defaultValue="admin@teachingshub.com" className="input-field" />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="gold">Save Changes</Button>
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="mb-10 animate-slide-up stagger-1">
          <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Integrations
          </h2>
          <div className="space-y-3">
            <IntegrationCard
              name="YouTube"
              description="Import videos and upload Shorts"
              icon={<Youtube className="w-6 h-6 text-red-500" />}
              connected={true}
            />
            <IntegrationCard
              name="Buffer"
              description="Schedule posts across platforms"
              icon={<div className="w-6 h-6 bg-foreground rounded-md" />}
              connected={false}
            />
            <IntegrationCard
              name="OpenAI (Whisper)"
              description="Transcription and insight extraction"
              icon={<div className="w-6 h-6 rounded-full bg-foreground" />}
              connected={true}
            />
          </div>
        </section>

        {/* API Keys Section */}
        <section className="mb-10 animate-slide-up stagger-2">
          <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-accent" />
            API Keys
          </h2>
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4 p-3 bg-accent/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-accent" />
              <p className="text-sm">API keys are stored securely and never exposed in the UI.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">YouTube API Key</label>
                <div className="flex gap-2">
                  <input type="password" value="••••••••••••••••" className="input-field flex-1" readOnly />
                  <Button variant="outline">Update</Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">OpenAI API Key</label>
                <div className="flex gap-2">
                  <input type="password" value="••••••••••••••••" className="input-field flex-1" readOnly />
                  <Button variant="outline">Update</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="animate-slide-up stagger-3">
          <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-accent" />
            Notifications
          </h2>
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            {[
              { label: 'New insight extracted', description: 'Get notified when AI extracts new insights' },
              { label: 'Post scheduled', description: 'Notification when a post is scheduled' },
              { label: 'Post published', description: 'Confirmation when a post goes live' },
              { label: 'Processing errors', description: 'Alert on transcription or processing failures' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={idx < 2} />
                  <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-accent peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
