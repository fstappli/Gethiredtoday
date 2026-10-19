const FAQS: { q: string; a: string }[] = [
  {
    q: "What happens to my resumes if I cancel?",
    a: "They stay in your account. You keep the Free plan: edit one resume and download it as a PDF.",
  },
  {
    q: "Will I be charged automatically?",
    a: "Pro renews at the end of each billing period until you cancel. You keep Pro access through the end of the period you paid for.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "[Confirm payment methods supported by the payment provider]",
  },
  {
    q: "Can I switch between monthly and 3-month billing?",
    a: "[Confirm whether plan switching is supported]",
  },
];

export default function PricingFAQ() {
  return (
    <section className="mx-auto flex max-w-[820px] flex-col px-6 py-[72px]">
      <h2 className="font-display m-0 mb-3 text-4xl font-bold tracking-[-1px]">Billing questions</h2>
      {FAQS.map((f, i) => (
        <details key={f.q} open={i === 0} className="border-b border-line py-4">
          <summary className="flex min-h-[44px] cursor-pointer items-center text-[17px] font-bold">{f.q}</summary>
          <p className="mb-0 mt-1.5 leading-[1.6] text-text-muted">{f.a}</p>
        </details>
      ))}
    </section>
  );
}
