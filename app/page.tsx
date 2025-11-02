import Script from "next/script";
import {
  Clock, Flame, Shield, Package, Smartphone, Zap,
  Layers, Radio, Sparkles, Droplet, Globe
} from "lucide-react";
import { getNextRotationDate } from "./lib/Constant";
import HeroSection from "./components/HeroSection";
import AnalyticsTracker from "./components/AnalyticsTracker";
import FinalCTA from "./components/FinalCTA";

interface Config {
  designA: { name: string; image: string; mockups: string[]; purchases: number; link: string };
  designB: { name: string; image: string; mockups: string[]; purchases: number; link: string };
  price: string;
  heroText: string;
  features: string[];
}

async function getConfig(): Promise<Config> {
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    const dataDir = path.join(process.cwd(), 'data')
    const configFile = path.join(dataDir, 'config.json')
    
    // Ensure data directory exists
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }
    
    try {
      const data = await fs.readFile(configFile, 'utf-8')
      return JSON.parse(data)
    } catch {
      // File doesn't exist, return defaults
      return {
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
    }
  }
}

export default async function Page() {
  const config = await getConfig()
  const nextRotation = getNextRotationDate()

  const designAPurchases = config.designA.purchases
  const designBPurchases = config.designB.purchases
  const leadingDesign = designAPurchases >= designBPurchases ? config.designA.name : config.designB.name
  const trailingDesign = designAPurchases >= designBPurchases ? config.designB.name : config.designA.name
  const trailingDesignLetter = designAPurchases >= designBPurchases ? 'B' : 'A'
  const trailingLink = designAPurchases >= designBPurchases ? config.designB.link : config.designA.link
  const gap = Math.abs(designAPurchases - designBPurchases)

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
        <HeroSection config={config} />

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
        <FinalCTA 
          config={config}
          trailingDesign={trailingDesign}
          trailingDesignLetter={trailingDesignLetter}
          trailingLink={trailingLink}
        />

      </main>

      {/* Analytics Tracker - Client Component */}
      <AnalyticsTracker />

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
