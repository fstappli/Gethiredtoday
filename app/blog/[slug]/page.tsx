import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock, Tag } from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { BLOG_POSTS, getPostBySlug } from '@/lib/blog-posts';

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `https://hiredtodayapp.com/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      url: `https://hiredtodayapp.com/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.description,
    "datePublished": post.date,
    "url": `https://hiredtodayapp.com/blog/${post.slug}`,
    "publisher": { "@type": "Organization", "name": "GetHiredToday", "url": "https://hiredtodayapp.com" },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className={`bg-gradient-to-br ${post.gradient} py-16`}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-8">
              <ArrowLeft className="w-4 h-4" /> Back to blog
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold text-white bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                <Tag className="w-3 h-3" /> {post.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-white/70">
                <Clock className="w-3 h-3" /> {post.readTime}
              </span>
              <span className="text-xs text-white/70">
                {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">{post.title}</h1>
          </div>
        </section>

        {/* Article body */}
        <section className="bg-white py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-lg text-gray-600 mb-8 leading-relaxed border-l-4 border-teal pl-4 italic">{post.description}</p>

            <div
              className="prose prose-gray prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-gray-900
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-600 prose-p:leading-relaxed
                prose-li:text-gray-600 prose-li:leading-relaxed
                prose-strong:text-gray-900
                prose-blockquote:border-l-4 prose-blockquote:border-teal prose-blockquote:bg-[var(--teal-50)] prose-blockquote:rounded-r-xl prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:not-italic prose-blockquote:text-gray-700
                prose-a:text-teal prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* CTA inline */}
            <div className="mt-12 p-6 bg-[var(--teal-50)] border border-[var(--teal-200)] rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl gradient-teal flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">✓</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Ready to put this into practice?</h3>
                  <p className="text-sm text-gray-600 mb-3">Build your resume with our free AI-powered tool. ATS-optimized templates, instant PDF download.</p>
                  <Link href="/builder/resume/new"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-teal px-4 py-2 rounded-full hover:bg-teal-600 transition-colors">
                    Start Building Free <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related articles */}
        {related.length > 0 && (
          <section className="bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">More Resume Tips</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {related.map((r) => (
                  <Link key={r.slug} href={`/blog/${r.slug}`}
                    className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className={`h-24 bg-gradient-to-br ${r.gradient}`} />
                    <div className="p-4">
                      <span className="text-xs font-semibold text-teal">{r.category} · {r.readTime}</span>
                      <h3 className="font-bold text-gray-900 mt-1 text-sm group-hover:text-teal transition-colors">{r.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
