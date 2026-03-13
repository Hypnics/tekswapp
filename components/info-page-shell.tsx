import Link from 'next/link'
import Footer from '@/components/footer'
import Navbar from '@/components/navbar'

export interface InfoPageSection {
  title: string
  paragraphs: string[]
  bullets?: string[]
}

interface InfoPageShellProps {
  eyebrow: string
  title: string
  description: string
  updatedAt?: string
  sections: InfoPageSection[]
  cta?: {
    label: string
    href: string
  }
}

export default function InfoPageShell({
  eyebrow,
  title,
  description,
  updatedAt,
  sections,
  cta,
}: InfoPageShellProps) {
  return (
    <div className="page-shell text-white">
      <Navbar />
      <main className="relative px-4 pb-20 pt-28">
        <article className="surface-card mx-auto max-w-4xl rounded-[2.15rem] p-6 sm:p-10">
          <p className="section-kicker">{eyebrow}</p>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{title}</h1>
          <p className="section-copy mt-4 text-sm leading-relaxed sm:text-base">{description}</p>
          {updatedAt ? (
            <p className="mt-3 text-xs uppercase tracking-[0.12em] text-white/45">
              Last updated: {updatedAt}
            </p>
          ) : null}

          <div className="mt-10 space-y-7">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-5 sm:p-6"
              >
                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
                <div className="mt-3 space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-relaxed text-white/70">
                      {paragraph}
                    </p>
                  ))}
                </div>
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/70">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {cta && (
            <div className="mt-8">
              <Link
                href={cta.href}
                className="brand-button inline-flex rounded-full px-5 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
              >
                {cta.label}
              </Link>
            </div>
          )}
        </article>
      </main>
      <Footer />
    </div>
  )
}
