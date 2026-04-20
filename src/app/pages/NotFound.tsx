import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1
          style={{ fontFamily: 'var(--font-display)' }}
          className="text-8xl mb-4 tracking-tight"
        >
          404
        </h1>
        <h2
          style={{ fontFamily: 'var(--font-display)' }}
          className="text-3xl sm:text-4xl mb-5 tracking-tight"
        >
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-10 tracking-wide font-light">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 hover:bg-foreground/90 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="tracking-wide">BACK TO HOME</span>
        </Link>
      </div>
    </div>
  );
}
