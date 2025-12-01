import type { Habit } from '../backend';
import { useDeleteHabit, useGetUserStats, useUpdateUserStats } from '../hooks/useQueries';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from './ui/alert-dialog';

interface DeleteHabitDialogProps {
  habit: Habit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteHabitDialog({ habit, open, onOpenChange }: DeleteHabitDialogProps) {
  const deleteHabit = useDeleteHabit();
  const { data: stats } = useGetUserStats();
  const updateStats = useUpdateUserStats();

  const handleDelete = async () => {
    await deleteHabit.mutateAsync(habit.id);

    // Update stats
    if (stats && stats.totalHabits > BigInt(0)) {
      await updateStats.mutateAsync({
        ...stats,
        totalHabits: stats.totalHabits - BigInt(1),
      });
    }

    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="neo-brutal-lg bg-card rounded-none">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black">Delete Habit?</AlertDialogTitle>
          <AlertDialogDescription className="text-base font-semibold">
            Are you sure you want to delete "{habit.name}"? This action cannot be undone and all
            progress data will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel className="neo-brutal-sm font-bold rounded-none">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteHabit.isPending}
            className="neo-brutal-sm font-black rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteHabit.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
