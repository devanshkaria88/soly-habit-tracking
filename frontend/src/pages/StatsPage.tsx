import { useGetUserStats, useGetHabits, useGetAchievements } from '../hooks/useQueries';
import { Flame, Trophy, TrendingUp, Zap, Target, Award, Calendar, CheckCircle2 } from 'lucide-react';
import { Progress } from '../components/ui/progress';

export default function StatsPage() {
  const { data: stats, isLoading: statsLoading } = useGetUserStats();
  const { data: habits } = useGetHabits();
  const { data: achievements } = useGetAchievements();

  if (statsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-16">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-lg font-bold">Loading your stats...</p>
        </div>
      </div>
    );
  }

  const level = stats ? Number(stats.level) : 0;
  const currentStreak = stats ? Number(stats.currentStreak) : 0;
  const longestStreak = stats ? Number(stats.longestStreak) : 0;
  const totalHabits = stats ? Number(stats.totalHabits) : 0;
  const totalCompletions = stats ? Number(stats.totalCompletions) : 0;
  const nextLevelThreshold = stats ? Number(stats.nextLevelThreshold) : 10;
  const activeHabits = habits?.length || 0;
  const unlockedAchievements = achievements?.length || 0;

  // Calculate progress to next level using dynamic threshold
  const progressToNextLevel = totalCompletions;
  const completionsNeeded = nextLevelThreshold - totalCompletions;
  const progressPercentage = Math.min((progressToNextLevel / nextLevelThreshold) * 100, 100);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black">Your Statistics</h1>
        <p className="text-lg font-semibold text-muted-foreground">
          Track your progress and celebrate your achievements
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Level Card */}
        <div className="neo-brutal-lg bg-card p-6 space-y-4 animate-slide-up" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-muted-foreground">Level</h3>
            <img src="/assets/generated/level-star.dim_80x80.png" alt="Level" className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <p className="text-5xl font-black text-primary">{level}</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>
                  {progressToNextLevel}/{nextLevelThreshold} to Level {level + 1}
                </span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3 neo-brutal-sm" />
            </div>
          </div>
        </div>

        {/* Current Streak Card */}
        <div className="neo-brutal-lg bg-card p-6 space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-muted-foreground">Current Streak</h3>
            <img src="/assets/generated/streak-flame.dim_64x64.png" alt="Streak" className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <p className="text-5xl font-black text-warning">{currentStreak}</p>
            <p className="text-sm font-bold">
              {currentStreak === 0 ? 'Start your streak today!' : `${currentStreak} day${currentStreak !== 1 ? 's' : ''} in a row! 🔥`}
            </p>
          </div>
        </div>

        {/* Longest Streak Card */}
        <div className="neo-brutal-lg bg-card p-6 space-y-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-muted-foreground">Longest Streak</h3>
            <img src="/assets/generated/trophy-icon.dim_64x64.png" alt="Trophy" className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <p className="text-5xl font-black text-accent">{longestStreak}</p>
            <p className="text-sm font-bold">
              {longestStreak === 0 ? 'Complete habits to build streaks' : 'Your personal best!'}
            </p>
          </div>
        </div>

        {/* Total Completions Card */}
        <div className="neo-brutal-lg bg-card p-6 space-y-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-muted-foreground">Total Completions</h3>
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
          <div className="space-y-2">
            <p className="text-5xl font-black text-success">{totalCompletions}</p>
            <p className="text-sm font-bold">Habits completed</p>
          </div>
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="neo-brutal-lg bg-card p-8 space-y-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center gap-4">
          <img src="/assets/generated/progress-chart.dim_200x150.png" alt="Progress Chart" className="w-24 h-18" />
          <div>
            <h2 className="text-2xl font-black">Progress Overview</h2>
            <p className="text-sm font-semibold text-muted-foreground">Your habit-building journey at a glance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Habits */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-black">Active Habits</h3>
            </div>
            <div className="neo-brutal-sm bg-muted p-4">
              <p className="text-4xl font-black text-primary">{activeHabits}</p>
              <p className="text-sm font-bold text-muted-foreground mt-1">
                {activeHabits === 0 ? 'Create your first habit' : 'Habits in progress'}
              </p>
            </div>
          </div>

          {/* Achievements */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-black">Achievements</h3>
            </div>
            <div className="neo-brutal-sm bg-muted p-4">
              <p className="text-4xl font-black text-accent">{unlockedAchievements}</p>
              <p className="text-sm font-bold text-muted-foreground mt-1">Unlocked rewards</p>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-success" />
              <h3 className="text-lg font-black">Avg per Habit</h3>
            </div>
            <div className="neo-brutal-sm bg-muted p-4">
              <p className="text-4xl font-black text-success">
                {activeHabits > 0 ? Math.round(totalCompletions / activeHabits) : 0}
              </p>
              <p className="text-sm font-bold text-muted-foreground mt-1">Completions each</p>
            </div>
          </div>
        </div>
      </div>

      {/* Streak Milestones */}
      <div className="neo-brutal-lg bg-card p-8 space-y-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center gap-4">
          <img src="/assets/generated/achievement-badge.dim_100x100.png" alt="Achievement" className="w-16 h-16" />
          <div>
            <h2 className="text-2xl font-black">Streak Milestones</h2>
            <p className="text-sm font-semibold text-muted-foreground">Keep going to unlock these achievements</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 7 Day Streak */}
          <div className={`neo-brutal-sm p-4 ${currentStreak >= 7 ? 'bg-success text-success-foreground' : 'bg-muted'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5" />
              <span className="text-lg font-black">7 Days</span>
            </div>
            <p className="text-xs font-bold opacity-90">
              {currentStreak >= 7 ? '✓ Unlocked!' : `${7 - currentStreak} days to go`}
            </p>
          </div>

          {/* 14 Day Streak */}
          <div className={`neo-brutal-sm p-4 ${currentStreak >= 14 ? 'bg-success text-success-foreground' : 'bg-muted'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5" />
              <span className="text-lg font-black">14 Days</span>
            </div>
            <p className="text-xs font-bold opacity-90">
              {currentStreak >= 14 ? '✓ Unlocked!' : `${14 - currentStreak} days to go`}
            </p>
          </div>

          {/* 30 Day Streak */}
          <div className={`neo-brutal-sm p-4 ${currentStreak >= 30 ? 'bg-success text-success-foreground' : 'bg-muted'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5" />
              <span className="text-lg font-black">30 Days</span>
            </div>
            <p className="text-xs font-bold opacity-90">
              {currentStreak >= 30 ? '✓ Unlocked!' : `${30 - currentStreak} days to go`}
            </p>
          </div>

          {/* 100 Day Streak */}
          <div className={`neo-brutal-sm p-4 ${currentStreak >= 100 ? 'bg-success text-success-foreground' : 'bg-muted'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5" />
              <span className="text-lg font-black">100 Days</span>
            </div>
            <p className="text-xs font-bold opacity-90">
              {currentStreak >= 100 ? '✓ Legendary!' : `${100 - currentStreak} days to go`}
            </p>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      {totalCompletions === 0 && (
        <div className="neo-brutal-lg bg-primary text-primary-foreground p-8 text-center space-y-4 animate-slide-up" style={{ animationDelay: '600ms' }}>
          <p className="text-6xl">🚀</p>
          <h3 className="text-2xl font-black">Ready to Start Your Journey?</h3>
          <p className="text-lg font-semibold">
            Complete your first habit today and watch your stats grow!
          </p>
        </div>
      )}

      {totalCompletions > 0 && currentStreak === 0 && (
        <div className="neo-brutal-lg bg-warning text-warning-foreground p-8 text-center space-y-4 animate-slide-up" style={{ animationDelay: '600ms' }}>
          <p className="text-6xl">💪</p>
          <h3 className="text-2xl font-black">Don't Break the Chain!</h3>
          <p className="text-lg font-semibold">
            Complete a habit today to start building your streak again.
          </p>
        </div>
      )}

      {currentStreak >= 7 && (
        <div className="neo-brutal-lg bg-success text-success-foreground p-8 text-center space-y-4 animate-slide-up" style={{ animationDelay: '600ms' }}>
          <p className="text-6xl">🔥</p>
          <h3 className="text-2xl font-black">You're On Fire!</h3>
          <p className="text-lg font-semibold">
            {currentStreak} days strong! Keep up the amazing work!
          </p>
        </div>
      )}
    </div>
  );
}
