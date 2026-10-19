import type { Metadata } from 'next';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import JobsClient from './jobs-client';

export const metadata: Metadata = {
  title: 'Find Jobs: Search Openings and See Your Match',
  description:
    'Search jobs from employers worldwide, see how well your resume matches each role, and apply with a resume tailored to it. Free to start.',
  alternates: { canonical: 'https://www.hiredtodayapp.com/jobs' },
};

export default function JobsPage() {
  return (
    <div className="bg-ground-site text-ink">
      <Navbar />
      <JobsClient />
      <Footer />
    </div>
  );
}
