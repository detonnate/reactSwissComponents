// Deterministic dummy data so every component renders identically on each load.
// Replace these with real data (or call the generators with a different seed/size).

export function rng(seed = 42) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)]

export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export type Order = {
  id: number
  customer: string
  product: string
  status: 'Paid' | 'Pending' | 'Refunded'
  amount: number
  date: string
}

const first = ['Anna', 'Luca', 'Marie', 'Noah', 'Elena', 'Jonas', 'Sofia', 'Felix', 'Lea', 'Max', 'Nina', 'Tim']
const last = ['Müller', 'Meier', 'Keller', 'Weber', 'Huber', 'Schmid', 'Fischer', 'Brunner', 'Frei', 'Baumann']
const products = ['Watch', 'Chocolate Box', 'Pocket Knife', 'Fondue Set', 'Cuckoo Clock', 'Rain Jacket']

export function makeOrders(count = 42, seed = 1): Order[] {
  const r = rng(seed)
  return Array.from({ length: count }, (_, i) => ({
    id: 1000 + i,
    customer: `${pick(r, first)} ${pick(r, last)}`,
    product: pick(r, products),
    status: pick(r, ['Paid', 'Paid', 'Pending', 'Refunded'] as const),
    amount: Math.round(20 + r() * 480),
    date: `2026-${String(1 + Math.floor(r() * 10)).padStart(2, '0')}-${String(1 + Math.floor(r() * 28)).padStart(2, '0')}`,
  }))
}

export function makeSeries(names: string[], length = 12, seed = 7, base = 100) {
  const r = rng(seed)
  return names.map((name) => {
    let v = base * (0.6 + r() * 0.8)
    return { name, data: Array.from({ length }, () => Math.round((v = Math.max(5, v + (r() - 0.45) * base * 0.25)))) }
  })
}

export function makeScatter(names: string[], n = 25, seed = 3) {
  const r = rng(seed)
  return names.map((name, k) => ({
    name,
    points: Array.from({ length: n }, () => {
      const x = Math.round(r() * 80 + k * 10)
      return { x, y: Math.round(x * (0.5 + k * 0.3) + r() * 25) }
    }),
  }))
}

export const mock = {
  orders: makeOrders(),
  monthly: makeSeries(['Revenue', 'Costs'], 12, 7, 120),
  quarterly: makeSeries(['Zurich', 'Geneva', 'Basel'], 4, 11, 80),
  scatter: makeScatter(['Segment A', 'Segment B']),
  share: [
    { name: 'Direct', value: 420 },
    { name: 'Search', value: 310 },
    { name: 'Social', value: 190 },
    { name: 'Referral', value: 120 },
  ],
  countries: [
    { value: 'ch', label: 'Switzerland' }, { value: 'de', label: 'Germany' }, { value: 'at', label: 'Austria' },
    { value: 'fr', label: 'France' }, { value: 'it', label: 'Italy' }, { value: 'li', label: 'Liechtenstein' },
    { value: 'es', label: 'Spain' }, { value: 'pt', label: 'Portugal' },
  ],
  navLinks: [
    { label: 'Home', href: '#', current: true }, { label: 'Products', href: '#' },
    { label: 'Pricing', href: '#' }, { label: 'About', href: '#' },
  ],
  megaGroups: [
    { title: 'Platform', links: [{ label: 'Overview', href: '#' }, { label: 'Analytics', href: '#' }, { label: 'Automation', href: '#' }] },
    { title: 'Solutions', links: [{ label: 'Retail', href: '#' }, { label: 'Finance', href: '#' }, { label: 'Healthcare', href: '#' }] },
    { title: 'Resources', links: [{ label: 'Docs', href: '#' }, { label: 'Guides', href: '#' }, { label: 'Support', href: '#' }] },
  ],
  sidebar: [
    { title: 'Workspace', links: [{ label: 'Dashboard', href: '#', current: true }, { label: 'Reports', href: '#' }, { label: 'Customers', href: '#' }] },
    { title: 'Settings', links: [{ label: 'Profile', href: '#' }, { label: 'Billing', href: '#' }] },
  ],
  footer: [
    { title: 'Company', links: [{ label: 'About', href: '#' }, { label: 'Careers', href: '#' }, { label: 'Press', href: '#' }] },
    { title: 'Product', links: [{ label: 'Features', href: '#' }, { label: 'Pricing', href: '#' }, { label: 'Changelog', href: '#' }] },
    { title: 'Legal', links: [{ label: 'Privacy', href: '#' }, { label: 'Terms', href: '#' }, { label: 'Imprint', href: '#' }] },
  ],
  faq: [
    { id: 'a', title: 'What is Swiss React Components?', content: 'A set of accessible React components styled with Swiss design principles.' },
    { id: 'b', title: 'Can I theme it?', content: 'Yes. Override any --swiss-* CSS custom property on :root or an ancestor.' },
    { id: 'c', title: 'Does it support SSR?', content: 'Portal-based components guard against missing document access.' },
  ],
  feed: [
    { id: '1', author: 'Anna Müller', time: '2026-10-28T09:12:00Z', title: 'Released v2.4', body: 'New reporting dashboard and CSV exports are live.' },
    { id: '2', author: 'Luca Keller', time: '2026-10-25T14:40:00Z', body: 'Commented on “Q4 roadmap”: looks great, let us ship it.' },
    { id: '3', author: 'Marie Weber', time: '2026-10-20T08:05:00Z', title: 'Joined the team', body: 'Welcome Marie to the design systems group!' },
  ],
  testimonials: [
    { quote: 'The cleanest component set we have used. Our team shipped twice as fast.', author: 'Elena Huber', role: 'CTO, Alpine Labs' },
    { quote: 'Accessible out of the box and beautifully minimal.', author: 'Jonas Frei', role: 'Design Lead, Matterhorn Bank' },
    { quote: 'Theming took minutes, not days.', author: 'Sofia Brunner', role: 'Founder, Lakeside' },
  ],
  logos: ['Alpine Labs', 'Matterhorn', 'Lakeside', 'Helvetia', 'Rhone'],
  timeline: ['Cart', 'Shipping', 'Payment', 'Review'],
  files: [{ name: 'invoice-2026-10.pdf', size: 184320 }, { name: 'logo.svg', size: 4096 }],
  tags: ['Design', 'Engineering', 'Marketing', 'Finance', 'Support'],
}
