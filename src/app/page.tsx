"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/currency";

const TEAL = "#00C2A8";
const TEAL_DARK = "#00A88F";
const BLACK = "#0A0E14";
const BORDER = "#E5E7EB";

const PARTNERS = ["DEFQON.1", "weeztix", "SZIGET", "Ancienne Belgique", "DGTL", "CERCLE"];

const MOCK_EVENTS = [
  { id: "1", title: "Fred Again..", venue: "Ziggo Dome", city: "Amsterdam", date: "Dec 12", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600", price: 65, currency: "EUR", category: "Concert" },
  { id: "2", title: "DGTL Festival 2026", venue: "NDSM Wharf", city: "Amsterdam", date: "Apr 18 - 19", image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600", price: 89, currency: "EUR", category: "Festival" },
  { id: "3", title: "Sziget Festival", venue: "Óbuda Island", city: "Budapest", date: "Aug 6 - 11", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600", price: 110, currency: "EUR", category: "Festival" },
  { id: "4", title: "Ancienne Belgique - Live", venue: "Ancienne Belgique", city: "Brussels", date: "Jan 24", image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600", price: 42, currency: "EUR", category: "Concert" },
  { id: "5", title: "Cercle Festival", venue: "Le Bourget", city: "Paris", date: "May 24", image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600", price: 78, currency: "EUR", category: "Festival" },
  { id: "6", title: "Deftones", venue: "AFAS Live", city: "Amsterdam", date: "Feb 14", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600", price: 55, currency: "GBP", category: "Concert" },
];

function Header() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  return (
  <header className="sticky top-0 z-40 bg-white border-b" style={{ borderColor: BORDER }}>
  <div className="mx-auto max-w-[1280px] px-3 sm:px-4 h-[56px] sm:h-[64px] flex items-center justify-between gap-3">
  <div className="flex items-center gap-3 sm:gap-7 min-w-0">
  <button onClick={() => setOpen(v=>!v)} className="lg:hidden grid place-items-center w-9 h-9 rounded-full border bg-white shrink-0 active:scale-95 transition" style={{ borderColor: BORDER }} aria-label="Menu">
  <span className="text-[18px] leading-none">{open ? " x " : "\u2630"}</span>
  </button>
  <Link href="/" className="flex items-center gap-1.5 shrink-0">
  <img src="/ticketswaplogo.png" alt="TicketSwap" className="h-7 sm:h-8 w-auto object-contain" />
  <span className="text-[19px] sm:text-[22px] font-black tracking-[-0.8px]" style={{ color: "#000" }}>ticketswap</span>
  </Link>
  <nav className="hidden lg:flex items-center gap-7 text-[13.5px] font-[500] text-[#111827]">
  <Link href="/how-it-works" className="hover:text-black transition">How it works</Link>
  <Link href="/sell" className="hover:text-black transition">How to sell</Link>
  <Link href="#" className="hover:text-black transition">Become a partner</Link>
  </nav>
  </div>
  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
  {user ? (
  <>
  <Link href="/my-tickets" className="hidden sm:inline text-[13px] font-bold hover:underline underline-offset-4" style={{ color: TEAL }}>My Tickets</Link>
  <span className="hidden xl:inline text-[11px] text-[#6B7280] truncate max-w-[140px]">{user.email}</span>
  <button onClick={() => signOut()} className="hidden sm:inline text-[13px] font-semibold text-[#374151] hover:text-black">Log out</button>
  <Link href="/sell" className="rounded-full px-[18px] sm:px-6 py-[9px] sm:py-[10px] text-[13px] font-bold text-white hover:opacity-90 active:scale-[0.98] transition whitespace-nowrap shadow-sm" style={{ background: TEAL }}>Sell your tickets</Link>
  </>
  ) : (
  <>
  <Link href="/login" className="hidden sm:inline text-[13.5px] font-semibold text-[#111827] hover:text-black">Log in</Link>
  <Link href="/signup" className="hidden sm:inline text-[13px] font-bold border rounded-full px-4 py-[7px] hover:bg-[#F9FAFB] transition" style={{ borderColor: BORDER }}>Sign up</Link>
  <Link href="/sell" className="rounded-full px-[18px] sm:px-6 py-[9px] sm:py-[10px] text-[13px] font-bold text-white hover:opacity-90 active:scale-[0.98] transition whitespace-nowrap shadow-sm" style={{ background: TEAL }}>Sell your tickets</Link>
  </>
  )}
  </div>
  </div>
  {open ? (
  <div className="lg:hidden border-t bg-white px-3 py-3 grid gap-1 animate-in" style={{ borderColor: BORDER }}>
  <Link onClick={()=>setOpen(false)} href="/how-it-works" className="rounded-xl px-3 py-[13px] text-[14px] font-semibold hover:bg-[#F5F7F9] active:bg-[#EEF2F7]">How it works</Link>
  <Link onClick={()=>setOpen(false)} href="/sell" className="rounded-xl px-3 py-[13px] text-[14px] font-semibold hover:bg-[#F5F7F9]">How to sell</Link>
  <Link onClick={()=>setOpen(false)} href="#" className="rounded-xl px-3 py-[13px] text-[14px] font-semibold hover:bg-[#F5F7F9]">Become a partner</Link>
  <div className="h-px bg-[#E5E7EB] my-1" />
  {user ? (
  <>
  <Link onClick={()=>setOpen(false)} href="/my-tickets" className="rounded-xl px-3 py-[13px] text-[14px] font-bold" style={{ color: TEAL }}>My Tickets</Link>
  <div className="px-3 py-1 text-[12px] text-[#6B7280] truncate">{user.email}</div>
  <button onClick={()=>{ setOpen(false); signOut(); }} className="text-left rounded-xl px-3 py-[13px] text-[14px] font-semibold hover:bg-[#F5F7F9]">Log out</button>
  </>
  ) : (
  <div className="flex gap-2 pt-1">
  <Link onClick={()=>setOpen(false)} href="/login" className="flex-1 rounded-full border bg-white px-4 py-3 text-center text-[14px] font-bold active:scale-[0.98]" style={{ borderColor: BORDER }}>Log in</Link>
  <Link onClick={()=>setOpen(false)} href="/signup" className="flex-1 rounded-full px-4 py-3 text-center text-[14px] font-bold text-white active:scale-[0.98]" style={{ background: TEAL }}>Sign up</Link>
  </div>
  )}
  </div>
  ) : null}
  </header>
  );
}

function PartnersStrip() {
  return (
  <div className="border-y bg-white overflow-hidden" style={{ borderColor: BORDER }}>
  <div className="mx-auto max-w-[1280px] px-3 sm:px-4 h-[44px] sm:h-[48px] flex items-center gap-3 sm:gap-5 overflow-x-auto no-scrollbar">
  <span className="text-[10px] sm:text-[11px] font-black tracking-[0.9px] text-[#6B7280] whitespace-nowrap shrink-0">OVER 6000 PARTNERS</span>
  <Link href="#" className="text-[11px] font-bold underline underline-offset-2 whitespace-nowrap shrink-0 hover:text-black">Become a partner <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" className="inline-block ml-1"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></Link>
  <div className="hidden md:flex items-center gap-8 flex-1 justify-end opacity-[0.55]">
  {PARTNERS.map((p,i)=> <span key={i} className="text-[11px] font-black tracking-[1px] text-[#1F2937] whitespace-nowrap">{p}</span>)}
  </div>
  <div className="flex md:hidden items-center gap-5 opacity-50 ml-2 shrink-0">
  {PARTNERS.slice(0,3).map((p,i)=> <span key={i} className="text-[10px] font-black tracking-wide">{p}</span>)}
  </div>
  </div>
  </div>
  );
}

function Hero() {
  const [q,setQ]=useState("");
  return (
  <section className="bg-white">
  <div className="mx-auto max-w-[1280px] px-4 pt-7 sm:pt-12 md:pt-16 pb-6 sm:pb-8 text-center">
  <p className="text-[13px] sm:text-[14px] font-[500] text-[#6B7280] tracking-[-0.1px]">The safest way to buy and sell tickets</p>
  <h1 className="mt-2 text-[28px] sm:text-[36px] md:text-[44px] font-black tracking-[-1.4px] leading-[0.95] px-1" style={{ color: BLACK }}>
  with over <span style={{ color: TEAL }}>20.6 million</span> fans
  </h1>
  <div className="mt-4 flex flex-wrap justify-center gap-2 text-[12px] sm:text-[13px]">
  <span className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 bg-[#F0FDFB] border-[#CCFBF1] font-medium"><span className="w-2 h-2 rounded-full" style={{ background: TEAL }} /> Prices capped at <b className="font-black">20%</b> above face value</span>
  <span className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 bg-white font-medium" style={{ borderColor: BORDER }}>Primary tickets from 6000+ partnered events</span>
  </div>
  <div className="mx-auto mt-6 sm:mt-8 max-w-[640px] flex items-center gap-2 rounded-full border bg-white p-1 sm:p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] focus-within:shadow-[0_8px_32px_rgba(0,0,0,0.12)] focus-within:border-[#00C2A8] transition" style={{ borderColor: BORDER }}>
  <span className="pl-2.5 sm:pl-3.5 shrink-0 grid place-items-center"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></span>
  <input value={q} onChange={e=> setQ(e.target.value)} placeholder="Search event, artist, venue" className="flex-1 min-w-0 outline-none text-[13px] sm:text-[14px] placeholder:text-[#9CA3AF] py-2.5 bg-transparent" />
  <button className="shrink-0 rounded-full px-5 sm:px-7 py-2.5 sm:py-[11px] text-[13px] sm:text-[14px] font-bold text-white hover:brightness-[0.96] active:scale-[0.98] transition shadow-sm" style={{ background: TEAL }}>Search</button>
  </div>
  <div className="mt-3.5 flex flex-wrap justify-center gap-4 sm:gap-8 text-[12px] sm:text-[13px] text-[#6B7280]">
  <span className="inline-flex items-center gap-1"><span className="inline-flex gap-0.5" aria-label="5 stars"><svg viewBox="0 0 24 24" width="12" height="12" fill="#00C2A8" stroke="#00C2A8" stroke-width="1.2" aria-hidden="true"><path d="M12 2l2.4 7.2h7.6l-6 4.4 2.3 7.2L12 16.6 5.7 20.8l2.3-7.2-6-4.4h7.6z"/></svg><svg viewBox="0 0 24 24" width="12" height="12" fill="#00C2A8" stroke="#00C2A8" stroke-width="1.2" aria-hidden="true"><path d="M12 2l2.4 7.2h7.6l-6 4.4 2.3 7.2L12 16.6 5.7 20.8l2.3-7.2-6-4.4h7.6z"/></svg><svg viewBox="0 0 24 24" width="12" height="12" fill="#00C2A8" stroke="#00C2A8" stroke-width="1.2" aria-hidden="true"><path d="M12 2l2.4 7.2h7.6l-6 4.4 2.3 7.2L12 16.6 5.7 20.8l2.3-7.2-6-4.4h7.6z"/></svg><svg viewBox="0 0 24 24" width="12" height="12" fill="#00C2A8" stroke="#00C2A8" stroke-width="1.2" aria-hidden="true"><path d="M12 2l2.4 7.2h7.6l-6 4.4 2.3 7.2L12 16.6 5.7 20.8l2.3-7.2-6-4.4h7.6z"/></svg><svg viewBox="0 0 24 24" width="12" height="12" fill="#00C2A8" stroke="#00C2A8" stroke-width="1.2" aria-hidden="true"><path d="M12 2l2.4 7.2h7.6l-6 4.4 2.3 7.2L12 16.6 5.7 20.8l2.3-7.2-6-4.4h7.6z"/></svg></span> 4.7 | 9,000+ reviews <span className="opacity-60 text-[11px]">Trustpilot</span></span>
  <span className="hidden sm:inline-flex items-center gap-1"><span className="inline-flex gap-0.5" aria-label="5 stars"><svg viewBox="0 0 24 24" width="12" height="12" fill="#00C2A8" stroke="#00C2A8" stroke-width="1.2" aria-hidden="true"><path d="M12 2l2.4 7.2h7.6l-6 4.4 2.3 7.2L12 16.6 5.7 20.8l2.3-7.2-6-4.4h7.6z"/></svg><svg viewBox="0 0 24 24" width="12" height="12" fill="#00C2A8" stroke="#00C2A8" stroke-width="1.2" aria-hidden="true"><path d="M12 2l2.4 7.2h7.6l-6 4.4 2.3 7.2L12 16.6 5.7 20.8l2.3-7.2-6-4.4h7.6z"/></svg><svg viewBox="0 0 24 24" width="12" height="12" fill="#00C2A8" stroke="#00C2A8" stroke-width="1.2" aria-hidden="true"><path d="M12 2l2.4 7.2h7.6l-6 4.4 2.3 7.2L12 16.6 5.7 20.8l2.3-7.2-6-4.4h7.6z"/></svg><svg viewBox="0 0 24 24" width="12" height="12" fill="#00C2A8" stroke="#00C2A8" stroke-width="1.2" aria-hidden="true"><path d="M12 2l2.4 7.2h7.6l-6 4.4 2.3 7.2L12 16.6 5.7 20.8l2.3-7.2-6-4.4h7.6z"/></svg><svg viewBox="0 0 24 24" width="12" height="12" fill="#00C2A8" stroke="#00C2A8" stroke-width="1.2" aria-hidden="true"><path d="M12 2l2.4 7.2h7.6l-6 4.4 2.3 7.2L12 16.6 5.7 20.8l2.3-7.2-6-4.4h7.6z"/></svg></span> 4.6 | 6,000+ reviews <span className="opacity-60 text-[11px]">Google</span></span>
  </div>
  </div>
  </section>
  );
}

function EventCard({ ev }: { ev: typeof MOCK_EVENTS[0] }) {
  return (
  <Link href={`/event/${ev.id}`} className="group rounded-2xl overflow-hidden border bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#D1D5DB] transition-all duration-200" style={{ borderColor: BORDER }}>
  <div className="relative h-[156px] sm:h-[148px] overflow-hidden bg-[#F3F4F6] shrink-0">
  <img src={ev.image} alt={ev.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition duration-500" />
  <span className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.5px] bg-white/95 backdrop-blur border shadow-sm" style={{ borderColor: "rgba(0,0,0,0.06)" }}>{ev.category.toUpperCase()}</span>
  <span className="absolute right-2.5 bottom-2.5 rounded-full px-2.5 py-1 text-[11px] font-bold bg-[#0A0E14] text-white shadow-sm">{formatPrice(ev.price, ev.city, ev.venue)}</span>
  </div>
  <div className="p-3.5">
  <div className="text-[11px] font-semibold text-[#6B7280] tracking-[0.2px]">{ev.date} | {ev.city}</div>
  <div className="mt-1 text-[14.5px] font-bold leading-tight line-clamp-1 tracking-[-0.2px]" style={{ color: BLACK }}>{ev.title}</div>
  <div className="text-[12.5px] text-[#6B7280] line-clamp-1">{ev.venue}</div>
  <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold" style={{ color: TEAL }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: TEAL }} /> SecureSwap | Fan-to-fan</div>
  </div>
  </Link>
  );
}

function HowBand() {
  return (
  <section className="mx-auto max-w-[1280px] px-3 sm:px-4 py-6 sm:py-8">
  <div className="rounded-2xl p-4 sm:p-5 md:px-6 md:py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between" style={{ background: "#F5F7F9", border: `1px solid ${BORDER}` }}>
  <div className="flex gap-3.5 flex-1">
  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm" style={{ background: TEAL }}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg></div>
  <div className="min-w-0">
  <div className="text-[12px] sm:text-[13px] font-black tracking-[0.5px] leading-none">HOW SECURESWAP WORKS - LIKE TICKETSWAP</div>
  <div className="mt-1.5 text-[12px] sm:text-[13px] leading-5 text-[#4B5563]">1. Our team lists at fair price (max +20%) | 2. Buyer pays - funds held securely | 3. Our team transfers via Ticket Transfer email <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" className="inline-block ml-1"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg> Accept | 4. Our team gets payout</div>
  </div>
  </div>
  <Link href="/how-it-works" className="shrink-0 self-start md:self-auto rounded-full border bg-white px-5 py-2.5 text-[13px] font-bold hover:bg-[#F9FAFB] active:scale-[0.98] transition shadow-sm" style={{ borderColor: BORDER }}>How it works <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" className="inline-block ml-1"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></Link>
  </div>
  </section>
  );
}

function Footer() {
  return (
  <footer className="mt-10 border-t bg-white" style={{ borderColor: BORDER }}>
  <div className="mx-auto max-w-[1280px] px-4 py-8 sm:py-10 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-sm">
  <div className="col-span-2 md:col-span-1">
  <div className="flex items-center gap-1.5 font-black text-[18px] tracking-[-0.6px]"><img src="/ticketswaplogo.png" alt="TicketSwap" className="h-7 w-auto object-contain" /><span style={{ color: "#000" }}>ticketswap</span></div>
  <p className="mt-3 text-[12.5px] leading-[1.6] text-[#6B7280]">Safe, convenient and fair. Prices capped at 20% above face value. SecureSwap escrow until you Accept. Trusted by 20.6M fans.</p>
  </div>
  <div>
  <div className="font-black text-[11px] tracking-[0.8px] text-[#111827]">DISCOVER</div>
  <ul className="mt-3 space-y-2.5 text-[13px] text-[#374151]">
  <li><Link href="#" className="hover:text-black hover:underline underline-offset-4">Concerts</Link></li><li><Link href="#" className="hover:text-black hover:underline underline-offset-4">Festivals</Link></li><li><Link href="#" className="hover:text-black hover:underline underline-offset-4">Sports</Link></li><li><Link href="#" className="hover:text-black hover:underline underline-offset-4">Theatre</Link></li>
  </ul>
  </div>
  <div>
  <div className="font-black text-[11px] tracking-[0.8px] text-[#111827]">HELP</div>
  <ul className="mt-3 space-y-2.5 text-[13px] text-[#374151]">
  <li><Link href="/how-it-works" className="hover:text-black hover:underline underline-offset-4">How it works</Link></li><li><Link href="/sell" className="hover:text-black hover:underline underline-offset-4">Sell tickets</Link></li><li><Link href="#" className="hover:text-black hover:underline underline-offset-4">Trust & Safety</Link></li>
  </ul>
  </div>
  <div className="col-span-2 md:col-span-1">
  <div className="font-black text-[11px] tracking-[0.8px] text-[#111827]">SELL</div>
  <Link href="/sell" className="mt-3 inline-flex w-full sm:w-auto justify-center rounded-full px-6 py-3 text-sm font-bold text-white text-center hover:opacity-90 active:scale-[0.98] transition shadow-sm" style={{ background: TEAL }}>Sell your tickets</Link>
  <p className="mt-2 text-[11px] text-[#9CA3AF]">Get paid fast after buyer accepts.</p>
  </div>
  </div>
  <div className="border-t py-4 text-center text-[11px] text-[#9CA3AF]" style={{ borderColor: BORDER }}>© {new Date().getFullYear()} TicketSwap</div>
  </footer>
  );
}

export default function Page() {
  const [listings, setListings] = useState<typeof MOCK_EVENTS>(MOCK_EVENTS);
  useEffect(() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return;
  (async () => {
  try {
  const { createClient } = await import("@supabase/supabase-js");
  const supa = createClient(url, anon);
  const { data } = await supa.from("swap_listings").select("*, custom_tickets(*)").eq("status","active").limit(6);
  if (data && data.length) {
  const mapped = data.map((r:any)=> ({
  id: r.id, title: r.custom_tickets?.event_name || r.custom_tickets?.title || "Ticket",
  venue: r.custom_tickets?.location || r.custom_tickets?.venue || "TBA", city: r.custom_tickets?.city || "", date: r.custom_tickets?.date || "", image: r.custom_tickets?.image_url || MOCK_EVENTS[0].image, price: Number(r.price), category: r.custom_tickets?.category || "Concert"
  }));
  setListings(mapped as any);
  }
  } catch {}
  })();
  }, []);

  return (
  <div className="min-h-screen bg-white">
  <Header />
  <Hero />
  <PartnersStrip />
  <HowBand />
  <section className="mx-auto max-w-[1280px] px-3 sm:px-4">
  <div className="flex items-end justify-between gap-3">
  <h2 className="text-[17px] sm:text-[19px] font-black tracking-[-0.5px] leading-none">Discover | Following</h2>
  <Link href="/sell" className="text-[12px] sm:text-[13px] font-bold hover:underline underline-offset-4 shrink-0" style={{ color: TEAL }}>Recommendations for you <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" className="inline-block ml-1"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></Link>
  </div>
  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
  {listings.map(ev=> <EventCard key={ev.id} ev={ev as any} />)}
  </div>
  <div className="mt-6 flex justify-center">
  <Link href="/sell" className="rounded-full border bg-white px-6 py-2.5 text-[13px] font-bold hover:bg-[#F9FAFB] active:scale-[0.98] transition shadow-sm" style={{ borderColor: BORDER }}>Browse all events</Link>
  </div>
  </section>
  <section className="mx-auto max-w-[1280px] px-4 mt-10 grid md:grid-cols-3 gap-3 sm:gap-4">
  {[
  { k:"SAFE", t:"Buyer protection", d:"Funds held by SecureSwap until you confirm. No fake tickets." },
  { k:"FAIR", t:"Capped at +20%", d:"Like TicketSwap - max 20% above face value. No scalping." },
  { k:"FAST", t:"Instant transfer", d:"Our team transfers via Ticket Transfer email > you Accept > our team will process payout." },
  ].map(c=> (
  <div key={c.k} className="rounded-2xl border bg-white p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition" style={{ borderColor: BORDER }}>
  <div className="text-[11px] font-black tracking-[1px]" style={{ color: TEAL }}>{c.k}</div>
  <div className="mt-1.5 font-bold text-[14px] tracking-[-0.2px]">{c.t}</div>
  <div className="mt-1 text-[13px] leading-[1.5] text-[#6B7280]">{c.d}</div>
  </div>
  ))}
  </section>
  <Footer />
  </div>
  );
}