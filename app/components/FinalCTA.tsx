'use client'

import { Clock, ArrowRight } from 'lucide-react'
import ClickTracker from './ClickTracker'

interface FinalCTAProps {
  config: {
    designA: { name: string; link: string }
    designB: { name: string; link: string }
    price: string
  }
  trailingDesign: string
  trailingDesignLetter: 'A' | 'B'
  trailingLink: string
}

export default function FinalCTA({ config, trailingDesign, trailingDesignLetter, trailingLink }: FinalCTAProps) {
  return (
    <section className="border-t border-gray-800 bg-black">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        
        <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-600">
          <Clock className="h-8 w-8" />
        </div>

        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
          Time Is Running Out
        </h2>
        
        <p className="text-xl text-gray-400 mb-4">
          <strong className="text-white">{trailingDesign}</strong> is currently losing.
        </p>
        
        <p className="text-lg text-gray-500 mb-10">
          In less than 48 hours, one of these designs will disappear forever.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <ClickTracker
            design={trailingDesignLetter}
            element="save-trailing-cta"
            link={trailingLink}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-10 py-4 text-lg font-bold hover:bg-red-700"
          >
            Save {trailingDesign}
            <ArrowRight className="h-5 w-5" />
          </ClickTracker>
          <a
            href="#shop"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-700 px-10 py-4 text-lg font-bold hover:bg-gray-900"
          >
            View Both
          </a>
        </div>

        <p className="text-sm text-gray-600">
          ${config.price} • Shipping Cost Applied at Checkout • 30-Day Returns
        </p>

      </div>
    </section>
  )
}

