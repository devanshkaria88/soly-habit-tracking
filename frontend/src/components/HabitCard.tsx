import { useState } from 'react';
import type { Habit } from '../backend';
import { useMarkHabitProgress, useGetHabitProgress, useGetUserStats } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Check, Edit, Trash2, Flame } from 'lucide-react';
import EditHabitDialog from './EditHabitDialog';
import DeleteHabitDialog from './DeleteHabitDialog';
import { toast } from 'sonner';
import { useConfetti } from '../hooks/useConfetti';

interface HabitCardProps {
  habit: Habit;
  index: number;
}

export default function HabitCard({ habit, index }: HabitCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isConfettiPlaying, setIsConfettiPlaying] = useState(false);
  const markProgress = useMarkHabitProgress();
  const { data: progressData } = useGetHabitProgress(habit.id);
  const { data: stats } = useGetUserStats();
  const { triggerConfetti } = useConfetti();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = BigInt(today.getTime() * 1000000);

  // Check if habit is completed today (date-only comparison)
  const todayProgress = progressData?.find((p) => {
    const progressDate = new Date(Number(p.date) / 1000000);
    progressDate.setHours(0, 0, 0, 0);
    return progressDate.getTime() === today.getTime() && p.completed;
  });

  const isCompletedToday = !!todayProgress;

  // Calculate streak for this specific habit
  const calculateHabitStreak = (): number => {
    if (!progressData || progressData.length === 0) return 0;

    // Get unique completed dates (date-only, no time)
    const completedDatesSet = new Set<number>();
    progressData
      .filter((p) => p.completed)
      .forEach((p) => {
        const date = new Date(Number(p.date) / 1000000);
        date.setHours(0, 0, 0, 0);
        completedDatesSet.add(date.getTime());
      });

    const completedDates = Array.from(completedDatesSet).sort((a, b) => b - a);

    if (completedDates.length === 0) return 0;

    let streak = 0;
    const oneDayMs = 24 * 60 * 60 * 1000;
    let expectedDate = today.getTime();

    // Check if today is completed, if not start from yesterday
    if (completedDates[0] !== today.getTime()) {
      expectedDate -= oneDayMs;
    }

    for (const completedDate of completedDates) {
      if (completedDate === expectedDate) {
        streak++;
        expectedDate -= oneDayMs;
      } else if (completedDate < expectedDate) {
        break;
      }
    }

    return streak;
  };

  const habitStreak = calculateHabitStreak();

  const handleToggle = async () => {
    // Prevent duplicate submissions for the same day
    if (isCompletedToday) {
      toast.info('Already completed today! 🎉');
      return;
    }

    // Debounce: prevent multiple confetti triggers
    if (isConfettiPlaying) {
      return;
    }

    try {
      setIsConfettiPlaying(true);
      
      await markProgress.mutateAsync({
        habitId: habit.id,
        date: todayTimestamp,
        completed: true,
      });

      // Trigger confetti animation
      triggerConfetti();

      // Reset confetti playing state after animation duration
      setTimeout(() => {
        setIsConfettiPlaying(false);
      }, 2500);

      // Show achievement toasts based on new streak
      const newStreak = habitStreak + 1;
      const currentStreakValue = stats ? Number(stats.currentStreak) : 0;
      
      if (newStreak === 7 && currentStreakValue >= 7) {
        toast.success('🔥 7-day streak! You\'re on fire!', { duration: 4000 });
      } else if (newStreak === 30 && currentStreakValue >= 30) {
        toast.success('🏆 30-day streak! Incredible dedication!', { duration: 4000 });
      } else if (newStreak === 100 && currentStreakValue >= 100) {
        toast.success('👑 100-day streak! Legendary!', { duration: 5000 });
      } else {
        toast.success('Great job! Keep it up! 💪', { duration: 2000 });
      }
    } catch (error) {
      console.error('Failed to mark habit as complete:', error);
      setIsConfettiPlaying(false);
    }
  };

  return (
    <>
      <div
        className="habit-card space-y-4 animate-slide-up"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black truncate">{habit.name}</h3>
            {habit.description && (
              <p className="text-sm font-semibold text-muted-foreground line-clamp-2 mt-1">
                {habit.description}
              </p>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditDialogOpen(true)}
              className="h-8 w-8 hover:bg-muted"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteDialogOpen(true)}
              className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {habit.reminder && (
          <div className="text-sm font-semibold bg-muted px-3 py-2 border-2 border-border">
            💡 {habit.reminder}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-warning" />
            <span className="text-2xl font-black">{habitStreak}</span>
            <span className="text-sm font-bold text-muted-foreground">day streak</span>
          </div>

          <Button
            onClick={handleToggle}
            disabled={markProgress.isPending || isCompletedToday || isConfettiPlaying}
            className={`neo-brutal-sm font-black rounded-none ${
              isCompletedToday
                ? 'bg-success text-success-foreground hover:bg-success/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {markProgress.isPending ? (
              'Saving...'
            ) : isCompletedToday ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Done!
              </>
            ) : (
              'Mark Done'
            )}
          </Button>
        </div>
      </div>

      <EditHabitDialog
        habit={habit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
      <DeleteHabitDialog
        habit={habit}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}
