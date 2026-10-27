import { FLOCK } from './flock.js';
import { drawSheep } from './sheep.js';
const KEY = 'baad-flock-v1';
export function readCollection(storage) {
  try {
    const data = JSON.parse(storage.getItem(KEY));
    return Object.fromEntries(FLOCK.filter(s => data?.[s.id]).map(s => [s.id, {
      seen: Math.max(0, Math.floor(Number(data[s.id].seen) || 0)),
      perfect: Math.max(0, Math.floor(Number(data[s.id].perfect) || 0)),
    }]));
  } catch { return {}; }
}
export function recordSheep(data, id, perfect, storage) {
  const entry = data[id] ??= { seen: 0, perfect: 0 };
  if (perfect) entry.perfect++; else entry.seen++;
  try { storage.setItem(KEY, JSON.stringify(data)); } catch {}
}
export function renderCollection(container, data) {
  container.replaceChildren();
  for (const type of FLOCK) {
    const entry = data[type.id], card = document.createElement('article');
    card.className = 'sheep-card' + (entry?.seen ? ' discovered' : '') + (entry?.perfect ? ' mastered' : '');
    if (entry?.seen) {
      const canvas = document.createElement('canvas'); canvas.width = 230; canvas.height = 140;
      drawSheep(canvas.getContext('2d'), { op: type.id, vx: 1, angle: 0, age: 0, counted: Boolean(entry.perfect) }, 103, 70, 36, type.color, true);
      canvas.setAttribute('aria-hidden','true');card.append(canvas);
      card.setAttribute('aria-label', `${type.name}, ${type.id}. Seen ${entry.seen}. Crits ${entry.perfect}.`);
    } else {
      const unknown = document.createElement('span'); unknown.className = 'unknown-sheep'; unknown.textContent = '???'; card.append(unknown);
      card.setAttribute('aria-label','Unknown sheep');
    }
    container.append(card);
  }
}
