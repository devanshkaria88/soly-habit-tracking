import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useActorReconnection } from './hooks/useActorReconnection';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './pages/Dashboard';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from 'next-themes';

export default function App() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched, error: profileError } = useGetCallerUserProfile();
  const [showApp, setShowApp] = useState(false);
  const { checkAndReconnect } = useActorReconnection();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Monitor for actor errors only from the profile query (initial critical query)
  // Other queries will handle their own errors through React Query's retry mechanism
  useEffect(() => {
    if (profileError) {
      checkAndReconnect(profileError);
    }
  }, [profileError, checkAndReconnect]);

  useEffect(() => {
    if (loginStatus !== 'initializing') {
      setShowApp(true);
    }
  }, [loginStatus]);

  if (!showApp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-lg font-bold">Loading Soly...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          {!isAuthenticated ? (
            <div className="container mx-auto px-4 py-16 max-w-4xl">
              <div className="text-center space-y-8 animate-slide-up">
                <div className="space-y-4">
                  <h1 className="text-6xl md:text-7xl font-black tracking-tight">
                    Welcome to <span className="text-primary">Soly</span>
                  </h1>
                  <p className="text-xl md:text-2xl font-bold text-muted-foreground">
                    Your ADHD-friendly habit tracker with gamification! 🎮
                  </p>
                </div>
                
                <div className="neo-brutal-lg bg-card p-8 md:p-12 max-w-2xl mx-auto">
                  <h2 className="text-3xl font-black mb-6">Why Soly?</h2>
                  <ul className="space-y-4 text-left text-lg">
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">✨</span>
                      <span><strong>Simple & Clear:</strong> No distractions, just your habits</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">🔥</span>
                      <span><strong>Track Streaks:</strong> Build momentum day by day</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">🏆</span>
                      <span><strong>Earn Rewards:</strong> Level up and unlock achievements</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">📊</span>
                      <span><strong>See Progress:</strong> Visual stats that motivate</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg font-semibold">
                  Login to start building better habits today! 🚀
                </p>
              </div>
            </div>
          ) : showProfileSetup ? (
            <ProfileSetup />
          ) : (
            <Dashboard />
          )}
        </main>
        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
