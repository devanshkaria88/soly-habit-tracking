import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Habit, HabitProgress, Achievement, UserStats, UserProfile } from '../backend';
import { toast } from 'sonner';

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully!');
    },
    onError: (error: Error) => {
      // Don't show toast for actor errors - reconnection handler will manage it
      if (!error.message.toLowerCase().includes('actor')) {
        toast.error(`Failed to save profile: ${error.message}`);
      }
    },
  });
}

// Habits
export function useGetHabits() {
  const { actor, isFetching } = useActor();

  return useQuery<Habit[]>({
    queryKey: ['habits'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHabits();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateHabit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description: string; reminder: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createHabit(data.name, data.description, data.reminder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      toast.success('Habit created! 🎉');
    },
    onError: (error: Error) => {
      if (!error.message.toLowerCase().includes('actor')) {
        toast.error(`Failed to create habit: ${error.message}`);
      }
    },
  });
}

export function useUpdateHabit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { habitId: bigint; name: string; description: string; reminder: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHabit(data.habitId, data.name, data.description, data.reminder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit updated!');
    },
    onError: (error: Error) => {
      if (!error.message.toLowerCase().includes('actor')) {
        toast.error(`Failed to update habit: ${error.message}`);
      }
    },
  });
}

export function useDeleteHabit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteHabit(habitId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      toast.success('Habit deleted');
    },
    onError: (error: Error) => {
      if (!error.message.toLowerCase().includes('actor')) {
        toast.error(`Failed to delete habit: ${error.message}`);
      }
    },
  });
}

// Progress
export function useGetHabitProgress(habitId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<HabitProgress[]>({
    queryKey: ['habitProgress', habitId?.toString()],
    queryFn: async () => {
      if (!actor || !habitId) return [];
      return actor.getHabitProgress(habitId);
    },
    enabled: !!actor && !isFetching && habitId !== null,
  });
}

export function useMarkHabitProgress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { habitId: bigint; date: bigint; completed: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markHabitProgress(data.habitId, data.date, data.completed);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['habitProgress', variables.habitId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    },
    onError: (error: Error) => {
      if (!error.message.toLowerCase().includes('actor')) {
        toast.error(`Failed to mark progress: ${error.message}`);
      }
    },
  });
}

// Achievements
export function useGetAchievements() {
  const { actor, isFetching } = useActor();

  return useQuery<Achievement[]>({
    queryKey: ['achievements'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAchievements();
    },
    enabled: !!actor && !isFetching,
  });
}

// Stats
export function useGetUserStats() {
  const { actor, isFetching } = useActor();

  return useQuery<UserStats | null>({
    queryKey: ['userStats'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateUserStats() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stats: UserStats) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUserStats(stats);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    },
    onError: (error: Error) => {
      if (!error.message.toLowerCase().includes('actor')) {
        console.error('Failed to update stats:', error.message);
      }
    },
  });
}
