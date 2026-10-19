export default function FaqItem({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="border-b border-line py-3">
      <summary className="flex min-h-[44px] cursor-pointer items-center text-[17px] font-bold">{q}</summary>
      <div className="mt-1.5 leading-[1.6] text-text-muted">{children}</div>
    </details>
  );
}
