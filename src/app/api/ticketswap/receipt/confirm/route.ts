import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !service) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  let authUserId: string | null = null;
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ") && anon) {
  const token = authHeader.slice(7).trim();
  if (token) {
  try {
  const supaAnon = createClient(url, anon);
  const { data } = await supaAnon.auth.getUser(token);
  if (data?.user) authUserId = data.user.id;
  } catch {}
  }
  }
  if (!authUserId) return NextResponse.json({ error: "Please log in" }, { status: 401 });

  let body: any = {};
  try { body = await req.json(); } catch { body = {}; }
  const receipt_code = String(body.receipt_code || "").trim().toUpperCase();
  const action = String(body.action || "").trim().toLowerCase(); // confirm | reject | reset
  if (!receipt_code) return NextResponse.json({ error: "receipt_code required" }, { status: 400 });
  if (!["confirm","reject","reset"].includes(action)) return NextResponse.json({ error: "action must be confirm, reject, or reset" }, { status: 400 });

  const supa = createClient(url, service);
  const { data: ticket, error: fetchErr } = await supa.from("ticketswap_tickets").select("receipt_code,user_id,payment_status").eq("receipt_code", receipt_code).maybeSingle();
  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  if ((ticket as any).user_id && (ticket as any).user_id !== authUserId) return NextResponse.json({ error: "Not the ticket owner" }, { status: 403 });

  let newStatus = "pending";
  if (action === "confirm") newStatus = "confirmed";
  else if (action === "reject") newStatus = "pending";
  else if (action === "reset") newStatus = "pending";

  // on reject/reset also clear receipt
  const patch: any = { payment_status: newStatus };
  if (action === "reject" || action === "reset") {
  // keep receipt_url for audit but allow re-upload - we keep it, just status pending
  // to truly clear, owner can re-upload flow will overwrite
  }

  const { error } = await supa.from("ticketswap_tickets").update(patch).eq("receipt_code", receipt_code);
  if (error) {
  if (error.message.toLowerCase().includes("column") && error.message.toLowerCase().includes("does not exist")) {
  return NextResponse.json({ error: error.message + " - run supabase_ticketswap_tickets.sql" }, { status: 500 });
  }
  return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, receipt_code, payment_status: newStatus });
}
