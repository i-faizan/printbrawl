'use client'

import { Smartphone, Zap, ArrowRight } from 'lucide-react'
import ClickTracker from './ClickTracker'

interface CTASectionProps {
  config: {
    designA: { name: string; link: string }
    designB: { name: string; link: string }
    price: string
  }
  trailingDesign: string
  trailingLink: string
  trailingDesignLetter: 'A' | 'B'
}

export default function CTASection({ config, trailingDesign, trailingLink, trailingDesignLetter }: CTASectionProps) {
  return (
    <>
      <div className="mt-6 flex flex-wrap gap-3">
        <ClickTracker
          design="A"
          element="vote-cta-main"
          link={config.designA.link}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.02] hover:bg-blue-400 active:scale-95"
        >
          <Smartphone className="h-5 w-5" />
          Vote {config.designA.name} • ${config.price}
        </ClickTracker>
        <ClickTracker
          design="B"
          element="vote-cta-main"
          link={config.designB.link}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-500 px-5 py-3 font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-500/20 transition hover:scale-[1.02] hover:bg-purple-400 active:scale-95"
        >
          <Zap className="h-5 w-5" />
          Vote {config.designB.name} • ${config.price}
        </ClickTracker>
      </div>
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center mb-8">
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
    </>
  )
}

