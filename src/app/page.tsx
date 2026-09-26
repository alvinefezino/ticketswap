"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const TEAL = "#00C2A8";
const TEAL_DARK = "#00A88F";
const BLACK = "#0A0E14";
const BORDER = "#E5E7EB";

const PARTNERS = ["DEFQON", "weeztix", "SZIGET", "Ancienne Belgique", "DGTL", "CERCLE"];

const MOCK_EVENTS = [
  { id: "1", title: "Fred Again..", venue: "Ziggo Dome", city: "Amsterdam", date: "Dec 12", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600", price: 65, category: "Concert" },
  { id: "2", title: "DGTL Festival 2026", venue: "NDSM Wharf", city: "Amsterdam", date: "Apr 18-19", image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600", price: 89, category: "Festival" },
  { id: "3", title: "Sziget Festival", venue: "Budapest", city: "Hungary", date: "Aug 6-11", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600", price: 110, category: "Festival" },
  { id: "4", title: "Ancienne Belgique — Live", venue: "AB Brussels", city: "Brussels", date: "Jan 24", image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600", price: 42, category: "Concert" },
  { id: "5", title: "Cercle Festival", venue: "Paris", city: "France", date: "May 24", image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600", price: 78, category: "Festival" },
  { id: "6", title: "Deftones", venue: "AFAS Live", city: "Amsterdam", date: "Feb 14", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600", price: 55, category: "Concert" },
];

function Header() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-white border-b" style={{ borderColor: BORDER }}>
      <div className="mx-auto max-w-[1280px] px-3 sm:px-4 h-[56px] sm:h-[64px] flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-6 min-w-0">
          <button onClick={() => setOpen(v=>!v)} className="lg:hidden grid place-items-center w-9 h-9 rounded-full border bg-white shrink-0" style={{ borderColor: BORDER }} aria-label="Menu">
            <span className="text-[18px] leading-none">{open ? "×" : "☰"}</span>
          </button>
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <span className="text-[18px] sm:text-[22px] font-black tracking-[-0.8px]" style={{ color: BLACK }}>ticketswap</span>
            <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: TEAL }} />
          </Link>
          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-[#111827]">
            <Link href="/how-it-works" className="hover:underline underline-offset-4">How it works</Link>
            <Link href="/sell" className="hover:underline underline-offset-4">How to sell</Link>
            <Link href="#" className="hover:underline underline-offset-4">Become a partner</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {user ? (
            <>
              <Link href="/my-tickets" className="hidden sm:inline text-[13px] font-bold hover:underline" style={{ color: TEAL }}>My Tickets</Link>
              <span className="hidden lg:inline text-[11px] text-[#6B7280] truncate max-w-[120px]">{user.email}</span>
              <button onClick={() => signOut()} className="hidden sm:inline text-[13px] font-semibold hover:underline">Log out</button>
              <Link href="/sell" className="rounded-full px-4 sm:px-5 py-2 sm:py-[10px] text-[12px] sm:text-[13px] font-bold text-white hover:opacity-90 transition whitespace-nowrap" style={{ background: TEAL }}>Sell</Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline text-[13px] font-semibold text-[#111827] hover:underline">Log in</Link>
              <Link href="/signup" className="hidden sm:inline text-[13px] font-bold border rounded-full px-4 py-1.5 whitespace-nowrap" style={{ borderColor: BORDER }}>Sign up</Link>
              <Link href="/sell" className="rounded-full px-4 sm:px-5 py-2 sm:py-[10px] text-[12px] sm:text-[13px] font-bold text-white hover:opacity-90 transition whitespace-nowrap" style={{ background: TEAL }}>Sell</Link>
            </>
          )}
        </div>
      </div>
      {open ? (
        <div className="lg:hidden border-t bg-white px-3 py-3 grid gap-1" style={{ borderColor: BORDER }}>
          <Link onClick={()=>setOpen(false)} href="/how-it-works" className="rounded-xl px-3 py-3 text-[14px] font-semibold hover:bg-[#F5F7F9]">How it works</Link>
          <Link onClick={()=>setOpen(false)} href="/sell" className="rounded-xl px-3 py-3 text-[14px] font-semibold hover:bg-[#F5F7F9]">How to sell</Link>
          <Link onClick={()=>setOpen(false)} href="#" className="rounded-xl px-3 py-3 text-[14px] font-semibold hover:bg-[#F5F7F9]">Become a partner</Link>
          <div className="h-px bg-[#E5E7EB] my-1" />
          {user ? (
            <>
              <Link onClick={()=>setOpen(false)} href="/my-tickets" className="rounded-xl px-3 py-3 text-[14px] font-bold" style={{ color: TEAL }}>My Tickets</Link>
              <div className="px-3 py-1 text-[12px] text-[#6B7280] truncate">{user.email}</div>
              <button onClick={()=>{ setOpen(false); signOut(); }} className="text-left rounded-xl px-3 py-3 text-[14px] font-semibold hover:bg-[#F5F7F9]">Log out</button>
            </>
          ) : (
            <div className="flex gap-2 pt-1">
              <Link onClick={()=>setOpen(false)} href="/login" className="flex-1 rounded-full border bg-white px-4 py-3 text-center text-[14px] font-bold" style={{ borderColor: BORDER }}>Log in</Link>
              <Link onClick={()=>setOpen(false)} href="/signup" className="flex-1 rounded-full px-4 py-3 text-center text-[14px] font-bold text-white" style={{ background: TEAL }}>Sign up</Link>
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
      <div className="mx-auto max-w-[1280px] px-3 sm:px-4 py-3 flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.8px] text-[#6B7280] whitespace-nowrap shrink-0">OVER 6000 PARTNERS</span>
        <Link href="#" className="text-[10px] sm:text-[11px] font-bold underline whitespace-nowrap shrink-0">Become a partner →</Link>
        <div className="hidden md:flex items-center gap-8 flex-1 justify-end opacity-60">
          {PARTNERS.map((p,i)=> <span key={i} className="text-[11px] font-black tracking-[1.1px] text-[#374151]">{p}</span>)}
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const [q,setQ]=useState("");
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1280px] px-4 pt-8 sm:pt-12 md:pt-16 pb-6 sm:pb-8 text-center">
        <p className="text-[13px] font-medium text-[#6B7280]">The safest way to buy and sell tickets</p>
        <h1 className="mt-2 text-[26px] sm:text-[32px] md:text-[40px] font-black tracking-[-1.2px] leading-[1.05] px-2" style={{ color: BLACK }}>
          with over <span style={{ color: TEAL }}>20.6 million</span> fans
        </h1>
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-[12px]">
          <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 bg-[#F0FDFB] border-[#CCFBF1]"><span className="w-2 h-2 rounded-full" style={{ background: TEAL }} /> Prices capped at <b>20%</b> above face value</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 bg-white" style={{ borderColor: BORDER }}>Primary tickets from 6000+ partnered events</span>
        </div>
        <div className="mx-auto mt-6 sm:mt-8 max-w-[640px] flex items-center gap-2 rounded-full border bg-white p-1 sm:p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)]" style={{ borderColor: BORDER }}>
          <span className="pl-2 sm:pl-3 text-[#9CA3AF] shrink-0">⌕</span>
          <input value={q} onChange={e=> setQ(e.target.value)} placeholder="Search event, artist, venue" className="flex-1 min-w-0 outline-none text-[13px] sm:text-[14px] placeholder:text-[#9CA3AF] py-2 bg-transparent" />
          <button className="shrink-0 rounded-full px-4 sm:px-6 py-2 sm:py-2.5 text-[13px] sm:text-sm font-bold text-white" style={{ background: TEAL }}>Search</button>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-6 text-[12px] text-[#6B7280]">
          <span>★★★★★ 4.7 · 9,000+ reviews <span className="opacity-60">(Trustpilot)</span></span>
          <span className="hidden sm:inline">★★★★★ 4.6 · 6,000+ reviews <span className="opacity-60">(Google)</span></span>
        </div>
      </div>
    </section>
  );
}

function EventCard({ ev }: { ev: typeof MOCK_EVENTS[0] }) {
  return (
    <Link href={`/event/${ev.id}`} className="group rounded-2xl overflow-hidden border bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition" style={{ borderColor: BORDER }}>
      <div className="relative h-40 sm:h-36 overflow-hidden bg-gray-100 shrink-0">
        <img src={ev.image} alt={ev.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-300" />
        <span className="absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.6px] bg-white/90 backdrop-blur border" style={{ borderColor: "rgba(0,0,0,0.06)" }}>{ev.category.toUpperCase()}</span>
        <span className="absolute right-2 bottom-2 rounded-full px-2.5 py-1 text-[11px] font-bold bg-black text-white">From €{ev.price}</span>
      </div>
      <div className="p-3">
        <div className="text-[11px] font-semibold text-[#6B7280] tracking-[0.4px]">{ev.date} · {ev.city}</div>
        <div className="mt-1 text-[14px] font-bold leading-tight line-clamp-1" style={{ color: BLACK }}>{ev.title}</div>
        <div className="text-[12px] text-[#6B7280] line-clamp-1">{ev.venue}</div>
        <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: TEAL }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: TEAL }} /> SecureSwap · Fan-to-fan</div>
      </div>
    </Link>
  );
}

function HowBand() {
  return (
    <section className="mx-auto max-w-[1280px] px-3 sm:px-4 py-6 sm:py-8">
      <div className="rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between" style={{ background: "#F5F7F9", border: `1px solid ${BORDER}` }}>
        <div className="flex gap-4 flex-1">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black shrink-0" style={{ background: TEAL }}>✓</div>
          <div>
            <div className="text-[13px] font-black tracking-[0.6px]">HOW SECURESWAP WORKS — LIKE TICKETSWAP</div>
            <div className="mt-1 text-[12px] leading-5 text-[#4B5563]">1. Seller lists at fair price (max +20%) · 2. Buyer pays — funds held securely · 3. Seller transfers via Ticket Transfer email → Accept · 4. Seller gets payout email</div>
          </div>
        </div>
        <Link href="/how-it-works" className="shrink-0 rounded-full border bg-white px-5 py-2 text-[13px] font-bold hover:bg-gray-50" style={{ borderColor: BORDER }}>How it works →</Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-10 border-t bg-white" style={{ borderColor: BORDER }}>
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:py-10 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-1 font-black text-[18px] tracking-[-0.6px]">ticketswap<span className="w-1.5 h-1.5 rounded-full mt-1" style={{ background: TEAL }} /></div>
          <p className="mt-3 text-[12px] leading-5 text-[#6B7280]">Clone of ticketswap.com — Safe, convenient and fair. Prices capped at 20% above face value. SecureSwap escrow until Accept.</p>
          <p className="mt-3 text-[11px] text-[#9CA3AF]">Not affiliated with TicketSwap B.V. · Demo.</p>
        </div>
        <div>
          <div className="font-bold text-[12px] tracking-[0.6px]">DISCOVER</div>
          <ul className="mt-3 space-y-2 text-[13px] text-[#374151]">
            <li><Link href="#" className="hover:underline">Concerts</Link></li><li><Link href="#" className="hover:underline">Festivals</Link></li><li><Link href="#" className="hover:underline">Sports</Link></li><li><Link href="#" className="hover:underline">Theatre</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-bold text-[12px] tracking-[0.6px]">HELP</div>
          <ul className="mt-3 space-y-2 text-[13px] text-[#374151]">
            <li><Link href="/how-it-works" className="hover:underline">How it works</Link></li><li><Link href="/sell" className="hover:underline">Sell tickets</Link></li><li><Link href="#" className="hover:underline">Trust & Safety</Link></li>
          </ul>
        </div>
        <div className="col-span-2 md:col-span-1">
          <div className="font-bold text-[12px] tracking-[0.6px]">SELL</div>
          <Link href="/sell" className="mt-3 inline-flex w-full sm:w-auto justify-center rounded-full px-5 py-3 text-sm font-bold text-white text-center" style={{ background: TEAL }}>Sell your tickets</Link>
        </div>
      </div>
      <div className="border-t py-4 text-center text-[11px] text-[#9CA3AF]" style={{ borderColor: BORDER }}>© {new Date().getFullYear()} ticketswap clone · SecureSwap</div>
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
        <div className="flex items-end justify-between">
          <h2 className="text-[18px] font-black tracking-[-0.5px]">Discover · Following</h2>
          <Link href="/sell" className="text-[13px] font-bold hover:underline" style={{ color: TEAL }}>Recommendations for you →</Link>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {listings.map(ev=> <EventCard key={ev.id} ev={ev as any} />)}
        </div>
        <div className="mt-6 flex justify-center">
          <Link href="/sell" className="rounded-full border bg-white px-6 py-2.5 text-[13px] font-bold hover:bg-gray-50" style={{ borderColor: BORDER }}>Browse all events</Link>
        </div>
      </section>
      <section className="mx-auto max-w-[1280px] px-4 mt-10 grid md:grid-cols-3 gap-4">
        {[
          { k:"SAFE", t:"Buyer protection", d:"Funds held by SecureSwap until you confirm. No fake tickets." },
          { k:"FAIR", t:"Capped at +20%", d:"Like TicketSwap — max 20% above face value. No scalping." },
          { k:"FAST", t:"Instant transfer", d:"Seller transfers via Gmail → you Accept → seller paid." },
        ].map(c=> (
          <div key={c.k} className="rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
            <div className="text-[11px] font-black tracking-[1px]" style={{ color: TEAL }}>{c.k}</div>
            <div className="mt-1 font-bold">{c.t}</div>
            <div className="mt-1 text-[13px] leading-5 text-[#6B7280]">{c.d}</div>
          </div>
        ))}
      </section>
      <Footer />
    </div>
  );
}
