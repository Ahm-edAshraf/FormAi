'use client'

import { useState } from 'react'

interface RatingFieldProps {
  name: string
  required?: boolean
  initial?: number | null
}

export function RatingField({ name, required, initial = null }: RatingFieldProps) {
  const [value, setValue] = useState<number | null>(initial)
  const [hover, setHover] = useState<number | null>(null)

  const highlight = (star: number) => (hover ?? value ?? 0) >= star

  return (
    <div className="flex items-center gap-1">
      {/* Hidden input to post numeric value */}
      <input type="hidden" name={name} value={value ?? ''} />
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(null)}
          onClick={() => setValue(star)}
          className={`text-2xl leading-none transition-colors ${
            highlight(star) ? 'text-yellow-400' : 'text-slate-500/40'
          }`}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  )
}


