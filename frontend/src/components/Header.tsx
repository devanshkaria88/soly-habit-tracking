import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { LogIn, LogOut, Sparkles } from 'lucide-react';
import { useGetCallerUserProfile } from '../hooks/useQueries';

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="border-b-4 border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" strokeWidth={3} />
          <h1 className="text-3xl font-black tracking-tight">Soly</h1>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && userProfile && (
            <span className="hidden sm:inline-block font-bold text-sm px-4 py-2 bg-muted border-2 border-border">
              Hey, {userProfile.name}! 👋
            </span>
          )}
          <Button
            onClick={handleAuth}
            disabled={disabled}
            className="neo-brutal-sm font-black text-base px-6 py-5 rounded-none"
            variant={isAuthenticated ? 'secondary' : 'default'}
          >
            {disabled ? (
              'Loading...'
            ) : isAuthenticated ? (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
