import type { MoneyDisplay } from '@/lib/currency/presenter'

interface PriceDisplayProps {
  money: MoneyDisplay
  originalMoney?: MoneyDisplay
  amountClassName?: string
  originalAmountClassName?: string
  metaClassName?: string
  showBasePrice?: boolean
}

export default function PriceDisplay({
  money,
  originalMoney,
  amountClassName,
  originalAmountClassName,
  metaClassName,
  showBasePrice = true,
}: PriceDisplayProps) {
  return (
    <div>
      <div className="flex flex-wrap items-end gap-2">
        {money.isApproximate ? (
          <span className="rounded-full border border-[#67F2FF]/18 bg-[#67F2FF]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#67F2FF]">
            Approx.
          </span>
        ) : null}
        <span className={amountClassName}>{money.formatted}</span>
        {originalMoney ? (
          <span className={originalAmountClassName}>{originalMoney.formatted}</span>
        ) : null}
      </div>
      {showBasePrice && money.isConverted ? (
        <p className={metaClassName}>Base price {money.baseFormatted}</p>
      ) : null}
    </div>
  )
}
