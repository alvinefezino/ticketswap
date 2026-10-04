"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice, currencyForLocation, formatPriceWithCurrency } from "@/lib/currency";

const TEAL = "#00C2A8";
const BORDER = "#E5E7EB";
const BLACK = "#0A0E14";

type Ticket = {
  receipt_code: string; user_id: string | null; artist_name: string | null; event_name: string | null; title: string;
  section: string | null; row_label: string | null; seat: string | null; date: string; time: string | null;
  location: string | null; address: string | null; city: string | null; ticket_type: string | null;
  level: string | null; number_of_tickets: number; seats: any[]; image_url: string | null; price: number | null;
  seller_name: string | null; seller_email: string | null; buyer_full_name: string | null; buyer_email: string | null;
  beneficiary_name: string | null; account_number: string | null; sort_code: string | null; bic_swift: string | null;
  currency: string | null;
  apple_pay_details: string | null; venmo_handle: string | null; zelle_details: string | null; cashapp_cashtag: string | null;
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
  const [previewObj, setPreviewObj] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadEmail, setUploadEmail] = useState("");
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [showPaymentCompleted, setShowPaymentCompleted] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 10-minute persistent timer
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timerKey = `timer_${code}`;
    const storedStartTime = localStorage.getItem(timerKey);
    const now = Date.now();
    const duration = 10 * 60 * 1000; // 10 minutes

    let startTime: number;
    if (storedStartTime) {
      startTime = parseInt(storedStartTime, 10);
    } else {
      startTime = now;
      localStorage.setItem(timerKey, startTime.toString());
    }

    const updateTimer = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(Math.floor(remaining / 1000));
      if (remaining <= 0) {
        setIsExpired(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [code]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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

  useEffect(() => {
  if (uploadFile && uploadFile.type.startsWith("image/")) {
  const u = URL.createObjectURL(uploadFile);
  setPreviewObj(u);
  return () => URL.revokeObjectURL(u);
  } else setPreviewObj(null);
  }, [uploadFile]);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url || `https://ticketswap.local/t/${code}`)}`;
  const amount = ticket ? Number(ticket.price || 0) : 0;
  const qty = ticket?.number_of_tickets || 1;
  const total = amount * qty;
  const seats: any[] = Array.isArray(ticket?.seats) ? ticket!.seats : [];
  const status = (ticket as any)?.payment_status || "pending";
  const cur = ticket ? (ticket.currency ? ({ AUD:{code:"AUD",symbol:"A$",locale:"en-AU"}, EUR:{code:"EUR",symbol:"€",locale:"de-DE"}, GBP:{code:"GBP",symbol:"£",locale:"en-GB"}} as any)[String(ticket.currency).toUpperCase()] || currencyForLocation(ticket.city, ticket.location) : currencyForLocation(ticket.city, ticket.location)) : { code: "EUR", symbol: "€", locale: "nl-NL" };
  const fmt = (n: number) => formatPriceWithCurrency(n, ticket?.currency || "EUR");
  const fmtSingle = ticket ? formatPriceWithCurrency(amount, ticket.currency || "EUR") : `€${amount.toLocaleString()}`;
  const isOwner = !!(user && ticket && (ticket as any).user_id && user.id === (ticket as any).user_id);

  const copy = async (t: string) => {
  try { await navigator.clipboard.writeText(t); } catch {}
  setMsg(`Copied`);
  setTimeout(() => setMsg(null), 1600);
  };

  const pickFile = (f: File | null) => {
  if (!f) return;
  if (f.size > 10 * 1024 * 1024) { setErr("Max 10MB"); return; }
  const ok = f.type.startsWith("image/") || f.type === "application/pdf";
  if (!ok) { setErr("Only images or PDF"); return; }
  setErr(null); setMsg(null); setUploadFile(f);
  };

  const doUpload = async () => {
  setErr(null); setMsg(null);
  if (!uploadFile) { setErr("Choose an image or PDF first"); return; }
  setUploading(true);
  try {
  const fd = new FormData();
  fd.append("receipt_code", code);
  fd.append("file", uploadFile);
  if (uploadEmail.trim()) fd.append("email", uploadEmail.trim());
  const r = await fetch("/api/ticketswap/receipt/upload", { method: "POST", body: fd });
  const j = await r.json().catch(()=>({}));
  if (!r.ok) throw new Error(j.error || `Failed ${r.status}`);
  setMsg("Receipt uploaded - our team will see it right away.");
  setUploadFile(null); setPreviewObj(null);
  setShowPaymentCompleted(true);
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
  setMsg(action==="confirm" ? "Payment confirmed \u2713" : "Receipt rejected - buyer can re-upload");
  } catch (e:any) { setErr(e.message || String(e)); }
  };

  if (loading) return <div className="min-h-screen grid place-items-center bg-[#F5F7F9]"><div className="flex flex-col items-center gap-3"><div className="h-8 w-8 rounded-full border-2 border-[#E5E7EB] border-t-[#00C2A8] animate-spin" /><div className="text-sm font-semibold text-[#6B7280]">Loading {code}...</div></div></div>;
  if (notFound || !ticket) return (
  <div className="min-h-screen bg-white">
  <header className="sticky top-0 bg-white border-b" style={{ borderColor: BORDER }}>
  <div className="mx-auto max-w-[960px] px-4 h-[56px] flex items-center justify-between">
  <Link href="/" className="font-black text-[19px]" style={{ color: BLACK }}>ticketswap<span className="w-1.5 h-1.5 rounded-full inline-block ml-0.5" style={{ background: TEAL }} /></Link>
  </div>
  </header>
  <div className="mx-auto max-w-[720px] px-4 py-14 text-center">
  <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 grid place-items-center mx-auto text-red-600 font-black"> x </div>
  <h1 className="mt-4 text-xl font-black">Ticket not found</h1>
  <p className="mt-2 text-sm text-[#6B7280]">Receipt <b>{code}</b> not found.</p>
  <Link href="/" className="mt-6 inline-flex rounded-full border bg-white px-6 py-3 text-sm font-bold active:scale-[0.98]" style={{ borderColor: BORDER }}>Back to discover</Link>
  </div>
  </div>
  );

  const statusMeta = status === "confirmed" ? { label: "Payment confirmed", dot: "bg-[#10B981]", bg: "bg-[#ECFDF5]", border: "border-[#A7F3D0]", text: "text-[#065F46]" }
  : status === "receipt_uploaded" ? { label: "Receipt uploaded - awaiting our team", dot: "bg-[#F59E0B]", bg: "bg-[#FFFBEB]", border: "border-[#FDE68A]", text: "text-[#92400E]" }
  : { label: "Awaiting payment", dot: "bg-[#9CA3AF]", bg: "bg-white", border: "border-[#E5E7EB]", text: "text-[#6B7280]" };

  return (
  <div className="min-h-screen bg-[#F5F7F9] pb-6">
  <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b" style={{ borderColor: BORDER }}>
  <div className="mx-auto max-w-[960px] px-3 sm:px-4 h-[52px] sm:h-[60px] flex items-center justify-between gap-2">
  <div className="flex items-center gap-3">
  <Link href="/" className="font-black text-[18px] sm:text-[20px] tracking-[-0.6px]" style={{ color: BLACK }}>ticketswap<span className="w-1.5 h-1.5 rounded-full inline-block ml-0.5" style={{ background: TEAL }} /></Link>
  {timeLeft !== null && (
  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border transition-colors ${isExpired ? "bg-red-50 text-red-600 border-red-100" : "bg-purple-50 text-purple-600 border-purple-100"}`}>
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  {isExpired ? "EXPIRED" : formatTime(timeLeft)}
  </div>
  )}
  </div>
  <div className="flex items-center gap-2">
  {isOwner ? <Link href={`/edit/${encodeURIComponent(code)}`} className="rounded-full px-3.5 sm:px-4 py-2 text-[12px] sm:text-[13px] font-bold text-white active:scale-[0.98]" style={{ background: BLACK }}>Edit ticket</Link> : null}
  <button onClick={() => copy(url)} className="hidden sm:inline-flex rounded-full border bg-white px-3 py-2 text-xs font-bold active:scale-[0.98]" style={{ borderColor: BORDER }}>Copy link</button>
  </div>
  </div>
  </header>

  <div className="mx-auto max-w-[720px] px-3 sm:px-4 pt-3 sm:pt-5">

  <div className={`rounded-2xl border px-3.5 py-3 flex items-center justify-between gap-3 ${statusMeta.bg} ${statusMeta.border}`}>
  <div className="flex items-center gap-2.5 min-w-0">
  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${statusMeta.dot} ${status === "receipt_uploaded" ? "animate-pulse" : ""}`} />
  <div className="min-w-0">
  <div className={`text-[13px] font-black leading-none ${statusMeta.text}`}>{statusMeta.label}</div>
  <div className="text-[11px] text-[#6B7280] leading-none mt-1 truncate">{isOwner ? "You are the owner | manage below" : "Buyer view | upload receipt after transfer"}</div>
  </div>
  </div>
  <span className="shrink-0 rounded-full bg-white border px-2.5 py-1 text-[10px] font-black tracking-wide" style={{ borderColor: BORDER }}>{status.toUpperCase()}</span>
  </div>

  <div className="mt-3 rounded-[20px] overflow-hidden border bg-white shadow-[0_2px_16px_rgba(0,0,0,0.04)]" style={{ borderColor: BORDER }}>
  {ticket.image_url ? (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={ticket.image_url} alt="ticket" className="w-full h-[176px] sm:h-[220px] object-cover" />
  ) : <div className="w-full h-28 grid place-items-center bg-[#F5F7F9] text-[#9CA3AF] text-sm">No image</div>}
  <div className="p-4 sm:p-5">
  <div className="flex gap-1.5 flex-wrap items-center">
  <span className="rounded-full border bg-white px-2.5 py-1 text-[10px] font-bold tracking-[0.6px]" style={{ borderColor: BORDER }}>{(ticket.ticket_type || "TICKET").toUpperCase()}</span>
  <span className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white" style={{ background: TEAL }}>{ticket.receipt_code}</span>
  {ticket.level ? <span className="rounded-full border bg-[#F5F7F9] px-2.5 py-1 text-[10px] font-bold" style={{ borderColor: BORDER }}>LVL {ticket.level}</span> : null}
  </div>
  <div className="mt-2.5 text-[11px] font-bold tracking-[0.7px]" style={{ color: TEAL }}>{ticket.artist_name?.toUpperCase() || ""}</div>
  <h1 className="text-[20px] sm:text-[22px] font-black leading-tight tracking-[-0.6px]" style={{ color: BLACK }}>{ticket.event_name || ticket.title}</h1>
  {ticket.artist_name && ticket.event_name && ticket.title !== ticket.event_name ? <div className="text-sm text-[#6B7280]">{ticket.title}</div> : null}
  <div className="mt-3 flex flex-wrap gap-2">
  <span className="inline-flex items-center gap-1.5 rounded-xl border bg-[#F8FAFC] px-2.5 py-1.5 text-[12px] font-bold" style={{ borderColor: BORDER }}>\uD83D\uDCC5 {ticket.date}{ticket.time ? ` | ${ticket.time}` : ""}</span>
  <span className="inline-flex items-center gap-1.5 rounded-xl border bg-[#F8FAFC] px-2.5 py-1.5 text-[12px] max-w-full truncate" style={{ borderColor: BORDER }}>\uD83D\uDCCD {ticket.location || "TBA"}{ticket.city ? `, ${ticket.city}` : ""}</span>
  <span className="rounded-xl px-3 py-1.5 text-[12px] font-black text-white" style={{ background: BLACK }}>{formatPriceWithCurrency(ticket.price, ticket.currency)}{qty > 1 ? ` x ${qty}` : ""}</span>
  </div>
  {ticket.address ? <div className="mt-2 text-[12px] text-[#6B7280] leading-snug">{ticket.address}</div> : null}
  </div>
  <div className="border-t border-dashed flex flex-col sm:flex-row gap-3 p-3 sm:p-4 items-center bg-[#F8FAFC]" style={{ borderColor: BORDER }}>
  <div className="relative shrink-0">
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img src={qrUrl} alt="QR" className={`w-[112px] h-[112px] sm:w-28 sm:h-28 bg-white rounded-xl border p-2 ${status !== "confirmed" ? (isExpired ? "blur-[12px]" : "blur-[7px]") : ""} select-none`} style={{ borderColor: BORDER }} />
  {status !== "confirmed" ? (
  <div className="absolute inset-0 grid place-items-center rounded-xl bg-white/55 backdrop-blur-[1px] border border-white/60 p-2 text-center">
  {isExpired ? (
  <div className="flex flex-col items-center gap-1">
  <div className="rounded-full bg-red-600 text-white px-2 py-1 text-[9px] font-black uppercase tracking-tighter">Offer Expired</div>
  <button onClick={() => window.location.reload()} className="text-[10px] font-bold text-red-600 hover:underline">Refresh</button>
  </div>
  ) : (
  <>
  <div className="rounded-full bg-[#111827] text-white px-3 py-1.5 text-[11px] font-black shadow-sm inline-flex items-center gap-1.5"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Payment not verified</div>
  <div className="text-[10px] leading-tight text-[#374151] mt-1 font-semibold">QR unlocks after our team confirms payment</div>
  </>
  )}
  </div>
  ) : (
  <div className="absolute -bottom-1 -right-1 rounded-full bg-[#10B981] text-white w-7 h-7 grid place-items-center shadow-sm border-2 border-white"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg></div>
  )}
  </div>
  <div className="flex-1 text-center sm:text-left min-w-0">
  <div className="text-[10px] font-black tracking-[1px] text-[#6B7280]">ENTRY QR - SCAN AT VENUE</div>
  <div className="font-mono font-black tracking-[1.5px] text-[15px] sm:text-[16px]">{ticket.receipt_code}</div>
  <div className="text-[11px] text-[#6B7280] mt-0.5">Screenshot works at the door.</div>
  <div className="text-[10px] font-mono break-all leading-tight mt-1" style={{ color: TEAL }}>{url}</div>
  </div>
  <div className="hidden sm:block text-right shrink-0">
  <div className="text-[10px] font-bold tracking-[0.8px] text-[#6B7280]">TICKET</div>
  <div className="text-xl font-black leading-none">#{qty}</div>
  <div className="text-[11px] text-[#6B7280]">{qty} ticket{qty>1?"s":""}</div>
  </div>
  </div>
  </div>

  <div className="mt-4 rounded-2xl border bg-white p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)]" style={{ borderColor: BORDER }}>
  <div className="flex items-center justify-between">
  <div className="text-[12px] font-black tracking-[0.8px]">TICKET DETAILS</div>
  <span className="text-[11px] text-[#9CA3AF]">{total ? `${fmt(total)} total` : ""}</span>
  </div>
  <div className="h-px bg-[#E5E7EB] my-3" />
  <div className="grid gap-2.5 text-[13px]">
  {[
  ["Artist", ticket.artist_name], ["Event", ticket.event_name], ["Section", ticket.section], ["Row", ticket.row_label], ["Seat", ticket.seat], ["Level", ticket.level], ["Type", ticket.ticket_type], ["Venue", ticket.location], ["Address", ticket.address], ["City", ticket.city], ["Date & time", `${ticket.date} ${ticket.time || ""}`.trim()], ["Each", ticket.price != null ? formatPriceWithCurrency(ticket.price, ticket.currency) : null], ["Quantity", String(qty)],
  ].filter(([,v]) => !!v).map(([k,v]) => (
  <div key={k} className="flex justify-between gap-3 py-1">
  <span className="text-[#6B7280] text-[12px] sm:text-[13px] shrink-0">{k}</span>
  <span className="font-semibold text-right text-[12px] sm:text-[13px] max-w-[58%] break-words">{String(v)}</span>
  </div>
  ))}
  </div>
  <div className="mt-4 grid gap-2.5 text-[13px]">
    <div className="flex justify-between gap-3 py-1">
      <span className="text-[#6B7280] text-[12px] sm:text-[13px] shrink-0">Buyer Full Name</span>
      <span className="font-semibold text-right text-[12px] sm:text-[13px] max-w-[58%] break-words">{ticket.buyer_full_name || "N/A"}</span>
    </div>
    <div className="flex justify-between gap-3 py-1">
      <span className="text-[#6B7280] text-[12px] sm:text-[13px] shrink-0">Buyer Email</span>
      <span className="font-semibold text-right text-[12px] sm:text-[13px] max-w-[58%] break-words">{ticket.buyer_email || "N/A"}</span>
    </div>
  </div>
  </div>

  {/* Payment Confirmation Notice */}
  <div className="mt-4 rounded-2xl border bg-white p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)]" style={{ borderColor: BORDER }}>
  <div className="flex items-start gap-3">
  <span className="h-9 w-9 rounded-xl grid place-items-center text-white text-sm shrink-0" style={{ background: TEAL }}><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg></span>
  <div className="min-w-0">
  <div className="text-[13px] font-black tracking-[0.2px]">Payment Confirmation Notice</div>
  <div className="mt-2 text-[13px] leading-relaxed text-[#374151]">
  To ensure a fast and smooth transaction, please make sure your payment is completed instantly. After making the payment, kindly upload your payment receipt on the designated upload page.
  </div>
  <div className="mt-2 text-[13px] leading-relaxed text-[#374151]">
  Once the payment has been verified, our team will confirm the transaction and proceed with the release of your ticket(s) promptly.
  </div>
  <div className="mt-2 text-[13px] leading-relaxed text-[#374151]">
  Thank you for choosing TicketSwap. We appreciate your business and look forward to providing you with a seamless ticketing experience.
  </div>
  </div>
  </div>
  </div>

  <div className="mt-4 rounded-2xl border bg-white p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)]" style={{ borderColor: BORDER }}>
  <div className="flex items-start gap-3">
  <span className="w-9 h-9 rounded-full grid place-items-center text-white font-black text-sm shrink-0" style={{ background: TEAL }}>$</span>
  <div className="min-w-0">
  <div className="text-[12px] font-black tracking-[0.7px]">PAYMENT - BANK TRANSFER</div>
  <div className="text-[12px] text-[#6B7280] leading-snug">Bank transfer only. Transfer + upload proof. Currency set by our team when creating the ticket.</div>
  </div>
  </div>

  <div className="mt-4 rounded-2xl border p-4 flex flex-col gap-3" style={{ background: "#F0FDFB", borderColor: "#CCFBF1" }}>
  <div className="flex items-start justify-between gap-3">
  <div>
  <div className="text-[11px] font-bold tracking-[0.8px] text-[#0F766E]">AMOUNT TO TRANSFER</div>
  <div className="text-[26px] font-black leading-none mt-1" style={{ color: BLACK }}>{fmt(total)}</div>
  <div className="text-[12px] text-[#6B7280] mt-1">{qty} x {fmtSingle} | Reference <b className="font-mono">{ticket.receipt_code}</b></div>
  </div>
  <button onClick={() => copy(`${total} - Ref: ${ticket.receipt_code}`)} className="shrink-0 rounded-full px-4 py-2.5 text-[13px] font-bold text-white active:scale-[0.98] shadow-sm" style={{ background: TEAL }}>Copy</button>
  </div>
  </div>

  <div className="mt-3 grid gap-2">
  <div className="rounded-2xl border overflow-hidden bg-white" style={{ borderColor: BORDER }}>
  <button type="button" onClick={() => setBankOpen(v => !v)} aria-expanded={bankOpen} className="w-full flex items-center gap-3 px-4 py-3 bg-[#F8FAFC] text-left active:scale-[0.99] transition">
  <span className="w-9 h-9 rounded-xl grid place-items-center text-white shrink-0" style={{ background: "#0A0E14" }}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="10" rx="1.5"/><path d="M3 10h18"/><path d="M7 14h2"/><path d="M11 14h2"/><path d="M15 14h2"/><path d="M7 17h2"/><path d="M11 17h2"/><path d="M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/></svg></span>
  <span className="text-[13px] font-black tracking-[-0.2px]">Bank transfer</span>
  <span className="ml-auto text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#F0FDFB] border hidden sm:inline-flex" style={{ borderColor: "#CCFBF1", color: "#0F766E" }}>{cur.code} | {fmt(total)} total</span>
  <span className={`ml-auto sm:ml-2 w-7 h-7 rounded-full border bg-white grid place-items-center shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${bankOpen ? "rotate-180" : "rotate-0"}`} style={{ borderColor: BORDER }}><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#111827" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></span>
  </button>
  <div className="grid transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]" style={{ gridTemplateRows: bankOpen ? "1fr" : "0fr", opacity: bankOpen ? 1 : 0 }}>
  <div className="overflow-hidden">
  <div className="px-3 py-3 grid gap-1.5 bg-white border-t" style={{ borderColor: BORDER }}>
  {[
  { k: "Beneficiary", v: ticket.beneficiary_name || " - " },
  { k: "Account number", v: ticket.account_number || " - ", mono: true },
  { k: "Sort code", v: ticket.sort_code || " - ", mono: true },
  { k: "BIC / SWIFT", v: ticket.bic_swift || " - ", mono: true },
  { k: "Reference", v: ticket.receipt_code, mono: true, hl: true },
  { k: "Amount", v: fmt(total), hl: true },
  ].map((r: any) => (
  <div key={r.k} className={`rounded-xl border p-3 flex items-center justify-between gap-3 ${r.hl ? "bg-[#F0FDFB] border-[#CCFBF1]" : "bg-[#F8FAFC]"}`} style={{ borderColor: r.hl ? "#CCFBF1" : BORDER }}>
  <div className="min-w-0"><div className="text-[10px] font-bold tracking-[0.6px] text-[#6B7280]">{r.k.toUpperCase()}</div><div className={`font-bold break-all text-[13px] ${r.mono ? "font-mono" : ""}`}>{r.v}</div></div>
  <button onClick={() => copy(String(r.v))} className="shrink-0 h-9 w-9 rounded-full border bg-white grid place-items-center active:scale-95" style={{ borderColor: BORDER }} aria-label={`Copy ${r.k}`}><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v3"/></svg></button>
  </div>
  ))}
  </div>
  </div>
  </div>
  </div>
  </div>

<div className="mt-3 rounded-xl p-3 flex gap-2.5 items-start" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
  <span className="text-sm shrink-0">\uD83D\uDCA1</span>
  <ol className="text-[12px] leading-5 list-decimal pl-4" style={{ color: "#78350F" }}>
  <li>Transfer <b>{fmt(total)}</b> with Reference <b className="font-mono">{ticket.receipt_code}</b>.</li>
  <li>Upload receipt below - our team confirms in their dashboard.</li>
  <li>Keep this link as your entry QR.</li>
  </ol>
  </div>

  <div className="mt-3 grid grid-cols-2 gap-2">
  <button onClick={() => window.print()} className="rounded-full border bg-white py-3 text-[13px] font-bold active:scale-[0.98]" style={{ borderColor: BORDER }}>Print</button>
  <button onClick={() => copy(url)} className="rounded-full py-3 text-[13px] font-bold text-white active:scale-[0.98]" style={{ background: BLACK }}>Copy link</button>
  </div>
  </div>



  <div className="mt-4 rounded-2xl border bg-white overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.04)]" style={{ borderColor: status === "receipt_uploaded" ? "#FDE68A" : status === "confirmed" ? "#A7F3D0" : BORDER }} >
  <div className="p-4 sm:p-5 pb-3">
  <div className="flex items-center gap-2.5">
  <span className="h-8 w-8 rounded-xl grid place-items-center text-white text-sm" style={{ background: status === "confirmed" ? "#10B981" : TEAL }}>\uD83E\uDDFE</span>
  <div>
  <div className="text-[13px] font-black tracking-[0.2px]">Payment receipt</div>
  <div className="text-[12px] text-[#6B7280] leading-none">Upload image or PDF after you transfer | 10MB max</div>
  </div>
  <span className={`ml-auto hidden sm:inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${statusMeta.bg} ${statusMeta.border} ${statusMeta.text}`}>{status === "receipt_uploaded" ? "AWAITING CONFIRMATION" : status.toUpperCase()}</span>
  </div>
  <div className="mt-3 grid grid-cols-3 gap-1.5">
  {[
  { n: 1, label: "Transfer", done: true },
  { n: 2, label: "Upload", done: status !== "pending" },
  { n: 3, label: "Confirmed", done: status === "confirmed" },
  ].map(s => (
  <div key={s.n} className={`rounded-full px-2 py-1.5 text-center text-[11px] font-bold border ${s.done ? "bg-[#0A0E14] text-white border-[#0A0E14]" : "bg-white text-[#6B7280] border-[#E5E7EB]"}`}>{s.n}. {s.label}</div>
  ))}
  </div>
  </div>

  {status === "confirmed" ? (
  <div className="mx-4 sm:mx-5 rounded-xl border p-3 flex items-center justify-between gap-3 bg-[#ECFDF5]" style={{ borderColor: "#A7F3D0" }}>
  <div className="flex items-center gap-2">
  <span className="h-7 w-7 rounded-full bg-[#10B981] text-white grid place-items-center text-sm">\u2713</span>
  <div><div className="text-[13px] font-black text-[#065F46]">Payment confirmed by our team</div><div className="text-[11px] text-[#065F46]/80">You are all set for entry.</div></div>
  </div>
  {isOwner ? <button onClick={()=>doConfirm("reject")} className="shrink-0 rounded-full border bg-white px-3 py-1.5 text-xs font-bold active:scale-95" style={{ borderColor: BORDER }}>Revert</button> : null}
  </div>
  ) : null}

  {ticket.receipt_url ? (
  <div className="mx-3 sm:mx-4 mt-3 rounded-2xl border overflow-hidden bg-[#F8FAFC]" style={{ borderColor: BORDER }}>
  <div className="p-3 flex items-center justify-between gap-2 bg-white border-b" style={{ borderColor: BORDER }}>
  <div className="min-w-0">
  <div className="text-[12px] font-black flex items-center gap-1.5 flex-wrap">
  <span className="inline-flex h-6 w-6 rounded-full bg-[#0A0E14] text-white grid place-items-center text-[10px]">{ticket.receipt_type === "pdf" ? "PDF" : "IMG"}</span>
  {ticket.receipt_type === "pdf" ? "PDF receipt" : "Image receipt"}
  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${statusMeta.bg} ${statusMeta.border} ${statusMeta.text}`}>{status === "receipt_uploaded" ? "NEEDS REVIEW" : status.toUpperCase()}</span>
  </div>
  <div className="text-[11px] text-[#6B7280] truncate mt-0.5">{ticket.receipt_uploaded_at ? new Date(ticket.receipt_uploaded_at).toLocaleString() : ""}{ticket.receipt_email ? ` | ${ticket.receipt_email}` : ""}</div>
  </div>
  <div className="flex gap-1.5 shrink-0">
  <a href={ticket.receipt_url} target="_blank" rel="noreferrer" className="h-9 px-3 rounded-full border bg-white grid place-items-center text-xs font-bold active:scale-95" style={{ borderColor: BORDER }}>Open</a>
  </div>
  </div>
  {ticket.receipt_type === "pdf" ? (
  <div className="p-4 text-center bg-white">
  <div className="mx-auto h-16 w-16 rounded-2xl bg-[#F5F7F9] border grid place-items-center text-xl" style={{ borderColor: BORDER }}>\uD83D\uDCC4</div>
  <a href={ticket.receipt_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-full px-5 py-2.5 text-sm font-bold text-white active:scale-[0.98]" style={{ background: TEAL }}>View PDF</a>
  <p className="mt-2 text-xs text-[#6B7280]">Opens in a new tab</p>
  </div>
  ) : (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={ticket.receipt_url} alt="receipt" className="w-full max-h-[420px] sm:max-h-[520px] object-contain bg-white" />
  )}
  {isOwner && status === "receipt_uploaded" ? (
  <div className="p-3 grid grid-cols-2 gap-2 bg-white border-t" style={{ borderColor: BORDER }}>
  <button onClick={()=>doConfirm("confirm")} className="rounded-full py-3 text-sm font-bold text-white active:scale-[0.98]" style={{ background: TEAL }}>Confirm payment</button>
  <button onClick={()=>doConfirm("reject")} className="rounded-full border bg-white py-3 text-sm font-bold active:scale-[0.98]" style={{ borderColor: BORDER }}>Reject</button>
  </div>
  ) : null}
  </div>
  ) : (
  <div className="mx-3 sm:mx-4 mt-3 rounded-2xl border-2 border-dashed p-4 text-center bg-[#F8FAFC]" style={{ borderColor: "#E5E7EB" }}>
  <div className="h-10 w-10 rounded-full bg-white border grid place-items-center mx-auto text-sm" style={{ borderColor: BORDER }}>\uD83D\uDCE4</div>
  <div className="text-[13px] font-bold mt-2">No receipt yet</div>
  <div className="text-xs text-[#6B7280] mt-1">Upload below - works for old tickets too. Our team sees it instantly in My Tickets.</div>
  </div>
  )}

  {status !== "confirmed" ? (
  <div className="p-4 sm:p-5 pt-3 grid gap-3">
  {msg ? <div className="rounded-xl border px-3 py-2.5 text-[13px] flex gap-2 items-center bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]"><span>\u2713</span><span>{msg}</span></div> : null}
  {err ? <div className="rounded-xl border px-3 py-2.5 text-[13px] bg-red-50 border-red-200 text-red-700">{err}</div> : null}

  <div
  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
  onDragLeave={() => setDragOver(false)}
  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0] || null; if (f) pickFile(f); }}
  onClick={() => fileRef.current?.click()}
  className={`rounded-2xl border-2 border-dashed p-4 sm:p-5 text-left cursor-pointer transition active:scale-[0.99] ${dragOver ? "bg-[#F0FDFB] border-[#00C2A8]" : "bg-[#F8FAFC] hover:bg-white"} ${uploadFile ? "border-[#00C2A8] bg-[#F0FDFB]" : ""}`}
  style={{ borderColor: dragOver || uploadFile ? TEAL : BORDER }}
  role="button" tabIndex={0}
  onKeyDown={e => { if (e.key === "Enter") fileRef.current?.click(); }}
  >
  <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={e=> pickFile(e.target.files?.[0] || null)} />
  {!uploadFile ? (
  <div className="flex gap-3 items-center">
  <div className="h-11 w-11 rounded-xl bg-white border grid place-items-center text-lg shrink-0" style={{ borderColor: BORDER }}>+</div>
  <div className="min-w-0">
  <div className="text-[13px] font-black">Tap to choose or drag file here</div>
  <div className="text-[11px] text-[#6B7280]">Image (JPG, PNG, WebP) or PDF | 10MB max | clear photo of transfer</div>
  </div>
  <span className="hidden sm:inline-flex ml-auto shrink-0 rounded-full bg-black text-white px-4 py-2 text-xs font-bold">Browse</span>
  </div>
  ) : (
  <div className="flex gap-3 items-center">
  {previewObj ? (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={previewObj} alt="preview" className="h-14 w-14 rounded-xl object-cover border bg-white shrink-0" style={{ borderColor: BORDER }} />
  ) : (
  <div className="h-14 w-14 rounded-xl bg-white border grid place-items-center text-lg shrink-0" style={{ borderColor: BORDER }}>\uD83D\uDCC4</div>
  )}
  <div className="min-w-0 flex-1">
  <div className="text-[13px] font-bold truncate">{uploadFile.name}</div>
  <div className="text-[11px] text-[#6B7280]">{(uploadFile.size/1024).toFixed(0)} KB | {uploadFile.type || "file"} | tap to change</div>
  <div className="mt-1 inline-flex rounded-full bg-white border px-2 py-0.5 text-[10px] font-bold" style={{ borderColor: BORDER }}>{uploadFile.type === "application/pdf" ? "PDF" : "IMAGE"}</div>
  </div>
  <button onClick={e => { e.stopPropagation(); setUploadFile(null); setPreviewObj(null); }} className="shrink-0 h-9 w-9 rounded-full border bg-white grid place-items-center active:scale-95" style={{ borderColor: BORDER }} aria-label="Remove file"> x </button>
  </div>
  )}
  </div>

  <label className="grid gap-1.5 text-left">
  <span className="text-[11px] font-bold text-[#374151]">Your email <span className="font-normal text-[#9CA3AF]">(optional - helps our team contact you)</span></span>
  <input value={uploadEmail} onChange={e=> setUploadEmail(e.target.value)} placeholder="you@gmail.com" inputMode="email" autoComplete="email" className="h-[48px] border rounded-xl px-4 text-[14px] outline-none bg-[#F8FAFC] focus:bg-white focus:border-[#00C2A8]" style={{ borderColor: BORDER }} />
  </label>

  <button onClick={doUpload} disabled={uploading || !uploadFile} className="h-[50px] rounded-full text-[15px] font-black text-white disabled:opacity-50 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2" style={{ background: uploading || !uploadFile ? "#9CA3AF" : TEAL }}>
  {uploading ? <><span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Uploading...</> : ticket.receipt_url ? "Replace receipt" : "Upload receipt"}
  </button>
  <p className="text-[11px] text-center text-[#9CA3AF] leading-snug">By uploading you confirm the transfer was sent. Our team is notified and can confirm in My Tickets.</p>
  </div>
  ) : (
  <div className="p-4 sm:p-5 pt-3">
  <p className="text-xs text-[#6B7280] text-center">Re-upload after our team reverts. Confirmed receipts are locked.</p>
  </div>
  )}
  </div>


  {showPaymentCompleted ? (
  <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowPaymentCompleted(false)}>
  <div className="w-full max-w-[420px] rounded-[20px] bg-white p-6 sm:p-7 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
  <div className="mx-auto h-14 w-14 rounded-full grid place-items-center text-white text-xl" style={{ background: TEAL }}><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg></div>
  <h3 className="mt-4 text-[18px] font-black tracking-[-0.3px]" style={{ color: BLACK }}>Payment completed</h3>
  <p className="mt-1.5 text-[13px] leading-relaxed text-[#6B7280]">Your receipt has been uploaded successfully. Our team will be notified and will confirm your payment shortly. You can track the status on this page.</p>
  <div className="mt-2 inline-flex rounded-full border px-3 py-1 text-[11px] font-bold bg-[#F0FDFB]" style={{ borderColor: "#CCFBF1", color: "#0F766E" }}>{code} | {ticket?.receipt_uploaded_at ? new Date(ticket.receipt_uploaded_at).toLocaleString() : "just now"}</div>
  <div className="mt-6 grid grid-cols-1 gap-2">
  <button onClick={() => setShowPaymentCompleted(false)} className="h-[46px] rounded-full text-sm font-black text-white active:scale-[0.98]" style={{ background: TEAL }}>Done</button>
  <button onClick={() => { setShowPaymentCompleted(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="h-[44px] rounded-full border bg-white text-sm font-bold active:scale-[0.98]" style={{ borderColor: BORDER }}>View ticket</button>
  </div>
  </div>
  </div>
  ) : null}
  </div>
  </div>
  );
}
