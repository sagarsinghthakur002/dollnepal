import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" path="/404" />
      <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center sm:px-6">
        <p className="font-display text-6xl font-semibold brand-gradient-text">404</p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-neutral-900">Page not found</h1>
        <p className="mt-2 text-sm text-neutral-500">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-1.5 rounded-full brand-gradient-bg px-6 py-3 text-sm font-semibold text-white">
          Back to home
        </Link>
      </main>
    </>
  );
}
