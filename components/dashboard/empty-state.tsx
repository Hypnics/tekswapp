interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="dashboard-panel rounded-[1.75rem] px-6 py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/8 text-lg font-semibold text-cyan-200">
        TS
      </div>
      <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/65">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="brand-button mt-5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
