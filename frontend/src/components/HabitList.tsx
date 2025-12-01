import type { Habit } from '../backend';
import HabitCard from './HabitCard';

interface HabitListProps {
  habits: Habit[];
}

export default function HabitList({ habits }: HabitListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {habits.map((habit, index) => (
        <HabitCard key={habit.id.toString()} habit={habit} index={index} />
      ))}
    </div>
  );
}
