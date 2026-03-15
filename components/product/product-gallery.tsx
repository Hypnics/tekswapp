'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ProductGalleryProps {
  images: string[]
  title: string
  verified: boolean
}

export default function ProductGallery({ images, title, verified }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = images[activeIndex] ?? images[0]

  return (
    <div className="space-y-3">
      <div className="surface-card-soft relative aspect-square overflow-hidden rounded-2xl">
        <Image
          src={activeImage}
          alt={title}
          fill
          unoptimized
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {verified ? (
          <div className="absolute left-4 top-4 rounded-full bg-[#2563EB]/90 px-3 py-1.5 text-xs font-semibold text-white">
            TekSwapp Verified
          </div>
        ) : null}
        <div className="absolute bottom-4 right-4 rounded-full border border-white/12 bg-[#091427]/82 px-3 py-1.5 text-xs font-medium text-white">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-square overflow-hidden rounded-xl border ${
                index === activeIndex ? 'border-[#67F2FF]/45' : 'border-white/10'
              }`}
            >
              <Image src={image} alt={`${title} photo ${index + 1}`} fill unoptimized className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
