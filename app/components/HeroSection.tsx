'use client'

import { useState } from 'react'
import { Clock, Flame, Shield, Smartphone, Zap } from 'lucide-react'
import DesignPreview from './DesignPreview'
import ImageModal from './ImageModal'
import CTASection from './CTASection'
import ClickTracker from './ClickTracker'

interface Config {
  designA: { name: string; image: string; mockups: string[]; purchases: number; link: string }
  designB: { name: string; image: string; mockups: string[]; purchases: number; link: string }
  price: string
  heroText: string
}

interface HeroSectionProps {
  config: Config
}

export default function HeroSection({ config }: HeroSectionProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalDesign, setModalDesign] = useState<'A' | 'B' | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const designAPurchases = config.designA.purchases
  const designBPurchases = config.designB.purchases
  const trailingDesign = designAPurchases >= designBPurchases ? config.designB.name : config.designA.name
  const gap = Math.abs(designAPurchases - designBPurchases)
  const trailingDesignLetter = designAPurchases >= designBPurchases ? 'B' : 'A'
  const trailingLink = designAPurchases >= designBPurchases ? config.designB.link : config.designA.link

  const handleImageClick = (design: 'A' | 'B') => {
    setModalDesign(design)
    setSelectedImageIndex(0)
    setModalOpen(true)
  }

  return (
    <>
      <section id="shop" className="relative">
        {/* Soft background glows */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-16 -top-20 h-[520px] w-[520px] rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-10 h-[520px] w-[520px] rounded-full bg-purple-500/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          
          {/* Badge */}
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wider text-zinc-300">
            Limited 48-Hour Drop • No Reprints
          </p>
          
          {/* Headline */}
          <h1 className="text-balance text-5xl font-extrabold uppercase leading-[0.95] tracking-tighter md:text-6xl mb-4">
            Two Cases.
            <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              One Survives.
            </span>
          </h1>
            
          {/* Price & Device Info */}
          <div className="mb-8 flex flex-col sm:flex-row items-center gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-2">
              <span className="text-2xl font-black text-white">${config.price}</span>
              <span className="text-xs text-zinc-400 uppercase tracking-wider">All Models</span>
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-zinc-400">
              <Smartphone className="h-4 w-4" />
              <span>Compatible with iPhone & Samsung models</span>
            </div>
          </div>

          {/* Two-column layout: Images + Content */}
          <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2">
            
            {/* Left column on desktop / Top on mobile: Two case previews */}
            <DesignPreview config={config} onImageClick={handleImageClick} />

            {/* Right column on desktop / Bottom on mobile: Copy + Counters + CTAs */}
            <div className="order-2 md:order-1">
              <p className="max-w-xl text-lg text-zinc-300">
                {config.heroText}
              </p>

              {/* Countdown */}
              <div
                className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                aria-live="polite"
              >
                <Clock className="h-5 w-5 text-zinc-400" />
                <span className="text-sm text-zinc-400">Battle ends in</span>
                <div className="ml-auto grid grid-flow-col gap-2">
                  {["days", "hours", "minutes", "seconds"].map((unit) => (
                    <div
                      key={unit}
                      className="min-w-[72px] rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-center"
                    >
                      <div id={`cd-${unit}`} className="font-mono text-2xl font-bold" />
                      <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                        {unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Reset Schedule Info */}
              <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-zinc-400 text-center">
                  ⏰ Resets every 2 days at <strong className="text-white">12AM US Central Time</strong>
                </p>
              </div>

              {/* Current Standing */}
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center justify-between text-xs text-zinc-400">
                  <span className="inline-flex items-center gap-2">
                    <Flame className="h-4 w-4 text-red-400" /> Current Standing
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-black text-white">{designAPurchases}</div>
                    <div className="mt-1 text-xs text-zinc-500 uppercase tracking-wide">Purchases</div>
                    <div className="mt-2 inline-block rounded-full bg-blue-600 px-3 py-1 text-xs font-bold">
                      {config.designA.name}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-white">{designBPurchases}</div>
                    <div className="mt-1 text-xs text-zinc-500 uppercase tracking-wide">Purchases</div>
                    <div className="mt-2 inline-block rounded-full bg-purple-600 px-3 py-1 text-xs font-bold">
                      {config.designB.name}
                    </div>
                  </div>
                </div>
                {gap > 0 && (
                  <p className="mt-3 text-center text-xs text-zinc-400">
                    <strong className="text-white">{trailingDesign}</strong> needs{" "}
                    <strong className="text-red-400">{gap + 1}</strong> more to survive
                  </p>
                )}
              </div>

              {/* CTAs */}
              <CTASection 
                config={config}
                trailingDesign={trailingDesign}
                trailingLink={trailingLink}
                trailingDesignLetter={trailingDesignLetter}
              />

              <p className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
                <Shield className="h-4 w-4" />
                Limited drop • Premium protection • iPhone & Samsung compatible
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Image Modal */}
      <ImageModal
        modalOpen={modalOpen}
        modalDesign={modalDesign}
        selectedImageIndex={selectedImageIndex}
        config={config}
        onClose={() => setModalOpen(false)}
        onImageSelect={setSelectedImageIndex}
      />
    </>
  )
}

