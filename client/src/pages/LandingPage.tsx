import { useRef } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { TaxMateWordmark } from '@/components/TaxMateLogo'
import { useAuth } from '@/hooks/useAuth'
import { ArrowRight, Check, Upload, ClipboardCheck, BadgeCheck } from 'lucide-react'

// ─── helpers ─────────────────────────────────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── data ─────────────────────────────────────────────────────────────────────

const steps = [
  {
    n: '01',
    icon: Upload,
    title: 'Upload your documents',
    body: 'Drop in your Uber tax summary, fuel receipts, phone bills, and any other expenses. No sorting, no spreadsheets.',
  },
  {
    n: '02',
    icon: ClipboardCheck,
    title: 'We handle the numbers',
    body: 'Our team reviews your documents, calculates your GST, and prepares your BAS or tax return — accurately and on time.',
  },
  {
    n: '03',
    icon: BadgeCheck,
    title: 'We lodge it for you',
    body: 'A registered Australian tax agent lodges directly with the ATO. You get notified when it\'s done. That\'s it.',
  },
]

const included = [
  '4 quarterly BAS lodgements',
  'Annual income tax return',
  'GST calculation on all fares',
  'Expense & deduction tracking',
  'ATO penalty reminders',
  'Registered tax agent sign-off',
]

const forWho = [
  'Uber & DiDi drivers',
  'Uber Eats & DoorDash riders',
  'Any rideshare or delivery driver',
  'Tradies & sole traders',
  'Freelancers & contractors',
  'Anyone self-employed in Australia',
]

