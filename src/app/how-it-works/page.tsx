import Link from "next/link";
const TEAL="#00C2A8"; const BORDER="#E5E7EB";
export default function HowItWorks(){
  return (
  <div className="min-h-screen bg-white">
  <header className="sticky top-0 z-40 bg-white border-b" style={{borderColor:BORDER}}>
  <div className="mx-auto max-w-[960px] px-3 sm:px-4 h-[56px] sm:h-[64px] flex items-center justify-between">
  <Link href="/" className="font-black text-[20px] tracking-[-0.6px]">ticketswap<span className="w-1.5 h-1.5 rounded-full inline-block ml-0.5" style={{background:TEAL}}/></Link>
  <Link href="/sell" className="rounded-full px-5 py-2 text-sm font-bold text-white" style={{background:TEAL}}>Sell your tickets</Link>
  </div>
  </header>
  <div className="mx-auto max-w-[960px] px-3 sm:px-4 py-6 sm:py-10">
  <h1 className="text-3xl font-black tracking-[-0.8px]">How it works</h1>
  <p className="mt-2 text-[14px] text-[#6B7280]">Exact flow like ticketswap.com - Safe, convenient and fair. Prices capped at 20% above face value.</p>
  <div className="mt-8 grid md:grid-cols-3 gap-4">
  {[
  {n:"01", t:"Seller lists", d:"Seller picks ticket from My Tickets → sets price (capped +20%). Listing goes live on Discover."},
  {n:"02", t:"Buyer pays - held", d:"Buyer clicks Buy → funds held by SecureSwap escrow. Seller gets email to transfer."},
  {n:"03", t:"Transfer → Accept", d:"Seller uses Transfer → recipient Gmail gets 'Do you wish to accept?' email with details + Accept button."},
  ].map(s=> (
  <div key={s.n} className="rounded-2xl border bg-white p-5" style={{borderColor:BORDER}}>
  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm" style={{background:TEAL}}>{s.n}</div>
  <div className="mt-3 font-bold">{s.t}</div>
  <div className="mt-1 text-[13px] leading-5 text-[#6B7280]">{s.d}</div>
  </div>
  ))}
  </div>
  <div className="mt-6 rounded-2xl p-5" style={{background:"#F5F7F9", border:`1px solid ${BORDER}`}}>
  <div className="font-black text-[13px] tracking-[0.6px]">WHEN BUYER ACCEPTS - SELLER GETS EMAIL</div>
  <div className="mt-2 text-[13px] leading-6 text-[#374151]">Recipient clicks <b>Accept Ticket</b> on /accept/[token] → API updates ticket_transfers → Resend sends email to seller: <i>&quot;They accepted your ticket - [event]&quot;</i> with receipt link. Seller sees &quot;Accepted by X&quot; on My Tickets (transfer_status=accepted). Decline works the same.</div>
  </div>
  <div className="mt-8 flex gap-3">
  <Link href="/sell" className="rounded-full px-6 py-3 text-sm font-bold text-white" style={{background:TEAL}}>Sell your tickets</Link>
  <Link href="/" className="rounded-full border bg-white px-6 py-3 text-sm font-bold" style={{borderColor:BORDER}}>Back to discover</Link>
  </div>
  </div>
  </div>
  );
}
