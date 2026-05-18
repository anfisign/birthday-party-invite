import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

type Slot = 'bowling' | 'full' | 'karaoke'

interface RSVP {
  id: string
  name: string
  slot: Slot
  createdAt: string
}

const DATA_FILE = path.join(process.cwd(), 'data', 'rsvps.json')

function readAll(): RSVP[] {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function saveAll(rsvps: RSVP[]): void {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(rsvps, null, 2))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, slot } = body as { name?: string; slot?: string }

  if (!name?.trim() || !['bowling', 'full', 'karaoke'].includes(slot ?? '')) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const rsvps = readAll()
  rsvps.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    slot: slot as Slot,
    createdAt: new Date().toISOString(),
  })
  saveAll(rsvps)

  const entry = rsvps[rsvps.length - 1]
  return NextResponse.json({ ok: true, id: entry.id })
}

export async function DELETE(req: NextRequest) {
  const body = await req.json()
  const { id } = body as { id?: string }
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const rsvps = readAll()
  const filtered = rsvps.filter(r => r.id !== id)
  if (filtered.length === rsvps.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  saveAll(filtered)
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const rsvps = readAll()

  const bowlingCount = rsvps.filter(r => r.slot === 'bowling' || r.slot === 'full').length
  const karaokeCount = rsvps.filter(r => r.slot === 'karaoke' || r.slot === 'full').length

  return NextResponse.json({ rsvps, bowlingCount, karaokeCount, total: rsvps.length })
}