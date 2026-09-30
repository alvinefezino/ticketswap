"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/currency";

const TEAL="#00C2A8"; const BORDER="#E5E7EB"; const BLACK="#0A0E14";

type Row = {
  receipt_code:string; title:string; event_name:string|null; date:string; price:number|null; image_url:string|null;
  number_of_tickets:number; location:string|null; city:string|null; created_at:string;
  payment_status:string|null; receipt_url:string|null; receipt_type:string|null; receipt_uploaded_at:string|null; receipt_email:string|null;
};

export default function MyTicketsPage(){
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [fetching, setFetching]=useState(true);
  const [err, setErr]=useState<string|null>(null);
  const [actionMsg, setActionMsg]=useState<string|null>(null);
  const userId = user?.id || null;
  const fetchedForRef = useRef<string|null>(null);

  const fetchRows = async () => {
    if (!userId) return;
    setFetching(true); setErr(null);
    try{
      const url=process.env.NEXT_PUBLIC_SUPABASE_URL||"";
      const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"";
      if(!url||!anon){ setErr("Supabase not configured"); setFetching(false); return; }
      const { createClient } = await import("@supabase/supabase-js");
      const supa=createClient(url,anon);
      const { data, error } = await supa.from("ticketswap_tickets").select("receipt_code,title,event_name,date,price,image_url,number_of_tickets,location,city,created_at,payment_status,receipt_url,receipt_type,receipt_uploaded_at,receipt_email").eq("user_id", userId).order("created_at",{ascending:false});
      if(error) throw new Error(error.message);
      setRows((data as Row[])||[]);
      fetchedForRef.current = userId;
    }catch(e:any){ setErr(e?.message||String(e)); }
    finally{ setFetching(false); }
  };

  useEffect(()=>{
    if(loading) return;
    if(!userId){ const t=setTimeout(()=> router.replace("/login"), 400); return ()=> clearTimeout(t); }
    if(fetchedForRef.current === userId && rows.length>0) return;
    fetchRows();
  },[userId, loading]);

  const confirm = async (code:string, action:"confirm"|"reject")=>{
    setActionMsg(null); setErr(null);
    try{
      const { createClient } = await import("@supabase/supabase-js");
      const url=process.env.NEXT_PUBLIC_SUPABASE_URL||"";
      const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"";
      const supa=createClient(url,anon);
      const { data } = await supa.auth.getSession();
      const token=data.session?.access_token;
      if(!token){ setErr("Please log in"); return; }
      const r=await fetch("/api/ticketswap/receipt/confirm",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({receipt_code:code,action})});
      const j=await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(j.error||`Failed ${r.status}`);
      setActionMsg(action==="confirm"?`Confirmed ${code}`:`Rejected ${code} — buyer can re-upload`);
      await fetchRows();
    }catch(e:any){ setErr(e.message||String(e)); }
  };

  if(loading) return <div className="min-h-screen grid place-items-center bg-white text-sm text-[#6B7280]">Checking login...</div>;
  if(!userId) return <div className="min-h-screen grid place-items-center bg-white text-sm text-[#6B7280]">Redirecting to login...</div>;

  const pendingCount = rows.filter(r=>(r.payment_status||"pending")==="pending").length;
  const uploadedCount = rows.filter(r=>r.payment_status==="receipt_uploaded").length;
  const confirmedCount = rows.filter(r=>r.payment_status==="confirmed").length;

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-white border-b" style={{borderColor:BORDER}}>
        <div className="mx-auto max-w-[1280px] px-3 sm:px-4 h-[56px] sm:h-[64px] flex items-center justify-between gap-2">
          <Link href="/" className="font-black text-[20px] tracking-[-0.6px]" style={{color:BLACK}}>ticketswap<span className="w-1.5 h-1.5 rounded-full inline-block ml-0.5" style={{background:TEAL}}/></Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[12px] text-[#6B7280]">{user?.email}</span>
            <Link href="/sell" className="rounded-full px-4 py-2 text-[13px] font-bold text-white" style={{background:TEAL}}>Create ticket</Link>
            <button onClick={async()=>{ await signOut(); fetchedForRef.current=null; router.push("/"); }} className="text-[13px] font-bold hover:underline">Log out</button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[960px] px-3 sm:px-4 py-6 sm:py-8">
        <h1 className="text-2xl font-black tracking-[-0.6px]">My Tickets</h1>
        <p className="mt-1 text-[13px] text-[#6B7280]">Only you see these. Buyer uploads receipt to your share link — you confirm here and on the preview page. Old tickets work retroactively.</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border px-3 py-1 bg-white" style={{borderColor:BORDER}}>{rows.length} total</span>
          <span className="rounded-full border px-3 py-1 bg-[#FFFBEB]" style={{borderColor:"#FDE68A"}}>{uploadedCount} receipt uploaded</span>
          <span className="rounded-full border px-3 py-1 bg-[#ECFDF5]" style={{borderColor:"#A7F3D0"}}>{confirmedCount} confirmed</span>
          <span className="rounded-full border px-3 py-1 bg-white" style={{borderColor:BORDER}}>{pendingCount} pending</span>
        </div>
        {actionMsg ? <div className="mt-4 rounded-xl border p-3 text-sm bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]">{actionMsg}</div> : null}
        {err ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div> : null}
        {fetching ? <div className="mt-8 grid place-items-center py-12 text-sm text-[#6B7280]">Loading your tickets...</div> : rows.length===0 ? (
          <div className="mt-8 rounded-2xl border p-8 text-center" style={{borderColor:BORDER}}>
            <div className="text-[#9CA3AF]">No tickets yet</div>
            <p className="mt-1 text-sm text-[#6B7280]">Create your first ticket — you&apos;ll get a shareable link with QR + bank transfer.</p>
            <Link href="/sell" className="mt-4 inline-flex rounded-full px-6 py-3 text-sm font-bold text-white" style={{background:TEAL}}>Generate Ticket</Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {rows.map(r=>{
              const status=(r.payment_status||"pending") as string;
              return (
                <div key={r.receipt_code} className="rounded-2xl overflow-hidden border bg-white flex flex-col" style={{borderColor: status==="receipt_uploaded" ? "#FDE68A" : status==="confirmed" ? "#A7F3D0" : BORDER, background: status==="receipt_uploaded" ? "#FFFBEB" : "white"}}>
                  <Link href={`/t/${encodeURIComponent(r.receipt_code)}`} className="block">
                    {r.image_url ? <img src={r.image_url} alt="" className="w-full h-36 object-cover" /> : <div className="w-full h-20 grid place-items-center bg-[#F5F7F9] text-xs text-[#9CA3AF]">No image</div>}
                    <div className="p-4 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold tracking-[0.6px]" style={{color:TEAL}}>{r.receipt_code}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${status==="confirmed"?"bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]":status==="receipt_uploaded"?"bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]":"bg-white text-[#6B7280]"}`} style={{borderColor: status==="pending"?BORDER:undefined}}>{status.toUpperCase().replace("_"," ")}</span>
                      </div>
                      <div className="font-bold leading-tight mt-1 line-clamp-1" style={{color:BLACK}}>{r.event_name || r.title}</div>
                      <div className="text-[12px] text-[#6B7280] mt-1">{r.date} · {r.location || "TBA"}{r.city?`, ${r.city}`:""} · {r.number_of_tickets} ticket{r.number_of_tickets>1?"s":""} · {r.price!=null?`${formatPrice(r.price, r.city, r.location)}`:"Free"}</div>
                    </div>
                  </Link>
                  <div className="px-4 pb-3 grid gap-2">
                    {r.receipt_url ? (
                      <div className="rounded-xl border overflow-hidden bg-white" style={{borderColor:BORDER}}>
                        <div className="px-3 py-2 flex items-center justify-between gap-2 bg-[#F8FAFC]" style={{borderColor:BORDER}}>
                          <span className="text-[11px] font-bold">Receipt {r.receipt_type==="pdf"?"(PDF)":"(Image)"} {r.receipt_uploaded_at ? `· ${new Date(r.receipt_uploaded_at).toLocaleDateString()}` : ""}</span>
                          <a href={r.receipt_url} target="_blank" rel="noreferrer" className="text-[11px] font-bold underline" style={{color:TEAL}}>Open</a>
                        </div>
                        {r.receipt_type==="pdf" ? (
                          <div className="p-2 text-center"><a href={r.receipt_url} target="_blank" rel="noreferrer" className="inline-flex rounded-full border bg-white px-4 py-2 text-xs font-bold" style={{borderColor:BORDER}}>View PDF</a></div>
                        ) : (
                          <img src={r.receipt_url} alt="receipt" className="w-full max-h-[220px] object-contain bg-white" />
                        )}
                        {r.receipt_email ? <div className="px-3 pb-2 text-[11px] text-[#6B7280]">From: {r.receipt_email}</div> : null}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed px-3 py-2 text-center text-xs text-[#9CA3AF] bg-[#F8FAFC]" style={{borderColor:BORDER}}>No receipt yet — buyer uploads at /t/{r.receipt_code}</div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/t/${encodeURIComponent(r.receipt_code)}`} className="flex-1 rounded-full border bg-white px-3 py-2 text-center text-xs font-bold" style={{borderColor:BORDER}}>View preview</Link>
                      <Link href={`/edit/${encodeURIComponent(r.receipt_code)}`} className="flex-1 rounded-full px-3 py-2 text-center text-xs font-bold text-white" style={{background:BLACK}}>Edit</Link>
                    </div>
                    {status==="receipt_uploaded" ? (
                      <div className="flex gap-2">
                        <button onClick={()=>confirm(r.receipt_code,"confirm")} className="flex-1 rounded-full px-3 py-2 text-xs font-bold text-white" style={{background:TEAL}}>Confirm payment</button>
                        <button onClick={()=>confirm(r.receipt_code,"reject")} className="flex-1 rounded-full border bg-white px-3 py-2 text-xs font-bold" style={{borderColor:BORDER}}>Reject</button>
                      </div>
                    ) : status==="confirmed" ? (
                      <button onClick={()=>confirm(r.receipt_code,"reject")} className="rounded-full border bg-white px-3 py-2 text-xs font-bold" style={{borderColor:BORDER}}>Revert to pending</button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
