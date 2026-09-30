"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { useAuth } from "@/contexts/AuthContext";
const TEAL="#00C2A8"; const BORDER="#E5E7EB"; const BLACK="#0A0E14";
type Seat={section:string;row:string;seat:string};
function Field({label,value,onChange,placeholder,type="text"}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string;type?:string}){
 return <label className="flex-1 grid gap-1"><span className="text-[10px] font-semibold text-[#6B7280]">{label}</span><input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||label} className="border rounded-[10px] px-3 h-[42px] text-[13px] outline-none bg-[#F8FAFC] focus:bg-white focus:border-[#00C2A8]" style={{borderColor:BORDER}} /></label>;
}
export default function EditPage({params}:{params:{code:string}}){
 const code=decodeURIComponent(params.code||"").toUpperCase();
 const {user,loading:authLoading}=useAuth();
 const router=useRouter();
 const [fetching,setFetching]=useState(true);
 const [notFound,setNotFound]=useState(false);
 const [notOwner,setNotOwner]=useState(false);
 const [artistName,setArtistName]=useState("");
 const [eventName,setEventName]=useState("");
 const [section,setSection]=useState("");
 const [row,setRow]=useState("");
 const [seat,setSeat]=useState("");
 const [date,setDate]=useState("");
 const [location,setLocation]=useState("");
 const [time,setTime]=useState("");
 const [address,setAddress]=useState("");
 const [ticketType,setTicketType]=useState("");
 const [level,setLevel]=useState("");
 const [numberOfTickets,setNumberOfTickets]=useState("1");
 const [city,setCity]=useState("");
 const [price,setPrice]=useState("");
 const [currency,setCurrency]=useState("EUR");
 const [sellerName,setSellerName]=useState("");
 const [sellerEmail,setSellerEmail]=useState("");
 const [beneficiaryName,setBeneficiaryName]=useState("");
 const [accountNumber,setAccountNumber]=useState("");
 const [sortCode,setSortCode]=useState("");
 const [bicSwift,setBicSwift]=useState("");
 const [imageUrlText,setImageUrlText]=useState("");
 const [imageFile,setImageFile]=useState<File|null>(null);
 const [previewUrl,setPreviewUrl]=useState<string|null>(null);
 const [seats,setSeats]=useState<Seat[]>([{section:"",row:"",seat:""}]);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState<string|null>(null);
 const [ok,setOk]=useState(false);
 const loadedForRef = useRef<string|null>(null);

 useEffect(()=>{
 if(authLoading) return;
 if(!user){ router.replace("/login"); return; }
 const key = `${code}__${user.id}`;
 if(loadedForRef.current === key) return;
 let cancelled=false;
 (async()=>{
 try{
 const {createClient}=await import("@supabase/supabase-js");
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL||""; const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"";
 const supa=createClient(url,anon);
 const {data,error}=await supa.from("ticketswap_tickets").select("*").eq("receipt_code",code).maybeSingle();
 if(cancelled) return;
 if(error) throw error;
 if(!data){ setNotFound(true); setFetching(false); return; }
 if((data as any).user_id && (data as any).user_id!==user.id){ setNotOwner(true); setFetching(false); return; }
 setArtistName((data as any).artist_name||"");
 setEventName((data as any).event_name||"");
 setSection((data as any).section||"");
 setRow((data as any).row_label||"");
 setSeat((data as any).seat||"");
 setDate((data as any).date||"");
 setLocation((data as any).location||"");
 setTime((data as any).time||"");
 setAddress((data as any).address|| (data as any).description || "");
 setTicketType((data as any).ticket_type||"");
 setLevel((data as any).level||"");
 setNumberOfTickets(String((data as any).number_of_tickets||1));
 setCity((data as any).city||"");
 setPrice((data as any).price!=null? String((data as any).price):"");
 setCurrency(((data as any).currency||"EUR").toUpperCase());
 setSellerName((data as any).seller_name||"");
 setSellerEmail((data as any).seller_email||"");
 setBeneficiaryName((data as any).beneficiary_name||"");
 setAccountNumber((data as any).account_number||"");
 setSortCode((data as any).sort_code||"");
 setBicSwift((data as any).bic_swift||"");
 setImageUrlText((data as any).image_url && !(data as any).image_url.startsWith("data:") ? (data as any).image_url : "");
 if((data as any).image_url) setPreviewUrl((data as any).image_url);
 const s=Array.isArray((data as any).seats)?(data as any).seats:[];
 if(s.length) setSeats(s);
 loadedForRef.current = key;
 }catch(e:any){ if(!cancelled) setError(e.message||String(e)); }
 finally{ if(!cancelled) setFetching(false); }
 })();
 return ()=>{ cancelled=true; };
 },[user?.id, authLoading, code]);

 const syncSeats=(n:number)=>{ const c=Math.max(1,Math.min(10,n||1)); setSeats(prev=>{ const next=[...prev]; while(next.length<c) next.push({section:"",row:"",seat:""}); while(next.length>c) next.pop(); return next; }); };
 const onNumChange=(v:string)=>{ const cleaned=v.replace(/[^0-9]/g,""); setNumberOfTickets(cleaned); const n=parseInt(cleaned||"1",10); if(!isNaN(n)) syncSeats(n); };
 const onFile=(f:File|null)=>{ setImageFile(f); if(f){ const u=URL.createObjectURL(f); setPreviewUrl(u); } };

 const onSave=async()=>{
 setError(null); setOk(false);
 if(!user){ setError("Please log in"); return; }
 if(!artistName.trim() && !eventName.trim()){ setError("Enter Artist or Event name"); return; }
 if(!date.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date.trim())){ setError("Date must be YYYY-MM-DD"); return; }
 const n=parseInt(numberOfTickets||"1",10); if(isNaN(n)||n<1||n>10){ setError("Number 1-10"); return; }
 setBusy(true);
 try{
 const {createClient}=await import("@supabase/supabase-js");
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL||""; const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"";
 const supa=createClient(url,anon);
 const {data}=await supa.auth.getSession();
 const token=data.session?.access_token;
 if(!token) throw new Error("Not logged in - please log in again");
 const fd=new FormData();
 fd.append("receipt_code",code);
 fd.append("artist_name",artistName.trim());
 fd.append("event_name",eventName.trim());
 fd.append("section",section.trim());
 fd.append("row_label",row.trim());
 fd.append("seat",seat.trim());
 fd.append("date",date.trim());
 fd.append("location",location.trim());
 fd.append("time",time.trim());
 fd.append("address",address.trim());
 fd.append("ticket_type",ticketType.trim());
 fd.append("level",level.trim());
 fd.append("number_of_tickets",String(n));
 fd.append("seats",JSON.stringify(seats));
 fd.append("city",city.trim());
 fd.append("price",price.trim());
 fd.append("currency",currency);
 fd.append("seller_name",sellerName.trim());
 fd.append("seller_email",sellerEmail.trim());
 fd.append("beneficiary_name",beneficiaryName.trim());
 fd.append("account_number",accountNumber.trim());
 fd.append("sort_code",sortCode.trim());
 fd.append("bic_swift",bicSwift.trim());
 if(imageUrlText.trim()) fd.append("image_url",imageUrlText.trim());
 if(imageFile) fd.append("image",imageFile);
 const r=await fetch("/api/ticketswap/update",{method:"POST",body:fd,headers:{Authorization:`Bearer ${token}`}});
 const j=await r.json().catch(()=>({}));
 if(!r.ok) throw new Error(j.error||`Failed ${r.status}`);
 setOk(true); window.scrollTo({top:0,behavior:"smooth"});
 }catch(e:any){ setError(e.message||String(e)); }
 finally{ setBusy(false); }
 };

 if(fetching) return <div className="min-h-screen grid place-items-center bg-white text-sm text-[#6B7280]">Loading {code}...</div>;
 if(notFound) return <div className="min-h-screen grid place-items-center bg-white p-6 text-center"><div><div className="text-xl font-black">Not found</div><p className="text-sm text-[#6B7280] mt-1">{code} not found</p><Link href="/my-tickets" className="mt-4 inline-flex rounded-full px-5 py-2 text-sm font-bold text-white" style={{background:TEAL}}>My Tickets</Link></div></div>;
 if(notOwner) return <div className="min-h-screen grid place-items-center bg-white p-6 text-center"><div><div className="text-xl font-black">Not owner</div><p className="text-sm text-[#6B7280] mt-1">You can only edit your own tickets</p><Link href={`/t/${code}`} className="mt-4 inline-flex rounded-full border bg-white px-5 py-2 text-sm font-bold" style={{borderColor:BORDER}}>View preview</Link></div></div>;

 return (
 <div className="min-h-screen bg-white">
 <header className="sticky top-0 z-40 bg-white border-b" style={{borderColor:BORDER}}>
 <div className="mx-auto max-w-[960px] px-4 h-[64px] flex items-center justify-between">
 <Link href="/" className="font-black text-[20px]" style={{color:BLACK}}>ticketswap<span className="w-1.5 h-1.5 rounded-full inline-block ml-0.5" style={{background:TEAL}}/></Link>
 <div className="flex gap-2">
 <Link href={`/t/${encodeURIComponent(code)}`} className="rounded-full border bg-white px-4 py-2 text-sm font-bold" style={{borderColor:BORDER}}>Preview</Link>
 <Link href="/my-tickets" className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{background:BLACK}}>My Tickets</Link>
 </div>
 </div>
 </header>
 <div className="mx-auto max-w-[720px] px-3 sm:px-4 py-6 sm:py-8">
 <h1 className="text-center text-[18px] font-extrabold">Edit Ticket {code}</h1>
 <p className="text-center text-[11px] text-[#6B7280] mt-1">Only you (owner) can edit. Changes show instantly on the preview link.</p>
 <div className="h-px bg-[#E5E7EB] mt-4" />
 {ok ? <div className="mt-4 rounded-xl border p-4 flex items-center justify-between gap-3" style={{borderColor:TEAL,background:"#F0FDFB"}}><span className="text-sm font-bold" style={{color:TEAL}}>Saved</span><Link href={`/t/${encodeURIComponent(code)}`} className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{background:TEAL}}>Open preview</Link></div> : null}
 {error ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
 <div className="mt-6 grid gap-3">
 <div className="flex flex-col sm:flex-row gap-3"><Field label="Artist Name" value={artistName} onChange={setArtistName} /><Field label="Event Name" value={eventName} onChange={setEventName} /></div>
 <div className="flex flex-col sm:flex-row gap-3"><Field label="Section" value={section} onChange={setSection} /><Field label="Row" value={row} onChange={setRow} /></div>
 <div className="flex flex-col sm:flex-row gap-3"><Field label="Seat" value={seat} onChange={setSeat} /><Field label="date" value={date} onChange={setDate} placeholder="YYYY-MM-DD" /></div>
 <div className="flex flex-col sm:flex-row gap-3"><Field label="Location" value={location} onChange={setLocation} /><Field label="time" value={time} onChange={setTime} placeholder="19:00" /></div>
 <div className="flex justify-center"><label className="w-full sm:w-[58%] grid gap-1"><span className="text-[10px] font-semibold text-[#6B7280]">Address</span><input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Address" className="border rounded-[10px] px-3 h-[42px] text-[13px] outline-none bg-[#F8FAFC] focus:bg-white" style={{borderColor:BORDER}} /></label></div>
 <div className="flex flex-col sm:flex-row gap-3"><Field label="Ticket Type" value={ticketType} onChange={setTicketType} /><Field label="level" value={level} onChange={setLevel} /></div>
 <div className="grid place-items-center gap-1"><span className="text-[10px] font-semibold text-[#6B7280]">Number of Tickets</span><input value={numberOfTickets} onChange={e=>onNumChange(e.target.value)} inputMode="numeric" className="border rounded-[10px] px-3 h-[42px] w-[110px] text-center text-[14px] font-bold outline-none bg-[#F8FAFC] focus:bg-white" style={{borderColor:BORDER}} /></div>
 {parseInt(numberOfTickets||"1",10)>1 ? <div className="rounded-xl border p-3 grid gap-2 bg-white" style={{borderColor:BORDER}}><div className="text-[11px] font-bold">Seats</div>{seats.map((s,idx)=>(<div key={idx} className="flex gap-2 items-center"><span className="text-[11px] font-bold text-[#6B7280] w-6">#{idx+1}</span><input value={s.section} onChange={e=>setSeats(p=>p.map((x,i)=>i===idx?{...x,section:e.target.value}:x))} placeholder="Sec" className="flex-1 border rounded-lg px-2 h-[38px] text-[12px] bg-[#F8FAFC] outline-none" style={{borderColor:BORDER}} /><input value={s.row} onChange={e=>setSeats(p=>p.map((x,i)=>i===idx?{...x,row:e.target.value}:x))} placeholder="Row" className="flex-1 border rounded-lg px-2 h-[38px] text-[12px] bg-[#F8FAFC] outline-none" style={{borderColor:BORDER}} /><input value={s.seat} onChange={e=>setSeats(p=>p.map((x,i)=>i===idx?{...x,seat:e.target.value}:x))} placeholder="Seat" className="flex-1 border rounded-lg px-2 h-[38px] text-[12px] bg-[#F8FAFC] outline-none" style={{borderColor:BORDER}} /></div>))}</div> : null}
 <label className="grid gap-1"><span className="text-[10px] font-semibold text-[#6B7280]">Image Url</span><input value={imageUrlText} onChange={e=>{setImageUrlText(e.target.value); if(e.target.value) setPreviewUrl(e.target.value);}} placeholder="https://..." className="border rounded-[10px] px-3 h-[42px] text-[13px] outline-none bg-[#F8FAFC] focus:bg-white" style={{borderColor:BORDER}} /></label>
 <label className="grid gap-1"><span className="text-[10px] font-semibold text-[#6B7280]">Upload photo</span><input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0]||null; setImageFile(f); if(f) setPreviewUrl(URL.createObjectURL(f));}} className="border rounded-[10px] px-3 py-2 text-[13px] bg-white file:mr-3 file:rounded-full file:border-0 file:bg-[#00C2A8] file:text-white file:px-4 file:py-1 file:text-sm file:font-bold" style={{borderColor:BORDER}} /></label>
 {previewUrl ? <div className="h-36 rounded-[10px] overflow-hidden border" style={{borderColor:BORDER}}><img src={previewUrl} alt="preview" className="w-full h-full object-cover" /></div> : null}
 <div className="flex flex-col sm:flex-row gap-3"><Field label="City" value={city} onChange={setCity} /><Field label="Price" value={price} onChange={setPrice} placeholder="0 for free" type="text" /><label className="grid gap-1 sm:w-[160px]"><span className="text-[10px] font-semibold text-[#6B7280]">Currency</span><select value={currency} onChange={(e)=>setCurrency(e.target.value)} className="border rounded-[10px] px-3 h-[42px] text-[13px] outline-none bg-[#F8FAFC] focus:bg-white font-semibold" style={{ borderColor: BORDER }}>{SUPPORTED_CURRENCIES.map((c)=> <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}</select></label></div>
 <div className="flex flex-col sm:flex-row gap-3"><Field label="Your name" value={sellerName} onChange={setSellerName} /><Field label="Your email" value={sellerEmail} onChange={setSellerEmail} /></div>
 <div className="rounded-xl border p-3 sm:p-4 bg-white grid gap-3" style={{borderColor:BORDER}}>
 <div className="flex items-center gap-2"><span className="w-7 h-7 rounded-full grid place-items-center text-white font-black text-xs" style={{background:TEAL}}>$</span><div><div className="text-[12px] font-black">Bank transfer</div><div className="text-[11px] text-[#6B7280]">Shown to buyer on preview.</div></div></div>
 <Field label="Beneficiary name" value={beneficiaryName} onChange={setBeneficiaryName} placeholder="Name on account" />
 <Field label="Account number" value={accountNumber} onChange={setAccountNumber} placeholder="Account number" />
 <div className="flex flex-col sm:flex-row gap-3"><Field label="Sort code" value={sortCode} onChange={setSortCode} placeholder="Sort code" /><Field label="BIC number / SWIFT" value={bicSwift} onChange={setBicSwift} placeholder="BIC / SWIFT" /></div>
 
 </div>
 <button onClick={onSave} disabled={busy} className="rounded-full h-[46px] font-bold text-[13px] disabled:opacity-60 mt-2 text-white" style={{background:busy?"#9CA3AF":TEAL}}>{busy?"Saving...":"Save changes"}</button>
 <p className="text-[10px] text-center text-[#9CA3AF]">After save, share the same /t/{code} link - buyer sees updated bank details + receipt status.</p>
 </div>
 </div>
 </div>
 );
}