const steps = [
  {
    number: '01',
    title: 'Find the right listing',
    description:
      'Search by brand, model, or category and narrow down results with condition and verified-seller filters.',
  },
  {
    number: '02',
    title: 'Review the details',
    description:
      'Check the condition, specs, seller notes, and seller profile before you move ahead.',
  },
  {
    number: '03',
    title: 'Checkout through TekSwapp',
    description:
      'The marketplace flow is designed around protected checkout and tracked shipping so the order stays visible.',
  },
  {
    number: '04',
    title: 'Track the order',
    description:
      'If anything feels off, buyer protection and support pages are already linked into the experience.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 pb-20">
      <div className="mx-auto max-w-7xl rounded-[2.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(79,140,255,0.16),rgba(255,255,255,0.06))] p-6 sm:p-8 lg:p-10">
        <div className="mb-8 max-w-3xl">
          <p className="section-kicker">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Shopping on TekSwapp in four steps
          </h2>
          <p className="section-copy mt-3 text-sm leading-relaxed sm:text-base">
            The buying flow is designed to feel straightforward: find a device, review the
            details, checkout, and stay informed as the order moves.
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
