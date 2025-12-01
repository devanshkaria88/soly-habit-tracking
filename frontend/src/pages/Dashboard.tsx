import { useState } from 'react';
import { useGetHabits, useGetUserStats, useGetAchievements } from '../hooks/useQueries';
import HabitList from '../components/HabitList';
import StatsOverview from '../components/StatsOverview';
import CreateHabitDialog from '../components/CreateHabitDialog';
import AchievementsPanel from '../components/AchievementsPanel';
import StatsPage from './StatsPage';
import { Button } from '../components/ui/button';
import { Plus, Trophy, TrendingUp, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function Dashboard() {
  const { data: habits, isLoading: habitsLoading } = useGetHabits();
  const { data: stats } = useGetUserStats();
  const { data: achievements } = useGetAchievements();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (habitsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-16">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-lg font-bold">Loading your habits...</p>
        </div>
      </div>
    );
  }

  const hasHabits = habits && habits.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* Stats Overview */}
      <StatsOverview stats={stats} />

      {/* Main Content */}
      <Tabs defaultValue="habits" className="w-full">
        <TabsList className="neo-brutal-sm grid w-full max-w-md mx-auto grid-cols-3 h-auto p-1 bg-muted">
          <TabsTrigger
            value="habits"
            className="font-black text-base py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Habits
          </TabsTrigger>
          <TabsTrigger
            value="achievements"
            className="font-black text-base py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Rewards
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="font-black text-base py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="habits" className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black">Your Habits</h2>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="neo-brutal-sm font-black rounded-none"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Habit
            </Button>
          </div>

          {!hasHabits ? (
            <div className="neo-brutal-lg bg-card p-12 text-center space-y-4">
              <p className="text-6xl">🌱</p>
              <h3 className="text-2xl font-black">No habits yet!</h3>
              <p className="text-lg font-semibold text-muted-foreground">
                Create your first habit to start building better routines.
              </p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="neo-brutal font-black text-lg px-8 py-6 rounded-none mt-4"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Habit
              </Button>
            </div>
          ) : (
            <HabitList habits={habits} />
          )}
        </TabsContent>

        <TabsContent value="achievements" className="mt-8">
          <AchievementsPanel achievements={achievements || []} stats={stats} />
        </TabsContent>

        <TabsContent value="stats" className="mt-8">
          <StatsPage />
        </TabsContent>
      </Tabs>

      <CreateHabitDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}
