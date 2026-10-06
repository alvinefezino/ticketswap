import Link from "next/link";
import { formatPrice } from "@/lib/currency";
const TEAL="#00C2A8"; const BORDER="#E5E7EB"; const BLACK="#0A0E14";

const FALLBACK: Record<string, any> = {
  "1": { title:"Fred Again..", venue:"Ziggo Dome", city:"Amsterdam", date:"Dec 12, 2025", image:"https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200", price:65, category:"Concert", desc:"The safest way to buy and sell tickets - prices capped at 20% above face value." },
  "2": { title:"DGTL Festival 2026", venue:"NDSM Wharf", city:"Amsterdam", date:"Apr 18-19, 2026", image:"https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200", price:89, category:"Festival", desc:"Two days of underground electronic music on the waterfront." },
  "3": { title:"Sziget Festival", venue:"Budapest", city:"Hungary", date:"Aug 6-11, 2026", image:"https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200", price:110, category:"Festival", desc:"Island of Freedom - 6 days, 500+ acts." },
};

export default function EventPage({ params }: { params: { id: string } }){
  const ev = FALLBACK[params.id] || FALLBACK["1"];
  return (
  <div className="min-h-screen bg-white">
  <header className="sticky top-0 z-40 bg-white border-b" style={{borderColor:BORDER}}>
  <div className="mx-auto max-w-[1280px] px-4 h-[64px] flex items-center justify-between">
  <Link href="/" className="flex items-center gap-1.5"><img src="/ticketswaplogo.png" alt="TicketSwap" className="h-7 w-auto object-contain" /><span className="font-black text-[20px] tracking-[-0.6px]" style={{color:"#000"}}>ticketswap</span></Link>
  <Link href="/sell" className="rounded-full px-5 py-2 text-sm font-bold text-white" style={{background:TEAL}}>Sell your tickets</Link>
  </div>
  </header>
  <div className="mx-auto max-w-[1280px] px-4 py-6 grid lg:grid-cols-[1fr_380px] gap-6">
  <div>
  <div className="rounded-2xl overflow-hidden border bg-gray-100" style={{borderColor:BORDER}}>
  <img src={ev.image} alt={ev.title} className="w-full h-[280px] object-cover" />
  </div>
  <div className="mt-4 flex gap-2">
  <span className="rounded-full border bg-white px-3 py-1 text-[11px] font-bold tracking-[0.6px]" style={{borderColor:BORDER}}>{ev.category.toUpperCase()}</span>
  <span className="rounded-full bg-[#F0FDFB] border px-3 py-1 text-[11px] font-bold" style={{borderColor:"#CCFBF1", color:TEAL}}>SecureSwap | Fan-to-fan</span>
  </div>
  <h1 className="mt-3 text-[28px] font-black tracking-[-0.8px]" style={{color:BLACK}}>{ev.title}</h1>
  <p className="text-[13px] text-[#6B7280]">{ev.date} | {ev.venue} | {ev.city}</p>
  <p className="mt-3 text-[14px] leading-6 text-[#374151]">{ev.desc}</p>
  <div className="mt-6 rounded-2xl p-5" style={{background:"#F5F7F9", border:`1px solid ${BORDER}`}}>
  <div className="text-[12px] font-black tracking-[0.8px]">TRUST & SAFETY - LIKE TICKETSWAP.COM</div>
  <ul className="mt-2 text-[13px] leading-6 text-[#4B5563] list-disc pl-5">
  <li>Prices capped at <b>20%</b> above face value - no scalping.</li>
  <li>Funds held by SecureSwap until buyer confirms.</li>
  <li>Our team transfers via Ticket Transfer email &gt; buyer clicks <b>Accept</b> &gt; our team gets &quot;They accepted&quot; email.</li>
  <li>40,000+ reviews | 4.7 Trustpilot.</li>
  </ul>
  </div>
  </div>
  <div className="lg:sticky lg:top-[80px] h-fit rounded-2xl border bg-white p-5" style={{borderColor:BORDER}}>
  <div className="text-[11px] font-bold tracking-[1px] text-[#6B7280]">TICKETS FROM</div>
  <div className="mt-1 flex items-baseline gap-2">
  <span className="text-3xl font-black" style={{color:BLACK}}>{formatPrice(ev.price, ev.city, ev.venue)}</span>
  <span className="text-[12px] text-[#6B7280]">face value capped +20%</span>
  </div>
  <form action="/api/checkout" method="post" className="mt-5 grid gap-3">
  <input type="hidden" name="eventId" value={params.id} />
  <label className="grid gap-1 text-[12px] font-bold">Quantity
  <select name="qty" className="border rounded-xl px-3 py-3 text-[14px] font-normal" style={{borderColor:BORDER}}>
  <option>1 ticket</option><option>2 tickets</option><option>3 tickets</option><option>4 tickets</option>
  </select>
  </label>
  <label className="grid gap-1 text-[12px] font-bold">Your Gmail (for Accept email)
  <input name="email" type="email" required placeholder="you@gmail.com" className="border rounded-xl px-4 py-3 font-normal outline-none" style={{borderColor:BORDER}} />
  </label>
  <button className="rounded-full py-3.5 text-sm font-bold text-white" style={{background:TEAL}}>Buy - SecureSwap holds funds</button>
  <p className="text-[11px] text-center text-[#9CA3AF]">You&apos;ll get &quot;Do you wish to accept?&quot; email with details + Accept button. Our team gets payout notification.</p>
  </form>
  <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#6B7280]">
  <span><span className="inline-flex gap-0.5" aria-label="5 stars"><svg viewBox="0 0 24 24" width="12" height="12" fill="#00C2A8" stroke="#00C2A8" stroke-width="1.2" aria-hidden="true"><path d="M12 2l2.4 7.2h7.6l-6 4.4 2.3 7.2L12 16.6 5.7 20.8l2.3-7.2-6-4.4h7.6z"/></svg><svg viewBox="0 0 24 24" width="12" height="12" fill="#00C2A8" stroke="#00C2A8" stroke-width="1.2" aria-hidden="true"><path d="M12 2l2.4 7.2h7.6l-6 4.4 2.3 7.2L12 16.6 5.7 20.8l2.3-7.2-6-4.4h7.6z"/></svg><svg viewBox="0 0 24 24" width="12" height="12" fill="#00C2A8" stroke="#00C2A8" stroke-width="1.2" aria-hidden="true"><path d="M12 2l2.4 7.2h7.6l-6 4.4 2.3 7.2L12 16.6 5.7 20.8l2.3-7.2-6-4.4h7.6z"/></svg><svg viewBox="0 0 24 24" width="12" height="12" fill="#00C2A8" stroke="#00C2A8" stroke-width="1.2" aria-hidden="true"><path d="M12 2l2.4 7.2h7.6l-6 4.4 2.3 7.2L12 16.6 5.7 20.8l2.3-7.2-6-4.4h7.6z"/></svg><svg viewBox="0 0 24 24" width="12" height="12" fill="#00C2A8" stroke="#00C2A8" stroke-width="1.2" aria-hidden="true"><path d="M12 2l2.4 7.2h7.6l-6 4.4 2.3 7.2L12 16.6 5.7 20.8l2.3-7.2-6-4.4h7.6z"/></svg></span> 4.7</span> <span> |  SecureSwap | 6000+ partners</span>
  </div>
  </div>
  </div>
  </div>
  );
}
