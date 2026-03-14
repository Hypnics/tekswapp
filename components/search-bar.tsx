'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const categories = [
  'All categories',
  'Phones',
  'Tablets',
  'Laptops',
  'Consoles',
  'Wearables',
  'Audio',
  'Other',
]

const defaultSuggestions = [
  'iPhone 15 Pro',
  'MacBook Pro M3',
  'Galaxy S24 Ultra',
  'iPad Pro',
  'PS5 Slim',
]

interface SearchBarProps {
  className?: string
  showSuggestions?: boolean
  initialQuery?: string
  initialCategory?: string
  suggestions?: string[]
}

export default function SearchBar({
  className = '',
  showSuggestions = true,
  initialQuery = '',
  initialCategory = 'All categories',
  suggestions = defaultSuggestions,
}: SearchBarProps) {
  const router = useRouter()
  const normalizedInitialCategory = categories.includes(initialCategory)
    ? initialCategory
    : 'All categories'
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(normalizedInitialCategory)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    setCategory(normalizedInitialCategory)
  }, [normalizedInitialCategory])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (category !== 'All categories') params.set('category', category)
    const queryString = params.toString()
    router.push(queryString ? `/listings?${queryString}` : '/listings')
  }

  return (
    <div className={className}>
      <form
        onSubmit={handleSearch}
        className={`surface-card overflow-hidden rounded-[2rem] transition-all duration-200 ${
          focused ? 'scale-[1.005] border-[#67F2FF]/35' : ''
        }`}
      >
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_220px_190px]">
          <label className="flex items-center gap-3 px-5 py-4 sm:px-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/62">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20L16.2 16.2" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 text-[10px] uppercase tracking-[0.22em] text-white/38">
                Search phones, laptops, and more
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Search by brand, model, or device..."
                className="h-8 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40 sm:text-[15px]"
              />
            </div>
          </label>

          <div className="border-t border-white/8 lg:border-l lg:border-t-0">
            <label className="flex h-full items-center gap-3 px-5 py-4">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/38">Category</div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full cursor-pointer bg-transparent text-sm text-white/74 outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#112a4d] text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="border-t border-white/8 p-3 lg:border-l lg:border-t-0">
            <button
              type="submit"
              className="brand-button h-full min-h-[54px] w-full rounded-[1.35rem] px-6 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
            >
              Search Listings
            </button>
          </div>
        </div>
      </form>

      {showSuggestions ? (
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/38">Try a search</span>
          {suggestions.map((term) => (
            <button
              key={term}
              type="button"
              className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-white/70 transition-colors hover:border-[#67F2FF]/28 hover:text-white"
              onClick={() => {
                setQuery(term)
                router.push(`/listings?q=${encodeURIComponent(term)}`)
              }}
            >
              {term}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
