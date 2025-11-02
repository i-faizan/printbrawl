'use client'

import { Smartphone, Zap } from 'lucide-react'
import ClickTracker from './ClickTracker'

interface Config {
  designA: { name: string; image: string; mockups: string[]; purchases: number; link: string }
  designB: { name: string; image: string; mockups: string[]; purchases: number; link: string }
  price: string
}

interface DesignPreviewProps {
  config: Config
  onImageClick: (design: 'A' | 'B') => void
}

export default function DesignPreview({ config, onImageClick }: DesignPreviewProps) {
  return (
    <div className="grid grid-cols-2 gap-4 order-1 md:order-2">
      {/* Design A Preview */}
      <figure className="group">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div 
            className="aspect-[3/4] relative cursor-pointer" 
            onClick={() => onImageClick('A')}
          >
            <img
              src={config.designA.image}
              alt={`${config.designA.name} case preview`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
          {/* Desktop overlay */}
          <figcaption className="absolute inset-x-0 bottom-0 hidden md:flex items-center justify-between bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-blue-300" />
              <span className="text-sm font-semibold">{config.designA.name}</span>
            </div>
            <ClickTracker
              design="A"
              element="image-overlay-cta"
              link={config.designA.link}
              className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur transition hover:bg-white/20"
            >
              ${config.price}
            </ClickTracker>
          </figcaption>
        </div>
        {/* Mobile label below image */}
        <div className="mt-3 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-blue-300" />
            <span className="text-sm font-semibold">{config.designA.name}</span>
          </div>
          <ClickTracker
            design="A"
            element="mobile-cta"
            link={config.designA.link}
            className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur transition hover:bg-white/20"
          >
            ${config.price}
          </ClickTracker>
        </div>
      </figure>

      {/* Design B Preview */}
      <figure className="group">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div 
            className="aspect-[3/4] relative cursor-pointer" 
            onClick={() => onImageClick('B')}
          >
            <img
              src={config.designB.image}
              alt={`${config.designB.name} case preview`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
          {/* Desktop overlay */}
          <figcaption className="absolute inset-x-0 bottom-0 hidden md:flex items-center justify-between bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-300" />
              <span className="text-sm font-semibold">{config.designB.name}</span>
            </div>
            <ClickTracker
              design="B"
              element="image-overlay-cta"
              link={config.designB.link}
              className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur transition hover:bg-white/20"
            >
              ${config.price}
            </ClickTracker>
          </figcaption>
        </div>
        {/* Mobile label below image */}
        <div className="mt-3 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-300" />
            <span className="text-sm font-semibold">{config.designB.name}</span>
          </div>
          <ClickTracker
            design="B"
            element="mobile-cta"
            link={config.designB.link}
            className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur transition hover:bg-white/20"
          >
            ${config.price}
          </ClickTracker>
        </div>
      </figure>
    </div>
  )
}

