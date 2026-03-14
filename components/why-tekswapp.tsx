const highlights = [
  {
    title: 'Easier to compare',
    text: 'Listings are built around the details tech buyers usually look for first, so you spend less time guessing.',
  },
  {
    title: 'Seller info up front',
    text: 'Verified badges and seller history are shown right on the listing so trust signals are visible before checkout.',
  },
  {
    title: 'Structured checkout',
    text: 'The order flow is designed around tracked delivery and review checkpoints instead of a vague handoff.',
  },
  {
    title: 'Support that is easy to find',
    text: 'Buyer protection, seller standards, and contact support pages are linked throughout the storefront.',
  },
]

export default function WhyTekSwapp() {
  return (
    <section className="px-4 pb-20" id="advantages">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="surface-card rounded-[2rem] p-6 sm:p-7">
          <p className="section-kicker">Why TekSwapp</p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            Built for careful tech buyers
          </h2>
          <p className="section-copy mt-4 text-sm leading-relaxed sm:text-base">
            TekSwapp is a new marketplace, so trust has to be earned. We start by making listings
            clearer, seller information more visible, and support easier to reach.
          </p>

          <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/42">What shoppers get</p>
            <div className="mt-4 space-y-3">
              {[
                'Cleaner listing fields',
                'Visible seller verification',
                'Help pages linked from the shop flow',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-white/78">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#67F2FF]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {highlights.map((item, index) => (
            <article
              key={item.title}
              className="surface-card group rounded-[1.85rem] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#67F2FF]/28"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.24em] text-white/36">
                  0{index + 1}
                </span>
                <span className="h-px w-14 bg-gradient-to-r from-transparent via-[#67F2FF]/60 to-transparent" />
              </div>
              <h3 className="mt-8 text-2xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/68">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
