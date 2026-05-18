'use client'

import { useState } from 'react'
import AnimatedBackground from './components/AnimatedBackground'

type Slot = 'bowling' | 'full' | 'karaoke'

const SLOTS: {
  id: Slot
  img: string
  badge: string
  title: string
  time: string
  note: string
}[] = [
  {
    id: 'bowling',
    img: '/images/bowling.jpg',
    badge: 'Short set',
    title: 'Just bowling',
    time: '5 – 7 PM',
    note: 'Done by 7, out before karaoke',
  },
  {
    id: 'full',
    img: '/images/bowling-karaoke.jpg',
    badge: 'Full night',
    title: 'The whole night',
    time: '5 – 9 PM',
    note: 'Bowling then karaoke, the works',
  },
  {
    id: 'karaoke',
    img: '/images/karaoke.png',
    badge: 'Late arrival',
    title: 'Just karaoke',
    time: '7 – 9 PM',
    note: 'Skip straight to the singing',
  },
]

// Selection uses the same near-black as title text — no purple anywhere
const SEL          = '#111827'   // gray-900, same as title
const SEL_BG       = '#f3f4f6'   // light gray tint
const SEL_BADGE_BG = '#d1d5db'   // gray-300
const SEL_BADGE_TEXT = '#111827' // gray-900

// Google Calendar URL builder
function buildCalendarUrl(slot: Slot): string {
  const dates: Record<Slot, string> = {
    bowling: '20260527T150000Z/20260527T170000Z', // 5–7 PM CEST
    full:    '20260527T150000Z/20260527T190000Z', // 5–9 PM CEST
    karaoke: '20260527T170000Z/20260527T190000Z', // 7–9 PM CEST
  }
  const details =
    '🎳 Bowling (5–7 PM): https://www.google.com/maps/search/Bowling+Celnice+Praha+1\n' +
    '🎤 Karaoke (7–9 PM): https://www.google.com/maps/search/Simply+33+Karaoke+Bar+Praha'
  const params = new URLSearchParams({
    action:   'TEMPLATE',
    text:     "Anfisa's Birthday 🎂",
    dates:    dates[slot],
    location: 'Bowling Celnice, Náměstí Republiky, Praha 1',
    details,
  })
  return `https://www.google.com/calendar/render?${params.toString()}`
}

