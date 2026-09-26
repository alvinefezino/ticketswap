import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest){
  const form = await req.formData().catch(()=> null);
  const body = form ? Object.fromEntries(form.entries()) : await req.json().catch(()=> ({}));
  // In production: insert into swap_listings via Supabase service role + Resend email
  // For clone demo: just redirect home with success toast
  console.log("sell listing (clone demo)", body);
  return NextResponse.redirect(new URL("/?listed=1", req.url), 303);
}
export async function GET(){ return NextResponse.json({ ok:true, clone:"ticketswap.com", mode:"demo — wire Supabase swap_listings + Resend to go live" }); }
