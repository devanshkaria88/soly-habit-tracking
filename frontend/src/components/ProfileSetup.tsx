import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export default function ProfileSetup() {
  const [name, setName] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      saveProfile.mutate({ name: name.trim() });
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="neo-brutal-lg bg-card p-8 animate-bounce-in">
        <h2 className="text-4xl font-black mb-4 text-center">Welcome! 🎉</h2>
        <p className="text-lg font-semibold mb-6 text-center text-muted-foreground">
          Let's get you set up. What should we call you?
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-lg font-bold">
              Your Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="neo-brutal-sm text-lg font-semibold rounded-none h-12"
              required
              autoFocus
            />
          </div>

          <Button
            type="submit"
            disabled={!name.trim() || saveProfile.isPending}
            className="neo-brutal w-full font-black text-lg py-6 rounded-none"
          >
            {saveProfile.isPending ? 'Saving...' : "Let's Go! 🚀"}
          </Button>
        </form>
      </div>
    </div>
  );
}
