import { redirect } from 'next/navigation';

/**
 * Root redirect — sends the user to the full-width Landing Page.
 * The landing page lives in the (full-width) route group.
 */
export default function RootPage() {
  redirect('/landing');
}
