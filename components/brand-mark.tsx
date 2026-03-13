import Link from 'next/link'
import IconMark from '@/components/icon-mark'

interface BrandMarkProps {
  href?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  subtitle?: string
}

function BrandText({ size }: { size: BrandMarkProps['size'] }) {
  return (
    <span className="brand-wordmark" data-size={size}>
      <span className="brand-wordmark-core">Tek</span>
      <span className="brand-wordmark-accent">Swapp</span>
    </span>
  )
}

function BrandContent({ size = 'md', subtitle }: Omit<BrandMarkProps, 'href' | 'className'>) {
  const iconSize =
    size === 'xl' ? 'h-16 w-16 rounded-[1.35rem]' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'

  return (
    <>
      <IconMark className={iconSize} />
      <span className="flex flex-col gap-1">
        <BrandText size={size} />
        {subtitle ? (
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/46 sm:text-[11px]">
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
}: BrandMarkProps) {
  const content = <BrandContent size={size} subtitle={subtitle} />

  if (!href) {
    return <div className={`inline-flex items-center gap-3 ${className}`}>{content}</div>
  }

  return (
    <Link href={href} className={`inline-flex items-center gap-3 ${className}`}>
      {content}
    </Link>
  )
}
