import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-ground-site text-ink">
      <Navbar />
      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col items-center gap-[18px] px-5 py-24 text-center">
        <span className="font-display text-[120px] font-extrabold leading-none text-brand">404</span>
        <h1 className="font-display m-0 text-[32px] font-bold tracking-[-1px] min-[761px]:text-[40px]">This page took a different job.</h1>
        <p className="m-0 text-lg leading-normal text-text-muted">The link may be old or mistyped. Here are some good places to go next.</p>
        <div className="flex flex-wrap justify-center gap-2.5">
          <Link href="/" className="rounded-xl bg-brand px-5 py-[15px] font-extrabold text-white no-underline">Go to home</Link>
          <Link href="/resume-templates" className="rounded-xl border-[1.5px] border-line-strong bg-white px-5 py-[15px] font-bold text-ink no-underline">Browse templates</Link>
          <Link href="/dashboard" className="rounded-xl border-[1.5px] border-line-strong bg-white px-5 py-[15px] font-bold text-ink no-underline">My dashboard</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
