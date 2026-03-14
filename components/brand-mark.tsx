import Link from 'next/link'
import IconMark from '@/components/icon-mark'

interface BrandMarkProps {
  href?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  subtitle?: string
  compactOnMobile?: boolean
}

function BrandText({ size }: { size: BrandMarkProps['size'] }) {
  return (
    <span className="brand-wordmark" data-size={size}>
      <span className="brand-wordmark-core">Tek</span>
      <span className="brand-wordmark-accent">Swapp</span>
    </span>
  )
}

function BrandContent({
  size = 'md',
  subtitle,
  compactOnMobile = false,
}: Omit<BrandMarkProps, 'href' | 'className'>) {
  const iconSize = compactOnMobile
    ? size === 'xl'
      ? 'h-14 w-14 rounded-[1.2rem] sm:h-16 sm:w-16 sm:rounded-[1.35rem]'
      : size === 'lg'
        ? 'h-10 w-10 sm:h-12 sm:w-12'
        : 'h-8 w-8 sm:h-10 sm:w-10'
    : size === 'xl'
      ? 'h-16 w-16 rounded-[1.35rem]'
      : size === 'lg'
        ? 'h-12 w-12'
        : 'h-10 w-10'

  return (
    <>
      <IconMark className={iconSize} />
      <span className="min-w-0 flex flex-col gap-1">
        <BrandText size={size} />
        {subtitle ? (
          <span
            className={`max-w-full text-[10px] leading-tight uppercase text-white/46 tracking-[0.22em] sm:text-[11px] sm:tracking-[0.3em] ${
              compactOnMobile ? 'hidden sm:block' : 'block'
            }`}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </>
  )
}

export default function BrandMark({
  href,
  className = '',
  size = 'md',
  subtitle,
  compactOnMobile = false,
}: BrandMarkProps) {
  const content = <BrandContent size={size} subtitle={subtitle} compactOnMobile={compactOnMobile} />

  if (!href) {
    return <div className={`inline-flex items-center gap-3 ${className}`}>{content}</div>
  }

  return (
    <Link href={href} className={`inline-flex items-center gap-3 ${className}`}>
      {content}
    </Link>
  )
}
