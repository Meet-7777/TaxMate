import { useRef } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { TaxMateWordmark } from '@/components/TaxMateLogo'
import { useAuth } from '@/hooks/useAuth'
import { ArrowRight, Check, Upload, FileSpreadsheet, Send } from 'lucide-react'

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
    body: 'Bank statements, receipts, invoices — drop them into the portal. No sorting needed.',
  },
  {
    n: '02',
    icon: FileSpreadsheet,
    title: 'We organise everything',
    body: 'We go through your documents, categorise your income and expenses, and build a clean financial summary.',
  },
  {
    n: '03',
    icon: Send,
    title: 'You get a ready-to-lodge sheet',
    body: "We send you a neat summary with everything filled in. You take it to your accountant or lodge it yourself — your call.",
  },
]

const works = [
  'Freelancers & contractors',
  'Rideshare & delivery drivers',
  'Tradies & sole traders',
  'Online sellers',
  'Side hustlers',
  'Anyone self-employed',
]

// ─── LandingPage ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { state } = useAuth()

  // Authenticated users go straight to dashboard
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
              Three steps to a clean tax summary.
            </h2>
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
        </div>
      </section>

      {/* ── WHO IT'S FOR ────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white border-y border-[#E5E5E5]">
        <div className="mx-auto max-w-5xl">
          <div className="grid sm:grid-cols-2 gap-16 items-start">
            <FadeUp>
              <p className="label-caps mb-3">Who it's for</p>
              <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-[-0.025em]">
                Anyone who earns money outside a regular job.
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-[#6B6B6B]">
                Tax time is confusing when you're self-employed. You've got a pile of receipts,
                a few bank statements, and no idea what goes where. We sort it all out and hand
                you back a clean summary — ready to lodge.
              </p>
              <Link
                to="/signup"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#2C5F4E] hover:underline underline-offset-4 group"
              >
                Get started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </FadeUp>

            <FadeUp delay={0.1}>
              <ul className="border border-[#E5E5E5]">
                {works.map((item, i) => (
                  <li
                    key={item}
                    className={`flex items-center gap-3 px-5 py-4 ${
                      i < works.length - 1 ? 'border-b border-[#E5E5E5]' : ''
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
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl flex flex-col items-center text-center">
          <FadeUp>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.03em]">
              Ready to sort your tax?
            </h2>
            <p className="mt-4 text-sm text-[#6B6B6B] max-w-xs mx-auto">
              Create an account, upload your docs, and we'll take it from there.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 bg-[#2C5F4E] text-white text-sm font-medium px-8 py-3.5 hover:bg-[#234d3e] transition-colors"
              >
                Create free account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center border border-[#E5E5E5] text-sm font-medium px-8 py-3.5 hover:border-[#1A1A1A]/30 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#E5E5E5] bg-white">
        <div className="mx-auto max-w-5xl px-6 py-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <TaxMateWordmark size={22} />
          <p className="text-xs text-[#6B6B6B]">
            © {new Date().getFullYear()} TaxMate
          </p>
        </div>
      </footer>
    </div>
  )
}

// ─── Hero — split into its own component to keep scroll hooks clean ───────────

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
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(2.75rem,6vw,4.5rem)] font-semibold leading-[1.07] tracking-[-0.03em]"
        >
          Your tax docs,
          <br />
          <span className="text-[#2C5F4E]">sorted for you.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-[1.0625rem] leading-relaxed text-[#6B6B6B] max-w-md"
        >
          Upload your documents. We organise everything and hand you back a
          clean summary — ready to lodge.
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
            Get started free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#how"
            className="inline-flex items-center justify-center border border-[#1A1A1A]/15 text-sm font-medium px-7 py-3.5 hover:border-[#1A1A1A]/35 transition-colors"
          >
            See how it works
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-7 text-xs text-[#9B9B9B]"
        >
          No lock-in · Free to sign up · Works for any self-employed person
        </motion.p>
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
