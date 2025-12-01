import { useState } from 'react';
import { useCreateHabit, useGetUserStats, useUpdateUserStats } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface CreateHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateHabitDialog({ open, onOpenChange }: CreateHabitDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [reminder, setReminder] = useState('');
  const createHabit = useCreateHabit();
  const { data: stats } = useGetUserStats();
  const updateStats = useUpdateUserStats();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createHabit.mutateAsync({
      name: name.trim(),
      description: description.trim(),
      reminder: reminder.trim() || null,
    });

    // Update stats
    if (stats) {
      await updateStats.mutateAsync({
        ...stats,
        totalHabits: stats.totalHabits + BigInt(1),
      });
    } else {
      await updateStats.mutateAsync({
        totalHabits: BigInt(1),
        totalCompletions: BigInt(0),
        currentStreak: BigInt(0),
        longestStreak: BigInt(0),
        level: BigInt(0),
        nextLevelThreshold: BigInt(10),
      });
    }

    setName('');
    setDescription('');
    setReminder('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="neo-brutal-lg bg-card max-w-md rounded-none">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black">Create New Habit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-bold">
              Habit Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Exercise"
              className="neo-brutal-sm font-semibold rounded-none"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-bold">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this habit involve?"
              className="neo-brutal-sm font-semibold rounded-none resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder" className="text-base font-bold">
              Reminder / Cue
            </Label>
            <Input
              id="reminder"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              placeholder="e.g., After breakfast"
              className="neo-brutal-sm font-semibold rounded-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              className="neo-brutal-sm font-bold rounded-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || createHabit.isPending}
              className="neo-brutal-sm font-black rounded-none"
            >
              {createHabit.isPending ? 'Creating...' : 'Create Habit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
