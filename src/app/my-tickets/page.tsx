"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const TEAL="#00C2A8"; const BORDER="#E5E7EB"; const BLACK="#0A0E14";

type Row = { receipt_code:string; title:string; event_name:string|null; date:string; price:number|null; image_url:string|null; number_of_tickets:number; location:string|null; city:string|null; created_at:string };

export default function MyTicketsPage(){
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [fetching, setFetching]=useState(true);
  const [err, setErr]=useState<string|null>(null);
  const userId = user?.id || null;
  const fetchedForRef = useRef<string|null>(null);

  useEffect(()=>{
    if(loading) return;
    if(!userId){
      // stay on loading screen briefly then redirect — avoids flash if auth restores from storage
      const t = setTimeout(()=> router.replace("/login"), 400);
      return ()=> clearTimeout(t);
    }
    // prevent re-fetch loop when user object identity changes but id same
    if(fetchedForRef.current === userId && rows.length>0) return;
    let cancelled=false;
    (async()=>{
      setFetching(true); setErr(null);
      try{
        const url=process.env.NEXT_PUBLIC_SUPABASE_URL||"";
        const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"";
        if(!url||!anon){ if(!cancelled){ setErr("Supabase not configured"); setFetching(false);} return; }
        const { createClient } = await import("@supabase/supabase-js");
        const supa=createClient(url,anon);
        const { data, error } = await supa.from("ticketswap_tickets").select("receipt_code,title,event_name,date,price,image_url,number_of_tickets,location,city,created_at").eq("user_id", userId).order("created_at",{ascending:false});
        if(cancelled) return;
        if(error) throw new Error(error.message);
        setRows((data as Row[])||[]);
        fetchedForRef.current = userId;
      }catch(e:any){ if(!cancelled) setErr(e?.message||String(e)); }
      finally{ if(!cancelled) setFetching(false); }
    })();
    return ()=>{ cancelled=true; };
  },[userId, loading]);

  if(loading) return <div className="min-h-screen grid place-items-center bg-white text-sm text-[#6B7280]">Checking login...</div>;
  if(!userId) return <div className="min-h-screen grid place-items-center bg-white text-sm text-[#6B7280]">Redirecting to login...</div>;

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
        <p className="mt-1 text-[13px] text-[#6B7280]">Only you can see these — registered users only. Share the link to let anyone view the preview + pay by bank transfer.</p>
        {err ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div> : null}
        {fetching ? <div className="mt-8 grid place-items-center py-12 text-sm text-[#6B7280]">Loading your tickets...</div> : rows.length===0 ? (
          <div className="mt-8 rounded-2xl border p-8 text-center" style={{borderColor:BORDER}}>
            <div className="text-[#9CA3AF]">No tickets yet</div>
            <p className="mt-1 text-sm text-[#6B7280]">Create your first ticket — you&apos;ll get a shareable link with QR + bank transfer.</p>
            <Link href="/sell" className="mt-4 inline-flex rounded-full px-6 py-3 text-sm font-bold text-white" style={{background:TEAL}}>Generate Ticket</Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {rows.map(r=>(
              <Link key={r.receipt_code} href={`/t/${encodeURIComponent(r.receipt_code)}`} className="rounded-2xl overflow-hidden border bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition" style={{borderColor:BORDER}}>
                {r.image_url ? <img src={r.image_url} alt="" className="w-full h-36 object-cover" /> : <div className="w-full h-20 grid place-items-center bg-[#F5F7F9] text-xs text-[#9CA3AF]">No image</div>}
                <div className="p-4">
                  <div className="text-[11px] font-bold tracking-[0.6px]" style={{color:TEAL}}>{r.receipt_code}</div>
                  <div className="font-bold leading-tight mt-1 line-clamp-1" style={{color:BLACK}}>{r.event_name || r.title}</div>
                  <div className="text-[12px] text-[#6B7280] mt-1">{r.date} · {r.location || "TBA"}{r.city?`, ${r.city}`:""} · {r.number_of_tickets} ticket{r.number_of_tickets>1?"s":""} · {r.price!=null?`$${Number(r.price).toLocaleString()}`:"Free"}</div>
                  <div className="mt-3 inline-flex rounded-full border bg-white px-3 py-1.5 text-[11px] font-bold" style={{borderColor:BORDER}}>View preview → {`/t/${r.receipt_code}`}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