export default function Invite() {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [slot, setSlot]   = useState<Slot | null>(null)
  const [name, setName]   = useState('')
  const [done, setDone]   = useState(false)
  const [rsvpId, setRsvpId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [err, setErr]     = useState('')

  async function submit() {
    if (!name.trim() || !slot) return
    setSaving(true)
    setErr('')
    try {
      const r = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), slot }),
      })
      if (!r.ok) throw new Error()
      const data = await r.json()
      setRsvpId(data.id ?? null)
      setDone(true)
    } catch {
      setErr("Couldn't save your RSVP — give it another go!")
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setDone(false)
    setName('')
    setSlot(null)
    setRsvpId(null)
  }

  if (done) return (
    <Success name={name} slot={slot!} rsvpId={rsvpId} onCancel={handleCancel} />
  )

  const canSubmit = !!name.trim() && !!slot && !saving

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 py-6 relative" style={{ zIndex: 1 }}>
      <AnimatedBackground />
      <div className="w-full max-w-[390px] relative" style={{ zIndex: 1 }}>
        <div className="bg-white rounded-[28px] overflow-hidden shadow-2xl">

          {/* Hero */}
          <div className="h-64 sm:h-80 relative overflow-hidden">
            <img
              src="/images/img.png"
              alt="Anfi"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, white 0%, transparent 50%)' }} />
          </div>

          <div className="px-5 pb-6 -mt-1">

            {/* Title */}
            <h1 className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight">
              Anfi's Birthday Party
            </h1>
            <p className="text-[15px] font-semibold mt-0.5 text-gray-700">
              Wednesday · 27 May
            </p>

            {/* Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {[
                { e: '🕔', t: '5 – 9 PM' },
                { e: '🎳', t: 'Bowling' },
                { e: '🎤', t: 'Karaoke' },
                { e: '🍕', t: 'Food' },
              ].map(c => (
                <span
                  key={c.t}
                  className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-2.5 py-1 text-[12px] font-medium text-gray-600"
                >
                  {c.e} {c.t}
                </span>
              ))}
            </div>

            {/* Plan toggle */}
            <button
              onClick={() => setDetailsOpen(v => !v)}
              className="mt-4 flex items-center gap-2 text-[16px] font-semibold text-gray-800 hover:text-gray-900 transition-colors"
            >
              <span className="underline underline-offset-2 decoration-gray-400">
                {detailsOpen ? 'Got it, hide this' : "What's the plan?"}
              </span>
              <svg
                width="18" height="18" viewBox="0 0 18 18" fill="none"
                style={{
                  transform: detailsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  flexShrink: 0,
                }}
              >
                <path d="M4 7l5 5 5-5" stroke="#6b7280" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* ── Detail panel ── */}
            {detailsOpen && (
              <div className="mt-3 space-y-2">

                {/* Bowling card */}
                <a
                  href="https://www.google.com/maps/search/Bowling+Celnice+Praha+1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl border-2 overflow-hidden hover:bg-gray-100 transition-colors"
                  style={{ borderColor: '#f3f4f6', backgroundColor: '#f9fafb' }}
                >
                  <img src="/images/bowling.jpg" alt="Bowling Celnice" className="w-full h-44 object-cover" />
                  <div className="px-4 pt-3 pb-3">
                    <p className="text-[15px] font-bold text-gray-900">🎳&nbsp; Bowling · 5 – 7 PM</p>
                    <p className="text-[13px] text-gray-800 mt-1 leading-relaxed">Two hours of bowling to kick things off — RSVP so I know how many to book!</p>
                    <p className="text-[13px] mt-2 font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">
                      📍 Bowling Celnice, Praha ↗
                    </p>
                  </div>
                </a>

{/* Karaoke + Food card */}
                <a
                  href="https://www.google.com/maps/search/Simply+33+Karaoke+Bar+Praha"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl border-2 overflow-hidden hover:bg-gray-100 transition-colors"
                  style={{ borderColor: '#f3f4f6', backgroundColor: '#f9fafb' }}
                >
                  <img src="/images/karaoke.png" alt="Simply 33 Karaoke" className="w-full h-44 object-cover" />
                  <div className="px-4 pt-3 pb-3">
                    <p className="text-[15px] font-bold text-gray-900">🎤&nbsp; Karaoke · 7 – 9 PM</p>
                    <p className="text-[13px] text-gray-800 mt-1 leading-relaxed">Then we move to karaoke. Singing is optional. Showing up is not.</p>

                    {/* Food lives inside karaoke */}
                    <div className="mt-2.5 pt-2.5 border-t" style={{ borderColor: '#f3f4f6' }}>
                      <p className="text-[15px] font-bold text-gray-900">🍕&nbsp; Food</p>
                      <p className="text-[13px] text-gray-800 mt-1 leading-relaxed">
                        Khachapuri, quesadillas, nachos, hummus, mozzarella sticks, fries, pizza — vegan options included. And cake, obviously 🎂
                      </p>
                    </div>

                    <p className="text-[13px] mt-2.5 font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">
                      📍 Simply 33 Karaoke Bar ↗
                    </p>
                  </div>
                </a>

                {/* Dress code — horizontal, same layout as RSVP cards */}
                <div
                  className="rounded-2xl border-2 px-4 py-4"
                  style={{ borderColor: '#f3f4f6', backgroundColor: '#f9fafb' }}
                >
                  <div className="flex items-center gap-3">
                    <img src="/images/pink-dress-code.jpg" alt="Dress code" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-gray-900">🩷 Dress code</p>
                      <p className="text-[13px] text-gray-800 mt-0.5">All pink</p>
                    </div>
                  </div>
                </div>

                {/* Wishlist — horizontal, same layout as RSVP cards */}
                <a
                  href="https://mywishlist.online/w/w14yfc/birthday-party-anfisa-2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl border-2 px-4 py-4 hover:bg-gray-100 transition-colors"
                  style={{ borderColor: '#f3f4f6', backgroundColor: '#f9fafb' }}
                >
                  <div className="flex items-center gap-3">
                    <img src="/images/wishlist.jpg" alt="My wishlist" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-gray-900">🎁 My wishlist</p>
                      <p className="text-[13px] text-gray-800 mt-0.5">In case you were wondering 👀</p>
                    </div>
                    <span className="text-[15px] font-bold text-gray-800 shrink-0">↗</span>
                  </div>
                </a>

              </div>
            )}

            <div className="h-px bg-gray-100 my-6" />

            {/* Slot picker */}
            <h2 className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight">How long can you make it?</h2>
            <p className="text-[13px] text-gray-800 mt-1 mb-3 leading-relaxed">Help me with the planning. Please select when you'll be able to arrive and how long you'll stay.</p>

            <div className="space-y-2">
              {SLOTS.map(s => {
                const active = slot === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => setSlot(s.id)}
                    className="w-full text-left rounded-2xl px-4 py-4 border-2 transition-all duration-150"
                    style={{
                      borderColor: active ? SEL : '#f3f4f6',
                      backgroundColor: active ? SEL_BG : '#f9fafb',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <img src={s.img} alt={s.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[15px] font-bold text-gray-900">
                            {s.title}
                          </span>
                          <span
                            className="text-[11px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5"
                            style={{
                              backgroundColor: active ? SEL_BADGE_BG : '#e5e7eb',
                              color: active ? SEL_BADGE_TEXT : '#6b7280',
                            }}
                          >
                            {s.badge}
                          </span>
                        </div>
                        <p className="text-[13px] text-gray-800 mt-0.5">{s.time} &middot; {s.note}</p>
                      </div>
                      <div
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-150"
                        style={{
                          borderColor: active ? SEL : '#d1d5db',
                          backgroundColor: active ? SEL : 'transparent',
                        }}
                      >
                        {active && (
                          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                            <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canSubmit && submit()}
              className="mt-3 w-full rounded-2xl border-2 bg-gray-50 px-4 py-2.5 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none transition-colors"
              style={{ borderColor: name ? '#111827' : '#f3f4f6' }}
            />

            {err && <p className="text-[13px] mt-2 text-gray-700">{err}</p>}

            <button
              onClick={submit}
              disabled={!canSubmit}
              className="mt-3 w-full text-white font-bold text-[16px] rounded-2xl py-3 transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed"
              style={{
                background: canSubmit ? 'linear-gradient(90deg, #f43f5e, #ec4899)' : '#e5e7eb',
                color: canSubmit ? 'white' : '#9ca3af',
              }}
            >
              {saving ? 'Saving…' : 'RSVP now'}
            </button>
          </div>
        </div>

        <p className="text-white/50 text-[12px] text-center mt-5 font-medium tracking-wide">
          Made with ♥ by Anfi
        </p>
      </div>
    </main>
  )
}

function Success({
  name,
  slot,
  rsvpId,
  onCancel,
}: {
  name: string
  slot: Slot
  rsvpId: string | null
  onCancel: () => void
}) {
  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [cancelErr, setCancelErr] = useState('')

  const lines: Record<Slot, { emoji: string; msg: string }> = {
    bowling: { emoji: '🎳', msg: 'See you at 5!' },
    full:    { emoji: '🎉', msg: "See you at 5 — and don't leave early 😄" },
    karaoke: { emoji: '🎤', msg: "See you at 7 — we'll save you a mic." },
  }
  const { emoji, msg } = lines[slot]
  const firstName = name.split(' ')[0]

  async function handleCancel() {
    if (!rsvpId) { setCancelled(true); return }
    setCancelling(true)
    setCancelErr('')
    try {
      const r = await fetch('/api/rsvp', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rsvpId }),
      })
      if (!r.ok) throw new Error()
      setCancelled(true)
    } catch {
      setCancelErr("Couldn't cancel — give it another go?")
    } finally {
      setCancelling(false)
    }
  }

  const calUrl = buildCalendarUrl(slot)

  if (cancelled) return (
    <main className="min-h-screen flex items-center justify-center p-4 relative" style={{ zIndex: 1 }}>
      <AnimatedBackground />
      <div className="bg-white rounded-[32px] shadow-2xl px-8 py-10 max-w-[340px] w-full text-center relative" style={{ zIndex: 1 }}>
        <div className="text-[64px] leading-none mb-4">👋</div>
        <h2 className="text-[24px] font-bold text-gray-900">RSVP cancelled</h2>
        <p className="text-gray-600 text-[15px] mt-2 leading-relaxed">No worries, {firstName}. Hope to see you there anyway!</p>
        <button
          onClick={onCancel}
          className="mt-6 w-full font-bold text-[15px] rounded-2xl py-3 transition-all duration-150 active:scale-[0.98]"
          style={{ background: 'transparent', color: '#111827', border: '2px solid #111827' }}
        >
          Changed your mind? RSVP again
        </button>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative" style={{ zIndex: 1 }}>
      <AnimatedBackground />
      <div className="bg-white rounded-[32px] shadow-2xl px-8 py-10 max-w-[340px] w-full text-center relative" style={{ zIndex: 1 }}>
        <div className="text-[64px] leading-none mb-4">{emoji}</div>
        <h2 className="text-[24px] font-bold text-gray-900">You&apos;re in! 🥳</h2>
        <p className="text-gray-600 text-[15px] mt-2 leading-relaxed">{msg}</p>
        <p className="text-gray-500 text-[13px] mt-2">Can&apos;t wait, {firstName}!</p>

        {/* Add to Calendar */}
        <a
          href={calUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex items-center justify-center gap-2 w-full font-bold text-[15px] rounded-2xl py-3 transition-all duration-150 active:scale-[0.98]"
          style={{ background: 'transparent', color: '#111827', border: '2px solid #111827' }}
        >
          📅 Add to Calendar
        </a>

        {/* Cancel RSVP */}
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="mt-3 w-full text-[14px] text-gray-400 hover:text-gray-600 transition-colors py-2 disabled:cursor-not-allowed"
        >
          {cancelling ? 'Cancelling…' : "Can't make it anymore? Cancel RSVP"}
        </button>
        {cancelErr && <p className="text-[13px] mt-1 text-red-500">{cancelErr}</p>}
      </div>
    </main>
  )
}
