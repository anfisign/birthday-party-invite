'use client'

import { useEffect, useState, useCallback } from 'react'

type Slot = 'bowling' | 'full' | 'karaoke'

interface RSVP {
  id: string
  name: string
  slot: Slot
  createdAt: string
}

interface Data {
  rsvps: RSVP[]
  bowlingCount: number
  karaokeCount: number
  total: number
}

const SLOT_LABELS: Record<Slot, string> = {
  bowling: '🎳 Just bowling (5–7 PM)',
  full:    '🎳🎤 The whole night (5–9 PM)',
  karaoke: '🎤 Just karaoke (7–9 PM)',
}

const SLOT_COLOR: Record<Slot, string> = {
  bowling: '#fef3c7',
  full:    '#fce7f3',
  karaoke: '#ede9fe',
}

const SLOT_TEXT: Record<Slot, string> = {
  bowling: '#92400e',
  full:    '#9d174d',
  karaoke: '#5b21b6',
}

function RSVPRow({ rsvp, onDeleted }: { rsvp: RSVP; onDeleted: (id: string) => void }) {
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await fetch('/api/rsvp', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rsvp.id }),
      })
      onDeleted(rsvp.id)
    } finally {
      setDeleting(false)
      setConfirm(false)
    }
  }

  return (
    <div className="flex items-center px-5 py-3 gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-gray-900">{rsvp.name}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {new Date(rsvp.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>
      <span
        className="text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0"
        style={{ backgroundColor: SLOT_COLOR[rsvp.slot], color: SLOT_TEXT[rsvp.slot] }}
      >
        {SLOT_LABELS[rsvp.slot]}
      </span>

      {/* Delete button */}
      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
          title="Remove RSVP"
        >
          ✕
        </button>
      ) : (
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-gray-500">Remove?</span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded-full transition-colors disabled:opacity-50"
          >
            {deleting ? '…' : 'Yes'}
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="text-[11px] font-medium text-gray-400 hover:text-gray-600 px-2 py-0.5 rounded-full transition-colors"
          >
            No
          </button>
        </div>
      )}
    </div>
  )
}

export default function Admin() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setLoading(true)
    fetch('/api/rsvp')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  function handleDeleted(id: string) {
    if (!data) return
    const updated = data.rsvps.filter(r => r.id !== id)
    const bowlingCount = updated.filter(r => r.slot === 'bowling' || r.slot === 'full').length
    const karaokeCount = updated.filter(r => r.slot === 'karaoke' || r.slot === 'full').length
    setData({ rsvps: updated, bowlingCount, karaokeCount, total: updated.length })
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900">Birthday RSVPs 🎂</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">27 May · Bowling & Karaoke</p>
          </div>
          <button
            onClick={refresh}
            className="text-[13px] font-medium text-violet-600 hover:text-violet-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {loading && !data && (
          <p className="text-gray-400 text-[14px]">Loading…</p>
        )}

        {data && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <StatCard emoji="🎉" value={data.total} label="Total RSVPs" color="#fdf2f8" />
              <StatCard emoji="🎳" value={data.bowlingCount} label="Bowling" sub="5–7 PM headcount" color="#fff7ed" />
              <StatCard emoji="🎤" value={data.karaokeCount} label="Karaoke" sub="7–9 PM headcount" color="#f5f3ff" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
              <div className="px-5 py-3 border-b border-gray-50">
                <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">By option</p>
              </div>
              {(['bowling', 'full', 'karaoke'] as Slot[]).map(s => {
                const count = data.rsvps.filter(r => r.slot === s).length
                return (
                  <div key={s} className="flex items-center px-5 py-3 border-b border-gray-50 last:border-0">
                    <span className="text-[13px] text-gray-700 flex-1">{SLOT_LABELS[s]}</span>
                    <span
                      className="text-[12px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: SLOT_COLOR[s], color: SLOT_TEXT[s] }}
                    >
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-50">
                <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">All responses</p>
              </div>

              {data.rsvps.length === 0 ? (
                <p className="text-gray-400 text-[14px] text-center py-10">
                  No RSVPs yet — share the link!
                </p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {[...data.rsvps].reverse().map(rsvp => (
                    <RSVPRow key={rsvp.id} rsvp={rsvp} onDeleted={handleDeleted} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

function StatCard({ emoji, value, label, sub, color }: {
  emoji: string; value: number; label: string; sub?: string; color: string
}) {
  return (
    <div className="rounded-2xl p-4 shadow-sm border border-gray-100" style={{ backgroundColor: color }}>
      <p className="text-[22px] leading-none">{emoji}</p>
      <p className="text-[28px] font-bold text-gray-900 mt-1 leading-none">{value}</p>
      <p className="text-[12px] font-semibold text-gray-700 mt-1">{label}</p>
      {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
    </div>
  )
}
