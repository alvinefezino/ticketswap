"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const TEAL = "#00C2A8";
const BORDER = "#E5E7EB";
const BLACK = "#0A0E14";

type Ticket = {
  receipt_code: string; artist_name: string | null; event_name: string | null; title: string;
  section: string | null; row_label: string | null; seat: string | null; date: string; time: string | null;
  location: string | null; address: string | null; city: string | null; ticket_type: string | null;
  level: string | null; number_of_tickets: number; seats: any[]; image_url: string | null; price: number | null;
  seller_name: string | null; seller_email: string | null; created_at: string;
};

export default function PreviewPage({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code || "").toUpperCase();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        if (!url || !anon) { setNotFound(true); setLoading(false); return; }
        const { createClient } = await import("@supabase/supabase-js");
        const supa = createClient(url, anon);
        const { data } = await supa.from("ticketswap_tickets").select("*").eq("receipt_code", code).maybeSingle();
        if (!alive) return;
        if (!data) { setNotFound(true); } else { setTicket(data as Ticket); }
      } catch { if (alive) setNotFound(true); } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [code]);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url || `https://ticketswap.local/t/${code}`)}`;
  const amount = ticket ? Number(ticket.price || 0) : 0;
  const qty = ticket?.number_of_tickets || 1;
  const total = amount * qty;
  const seats: any[] = Array.isArray(ticket?.seats) ? ticket!.seats : [];

  const copy = async (t: string) => {
    try { await navigator.clipboard.writeText(t); alert("Copied: " + t); } catch { prompt("Copy:", t); }
  };

  if (loading) return <div className="min-h-screen grid place-items-center bg-white"><div className="text-sm text-[#6B7280]">Loading ticket {code}…</div></div>;
  if (notFound || !ticket) return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white border-b" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-[960px] px-4 h-[64px] flex items-center justify-between">
          <Link href="/" className="font-black text-[20px]" style={{ color: BLACK }}>ticketswap<span className="w-1.5 h-1.5 rounded-full inline-block ml-0.5" style={{ background: TEAL }} /></Link>
        </div>
      </header>
      <div className="mx-auto max-w-[720px] px-4 py-14 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 grid place-items-center mx-auto text-red-600 font-black">×</div>
        <h1 className="mt-4 text-xl font-black">Ticket not found</h1>
        <p className="mt-2 text-sm text-[#6B7280]">Receipt <b>{code}</b> not found. Check the link or ask the seller to resend.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full border bg-white px-6 py-2.5 text-sm font-bold" style={{ borderColor: BORDER }}>Back to discover</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      <header className="sticky top-0 z-40 bg-white border-b" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-[960px] px-4 h-[64px] flex items-center justify-between">
          <Link href="/" className="font-black text-[20px] tracking-[-0.6px]" style={{ color: BLACK }}>ticketswap<span className="w-1.5 h-1.5 rounded-full inline-block ml-0.5" style={{ background: TEAL }} /></Link>
          <div className="flex gap-2">
            <button onClick={() => copy(url)} className="hidden sm:inline rounded-full border bg-white px-4 py-2 text-[12px] font-bold" style={{ borderColor: BORDER }}>Copy link</button>
            <Link href="/sell" className="rounded-full px-4 py-2 text-[12px] font-bold text-white" style={{ background: TEAL }}>Create ticket</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[720px] px-4 py-6">
        {/* Share bar */}
        <div className="rounded-2xl border bg-white p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between" style={{ borderColor: BORDER }}>
          <div>
            <div className="text-[11px] font-black tracking-[0.8px]" style={{ color: TEAL }}>SHAREABLE LINK — SEND TO BUYER</div>
            <div className="text-[12px] font-mono break-all text-[#0A0E14] mt-1">{url}</div>
            <div className="text-[11px] text-[#6B7280] mt-1">Receipt: <b>{ticket.receipt_code}</b> · Anyone with this link sees this preview.</div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => copy(url)} className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ background: TEAL }}>Copy link</button>
            <button onClick={() => { if (navigator.share) navigator.share({ title: ticket.title, url }).catch(()=>{}); else copy(url); }} className="rounded-full border bg-white px-4 py-2 text-sm font-bold" style={{ borderColor: BORDER }}>Share</button>
          </div>
        </div>

        {/* 1) TICKET DESIGN */}
        <div className="mt-6 rounded-2xl overflow-hidden border bg-white" style={{ borderColor: BORDER }}>
          {ticket.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ticket.image_url} alt="ticket" className="w-full h-[220px] object-cover" />
          ) : <div className="w-full h-28 grid place-items-center bg-[#F5F7F9] text-[#9CA3AF] text-sm">No image</div>}
          <div className="p-5">
            <div className="flex gap-2 flex-wrap">
              <span className="rounded-full border bg-white px-3 py-1 text-[11px] font-bold tracking-[0.6px]" style={{ borderColor: BORDER }}>{(ticket.ticket_type || "TICKET").toUpperCase()}</span>
              <span className="rounded-full px-3 py-1 text-[11px] font-bold text-white" style={{ background: TEAL }}>RECEIPT {ticket.receipt_code}</span>
              {ticket.level ? <span className="rounded-full border bg-[#F5F7F9] px-3 py-1 text-[11px] font-bold" style={{ borderColor: BORDER }}>LEVEL {ticket.level}</span> : null}
            </div>
            <div className="mt-3 text-[11px] font-bold tracking-[0.6px]" style={{ color: TEAL }}>{ticket.artist_name?.toUpperCase() || ""}</div>
            <h1 className="text-[22px] font-black leading-tight tracking-[-0.6px]" style={{ color: BLACK }}>{ticket.event_name || ticket.title}</h1>
            {ticket.artist_name && ticket.event_name && ticket.title !== ticket.event_name ? <div className="text-sm text-[#6B7280]">{ticket.title}</div> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl border bg-[#F8FAFC] px-3 py-2 text-[12px] font-bold" style={{ borderColor: BORDER }}>📅 {ticket.date} {ticket.time || ""}</span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border bg-[#F8FAFC] px-3 py-2 text-[12px]" style={{ borderColor: BORDER }}>📍 {ticket.location || "TBA"}{ticket.city ? `, ${ticket.city}` : ""}</span>
              <span className="rounded-xl px-3 py-2 text-[12px] font-black text-white" style={{ background: BLACK }}>${Number(ticket.price || 0).toLocaleString()} {qty > 1 ? `× ${qty} = $${total.toLocaleString()}` : ""}</span>
            </div>
            {ticket.address ? <div className="mt-2 text-[12px] text-[#6B7280]">{ticket.address}</div> : null}
          </div>
          {/* perforated stub */}
          <div className="border-t border-dashed flex flex-col sm:flex-row gap-4 p-4 items-center bg-[#F8FAFC]" style={{ borderColor: BORDER }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="QR" className="w-28 h-28 bg-white rounded-xl border p-2" style={{ borderColor: BORDER }} />
            <div className="flex-1 text-center sm:text-left">
              <div className="text-[10px] font-black tracking-[1px] text-[#6B7280]">ENTRY QR — SCAN AT VENUE</div>
              <div className="font-mono font-black tracking-[2px] text-[16px]">{ticket.receipt_code}</div>
              <div className="text-[11px] text-[#6B7280] mt-1">Show this QR at entry. Screenshot works.</div>
              <div className="text-[11px] font-mono break-all" style={{ color: TEAL }}>{url}</div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-[10px] font-bold tracking-[0.8px] text-[#6B7280]">TICKET</div>
              <div className="text-xl font-black">#{qty}</div>
              <div className="text-[11px] text-[#6B7280]">{qty} ticket{qty>1?"s":""}</div>
            </div>
          </div>
        </div>

        {/* 2) DETAILS */}
        <div className="mt-6 rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
          <div className="text-[12px] font-black tracking-[0.8px]">TICKET DETAILS</div>
          <div className="h-px bg-[#E5E7EB] my-3" />
          <div className="grid gap-2 text-[13px]">
            {[
              ["Artist", ticket.artist_name], ["Event", ticket.event_name], ["Section", ticket.section], ["Row", ticket.row_label], ["Seat", ticket.seat], ["Level", ticket.level], ["Ticket Type", ticket.ticket_type], ["Venue", ticket.location], ["Address", ticket.address], ["City", ticket.city], ["Date & Time", `${ticket.date} ${ticket.time || ""}`.trim()], ["Price (each)", ticket.price != null ? `$${Number(ticket.price).toLocaleString()}` : null], ["Quantity", String(qty)], ["Total", `$${total.toLocaleString()}`], ["Seller", ticket.seller_name], ["Seller email", ticket.seller_email],
            ].map(([k,v]) => v ? <div key={k} className="flex justify-between gap-4"><span className="text-[#6B7280]">{k}</span><span className="font-semibold text-right max-w-[60%] break-words">{String(v)}</span></div> : null)}
          </div>
          {seats.length ? (
            <div className="mt-4 grid gap-2">
              <div className="text-[12px] font-bold">Seats ({seats.length})</div>
              {seats.map((s:any,i:number)=> (
                <div key={i} className="flex justify-between rounded-xl border px-3 py-2 bg-[#F8FAFC] text-[12px]" style={{ borderColor: BORDER }}>
                  <span className="font-bold text-[#6B7280]">#{i+1}</span>
                  <span>Sec <b>{s.section || "—"}</b> · Row <b>{s.row || "—"}</b> · Seat <b>{s.seat || "—"}</b></span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* 3) PAYMENTS — BANK TRANSFER ONLY */}
        <div className="mt-6 rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full grid place-items-center text-white font-black text-sm" style={{ background: TEAL }}>$</span>
            <div>
              <div className="text-[12px] font-black tracking-[0.8px]">PAYMENT — BANK TRANSFER ONLY</div>
              <div className="text-[12px] text-[#6B7280]">Amount taken from form · No card, no gateway — transfer to seller&apos;s bank.</div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border p-4 flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center" style={{ background: "#F0FDFB", borderColor: "#CCFBF1" }}>
            <div>
              <div className="text-[11px] font-bold tracking-[0.8px] text-[#0F766E]">AMOUNT TO TRANSFER</div>
              <div className="text-2xl font-black" style={{ color: BLACK }}>${total.toLocaleString()}</div>
              <div className="text-[11px] text-[#6B7280]">{qty} × ${amount.toLocaleString()} · Receipt <b>{ticket.receipt_code}</b> as reference</div>
            </div>
            <button onClick={() => copy(`$${total.toLocaleString()} — Ref: ${ticket.receipt_code}`)} className="rounded-full px-4 py-2 text-sm font-bold text-white shrink-0" style={{ background: TEAL }}>Copy amount + ref</button>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-3 text-[13px]">
            {[
              { k: "Bank Name", v: "Example Bank (replace with seller bank)" },
              { k: "Account Holder", v: ticket.seller_name || "Seller — add name in form" },
              { k: "Account / IBAN", v: "DE89 3704 0044 0532 0130 00 — replace" },
              { k: "Reference (required)", v: ticket.receipt_code },
              { k: "Seller Email", v: ticket.seller_email || "—" },
            ].map(r=> (
              <div key={r.k} className="rounded-xl border p-3 flex justify-between gap-3 items-center bg-[#F8FAFC]" style={{ borderColor: BORDER }}>
                <div>
                  <div className="text-[10px] font-bold tracking-[0.6px] text-[#6B7280]">{r.k.toUpperCase()}</div>
                  <div className="font-semibold break-all">{r.v}</div>
                </div>
                <button onClick={() => copy(String(r.v))} className="shrink-0 rounded-full border bg-white px-3 py-1.5 text-[11px] font-bold" style={{ borderColor: BORDER }}>Copy</button>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border p-3 bg-[#FFFBEB]" style={{ borderColor: "#FDE68A" }}>
            <div className="text-[12px] font-bold" style={{ color: "#92400E" }}>How to pay</div>
            <ol className="mt-1 text-[12px] leading-5 list-decimal pl-5" style={{ color: "#78350F" }}>
              <li>Transfer <b>${total.toLocaleString()}</b> to the bank above.</li>
              <li>Use Reference <b>{ticket.receipt_code}</b> so seller can match payment.</li>
              <li>After payment, seller transfers ticket via Ticket Transfer email and you Accept.</li>
              <li>Keep this link — it&apos;s your receipt + QR for entry.</li>
            </ol>
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={() => window.print()} className="flex-1 rounded-full border bg-white py-3 text-sm font-bold" style={{ borderColor: BORDER }}>Print ticket</button>
            <button onClick={() => copy(url)} className="flex-1 rounded-full py-3 text-sm font-bold text-white" style={{ background: BLACK }}>Copy link</button>
          </div>
          <p className="mt-3 text-center text-[11px] text-[#9CA3AF]">No payment gateway — bank transfer only, as requested. Update bank details in Supabase or .env seller config to go live.</p>
        </div>

        <div className="mt-6 text-center text-[11px] text-[#9CA3AF]">ticketswap clone · Preview link shareable · Bank transfer · Not affiliated with ticketswap.com</div>
      </div>
    </div>
  );
}
