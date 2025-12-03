import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { InsightCard } from '@/components/insights/InsightCard';
import { PostPreview } from '@/components/posts/PostPreview';
import { SourceCard } from '@/components/sources/SourceCard';
import { 
  Video, 
  Lightbulb, 
  FileText, 
  Calendar,
  ArrowRight
} from 'lucide-react';
import { getStats, insights, posts, sources } from '@/lib/seed-data';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const stats = getStats();
  const recentInsights = insights.slice(0, 3);
  const recentPosts = posts.filter(p => p.status !== 'draft').slice(0, 2);
  const recentSources = sources.slice(0, 2);

  return (
    <MainLayout>
      <Header 
        title="Dashboard" 
        subtitle="Welcome back! Here's your content overview."
      />
      
      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
          <StatCard 
            title="Total Sources" 
            value={stats.totalSources} 
            icon={Video}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard 
            title="Insights Extracted" 
            value={stats.totalInsights} 
            icon={Lightbulb}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard 
            title="Posts Created" 
            value={stats.totalPosts} 
            icon={FileText}
          />
          <StatCard 
            title="Scheduled" 
            value={stats.scheduledPosts} 
            icon={Calendar}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Insights */}
          <div className="lg:col-span-2 animate-slide-up stagger-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Recent Insights
              </h2>
              <Link to="/insights">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-4">
              {recentInsights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8 animate-slide-up stagger-2">
            {/* Upcoming Posts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Upcoming Posts
                </h2>
                <Link to="/calendar">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Calendar <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <PostPreview key={post.id} post={post} />
                ))}
              </div>
            </div>

            {/* Recent Sources */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Recent Sources
                </h2>
                <Link to="/sources">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View all <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {recentSources.map((source) => (
                  <SourceCard key={source.id} source={source} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
