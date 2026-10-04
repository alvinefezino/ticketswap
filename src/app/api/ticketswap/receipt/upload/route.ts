import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_IMAGE = ["image/jpeg","image/png","image/webp","image/heic","image/heif"];
const ALLOWED_PDF = "application/pdf";
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !service) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  const supa = createClient(url, service);

  let form: FormData;
  try { form = await req.formData(); } catch { return NextResponse.json({ error: "Send FormData with receipt_code + file" }, { status: 400 }); }
  const get = (k: string) => String(form.get(k) || "").trim();
  const receipt_code = get("receipt_code").toUpperCase();
  const name = get("buyer_name") || null;
  const email = get("email") || get("receipt_email") || null;
  if (!receipt_code) return NextResponse.json({ error: "receipt_code required" }, { status: 400 });

  const { data: ticket, error: fetchErr } = await supa.from("ticketswap_tickets").select("receipt_code,seller_email,user_id").eq("receipt_code", receipt_code).maybeSingle();
  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  const file = form.get("file") as File | null;
  if (!file || typeof (file as any).arrayBuffer !== "function") return NextResponse.json({ error: "File required (image or PDF)" }, { status: 400 });
  const size = (file as any).size || 0;
  if (size > MAX_BYTES) return NextResponse.json({ error: "File too large - max 10MB" }, { status: 400 });
  const mime = file.type || "";
  const isImage = ALLOWED_IMAGE.includes(mime) || mime.startsWith("image/");
  const isPdf = mime === ALLOWED_PDF;
  if (!isImage && !isPdf) return NextResponse.json({ error: "Only images (jpg/png/webp) or PDF allowed" }, { status: 400 });

  try {
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = isPdf ? "pdf" : (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g,"") || "jpg";
  const path = `${receipt_code}/${Date.now()}-${Math.random().toString(36).slice(2,7)}.${ext}`;
  const { error: upErr } = await supa.storage.from("ticket-receipts").upload(path, buf, { contentType: mime || (isPdf ? ALLOWED_PDF : "image/jpeg"), upsert: false });
  let publicUrl: string | null = null;
  if (upErr) {
  // storage may not exist yet - instruct to run SQL, fallback to base64 so buyer not blocked
  if (upErr.message.toLowerCase().includes("bucket") || upErr.message.toLowerCase().includes("not found")) {
  const b64 = buf.toString("base64");
  publicUrl = `data:${mime || "application/octet-stream"};base64,${b64}`;
  } else {
  return NextResponse.json({ error: "Upload failed: " + upErr.message + " - run supabase_ticketswap_tickets.sql to create ticket-receipts bucket." }, { status: 500 });
  }
  } else {
  const { data } = supa.storage.from("ticket-receipts").getPublicUrl(path);
  publicUrl = data.publicUrl;
  }

  const patch: any = {
  payment_status: "receipt_uploaded",
  receipt_url: publicUrl,
  receipt_type: isPdf ? "pdf" : "image",
  receipt_uploaded_at: new Date().toISOString(),
  receipt_email: email,
  buyer_full_name: name,
  };
  const { error: updErr } = await supa.from("ticketswap_tickets").update(patch).eq("receipt_code", receipt_code);
  if (updErr) {
  if (updErr.message.toLowerCase().includes("column") && updErr.message.toLowerCase().includes("does not exist")) {
  return NextResponse.json({ error: updErr.message + " - run supabase_ticketswap_tickets.sql in Supabase SQL Editor (adds receipt columns), then retry.", needsSql: true }, { status: 500 });
  }
  return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  // optional email to seller
  const resendKey = process.env.RESEND_API_KEY || "";
  const from = process.env.RESEND_FROM_EMAIL || "";
  const sellerEmail = (ticket as any).seller_email || "";
  if (resendKey && from && sellerEmail && !resendKey.includes("placeholder")) {
  try {
  const { Resend } = await import("resend");
  const resend = new Resend(resendKey);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get("host") || "localhost:3001"}`;
  const dashUrl = `${appUrl.replace(/\/$/,"")}/my-tickets`;
  await resend.emails.send({
  from,
  to: sellerEmail,
  subject: `New payment receipt for ${receipt_code}`,
  html: `<p>Someone uploaded a payment receipt for <b>${receipt_code}</b>.</p><p>Email: ${email || " - "}</p><p><a href="${dashUrl}">View in My Tickets</a></p><p>File: ${publicUrl?.startsWith("data:") ? "embedded image" : publicUrl}</p>`
  });
  } catch {}
  }

  return NextResponse.json({ ok: true, receipt_code, receipt_url: publicUrl, payment_status: "receipt_uploaded" });
  } catch (e:any) {
  return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
