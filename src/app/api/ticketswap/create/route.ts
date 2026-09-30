import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
function genReceipt() {
  const a = Math.random().toString(36).slice(2, 6).toUpperCase();
  const b = Math.random().toString(36).slice(2, 6).toUpperCase();
  const c = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SWAP-${a}-${b}-${c}`;
}
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !service) return NextResponse.json({ error: "Supabase not configured - set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local and Vercel env." }, { status: 500 });
  // Resolve user from Authorization: Bearer <access_token> if present (sent by /sell when logged in)
  let authUserId: string | null = null;
  let authEmail: string | null = null;
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ") && anon) {
  const token = authHeader.slice(7).trim();
  if (token) {
  try {
  const supaAnon = createClient(url, anon);
  const { data } = await supaAnon.auth.getUser(token);
  if (data?.user) {
  authUserId = data.user.id;
  authEmail = data.user.email || null;
  }
  } catch {}
  }
  }
  // Enforce login - only registered users may create tickets (My Tickets is gated)
  if (!authUserId) {
  return NextResponse.json({ error: "Please log in or sign up first - only registered users can create tickets. Go to /login." }, { status: 401 });
  }
  const supa = createClient(url, service);
  let form: FormData;
  try {
  form = await req.formData();
  } catch {
  return NextResponse.json({ error: "Send as FormData" }, { status: 400 });
  }
  const get = (k: string) => String(form.get(k) || "").trim();
  const artist_name = get("artist_name") || null;
  const event_name = get("event_name") || null;
  const title = (event_name || artist_name || "My Ticket").trim();
  const date = get("date");
  if (!title || !date) return NextResponse.json({ error: "Event name and date required" }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Date must be YYYY-MM-DD" }, { status: 400 });
  const seatsRaw = get("seats");
  let seats: any[] = [];
  try { seats = seatsRaw ? JSON.parse(seatsRaw) : []; } catch { seats = []; }
  const number_of_tickets = Math.max(1, Math.min(10, parseInt(get("number_of_tickets") || "1", 10) || 1));
  let image_url: string | null = get("image_url") || null;
  const file = form.get("image") as File | null;
  if (file && typeof (file as any).arrayBuffer === "function" && (file as any).size > 0) {
  try {
  const buf = Buffer.from(await (file as File).arrayBuffer());
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `ticketswap/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: upErr } = await supa.storage.from("ticket-images").upload(path, buf, {
  contentType: file.type || (ext === "png" ? "image/png" : "image/jpeg"),
  upsert: false,
  });
  if (upErr) {
  const b64 = buf.toString("base64");
  image_url = `data:${file.type || "image/jpeg"};base64,${b64}`;
  } else {
  const { data } = supa.storage.from("ticket-images").getPublicUrl(path);
  image_url = data.publicUrl;
  }
  } catch {}
  }
  const priceRaw = get("price");
  const price = priceRaw ? Number(priceRaw.replace(/[^0-9.]/g, "")) : 0;
  const currency = (get("currency") || "EUR").toUpperCase();
  const receipt_code = genReceipt();
  const payload: any = {
  receipt_code,
  user_id: authUserId,
  artist_name,
  event_name,
  title,
  section: get("section") || null,
  row_label: get("row_label") || null,
  seat: get("seat") || null,
  date,
  time: get("time") || null,
  location: get("location") || null,
  address: get("address") || null,
  city: get("city") || null,
  ticket_type: get("ticket_type") || null,
  level: get("level") || null,
  number_of_tickets,
  seats: seats || [],
  image_url: image_url || null,
  price: isNaN(price) ? 0 : price,
  currency,
  seller_name: get("seller_name") || authEmail || null,
  seller_email: get("seller_email") || authEmail || null,
  beneficiary_name: get("beneficiary_name") || null,
  account_number: get("account_number") || null,
  sort_code: get("sort_code") || null,
  bic_swift: get("bic_swift") || null,
  description: get("address") || null,
  };
  const { error } = await supa.from("ticketswap_tickets").insert(payload);
  if (error) {
  if (error.message.toLowerCase().includes("does not exist") || error.message.toLowerCase().includes("relation")) {
  return NextResponse.json({ error: "Table ticketswap_tickets not found or missing column user_id. Run supabase_ticketswap_tickets.sql in Supabase SQL Editor (includes: alter table add column if not exists user_id), then retry." }, { status: 500 });
  }
  // helpful for column errors
  if (error.message.toLowerCase().includes("column")) {
  return NextResponse.json({ error: error.message + " - run supabase_ticketswap_tickets.sql to add missing columns, then retry." }, { status: 500 });
  }
  return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get("host") || "localhost:3001"}`;
  const base = appUrl.replace(/\/$/, "");
  const urlOut = `${base}/t/${encodeURIComponent(receipt_code)}`;
  return NextResponse.json({ ok: true, receipt_code, url: urlOut });
}
