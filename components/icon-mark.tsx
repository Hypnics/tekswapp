interface IconMarkProps {
  className?: string
}

export default function IconMark({ className = '' }: IconMarkProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-[1.05rem] border border-white/14 bg-[#08111f]/90 text-white shadow-[0_18px_35px_rgba(5,10,24,0.42)] backdrop-blur-xl ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(103,242,255,0.2),transparent_58%),linear-gradient(145deg,rgba(79,140,255,0.28),rgba(9,17,31,0.16))]" />
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="relative z-10 h-[58%] w-[58%]"
        fill="none"
      >
        <path
          d="M4.75 10.25L9.25 5.75L14 10.5L19.25 5.75"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.75 17.5L9.25 13L14 17.75L19.25 13"
          stroke="#67F2FF"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M3.5 3.5H7.25" stroke="#FFBE72" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </div>
  )
}
