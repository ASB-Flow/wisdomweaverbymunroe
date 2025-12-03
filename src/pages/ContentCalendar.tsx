import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { CalendarPost } from '@/components/calendar/CalendarPost';
import { posts } from '@/lib/seed-data';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { cn } from '@/lib/utils';

export default function ContentCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getPostsForDay = (date: Date) => {
    return posts.filter(post => {
      const postDate = post.scheduledAt || post.publishedAt;
      return postDate && isSameDay(postDate, date);
    });
  };

  return (
    <MainLayout>
      <Header 
        title="Content Calendar" 
        subtitle="Schedule and manage your content"
        showAddButton
        addButtonLabel="Schedule Post"
      />
      
      <div className="p-8">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
          {/* Week days header */}
          <div className="grid grid-cols-7 border-b border-border">
            {weekDays.map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground bg-secondary/30">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const dayPosts = getPostsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());

              return (
                <div 
                  key={idx}
                  className={cn(
                    "min-h-32 p-2 border-b border-r border-border last:border-r-0 [&:nth-child(7n)]:border-r-0",
                    !isCurrentMonth && "bg-muted/30"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-sm mb-2",
                    isToday && "bg-accent text-accent-foreground font-medium",
                    !isCurrentMonth && "text-muted-foreground"
                  )}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {dayPosts.map(post => (
                      <CalendarPost key={post.id} post={post} />
                    ))}
                  </div>

                  {dayPosts.length === 0 && isCurrentMonth && (
                    <button className="w-full py-2 text-xs text-muted-foreground hover:text-accent transition-colors opacity-0 hover:opacity-100">
                      <Plus className="w-4 h-4 mx-auto" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-muted-foreground">YouTube</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-pink-500" />
            <span className="text-sm text-muted-foreground">Instagram</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-500" />
            <span className="text-sm text-muted-foreground">X (Twitter)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="text-sm text-muted-foreground">Facebook</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
