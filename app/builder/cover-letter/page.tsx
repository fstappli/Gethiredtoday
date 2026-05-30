import Link from "next/link";
import { Mail, Briefcase, Star, Zap, Award, FileText, Plus, Lock } from "lucide-react";
import Navbar from "@/components/navbar";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const coverLetterTemplates = [
  {
    id: "professional",
    name: "Professional",
    description: "Clean, traditional format ideal for corporate roles and established industries.",
    icon: Briefcase,
    color: "from-blue-500 to-blue-700",
    tags: ["Corporate", "Finance", "Legal"],
    isPremium: false,
  },
  {
    id: "modern",
    name: "Modern",
    description: "Contemporary design with a fresh layout suited for tech and creative fields.",
    icon: Zap,
    color: "from-teal-500 to-teal-700",
    tags: ["Tech", "Startups", "Design"],
    isPremium: true,
  },
  {
    id: "executive",
    name: "Executive",
    description: "Authoritative and polished template crafted for senior and leadership positions.",
    icon: Award,
    color: "from-purple-500 to-purple-700",
    tags: ["C-Suite", "Director", "VP"],
    isPremium: true,
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold and expressive format for roles in marketing, media, and the arts.",
    icon: Star,
    color: "from-orange-500 to-orange-700",
    tags: ["Marketing", "Media", "Arts"],
    isPremium: true,
  },
  {
    id: "simple",
    name: "Simple",
    description: "Minimal and clean — lets your content shine without distraction.",
    icon: FileText,
    color: "from-slate-500 to-slate-700",
    tags: ["Any Industry", "Entry Level"],
    isPremium: true,
  },
  {
    id: "academic",
    name: "Academic",
    description: "Structured format tailored for academic positions, research, and grants.",
    icon: Mail,
    color: "from-emerald-500 to-emerald-700",
    tags: ["Research", "Academia", "PhD"],
    isPremium: true,
  },
];

export default async function CoverLetterStartPage() {
  let isPro = false;
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .single();
      isPro = profile?.subscription_status === 'active';
    }
  } catch {}

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-16 pb-10 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--teal-100)] text-[var(--teal-700)] text-sm font-medium mb-6">
          <Mail className="w-4 h-4" />
          Cover Letter Builder
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Write a Cover Letter
          <br />
          <span className="text-teal">That Gets Interviews</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
          Choose a template and let AI craft a compelling, personalized cover letter in seconds —
          tailored to the job and company you&apos;re targeting.
        </p>
        <Link
          href="/builder/cover-letter/new?template=professional"
          className="btn-teal inline-flex items-center gap-2 text-base"
        >
          <Plus className="w-4 h-4" />
          Start from Scratch
        </Link>
      </section>

      {/* Templates Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-foreground mb-2">Choose a Template</h2>
        <p className="text-muted-foreground mb-8">
          Start with a professionally designed template or begin blank.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Start from Scratch card */}
          <Link
            href="/builder/cover-letter/new?template=blank"
            className="group relative border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-3 min-h-[220px] hover:border-[var(--teal)] hover:bg-[var(--teal-50)] transition-colors cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center group-hover:bg-[var(--teal-100)] transition-colors">
              <Plus className="w-7 h-7 text-muted-foreground group-hover:text-[var(--teal)] transition-colors" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground group-hover:text-[var(--teal)] transition-colors">
                Start from Scratch
              </p>
              <p className="text-sm text-muted-foreground mt-1">Blank canvas, your words</p>
            </div>
          </Link>

          {/* Template cards */}
          {coverLetterTemplates.map((template) => {
            const Icon = template.icon;
            const canUse = !template.isPremium || isPro;
            return canUse ? (
              <Link
                key={template.id}
                href={`/builder/cover-letter/new?template=${template.id}`}
                className="group relative border border-border rounded-2xl p-6 hover:border-[var(--teal)] hover:shadow-md transition-all card-shadow bg-card flex flex-col gap-4"
              >
                {!template.isPremium && (
                  <span className="absolute top-4 right-4 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    Free
                  </span>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-lg mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{template.description}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {template.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="text-sm font-medium text-teal group-hover:underline">
                  Use this template →
                </div>
              </Link>
            ) : (
              <Link
                key={template.id}
                href="/upgrade?from=%2Fbuilder%2Fcover-letter"
                className="group relative border border-border rounded-2xl p-6 hover:border-amber-300 hover:shadow-md transition-all card-shadow bg-card flex flex-col gap-4"
              >
                <span className="absolute top-4 right-4 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  PRO
                </span>

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center shadow-sm opacity-60`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-lg mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{template.description}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {template.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-sm font-medium text-amber-600">
                  <Lock className="w-3.5 h-3.5" />
                  Upgrade to Pro to unlock
                </div>
              </Link>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          {isPro ? (
            'You have access to all templates.'
          ) : (
            <>
              Unlock all templates with{' '}
              <Link href="/upgrade?from=%2Fbuilder%2Fcover-letter" className="text-teal-600 hover:underline font-medium">
                Pro — $9.99/month
              </Link>
              .
            </>
          )}
        </p>
      </section>
    </div>
  );
}
