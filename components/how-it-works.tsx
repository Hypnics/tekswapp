const steps = [
  {
    number: '01',
    title: 'List the device',
    description:
      'Publish photos, condition notes, storage, and included accessories so buyers see the full picture up front.',
  },
  {
    number: '02',
    title: 'Buyer checks out',
    description:
      'Payment is captured through a protected flow and held while the order moves through the delivery stage.',
  },
  {
    number: '03',
    title: 'Ship with tracking',
    description:
      'Tracked delivery keeps both sides aligned and gives support a cleaner signal if something goes sideways.',
  },
  {
    number: '04',
    title: 'Payout is released',
    description:
      'Once delivery conditions are met, the seller receives payout according to platform policy and review rules.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 pb-20">
      <div className="mx-auto max-w-7xl rounded-[2.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(79,140,255,0.16),rgba(255,255,255,0.06))] p-6 sm:p-8 lg:p-10">
        <div className="mb-8 max-w-3xl">
          <p className="section-kicker">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            A transaction flow that keeps both sides aligned
          </h2>
          <p className="section-copy mt-3 text-sm leading-relaxed sm:text-base">
            TekSwapp is opinionated about the order lifecycle so devices do not move through a
            vague, trust-me marketplace experience.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <article
              key={step.number}
              className="rounded-[1.75rem] border border-white/8 bg-white/[0.07] p-5 backdrop-blur-sm"
            >
              <p className="text-sm font-semibold tracking-[0.22em] text-[#67F2FF]">{step.number}</p>
              <h3 className="mt-6 text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/68">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
