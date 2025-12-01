import type { UserStats } from '../backend';
import { Flame, Trophy, TrendingUp, Zap } from 'lucide-react';

interface StatsOverviewProps {
  stats: UserStats | null | undefined;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const level = stats ? Number(stats.level) : 0;
  const currentStreak = stats ? Number(stats.currentStreak) : 0;
  const totalHabits = stats ? Number(stats.totalHabits) : 0;
  const totalCompletions = stats ? Number(stats.totalCompletions) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="stat-card space-y-2 animate-slide-up" style={{ animationDelay: '0ms' }}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-black uppercase opacity-90">Level</span>
          <Zap className="w-5 h-5" />
        </div>
        <p className="text-4xl font-black">{level}</p>
      </div>

      <div className="stat-card space-y-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-black uppercase opacity-90">Streak</span>
          <Flame className="w-5 h-5" />
        </div>
        <p className="text-4xl font-black">{currentStreak}</p>
      </div>

      <div className="stat-card space-y-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-black uppercase opacity-90">Habits</span>
          <TrendingUp className="w-5 h-5" />
        </div>
        <p className="text-4xl font-black">{totalHabits}</p>
      </div>

      <div className="stat-card space-y-2 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-black uppercase opacity-90">Total</span>
          <Trophy className="w-5 h-5" />
        </div>
        <p className="text-4xl font-black">{totalCompletions}</p>
      </div>
    </div>
  );
}
