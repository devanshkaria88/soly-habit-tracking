import type { Achievement, UserStats } from '../backend';
import { Trophy, Star, Flame, Target, Award, Zap } from 'lucide-react';

interface AchievementsPanelProps {
  achievements: Achievement[];
  stats: UserStats | null | undefined;
}

export default function AchievementsPanel({ achievements, stats }: AchievementsPanelProps) {
  const level = stats ? Number(stats.level) : 0;
  const currentStreak = stats ? Number(stats.currentStreak) : 0;
  const longestStreak = stats ? Number(stats.longestStreak) : 0;
  const totalCompletions = stats ? Number(stats.totalCompletions) : 0;

  // Define milestone achievements
  const milestones = [
    {
      id: 'first-habit',
      name: 'First Step',
      description: 'Complete your first habit',
      icon: Star,
      unlocked: totalCompletions >= 1,
      color: 'text-chart-1',
    },
    {
      id: 'week-streak',
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: Flame,
      unlocked: currentStreak >= 7 || longestStreak >= 7,
      color: 'text-warning',
    },
    {
      id: 'month-streak',
      name: 'Month Master',
      description: 'Maintain a 30-day streak',
      icon: Trophy,
      unlocked: currentStreak >= 30 || longestStreak >= 30,
      color: 'text-chart-2',
    },
    {
      id: 'fifty-completions',
      name: 'Half Century',
      description: 'Complete 50 habits',
      icon: Target,
      unlocked: totalCompletions >= 50,
      color: 'text-chart-3',
    },
    {
      id: 'hundred-completions',
      name: 'Centurion',
      description: 'Complete 100 habits',
      icon: Award,
      unlocked: totalCompletions >= 100,
      color: 'text-chart-4',
    },
    {
      id: 'level-ten',
      name: 'Level 10',
      description: 'Reach level 10',
      icon: Zap,
      unlocked: level >= 10,
      color: 'text-primary',
    },
  ];

  const unlockedCount = milestones.filter((m) => m.unlocked).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black">Achievements</h2>
        <div className="neo-brutal-sm bg-primary text-primary-foreground px-4 py-2">
          <span className="font-black text-lg">
            {unlockedCount} / {milestones.length}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {milestones.map((milestone, index) => {
          const Icon = milestone.icon;
          return (
            <div
              key={milestone.id}
              className={`habit-card space-y-3 ${
                milestone.unlocked ? 'animate-slide-up' : 'opacity-50'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-3 border-2 border-border ${
                    milestone.unlocked ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  <Icon className="w-6 h-6" strokeWidth={3} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black">{milestone.name}</h3>
                  <p className="text-sm font-semibold text-muted-foreground">
                    {milestone.description}
                  </p>
                </div>
              </div>
              {milestone.unlocked && (
                <div className="text-xs font-bold text-success flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  UNLOCKED!
                </div>
              )}
            </div>
          );
        })}
      </div>

      {achievements.length > 0 && (
        <div className="space-y-4 mt-8">
          <h3 className="text-2xl font-black">Custom Achievements</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {achievements.map((achievement) => (
              <div key={achievement.id.toString()} className="habit-card space-y-2">
                <div className="flex items-start gap-3">
                  <Trophy className="w-6 h-6 text-chart-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-black">{achievement.name}</h4>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {achievement.description}
                    </p>
                    <p className="text-xs font-bold text-muted-foreground mt-2">
                      {new Date(Number(achievement.achievedAt) / 1000000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
