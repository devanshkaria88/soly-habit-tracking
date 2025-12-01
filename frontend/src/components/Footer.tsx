import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t-4 border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-6 text-center">
        <p className="text-sm font-semibold flex items-center justify-center gap-2 flex-wrap">
          © 2025. Built with{' '}
          <Heart className="w-4 h-4 text-destructive fill-destructive inline" />{' '}
          using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-bold"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
