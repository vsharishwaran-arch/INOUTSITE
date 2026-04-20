import { Outlet } from 'react-router';
import { Navigation } from './Navigation';
import { ScrollToTop } from './ScrollToTop';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}