import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { RESUME_EXAMPLES } from "@/lib/resume-examples-data";

export const metadata = {
  title: "About",
  description: "Friendly, honest tools that help people present their best work and spend less time on applications.",
};

const VALUES = [
  { t: "Free means free", d: "Your first resume and PDF never sit behind a paywall or a surprise trial." },
  { t: "You stay in control", d: "Nothing is sent in your name without your say. Cancel in two clicks." },
  { t: "Your data is yours", d: "Export or delete everything from your account at any time." },
];

export default function AboutPage() {
  const stats = [
    { v: "50K+", l: "resumes built" },
    { v: "60+", l: "templates" },
    { v: String(RESUME_EXAMPLES.length), l: "resume examples" },
  ];
  return (
    <div className="flex min-h-screen flex-col bg-ground-site text-ink">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto flex max-w-[980px] flex-col gap-5 px-5 pb-10 pt-[72px]">
          <span className="text-sm font-extrabold tracking-[1px] text-brand">ABOUT US</span>
          <h1 className="font-display m-0 text-[42px] font-bold leading-none tracking-[-2px] min-[761px]:text-[62px]">Job hunting is hard enough. Your tools shouldn&apos;t be.</h1>
          <p className="m-0 max-w-[760px] text-xl leading-[1.6] text-text-muted">
            We build friendly, honest tools that help people present their best work and spend less time on applications.
          </p>
        </section>
        <section className="mx-auto grid max-w-[1240px] gap-[18px] px-5 pb-16 pt-6 [grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr))]">
          {VALUES.map((v) => (
            <div key={v.t} className="flex flex-col gap-2 rounded-[20px] border border-line bg-white p-6">
              <b className="font-display text-[22px]">{v.t}</b>
              <span className="leading-[1.55] text-text-muted">{v.d}</span>
            </div>
          ))}
        </section>
        <section className="border-y border-line bg-white">
          <dl className="m-0 mx-auto grid max-w-[1240px] gap-6 px-5 py-14 [grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr))]">
            {stats.map((s) => (
              <div key={s.l}>
                <dd className="font-display m-0 text-[40px] font-extrabold">{s.v}</dd>
                <dt className="text-text-muted">{s.l}</dt>
              </div>
            ))}
          </dl>
        </section>
        <section className="px-5 pb-[72px] pt-16">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-3.5 rounded-[28px] bg-brand px-6 py-[52px] text-center text-white">
            <h2 className="font-display m-0 text-[32px] font-bold tracking-[-1.1px] min-[761px]:text-[40px]">Come build your resume with us.</h2>
            <Link href="/signup" className="rounded-[14px] bg-sun px-[26px] py-[17px] font-extrabold text-ink no-underline">Create free account</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
