'use client'

import Script from "next/script";
import { useState, useEffect } from "react";
import {
  Clock, Flame, Shield, Package, RotateCcw, Smartphone, Zap, ArrowRight, X,
  Layers, Radio, Sparkles, Droplet, Globe, Info
} from "lucide-react";
import { getNextRotationDate } from "./lib/Constant";

interface Config {
  designA: { name: string; image: string; mockups: string[]; purchases: number; link: string };
  designB: { name: string; image: string; mockups: string[]; purchases: number; link: string };
  price: string;
  heroText: string;
  features: string[];
}

export default function Page() {
  const [config, setConfig] = useState<Config | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDesign, setModalDesign] = useState<'A' | 'B' | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const nextRotation = getNextRotationDate();
  
  // Handle keyboard navigation in modal
  useEffect(() => {
    if (!modalOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalOpen(false);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const allImages = modalDesign === 'A' 
          ? [config!.designA.image, ...(config!.designA.mockups || [])]
          : [config!.designB.image, ...(config!.designB.mockups || [])];
        setSelectedImageIndex(prev => (prev > 0 ? prev - 1 : allImages.length - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const allImages = modalDesign === 'A' 
          ? [config!.designA.image, ...(config!.designA.mockups || [])]
          : [config!.designB.image, ...(config!.designB.mockups || [])];
        setSelectedImageIndex(prev => (prev < allImages.length - 1 ? prev + 1 : 0));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, modalDesign, config]);

  // Initialize user session and tracking
  useEffect(() => {
    // Generate or retrieve session ID
    let sessionId = localStorage.getItem('pb_session_id')
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('pb_session_id', sessionId)
    }

    // Generate or retrieve user ID
    let userId = localStorage.getItem('pb_user_id')
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('pb_user_id', userId)
    }

    // Create or update session
    fetch('/api/analytics/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        userId,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        deviceType: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
      })
    }).catch(() => {})

    // Track page view
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'pageview',
        timestamp: new Date().toISOString(),
        sessionId,
        userId
      })
    }).catch(() => {})

    // Update session activity
    fetch('/api/analytics/sessions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        type: 'pageview',
        timestamp: new Date().toISOString()
      })
    }).catch(() => {})

    // Track scroll depth
    let maxScroll = 0
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollDepth = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0
      
      if (scrollDepth > maxScroll) {
        maxScroll = scrollDepth
        fetch('/api/analytics/sessions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            type: 'scroll',
            data: { scrollDepth },
            timestamp: new Date().toISOString()
          })
        }).catch(() => {})
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // Track time on page every 10 seconds
    const timeInterval = setInterval(() => {
      fetch('/api/analytics/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          type: 'activity',
          timestamp: new Date().toISOString()
        })
      }).catch(() => {})
    }, 10000)

    // Track exit intent
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        fetch('/api/analytics/sessions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            type: 'exit',
            timestamp: new Date().toISOString()
          })
        }).catch(() => {})
      }
    }
    document.addEventListener('mouseleave', handleMouseLeave)

    // Track before unload
    const handleBeforeUnload = () => {
      const timeOnPage = Math.floor((Date.now() - parseInt(sessionId.split('_')[1])) / 1000)
      fetch('/api/analytics/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          type: 'exit',
          timestamp: new Date().toISOString()
        }),
        keepalive: true
      }).catch(() => {})
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    fetch('/api/config')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(() => {
        // Fallback to defaults if API fails
        setConfig({
          designA: { 
            name: "Design A", 
            image: "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=800&fit=crop&q=80", 
            mockups: ["https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=800&fit=crop&q=80"],
            purchases: 127, 
            link: "YOUR_GUMROAD_DESIGN_A_LINK" 
          },
          designB: { 
            name: "Design B", 
            image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=800&fit=crop&q=80", 
            mockups: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=800&fit=crop&q=80"],
            purchases: 143, 
            link: "YOUR_GUMROAD_DESIGN_B_LINK" 
          },
          price: "24.99",
          heroText: "Your purchase is your vote. The champion stays in the collection. The loser is vaulted forever. Choose your design—and protect your phone in style.",
          features: [
            "Military-grade shock absorption keeps your phone safe from drops and impacts.",
            "Compatible with iPhone & Samsung models. Precise cutouts for all ports and buttons.",
            "Durable TPU with polycarbonate backing. Lightweight, slim, and built to last."
          ]
        });
      });

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearInterval(timeInterval)
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, []);

  if (!config) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const designAPurchases = config.designA.purchases;
  const designBPurchases = config.designB.purchases;
  const leadingDesign = designAPurchases >= designBPurchases ? config.designA.name : config.designB.name;
  const trailingDesign = designAPurchases >= designBPurchases ? config.designB.name : config.designA.name;
  const gap = Math.abs(designAPurchases - designBPurchases);

  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-black border-b border-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-red-600">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">PRINT BRAWL</span>
          </div>
          <a
            href="#shop"
            className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700"
          >
            Shop Now
          </a>
        </div>
      </header>

      <main className="bg-black text-white">
        {/* TIMER BAR */}
        <div className="border-b border-gray-800 bg-red-600">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <div className="flex items-center justify-center gap-3">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-bold uppercase tracking-wider">
                Next Drop: <span id="countdown" className="font-mono"></span>
              </span>
            </div>
          </div>
        </div>

        {/* HERO WITH DESIGNS */}
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
              <div className="grid grid-cols-2 gap-4 order-1 md:order-2">
                
                {/* Design A Preview */}
                <figure className="group">
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <div className="aspect-[3/4] relative cursor-pointer" onClick={() => {
                      setModalDesign('A');
                      setSelectedImageIndex(0);
                      setModalOpen(true);
                    }}>
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
                      <a
                        data-cta="design-a"
                        href={config.designA.link}
                        onClick={(e) => {
                          const sessionId = localStorage.getItem('pb_session_id') || ''
                          const userId = localStorage.getItem('pb_user_id') || ''
                          
                          fetch('/api/analytics', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              type: 'click',
                              timestamp: new Date().toISOString(),
                              design: 'A',
                              element: 'image-overlay-cta',
                              link: config.designA.link,
                              sessionId,
                              userId
                            })
                          }).catch(() => {})

                          fetch('/api/analytics/sessions', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              sessionId,
                              type: 'click',
                              data: { design: 'A', element: 'image-overlay-cta', link: config.designA.link, type: 'product-link' },
                              timestamp: new Date().toISOString()
                            })
                          }).catch(() => {})
                        }}
                        className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur transition hover:bg-white/20"
                      >
                        ${config.price}
                      </a>
                    </figcaption>
                  </div>
                  {/* Mobile label below image */}
                  <div className="mt-3 flex items-center justify-between md:hidden">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-blue-300" />
                      <span className="text-sm font-semibold">{config.designA.name}</span>
                    </div>
                  <a
                    data-cta="design-a"
                    href={config.designA.link}
                    onClick={(e) => {
                      const sessionId = localStorage.getItem('pb_session_id') || ''
                      const userId = localStorage.getItem('pb_user_id') || ''
                      
                      fetch('/api/analytics', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          type: 'click',
                          timestamp: new Date().toISOString(),
                          design: 'A',
                          element: 'mobile-cta',
                          link: config.designA.link,
                          sessionId,
                          userId
                        })
                      }).catch(() => {})

                      fetch('/api/analytics/sessions', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          sessionId,
                          type: 'click',
                          data: { design: 'A', element: 'mobile-cta', link: config.designA.link, type: 'product-link' },
                          timestamp: new Date().toISOString()
                        })
                      }).catch(() => {})
                    }}
                    className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur transition hover:bg-white/20"
                  >
                    ${config.price}
                  </a>
                  </div>
                </figure>

                {/* Design B Preview */}
                <figure className="group">
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <div className="aspect-[3/4] relative cursor-pointer" onClick={() => {
                      setModalDesign('B');
                      setSelectedImageIndex(0);
                      setModalOpen(true);
                    }}>
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
                      <a
                        data-cta="design-b"
                        href={config.designB.link}
                        onClick={(e) => {
                          const sessionId = localStorage.getItem('pb_session_id') || ''
                          const userId = localStorage.getItem('pb_user_id') || ''
                          
                          fetch('/api/analytics', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              type: 'click',
                              timestamp: new Date().toISOString(),
                              design: 'B',
                              element: 'image-overlay-cta',
                              link: config.designB.link,
                              sessionId,
                              userId
                            })
                          }).catch(() => {})

                          fetch('/api/analytics/sessions', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              sessionId,
                              type: 'click',
                              data: { design: 'B', element: 'image-overlay-cta', link: config.designB.link, type: 'product-link' },
                              timestamp: new Date().toISOString()
                            })
                          }).catch(() => {})
                        }}
                        className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur transition hover:bg-white/20"
                      >
                        ${config.price}
                      </a>
                    </figcaption>
                  </div>
                  {/* Mobile label below image */}
                  <div className="mt-3 flex items-center justify-between md:hidden">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-purple-300" />
                      <span className="text-sm font-semibold">{config.designB.name}</span>
                    </div>
                    <a
                      data-cta="design-b"
                      href={config.designB.link}
                      onClick={(e) => {
                        const sessionId = localStorage.getItem('pb_session_id') || ''
                        const userId = localStorage.getItem('pb_user_id') || ''
                        
                        fetch('/api/analytics', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            type: 'click',
                            timestamp: new Date().toISOString(),
                            design: 'B',
                            element: 'mobile-cta',
                            link: config.designB.link,
                            sessionId,
                            userId
                          })
                        }).catch(() => {})

                        fetch('/api/analytics/sessions', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            sessionId,
                            type: 'click',
                            data: { design: 'B', element: 'mobile-cta', link: config.designB.link, type: 'product-link' },
                            timestamp: new Date().toISOString()
                          })
                        }).catch(() => {})
                      }}
                      className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur transition hover:bg-white/20"
                    >
                      ${config.price}
                    </a>
                  </div>
                </figure>

              </div>

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
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    data-cta="design-a"
                    href={config.designA.link}
                    onClick={(e) => {
                      const sessionId = localStorage.getItem('pb_session_id') || ''
                      const userId = localStorage.getItem('pb_user_id') || ''
                      
                      fetch('/api/analytics', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          type: 'click',
                          timestamp: new Date().toISOString(),
                          design: 'A',
                          element: 'vote-cta-main',
                          link: config.designA.link,
                          sessionId,
                          userId
                        })
                      }).catch(() => {})

                      fetch('/api/analytics/sessions', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          sessionId,
                          type: 'click',
                          data: { design: 'A', element: 'vote-cta-main', link: config.designA.link, type: 'product-link' },
                          timestamp: new Date().toISOString()
                        })
                      }).catch(() => {})
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.02] hover:bg-blue-400 active:scale-95"
                  >
                    <Smartphone className="h-5 w-5" />
                    Vote {config.designA.name} • ${config.price}
                  </a>
                  <a
                    data-cta="design-b"
                    href={config.designB.link}
                    onClick={(e) => {
                      const sessionId = localStorage.getItem('pb_session_id') || ''
                      const userId = localStorage.getItem('pb_user_id') || ''
                      
                      fetch('/api/analytics', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          type: 'click',
                          timestamp: new Date().toISOString(),
                          design: 'B',
                          element: 'vote-cta-main',
                          link: config.designB.link,
                          sessionId,
                          userId
                        })
                      }).catch(() => {})

                      fetch('/api/analytics/sessions', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          sessionId,
                          type: 'click',
                          data: { design: 'B', element: 'vote-cta-main', link: config.designB.link, type: 'product-link' },
                          timestamp: new Date().toISOString()
                        })
                      }).catch(() => {})
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-500 px-5 py-3 font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-500/20 transition hover:scale-[1.02] hover:bg-purple-400 active:scale-95"
                  >
                    <Zap className="h-5 w-5" />
                    Vote {config.designB.name} • ${config.price}
                  </a>
                </div>

                <p className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
                  <Shield className="h-4 w-4" />
                  Limited drop • Premium protection • iPhone & Samsung compatible
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-t border-gray-800 bg-black">
          <div className="mx-auto max-w-6xl px-6 py-20">
            
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                This isn't a regular store. Only the strongest designs survive.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              
              <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-8">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">48-Hour Battles</h3>
                <p className="text-gray-400 leading-relaxed">
                  Every 2 days, the design with fewer purchases is eliminated and replaced with a new challenger.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-8">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Your Vote Counts</h3>
                <p className="text-gray-400 leading-relaxed">
                  Every purchase is a vote. You decide which design deserves to stay and which disappears.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-8">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-600">
                  <Flame className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Winners Last Forever</h3>
                <p className="text-gray-400 leading-relaxed">
                  Survive multiple rounds and your design becomes permanent. Losers are gone forever.
                </p>
              </div>

            </div>

            <div className="mt-10 rounded-xl border border-yellow-800 bg-yellow-900/10 p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-lg bg-yellow-600 p-2">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-2">Right now, {trailingDesign} is at risk</h4>
                  <p className="text-gray-400">
                    If you love this design, buy it now. Once the timer runs out, it's gone forever and replaced with something new.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="border-t border-gray-800 bg-black">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">About</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-300 text-lg leading-relaxed">
                  Personalize your iPhone, Samsung Galaxy, and Google Pixel devices with premium-quality custom 
                  protective phone cases. Every case has double layers for extra durability and protection while 
                  the clear, open ports stay out of your way when it comes to charging. The outer polycarbonate 
                  shell will resist daily impacts. Choose between matte or glossy finish and enjoy adding a 
                  unique touch to your phone with our custom protective phone cases sourced from Korea.
                </p>
                <p className="text-blue-400 font-semibold text-lg">
                  New iPhone 17 series models now available!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* KEY FEATURES */}
        <section className="border-t border-gray-800 bg-gradient-to-b from-black to-gray-900">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-16">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Key Features</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
              
              {/* Dual Layer Protection */}
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                  <Layers className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Dual Layer Protection</h3>
                <p className="text-gray-400 leading-relaxed">
                  Custom protective phone cases made with 100% polycarbonate shell and 100% TPU lining for extra durability and protection.
                </p>
              </div>

              {/* Wireless Charging */}
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                  <Radio className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Wireless Charging</h3>
                <p className="text-gray-400 leading-relaxed">
                  Supports wireless charging for added convenience (not including MagSafe).
                </p>
              </div>

              {/* Premium Finish */}
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                  <Sparkles className="h-6 w-6 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Premium Finish</h3>
                <p className="text-gray-400 leading-relaxed">
                  All custom protective phone cases come in your choice of glossy or matte finish.
                </p>
              </div>

              {/* Open Ports */}
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                  <Package className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Clear Connectivity</h3>
                <p className="text-gray-400 leading-relaxed">
                  Clear, open ports for seamless connectivity and easy access to all buttons and features.
                </p>
              </div>

              {/* Country of Origin */}
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                  <Globe className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Quality Sourcing</h3>
                <p className="text-gray-400 leading-relaxed">
                  Blank product sourced from South Korea, ensuring premium quality and durability.
                </p>
              </div>

              {/* Care Instructions */}
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                  <Droplet className="h-6 w-6 text-blue-300" />
                </div>
                <h3 className="text-xl font-bold mb-3">Care Instructions</h3>
                <p className="text-gray-400 leading-relaxed">
                  Clean with a soft damp cotton or microfiber cloth. Add a drop of dish soap if needed.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* WHY CHOOSE - Customizable from Admin */}
        <section className="border-t border-gray-800 bg-black">
          <div className="mx-auto max-w-6xl px-6 py-20">
            
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
                Why Choose Print Brawl?
              </h2>
              <p className="text-lg text-gray-400">
                The battle is about design. The quality stays consistent.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              
              <div className="text-center">
                <div className="mb-6 mx-auto inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Drop Protection</h3>
                <p className="text-gray-400">
                  {config.features[0] || "Military-grade shock absorption keeps your phone safe from drops and impacts."}
                </p>
              </div>

              <div className="text-center">
                <div className="mb-6 mx-auto inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-700">
                  <Smartphone className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Perfect Fit</h3>
                <p className="text-gray-400">
                  {config.features[1] || "Compatible with iPhone & Samsung models. Precise cutouts for all ports and buttons."}
                </p>
              </div>

              <div className="text-center">
                <div className="mb-6 mx-auto inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-green-700">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Premium Materials</h3>
                <p className="text-gray-400">
                  {config.features[2] || "Durable TPU with polycarbonate backing. Lightweight, slim, and built to last."}
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* FINAL CTA */}
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
              <a
                href={designAPurchases >= designBPurchases ? config.designB.link : config.designA.link}
                onClick={(e) => {
                  const sessionId = localStorage.getItem('pb_session_id') || ''
                  const userId = localStorage.getItem('pb_user_id') || ''
                  const design = designAPurchases >= designBPurchases ? 'B' : 'A'
                  const link = designAPurchases >= designBPurchases ? config.designB.link : config.designA.link
                  
                  fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      type: 'click',
                      timestamp: new Date().toISOString(),
                      design,
                      element: 'save-trailing-cta',
                      link,
                      sessionId,
                      userId
                    })
                  }).catch(() => {})

                  fetch('/api/analytics/sessions', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      sessionId,
                      type: 'click',
                      data: { design, element: 'save-trailing-cta', link, type: 'product-link' },
                      timestamp: new Date().toISOString()
                    })
                  }).catch(() => {})
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-10 py-4 text-lg font-bold hover:bg-red-700"
              >
                Save {trailingDesign}
                <ArrowRight className="h-5 w-5" />
              </a>
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

      </main>

      {/* Image Modal */}
      {modalOpen && modalDesign && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="relative max-w-6xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 z-10 rounded-full bg-white/10 hover:bg-white/20 p-3 backdrop-blur transition"
            >
              <X className="h-6 w-6 text-white" />
            </button>

            {/* Main Image Display */}
            <div className="mb-6 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
              <img
                src={(() => {
                  const allImages = modalDesign === 'A' 
                    ? [config.designA.image, ...(config.designA.mockups || [])]
                    : [config.designB.image, ...(config.designB.mockups || [])];
                  return allImages[selectedImageIndex] || (modalDesign === 'A' ? config.designA.image : config.designB.image);
                })()}
                alt={modalDesign === 'A' ? config.designA.name : config.designB.name}
                className="w-full h-auto object-contain max-h-[70vh] mx-auto"
              />
            </div>

            {/* Thumbnail Gallery */}
            {(() => {
              const allImages = modalDesign === 'A' 
                ? [config.designA.image, ...(config.designA.mockups || [])]
                : [config.designB.image, ...(config.designB.mockups || [])];
              return allImages.length > 1;
            })() && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {(() => {
                  const allImages = modalDesign === 'A' 
                    ? [config.designA.image, ...(config.designA.mockups || [])]
                    : [config.designB.image, ...(config.designB.mockups || [])];
                  return allImages;
                })().map((mockup, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition ${
                      selectedImageIndex === index 
                        ? 'border-blue-500 ring-2 ring-blue-500/50' 
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <img
                      src={mockup}
                      alt={`${modalDesign === 'A' ? config.designA.name : config.designB.name} ${index === 0 ? 'main' : 'mockup ' + index}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-gray-800 bg-black py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 mb-6 text-sm text-gray-500">
            <a href="mailto:support@printbrawl.com" className="hover:text-white">Contact</a>
            <a href="/shipping" className="hover:text-white">Shipping</a>
            <a href="/returns" className="hover:text-white">Returns</a>
            <a href="/privacy" className="hover:text-white">Privacy</a>
          </div>
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Print Brawl. Every purchase counts.
          </p>
        </div>
      </footer>

      {/* Countdown Timer Script */}
      <Script id="countdown-timer" strategy="afterInteractive">{`
        (function() {
          const targetDate = new Date('${nextRotation}');
          
          function updateCountdown() {
            const now = new Date();
            const diff = targetDate - now;
            
            if (diff <= 0) {
              ['days', 'hours', 'minutes', 'seconds'].forEach(unit => {
                const el = document.getElementById('cd-' + unit);
                if (el) el.textContent = '00';
              });
              const countdownEl = document.getElementById('countdown');
              if (countdownEl) countdownEl.textContent = 'ENDED';
              return;
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            const pad = (n) => String(n).padStart(2, '0');
            
            const daysEl = document.getElementById('cd-days');
            const hoursEl = document.getElementById('cd-hours');
            const minutesEl = document.getElementById('cd-minutes');
            const secondsEl = document.getElementById('cd-seconds');
            
            if (daysEl) daysEl.textContent = pad(days);
            if (hoursEl) hoursEl.textContent = pad(hours);
            if (minutesEl) minutesEl.textContent = pad(minutes);
            if (secondsEl) secondsEl.textContent = pad(seconds);
            
            // Update top bar countdown
            const countdownEl = document.getElementById('countdown');
            if (countdownEl) {
              countdownEl.textContent = pad(days) + 'd ' + pad(hours) + 'h ' + pad(minutes) + 'm ' + pad(seconds) + 's';
            }
          }
          
          updateCountdown();
          setInterval(updateCountdown, 1000);
        })();
      `}</Script>
    </>
  );
}
