'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X } from 'lucide-react';
import { cn } from '@/utils/helpers';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/play', label: 'Play' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

const fadeDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
};

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-40 px-5 md:px-8 py-4 md:py-5"
      >
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <motion.div
            variants={fadeDown}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0 }}
          >
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-accent-green/60 group-hover:border-accent-green transition-colors duration-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent-green shadow-[0_0_8px_rgba(57,255,20,0.5)]" />
              </div>
              <span className="text-sm font-bold uppercase tracking-[0.15em] text-white hidden sm:block">
                Googly AI
              </span>
            </Link>
          </motion.div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                variants={fadeDown}
                initial="initial"
                animate="animate"
                transition={{
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.1 + i * 0.1,
                }}
              >
                <Link
                  href={link.href}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors duration-300 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent-green group-hover:w-full transition-all duration-300" />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Mobile menu button */}
          <motion.button
            variants={fadeDown}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <div className="flex flex-col gap-1.5 items-center">
              <span className="block w-4 h-[1.5px] bg-white" />
              <span className="block w-4 h-[1.5px] bg-white" />
              <span className="block w-3 h-[1.5px] bg-white" />
            </div>
          </motion.button>
        </nav>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-primary/95 backdrop-blur-2xl flex flex-col items-center justify-center"
          >
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>

            {/* Mobile links */}
            <div className="flex flex-col items-center gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.1 + i * 0.1,
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-2xl font-bold uppercase tracking-[0.15em] text-white/70 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mt-4"
              >
                <Link
                  href="/play"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-8 py-3 rounded-xl bg-accent-green/10 text-accent-green border border-accent-green/30 text-sm font-bold uppercase tracking-[0.2em] hover:bg-accent-green/20 transition-all duration-300"
                >
                  Start Game →
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
