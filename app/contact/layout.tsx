import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Contact and help',
  description: 'Get help with your GetHiredToday account, billing or resume, or send feedback. Most answers are one click away, and a real person reads every message.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
