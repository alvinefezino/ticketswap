"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const TEAL = "#00C2A8";
const BORDER = "#E5E7EB";
const BLACK = "#0A0E14";

type Seat = { section: string; row: string; seat: string };

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
 return (
 <label className="flex-1 grid gap-1">
 <span className="text-[10px] font-semibold tracking-[0.2px] text-[#6B7280]">{label}</span>
 <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || label} className="border rounded-[10px] px-3 h-[42px] text-[13px] outline-none bg-[#F8FAFC] focus:bg-white focus:border-[#00C2A8]" style={{ borderColor: BORDER }} />
 </label>
 );
}

export default function SellPage() {
 const { user, loading } = useAuth();
 const router = useRouter();
 const [artistName, setArtistName] = useState("");
 const [eventName, setEventName] = useState("");
 const [section, setSection] = useState("");
 const [row, setRow] = useState("");
 const [seat, setSeat] = useState("");
 const [date, setDate] = useState("");
 const [location, setLocation] = useState("");
 const [time, setTime] = useState("");
 const [address, setAddress] = useState("");
 const [ticketType, setTicketType] = useState("");
 const [level, setLevel] = useState("");
 const [numberOfTickets, setNumberOfTickets] = useState("1");
 const [city, setCity] = useState("");
 const [price, setPrice] = useState("");
 const [sellerName, setSellerName] = useState("");
 const [sellerEmail, setSellerEmail] = useState("");
 const [beneficiaryName, setBeneficiaryName] = useState("");
 const [accountNumber, setAccountNumber] = useState("");
 const [sortCode, setSortCode] = useState("");
 const [bicSwift, setBicSwift] = useState("");const [imageUrlText, setImageUrlText] = useState("");
 const [imageFile, setImageFile] = useState<File | null>(null);
 const [previewUrl, setPreviewUrl] = useState<string | null>(null);
 const [seats, setSeats] = useState<Seat[]>([{ section: "", row: "", seat: "" }]);
 const [busy, setBusy] = useState(false);
 const [result, setResult] = useState<{ code: string; url: string } | null>(null);
 const [error, setError] = useState<string | null>(null);

 const syncSeats = (n: number) => {
 const c = Math.max(1, Math.min(10, n || 1));
 setSeats((prev) => {
 const next = [...prev];
 while (next.length < c) next.push({ section: "", row: "", seat: "" });
 while (next.length > c) next.pop();
 return next;
 });
 };
 const onNumChange = (v: string) => {
 const cleaned = v.replace(/[^0-9]/g, "");
 setNumberOfTickets(cleaned);
 const n = parseInt(cleaned || "1", 10);
 if (!isNaN(n)) syncSeats(n);
 };

 const onFile = (f: File | null) => {
 setImageFile(f);
 if (f) {
 const u = URL.createObjectURL(f);
 setPreviewUrl(u);
 setImageUrlText("");
 } else setPreviewUrl(null);
 };

 const onGenerate = async () => {
 setError(null);
 if (loading) { setError("Checking login..."); return; }
 if (!user) { setError("Please log in or sign up first - only registered users can create tickets."); router.push("/login"); return; }
 if (!artistName.trim() && !eventName.trim()) { setError("Enter Artist Name or Event Name"); return; }
 if (!date.trim()) { setError("Enter date as YYYY-MM-DD"); return; }
 if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) { setError("Use YYYY-MM-DD e.g. 2026-10-15"); return; }
 const n = parseInt(numberOfTickets || "1", 10);
 if (isNaN(n) || n < 1 || n > 10) { setError("Number must be 1-10"); return; }
 setBusy(true);
 try {
 const fd = new FormData();
 fd.append("artist_name", artistName.trim());
 fd.append("event_name", eventName.trim());
 fd.append("section", section.trim());
 fd.append("row_label", row.trim());
 fd.append("seat", seat.trim());
 fd.append("date", date.trim());
 fd.append("location", location.trim());
 fd.append("time", time.trim());
 fd.append("address", address.trim());
 fd.append("ticket_type", ticketType.trim());
 fd.append("level", level.trim());
 fd.append("number_of_tickets", String(n));
 fd.append("seats", JSON.stringify(seats));
 fd.append("city", city.trim());
 fd.append("price", price.trim());
 fd.append("seller_name", sellerName.trim());
 fd.append("seller_email", sellerEmail.trim());
 fd.append("beneficiary_name", beneficiaryName.trim());
 fd.append("account_number", accountNumber.trim());
 fd.append("sort_code", sortCode.trim());
 fd.append("bic_swift", bicSwift.trim());
 if (imageUrlText.trim()) fd.append("image_url", imageUrlText.trim());
 if (imageFile) fd.append("image", imageFile);

 let accessToken: string | null = null;
 try { const { createClient } = await import("@supabase/supabase-js"); const url=process.env.NEXT_PUBLIC_SUPABASE_URL||""; const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||""; if(url && anon){ const c=createClient(url,anon); const {data}=await c.auth.getSession(); accessToken=data?.session?.access_token||null; } } catch {}
 const r = await fetch("/api/ticketswap/create", { method: "POST", body: fd, headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} });
 const j = await r.json().catch(() => ({}));
 if (!r.ok) throw new Error(j?.error || `Failed ${r.status}`);
 setResult({ code: j.receipt_code, url: j.url });
 window.scrollTo({ top: 0, behavior: "smooth" });
 } catch (e: any) {
 setError(e?.message || String(e));
 } finally { setBusy(false); }
 };

 const shareUrl = result?.url || "";
 const copyLink = async () => {
 if (!shareUrl) return;
 await navigator.clipboard.writeText(shareUrl).catch(() => {});
 alert("Link copied: " + shareUrl);
 };

 return (
 <div className="min-h-screen bg-white">
 <header className="sticky top-0 z-40 bg-white border-b" style={{ borderColor: BORDER }}>
 <div className="mx-auto max-w-[960px] px-4 h-[64px] flex items-center justify-between">
 <Link href="/" className="font-black text-[20px] tracking-[-0.6px]" style={{ color: BLACK }}>
 ticketswap<span className="w-1.5 h-1.5 rounded-full inline-block ml-0.5" style={{ background: TEAL }} />
 </Link>
 <Link href="/" className="text-[13px] font-bold hover:underline">Back to discover</Link>
 </div>
 </header>

 <div className="mx-auto max-w-[720px] px-3 sm:px-4 py-6 sm:py-8">
 {!loading && !user ? (
 <div className="rounded-2xl border p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{ borderColor: "#FCA5A5", background: "#FFF1F2" }}>
 <div className="text-sm text-[#7F1D1D]"><b>Log in required</b> - only registered users can create tickets. My Tickets is private.</div>
 <div className="flex gap-2 shrink-0"><Link href="/login" className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ background: TEAL }}>Log in</Link><Link href="/signup" className="rounded-full border bg-white px-4 py-2 text-sm font-bold" style={{ borderColor: BORDER }}>Sign up</Link></div>
 </div>
 ) : null}
 {result ? (
 <div className="rounded-2xl border p-5 mb-6" style={{ borderColor: TEAL, background: "#F0FDFB" }}>
 <div className="text-[12px] font-black tracking-[0.8px]" style={{ color: TEAL }}>TICKET CREATED - SHARE THIS LINK</div>
 <div className="mt-2 text-[14px] font-bold break-all text-[#0A0E14]">{shareUrl}</div>
 <div className="mt-1 text-[12px] text-[#6B7280]">Receipt: <b>{result.code}</b> | Anyone with the link sees ticket design + details + payment methods.</div>
 <div className="mt-4 flex flex-col sm:flex-row gap-2">
 <button onClick={copyLink} className="rounded-full px-5 py-3 sm:py-2.5 text-sm font-bold text-white text-center justify-center" style={{ background: TEAL }}>Copy link</button>
 <Link href={shareUrl} className="rounded-full border bg-white px-5 py-3 sm:py-2.5 text-sm font-bold text-center justify-center" style={{ borderColor: BORDER }}>Open preview <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" className="inline-block ml-1"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></Link>
 <button onClick={() => setResult(null)} className="rounded-full border bg-white px-5 py-3 sm:py-2.5 text-sm font-bold text-center justify-center" style={{ borderColor: BORDER }}>Create another</button>
 </div>
 {previewUrl ? <img src={previewUrl} alt="preview" className="mt-4 w-full h-40 object-cover rounded-xl border" style={{ borderColor: BORDER }} /> : null}
 </div>
 ) : null}

 <h1 className="text-center text-[18px] font-extrabold">Ticket Generator Form</h1>
 <p className="text-center text-[11px] leading-4 text-[#6B7280] mt-1 px-6">Please fill the form for each ticket item and make sure to click on &apos;Generate Ticket&apos; to add each ticket item.</p>
 <div className="h-px bg-[#E5E7EB] mt-4" />

 {error ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

 <div className="mt-6 grid gap-3">
 <div className="flex flex-col sm:flex-row gap-3">
 <Field label="Artist Name" value={artistName} onChange={setArtistName} />
 <Field label="Event Name" value={eventName} onChange={setEventName} />
 </div>
 <div className="flex flex-col sm:flex-row gap-3">
 <Field label="Section" value={section} onChange={setSection} />
 <Field label="Row" value={row} onChange={setRow} />
 </div>
 <div className="flex flex-col sm:flex-row gap-3">
 <Field label="Seat" value={seat} onChange={setSeat} />
 <Field label="date" value={date} onChange={setDate} placeholder="YYYY-MM-DD" />
 </div>
 <div className="flex flex-col sm:flex-row gap-3">
 <Field label="Location" value={location} onChange={setLocation} />
 <Field label="time" value={time} onChange={setTime} placeholder="19:00" />
 </div>

 <div className="flex justify-center px-0">
 <label className="w-full sm:w-[58%] grid gap-1">
 <span className="text-[10px] font-semibold text-[#6B7280]">Address</span>
 <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="border rounded-[10px] px-3 h-[42px] text-[13px] outline-none bg-[#F8FAFC] focus:bg-white focus:border-[#00C2A8]" style={{ borderColor: BORDER }} />
 </label>
 </div>

 <div className="flex flex-col sm:flex-row gap-3">
 <Field label="Ticket Type" value={ticketType} onChange={setTicketType} />
 <Field label="level" value={level} onChange={setLevel} />
 </div>

 <div className="grid place-items-center gap-1">
 <span className="text-[10px] font-semibold text-[#6B7280]">Number of Tickets</span>
 <input value={numberOfTickets} onChange={(e) => onNumChange(e.target.value)} inputMode="numeric" className="border rounded-[10px] px-3 h-[42px] w-[110px] text-center text-[14px] font-bold outline-none bg-[#F8FAFC] focus:bg-white" style={{ borderColor: BORDER }} />
 <span className="text-[10px] text-[#6B7280]">{numberOfTickets.trim() ? `${numberOfTickets} ticket(s)` : ""}</span>
 </div>

 {parseInt(numberOfTickets || "1", 10) > 1 ? (
 <div className="rounded-xl border p-3 grid gap-2 bg-white" style={{ borderColor: BORDER }}>
 <div className="text-[11px] font-bold">Seats - choose position per ticket</div>
 {seats.map((s, idx) => (
 <div key={idx} className="flex gap-2 items-center">
 <span className="text-[11px] font-bold text-[#6B7280] w-6">#{idx + 1}</span>
 <input value={s.section} onChange={(e) => setSeats((p) => p.map((x, i) => (i === idx ? { ...x, section: e.target.value } : x)))} placeholder="Sec" className="flex-1 border rounded-lg px-2 h-[38px] text-[12px] bg-[#F8FAFC] outline-none" style={{ borderColor: BORDER }} />
 <input value={s.row} onChange={(e) => setSeats((p) => p.map((x, i) => (i === idx ? { ...x, row: e.target.value } : x)))} placeholder="Row" className="flex-1 border rounded-lg px-2 h-[38px] text-[12px] bg-[#F8FAFC] outline-none" style={{ borderColor: BORDER }} />
 <input value={s.seat} onChange={(e) => setSeats((p) => p.map((x, i) => (i === idx ? { ...x, seat: e.target.value } : x)))} placeholder="Seat" className="flex-1 border rounded-lg px-2 h-[38px] text-[12px] bg-[#F8FAFC] outline-none" style={{ borderColor: BORDER }} />
 </div>
 ))}
 </div>
 ) : null}

 <label className="grid gap-1">
 <span className="text-[10px] font-semibold text-[#6B7280]">Image Url</span>
 <input value={imageUrlText} onChange={(e) => { setImageUrlText(e.target.value); if (e.target.value) { setPreviewUrl(e.target.value); setImageFile(null); } }} placeholder="https://... or pick from gallery" className="border rounded-[10px] px-3 h-[42px] text-[13px] outline-none bg-[#F8FAFC] focus:bg-white" style={{ borderColor: BORDER }} />
 </label>

 <label className="grid gap-1">
 <span className="text-[10px] font-semibold text-[#6B7280]">Upload photo (ticket image)</span>
 <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] || null)} className="border rounded-[10px] px-3 py-2 text-[13px] bg-white min-w-0 w-full file:mr-3 file:rounded-full file:border-0 file:bg-[#00C2A8] file:text-white file:px-4 file:py-1 file:text-sm file:font-bold" style={{ borderColor: BORDER }} />
 </label>

 {previewUrl ? <div className="h-36 rounded-[10px] overflow-hidden border" style={{ borderColor: BORDER }}><img src={previewUrl} alt="preview" className="w-full h-full object-cover" /></div> : null}

 <div className="flex flex-col sm:flex-row gap-3">
 <Field label="City" value={city} onChange={setCity} placeholder="City (optional) - sets currency" />
 <Field label="Price" value={price} onChange={setPrice} placeholder="0 for free" type="text" />
 </div>

 <div className="flex flex-col sm:flex-row gap-3">
 <Field label="Your name" value={sellerName} onChange={setSellerName} placeholder="Name (optional)" />
 <Field label="Your email" value={sellerEmail} onChange={setSellerEmail} placeholder="you@gmail.com (optional)" />
 </div>

 <div className="rounded-xl border p-3 sm:p-4 bg-white grid gap-3" style={{ borderColor: BORDER }}>
 <div className="flex items-center gap-2">
 <span className="w-7 h-7 rounded-full grid place-items-center text-white font-black text-xs" style={{ background: TEAL }}>$</span>
 <div>
 <div className="text-[12px] font-black tracking-[0.6px]">Bank transfer</div>
 <div className="text-[11px] text-[#6B7280]">This is shown to the buyer on the preview for payment. Currency auto by location/city.</div>
 </div>
 </div>
 <Field label="Beneficiary name" value={beneficiaryName} onChange={setBeneficiaryName} placeholder="Name on account" />
 <Field label="Account number" value={accountNumber} onChange={setAccountNumber} placeholder="Account number" />
 <div className="flex flex-col sm:flex-row gap-3">
 <Field label="Sort code" value={sortCode} onChange={setSortCode} placeholder="Sort code" />
 <Field label="BIC number / SWIFT" value={bicSwift} onChange={setBicSwift} placeholder="BIC / SWIFT" />
 </div>
 <div className="h-px bg-[#E5E7EB]" />
 
 </div>

 <p className="text-[10px] text-[#9CA3AF]">After creation you get a shareable link - preview shows ticket design + details + bank transfer.</p>

 <button onClick={onGenerate} disabled={busy || (!loading && !user)} className="rounded-full h-[46px] font-bold text-[13px] disabled:opacity-60 mt-2 border" style={{ background: busy ? "#E5E7EB" : (!loading && !user) ? "#F3F4F6" : "white", color: "#6B7280", borderColor: BORDER }}>
 {busy ? "Generating..." : "Generate Ticket"}
 </button>
 <p className="text-[10px] text-center text-[#9CA3AF]">QR code + receipt link auto-generated. Amount = price x tickets in buyer currency.</p>
 </div>
 </div>
 </div>
 );
}