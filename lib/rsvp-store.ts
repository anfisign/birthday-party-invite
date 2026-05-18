import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'rsvps.json')

export type Slot = 'bowling' | 'full' | 'karaoke'

export interface RSVP {
  id: string
  name: string
  slot: Slot
  createdAt: string
}

export function readRSVPs(): RSVP[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]')
      return []
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as RSVP[]
  } catch {
    return []
  }
}

export function addRSVP(input: { name: string; slot: Slot }): RSVP {
  const rsvps = readRSVPs()
  const entry: RSVP = {
    id: crypto.randomUUID(),
    name: input.name,
    slot: input.slot,
    createdAt: new Date().toISOString(),
  }
  rsvps.push(entry)
  fs.writeFileSync(DATA_FILE, JSON.stringify(rsvps, null, 2))
  return entry
}

export function getRSVPCounts(rsvps: RSVP[]) {
  return {
    total: rsvps.length,
    bowlingCount: rsvps.filter(r => r.slot === 'bowling' || r.slot === 'full').length,
    karaokeCount: rsvps.filter(r => r.slot === 'karaoke' || r.slot === 'full').length,
  }
}
