import { useState, useEffect } from 'react';
import type { Habit } from '../backend';
import { useUpdateHabit } from '../hooks/useQueries';
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

interface EditHabitDialogProps {
  habit: Habit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditHabitDialog({ habit, open, onOpenChange }: EditHabitDialogProps) {
  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description);
  const [reminder, setReminder] = useState(habit.reminder || '');
  const updateHabit = useUpdateHabit();

  useEffect(() => {
    if (open) {
      setName(habit.name);
      setDescription(habit.description);
      setReminder(habit.reminder || '');
    }
  }, [open, habit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await updateHabit.mutateAsync({
      habitId: habit.id,
      name: name.trim(),
      description: description.trim(),
      reminder: reminder.trim() || null,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="neo-brutal-lg bg-card max-w-md rounded-none">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black">Edit Habit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-base font-bold">
              Habit Name *
            </Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="neo-brutal-sm font-semibold rounded-none"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-base font-bold">
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="neo-brutal-sm font-semibold rounded-none resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-reminder" className="text-base font-bold">
              Reminder / Cue
            </Label>
            <Input
              id="edit-reminder"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
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
              disabled={!name.trim() || updateHabit.isPending}
              className="neo-brutal-sm font-black rounded-none"
            >
              {updateHabit.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
