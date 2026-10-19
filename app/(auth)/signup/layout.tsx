import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Create your free account',
  description: 'Create a free GetHiredToday account with no password and no card. Build a resume, check your ATS score and download your PDF for free.',
  alternates: { canonical: '/signup' },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
