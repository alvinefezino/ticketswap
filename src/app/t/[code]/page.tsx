"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const TEAL = "#00C2A8";
const BORDER = "#E5E7EB";
const BLACK = "#0A0E14";

type Ticket = {
  receipt_code: string; user_id: string | null; artist_name: string | null; event_name: string | null; title: string;
  section: string | null; row_label: string | null; seat: string | null; date: string; time: string | null;
  location: string | null; address: string | null; city: string | null; ticket_type: string | null;
  level: string | null; number_of_tickets: number; seats: any[]; image_url: string | null; price: number | null;
  seller_name: string | null; seller_email: string | null;
  beneficiary_name: string | null; account_number: string | null; sort_code: string | null; bic_swift: string | null;
  payment_status: string | null; receipt_url: string | null; receipt_type: string | null; receipt_uploaded_at: string | null; receipt_email: string | null;
  created_at: string;
};

export default function PreviewPage({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code || "").toUpperCase();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadEmail, setUploadEmail] = useState("");
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      const anonUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      if (!anonUrl || !anon) { setNotFound(true); setLoading(false); return; }
      const { createClient } = await import("@supabase/supabase-js");
      const supa = createClient(anonUrl, anon);
      const { data, error } = await supa.from("ticketswap_tickets").select("*").eq("receipt_code", code).maybeSingle();
      if (error) throw error;
      if (!data) { setNotFound(true); } else { setTicket(data as Ticket); }
    } catch { setNotFound(true); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [code]);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url || `https://ticketswap.local/t/${code}`)}`;
  const amount = ticket ? Number(ticket.price || 0) : 0;
  const qty = ticket?.number_of_tickets || 1;
  const total = amount * qty;
  const seats: any[] = Array.isArray(ticket?.seats) ? ticket!.seats : [];
  const status = (ticket as any)?.payment_status || "pending";
  const isOwner = !!(user && ticket && (ticket as any).user_id && user.id === (ticket as any).user_id);

  const copy = async (t: string) => {
    try { await navigator.clipboard.writeText(t); alert("Copied: " + t); } catch { prompt("Copy:", t); }
  };

  const doUpload = async () => {
    setErr(null); setMsg(null);
    if (!uploadFile) { setErr("Choose an image or PDF first"); return; }
    if (uploadFile.size > 10 * 1024 * 1024) { setErr("Max 10MB"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("receipt_code", code);
      fd.append("file", uploadFile);
      if (uploadEmail.trim()) fd.append("email", uploadEmail.trim());
      const r = await fetch("/api/ticketswap/receipt/upload", { method: "POST", body: fd });
      const j = await r.json().catch(()=>({}));
      if (!r.ok) throw new Error(j.error || `Failed ${r.status}`);
      setMsg("Receipt uploaded — seller will see it in their dashboard. You can re-upload to replace.");
      setUploadFile(null);
      await load();
    } catch (e:any) { setErr(e.message || String(e)); }
    finally { setUploading(false); }
  };

  const doConfirm = async (action: "confirm"|"reject") => {
    if (!isOwner) return;
    setErr(null);
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const anonUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      const supa = createClient(anonUrl, anon);
      const { data } = await supa.auth.getSession();
      const token = data.session?.access_token;
      if (!token) { setErr("Please log in as the ticket owner"); return; }
      const r = await fetch("/api/ticketswap/receipt/confirm", { method: "POST", headers: { "Content-Type":"application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ receipt_code: code, action }) });
      const j = await r.json().catch(()=>({}));
      if (!r.ok) throw new Error(j.error || `Failed ${r.status}`);
      await load();
      setMsg(action==="confirm" ? "Payment confirmed" : "Receipt rejected — buyer can re-upload");
    } catch (e:any) { setErr(e.message || String(e)); }
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
        <p className="mt-2 text-sm text-[#6B7280]">Receipt <b>{code}</b> not found.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full border bg-white px-6 py-2.5 text-sm font-bold" style={{ borderColor: BORDER }}>Back to discover</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      <header className="sticky top-0 z-40 bg-white border-b" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-[960px] px-3 sm:px-4 h-[56px] sm:h-[64px] flex items-center justify-between gap-2">
          <Link href="/" className="font-black text-[20px] tracking-[-0.6px]" style={{ color: BLACK }}>ticketswap<span className="w-1.5 h-1.5 rounded-full inline-block ml-0.5" style={{ background: TEAL }} /></Link>
          {isOwner ? <Link href={`/edit/${encodeURIComponent(code)}`} className="rounded-full px-4 py-2 text-[12px] font-bold text-white" style={{ background: BLACK }}>Edit ticket</Link> : null}
        </div>
      </header>

      <div className="mx-auto max-w-[720px] px-3 sm:px-4 py-4 sm:py-6">

        {isOwner ? (
          <div className="rounded-xl border p-3 flex items-center justify-between gap-3 bg-[#F0FDFB]" style={{ borderColor: "#CCFBF1" }}>
            <div className="text-[12px]"><b>You are the owner</b> — you can <Link href={`/edit/${encodeURIComponent(code)}`} className="underline font-bold" style={{ color: TEAL }}>edit this ticket</Link> and confirm receipts.</div>
            <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold bg-white border" style={{ borderColor: "#CCFBF1", color: TEAL }}>{status === "confirmed" ? "CONFIRMED" : status === "receipt_uploaded" ? "RECEIPT UPLOADED" : "PENDING"}</span>
          </div>
        ) : null}

        {/* 1) TICKET DESIGN */}
        <div className="mt-3 rounded-2xl overflow-hidden border bg-white" style={{ borderColor: BORDER }}>
          {ticket.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ticket.image_url} alt="ticket" className="w-full h-[190px] sm:h-[220px] object-cover" />
          ) : <div className="w-full h-28 grid place-items-center bg-[#F5F7F9] text-[#9CA3AF] text-sm">No image</div>}
          <div className="p-5">
            <div className="flex gap-2 flex-wrap">
              <span className="rounded-full border bg-white px-3 py-1 text-[11px] font-bold tracking-[0.6px]" style={{ borderColor: BORDER }}>{(ticket.ticket_type || "TICKET").toUpperCase()}</span>
              <span className="rounded-full px-3 py-1 text-[11px] font-bold text-white" style={{ background: TEAL }}>RECEIPT {ticket.receipt_code}</span>
              {ticket.level ? <span className="rounded-full border bg-[#F5F7F9] px-3 py-1 text-[11px] font-bold" style={{ borderColor: BORDER }}>LEVEL {ticket.level}</span> : null}
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold border ${status==="confirmed"?"bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]":status==="receipt_uploaded"?"bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]":"bg-white text-[#6B7280]"}`} style={{ borderColor: status==="pending"?BORDER:undefined }}>{status.toUpperCase()}</span>
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
          <div className="border-t border-dashed flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 items-center bg-[#F8FAFC]" style={{ borderColor: BORDER }}>
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
              ["Artist", ticket.artist_name], ["Event", ticket.event_name], ["Section", ticket.section], ["Row", ticket.row_label], ["Seat", ticket.seat], ["Level", ticket.level], ["Ticket Type", ticket.ticket_type], ["Venue", ticket.location], ["Address", ticket.address], ["City", ticket.city], ["Date & Time", `${ticket.date} ${ticket.time || ""}`.trim()], ["Price (each)", ticket.price != null ? `$${Number(ticket.price).toLocaleString()}` : null], ["Quantity", String(qty)], ["Total", `$${total.toLocaleString()}`],
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
              <div className="text-[12px] text-[#6B7280]">Amount taken from form · transfer to seller&apos;s bank.</div>
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

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
            {[
              { k: "Beneficiary name", v: ticket.beneficiary_name || "—" },
              { k: "Account number", v: ticket.account_number || "—" },
              { k: "Sort code", v: ticket.sort_code || "—" },
              { k: "BIC number / SWIFT", v: ticket.bic_swift || "—" },
              { k: "Reference (required)", v: ticket.receipt_code },
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
              <li>Upload your receipt below after sending.</li>
              <li>Keep this link — it&apos;s your receipt + QR for entry.</li>
            </ol>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button onClick={() => window.print()} className="flex-1 rounded-full border bg-white py-3 text-sm font-bold" style={{ borderColor: BORDER }}>Print ticket</button>
            <button onClick={() => copy(url)} className="flex-1 rounded-full py-3 text-sm font-bold text-white" style={{ background: BLACK }}>Copy link</button>
          </div>
        </div>

        {/* 4) UPLOAD RECEIPT */}
        <div className="mt-6 rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
          <div className="text-[12px] font-black tracking-[0.8px]">UPLOAD PAYMENT RECEIPT</div>
          <div className="text-[12px] text-[#6B7280] mt-1">Buyer: upload image or PDF after you transfer. Seller sees it in My Tickets and here.</div>

          {status === "confirmed" ? (
            <div className="mt-3 rounded-xl border p-3 bg-[#ECFDF5]" style={{ borderColor: "#A7F3D0" }}>
              <div className="text-sm font-bold text-[#065F46]">✓ Payment confirmed by seller</div>
              {isOwner ? <div className="mt-2 flex gap-2"><button onClick={()=>doConfirm("reject")} className="rounded-full border bg-white px-4 py-2 text-xs font-bold" style={{ borderColor: BORDER }}>Revert to pending</button></div> : null}
            </div>
          ) : null}

          {ticket.receipt_url ? (
            <div className="mt-3 rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
              <div className="p-3 flex flex-wrap gap-2 items-center justify-between bg-[#F8FAFC]" style={{ borderColor: BORDER }}>
                <div className="text-[11px] font-bold">
                  Receipt {ticket.receipt_type === "pdf" ? "(PDF)" : "(Image)"} {ticket.receipt_uploaded_at ? `· ${new Date(ticket.receipt_uploaded_at).toLocaleString()}` : ""} {ticket.receipt_email ? `· ${ticket.receipt_email}` : ""}
                  <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-black border" style={{ borderColor: status==="receipt_uploaded"?"#FDE68A":BORDER, background: status==="receipt_uploaded"?"#FFFBEB":"white" }}>{status.toUpperCase()}</span>
                </div>
                <div className="flex gap-2">
                  <a href={ticket.receipt_url} target="_blank" rel="noreferrer" className="rounded-full border bg-white px-3 py-1.5 text-xs font-bold" style={{ borderColor: BORDER }}>Open</a>
                  {isOwner && status === "receipt_uploaded" ? (
                    <>
                      <button onClick={()=>doConfirm("confirm")} className="rounded-full px-3 py-1.5 text-xs font-bold text-white" style={{ background: TEAL }}>Confirm payment</button>
                      <button onClick={()=>doConfirm("reject")} className="rounded-full border bg-white px-3 py-1.5 text-xs font-bold" style={{ borderColor: BORDER }}>Reject</button>
                    </>
                  ) : null}
                </div>
              </div>
              {ticket.receipt_type === "pdf" ? (
                <div className="p-3 text-center">
                  <a href={ticket.receipt_url} target="_blank" rel="noreferrer" className="inline-flex rounded-full px-5 py-2.5 text-sm font-bold text-white" style={{ background: TEAL }}>View PDF</a>
                  <p className="mt-2 text-xs text-[#6B7280]">PDF receipts open in a new tab</p>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ticket.receipt_url} alt="receipt" className="w-full max-h-[520px] object-contain bg-white" />
              )}
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-dashed p-4 text-center bg-[#F8FAFC]" style={{ borderColor: BORDER }}>
              <div className="text-sm text-[#6B7280]">No receipt uploaded yet</div>
              {status === "pending" ? <div className="text-xs text-[#9CA3AF] mt-1">Old tickets are pending until buyer uploads — works retroactively.</div> : null}
            </div>
          )}

          {status !== "confirmed" ? (
            <div className="mt-4 grid gap-3">
              {msg ? <div className="rounded-xl border p-3 text-sm bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]">{msg}</div> : null}
              {err ? <div className="rounded-xl border p-3 text-sm bg-red-50 border-red-200 text-red-700">{err}</div> : null}
              <label className="grid gap-1 text-left">
                <span className="text-[11px] font-bold text-[#374151]">Receipt file (image or PDF, max 10MB)</span>
                <input type="file" accept="image/*,application/pdf" onChange={e=> setUploadFile(e.target.files?.[0] || null)} className="border rounded-xl px-3 py-2.5 text-sm bg-white file:mr-3 file:rounded-full file:border-0 file:bg-black file:text-white file:px-4 file:py-1 file:text-xs file:font-bold" style={{ borderColor: BORDER }} />
                {uploadFile ? <span className="text-xs text-[#6B7280]">{uploadFile.name} · {(uploadFile.size/1024).toFixed(0)} KB · {uploadFile.type || "unknown type"}</span> : null}
              </label>
              <label className="grid gap-1 text-left">
                <span className="text-[11px] font-bold text-[#374151]">Your email (optional, helps seller contact you)</span>
                <input value={uploadEmail} onChange={e=> setUploadEmail(e.target.value)} placeholder="you@gmail.com" className="border rounded-xl px-4 py-3 text-sm outline-none bg-[#F8FAFC] focus:bg-white" style={{ borderColor: BORDER }} />
              </label>
              <button onClick={doUpload} disabled={uploading || !uploadFile} className="rounded-full py-3 text-sm font-bold text-white disabled:opacity-50" style={{ background: TEAL }}>{uploading ? "Uploading..." : ticket.receipt_url ? "Replace receipt" : "Upload receipt"}</button>
              <p className="text-[11px] text-center text-[#9CA3AF]">After upload, the ticket creator sees it in My Tickets and here and can confirm.</p>
            </div>
          ) : (
            <p className="mt-3 text-xs text-[#6B7280]">Re-upload after seller reverts, but not while confirmed.</p>
          )}
        </div>

        <div className="mt-6 text-center text-[11px] text-[#9CA3AF]">ticketswap clone · Preview link shareable · Bank transfer · Not affiliated with ticketswap.com</div>
      </div>
    </div>
  );
}