// ─── LandingPage ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { state } = useAuth()

  if (state.status === 'authenticated') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="landing bg-[#F9F9F6] text-[#1A1A1A] overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-[#E5E5E5] bg-[#F9F9F6]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 h-14">
          <TaxMateWordmark size={28} />
          <nav className="flex items-center gap-6">
            <a
              href="#how"
              className="hidden sm:block text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
            >
              How it works
            </a>
            <a
              href="#pricing"
              className="hidden sm:block text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
            >
              Pricing
            </a>
            <Link
              to="/login"
              className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="text-sm font-medium bg-[#2C5F4E] text-white px-4 py-2 hover:bg-[#234d3e] transition-colors"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section id="how" className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <FadeUp>
            <p className="label-caps mb-3">How it works</p>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-[-0.025em] max-w-lg">
              Upload your docs. We do the rest.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#6B6B6B] max-w-md">
              No spreadsheets. No ATO forms. No appointments. You upload, we calculate and lodge.
            </p>
          </FadeUp>

          <div className="mt-12 grid gap-px sm:grid-cols-3 border border-[#E5E5E5]">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <FadeUp key={step.n} delay={i * 0.1}>
                  <div className="bg-white p-8 h-full">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[2.25rem] font-semibold tracking-[-0.04em] text-[#EBEBEB] leading-none select-none">
                        {step.n}
                      </span>
                      <Icon className="h-5 w-5 text-[#2C5F4E]" />
                    </div>
                    <h3 className="text-[1rem] font-semibold text-[#1A1A1A]">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#6B6B6B]">{step.body}</p>
                  </div>
                </FadeUp>
              )
            })}
          </div>

          {/* What to upload callout */}
          <FadeUp delay={0.15}>
            <div className="mt-8 border border-[#E5E5E5] bg-white p-6">
              <p className="label-caps mb-4">What you'll need to upload</p>
              <div className="grid sm:grid-cols-2 gap-x-12 gap-y-2">
                {[
                  'Uber / DiDi annual tax summary',
                  'Fuel receipts',
                  'Vehicle registration',
                  'Insurance',
                  'Phone & data bills',
                  'Any repair or maintenance invoices',
                ].map((doc) => (
                  <div key={doc} className="flex items-center gap-2.5 text-sm text-[#6B6B6B]">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#2C5F4E] shrink-0" />
                    {doc}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-[#9B9B9B]">
                Not sure if something counts? Upload it anyway — our team will sort it out.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 bg-white border-y border-[#E5E5E5]">
        <div className="mx-auto max-w-5xl">
          <FadeUp>
            <p className="label-caps mb-3">Pricing</p>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-[-0.025em] max-w-lg">
              One flat price. Everything included.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#6B6B6B] max-w-md">
              Traditional accountants charge $800–$2,400 a year for the same work. We do it for $99.
            </p>
          </FadeUp>

          <div className="mt-12 grid sm:grid-cols-2 gap-px border border-[#E5E5E5]">
            {/* Price card */}
            <FadeUp>
              <div className="bg-[#2C5F4E] p-10 h-full flex flex-col justify-between">
                <div>
                  <p className="text-[#A8C9BD] text-sm font-medium uppercase tracking-widest">
                    Full service
                  </p>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-[3.5rem] font-semibold text-white leading-none tracking-[-0.04em]">
                      $99
                    </span>
                    <span className="text-[#A8C9BD] text-sm pb-2">/ year</span>
                  </div>
                  <p className="mt-2 text-[#A8C9BD] text-sm">
                    That's $1.90 a week. Less than a coffee.
                  </p>
                </div>
                <Link
                  to="/signup"
                  className="mt-10 inline-flex items-center justify-center gap-2 bg-white text-[#2C5F4E] text-sm font-semibold px-6 py-3 hover:bg-[#F0F7F4] transition-colors"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </FadeUp>

            {/* What's included */}
            <FadeUp delay={0.1}>
              <div className="bg-white p-10 h-full">
                <p className="text-sm font-semibold text-[#1A1A1A] mb-6">What's included</p>
                <ul className="space-y-3">
                  {included.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-[#2C5F4E] shrink-0 mt-0.5" />
                      <span className="text-sm text-[#1A1A1A]">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 border-t border-[#E5E5E5] pt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#6B6B6B]">Traditional accountant</span>
                    <span className="font-medium text-[#B5482F] line-through">$800–$2,400/yr</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-[#6B6B6B]">TaxMate</span>
                    <span className="font-semibold text-[#2C5F4E]">$99/yr</span>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>

          <FadeUp delay={0.15}>
            <p className="mt-5 text-xs text-[#9B9B9B] text-center">
              All lodgements signed off by a registered Australian tax agent · ABN required to sign up
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── WHO IT'S FOR ────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid sm:grid-cols-2 gap-16 items-start">
            <FadeUp>
              <p className="label-caps mb-3">Who it's for</p>
              <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-[-0.025em]">
                Built for gig workers and sole traders.
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-[#6B6B6B]">
                If you drive for Uber, deliver for UberEats, or work any gig platform in Australia —
                you're legally required to lodge a BAS every quarter and a tax return every year.
                Most drivers either pay too much to an accountant or miss lodgements and cop ATO penalties.
                TaxMate is neither.
              </p>
              <div className="mt-6 border border-[#E5E5E5] bg-white p-5">
                <p className="text-xs font-semibold text-[#B5482F] uppercase tracking-wider mb-2">
                  Late BAS penalty
                </p>
                <p className="text-sm text-[#6B6B6B]">
                  Missing a BAS lodgement costs <span className="font-semibold text-[#1A1A1A]">$1,100 per quarter</span> in ATO penalties.
                  TaxMate tracks every deadline and lodges on time, every time.
                </p>
              </div>
              <Link
                to="/signup"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#2C5F4E] hover:underline underline-offset-4 group"
              >
                Get started for $99/year
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </FadeUp>

            <FadeUp delay={0.1}>
              <ul className="border border-[#E5E5E5]">
                {forWho.map((item, i) => (
                  <li
                    key={item}
                    className={`flex items-center gap-3 px-5 py-4 bg-white ${
                      i < forWho.length - 1 ? 'border-b border-[#E5E5E5]' : ''
                    }`}
                  >
                    <Check className="h-4 w-4 text-[#2C5F4E] shrink-0" />
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white border-t border-[#E5E5E5]">
        <div className="mx-auto max-w-5xl flex flex-col items-center text-center">
          <FadeUp>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.03em]">
              Stop ignoring your tax.
            </h2>
            <p className="mt-4 text-sm text-[#6B6B6B] max-w-sm mx-auto">
              Upload your documents once. We handle every BAS and your annual return —
              lodged by a registered tax agent, for $99 a year.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 bg-[#2C5F4E] text-white text-sm font-medium px-8 py-3.5 hover:bg-[#234d3e] transition-colors"
              >
                Get started — $99/year
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center justify-center border border-[#E5E5E5] text-sm font-medium px-8 py-3.5 hover:border-[#1A1A1A]/30 transition-colors"
              >
                See how it works
              </a>
            </div>
            <p className="mt-6 text-xs text-[#9B9B9B]">
              No lock-in · ABN required · Works for all gig platforms
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#E5E5E5] bg-[#F9F9F6]">
        <div className="mx-auto max-w-5xl px-6 py-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <TaxMateWordmark size={22} />
          <p className="text-xs text-[#9B9B9B] text-center sm:text-right">
            Lodgements signed off by a registered Australian tax agent.
            <br />
            © {new Date().getFullYear()} TaxMate Pty Ltd
          </p>
        </div>
      </footer>
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-14 overflow-hidden"
    >
      {/* Grid bg */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(#E5E5E5 1px, transparent 1px), linear-gradient(90deg, #E5E5E5 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: 0.4,
        }}
      />
      {/* Green glow */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 560,
          height: 560,
          background: 'radial-gradient(circle, rgba(44,95,78,0.07) 0%, transparent 68%)',
        }}
      />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex flex-col items-center text-center max-w-2xl"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5 inline-flex items-center gap-2 border border-[#2C5F4E]/20 bg-[#2C5F4E]/5 px-3 py-1.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#2C5F4E]" />
          <span className="text-xs font-medium text-[#2C5F4E] tracking-wide">
            For Uber, DiDi & delivery drivers in Australia
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(2.75rem,6vw,4.5rem)] font-semibold leading-[1.07] tracking-[-0.03em]"
        >
          Your BAS and tax return.
          <br />
          <span className="text-[#2C5F4E]">We lodge it for you.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-[1.0625rem] leading-relaxed text-[#6B6B6B] max-w-md"
        >
          Upload your Uber summary and receipts. Our team calculates everything and a
          registered Australian tax agent lodges with the ATO — every quarter, every year.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col sm:flex-row gap-3"
        >
          <Link
            to="/signup"
            className="group inline-flex items-center justify-center gap-2 bg-[#2C5F4E] text-white text-sm font-medium px-7 py-3.5 hover:bg-[#234d3e] transition-colors"
          >
            Get started — $99/year
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#how"
            className="inline-flex items-center justify-center border border-[#1A1A1A]/15 text-sm font-medium px-7 py-3.5 hover:border-[#1A1A1A]/35 transition-colors"
          >
            See how it works
          </a>
        </motion.div>

        {/* Social proof strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-xs text-[#9B9B9B]"
        >
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[#2C5F4E]" />
            4 BAS lodgements included
          </span>
          <span className="hidden sm:block text-[#E5E5E5]">|</span>
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[#2C5F4E]" />
            Annual tax return included
          </span>
          <span className="hidden sm:block text-[#E5E5E5]">|</span>
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[#2C5F4E]" />
            Registered tax agent
          </span>
        </motion.div>
      </motion.div>

      {/* Scroll nudge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.4 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="h-6 w-px bg-[#6B6B6B]/30"
        />
      </motion.div>
    </section>
  )
}
