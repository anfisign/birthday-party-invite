import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

type Slot = 'bowling' | 'full' | 'karaoke'

interface RSVP {
  id: string
  name: string
  slot: Slot
  createdAt: string
}

async function readAll(): Promise<RSVP[]> {
  try {
    const data = await kv.get<RSVP[]>('rsvps')
    return data ?? []
  } catch {
    return []
  }
}

async function saveAll(rsvps: RSVP[]): Promise<void> {
  await kv.set('rsvps', rsvps)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, slot } = body as { name?: string; slot?: string }

  if (!name?.trim() || !['bowling', 'full', 'karaoke'].includes(slot ?? '')) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const rsvps = await readAll()
  const entry: RSVP = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    slot: slot as Slot,
    createdAt: new Date().toISOString(),
  }
  rsvps.push(entry)
  await saveAll(rsvps)

  return NextResponse.json({ ok: true, id: entry.id })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const rsvps = await readAll()
  const filtered = rsvps.filter(r => r.id !== id)
  if (filtered.length === rsvps.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  await saveAll(filtered)
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const rsvps = await readAll()
  const bowlingCount = rsvps.filter(r => r.slot === 'bowling' || r.slot === 'full').length
  const karaokeCount = rsvps.filter(r => r.slot === 'karaoke' || r.slot === 'full').length
  return NextResponse.json({ rsvps, bowlingCount, karaokeCount, total: rsvps.length })
}
