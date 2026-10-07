import AboutPage from '@/app/about/page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Story | JODO',
  description: 'The About page introduces the idea, the making process, and the feeling behind JODO.',
};

export default function OurStoryPage() {
  return <AboutPage />;
}
