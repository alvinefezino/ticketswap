import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !service) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  // auth
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
  if (!authUserId) return NextResponse.json({ error: "Please log in" }, { status: 401 });

  const supa = createClient(url, service);

  let form: FormData;
  try { form = await req.formData(); } catch { return NextResponse.json({ error: "Send as FormData" }, { status: 400 }); }
  const get = (k: string) => String(form.get(k) || "").trim();
  const receipt_code = get("receipt_code").toUpperCase();
  if (!receipt_code) return NextResponse.json({ error: "receipt_code required" }, { status: 400 });

  // fetch existing to verify owner
  const { data: existing, error: fetchErr } = await supa.from("ticketswap_tickets").select("id,user_id").eq("receipt_code", receipt_code).maybeSingle();
  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if (!existing) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  if (existing.user_id && existing.user_id !== authUserId) return NextResponse.json({ error: "Not the ticket owner" }, { status: 403 });

  const date = get("date");
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Date must be YYYY-MM-DD" }, { status: 400 });

  const seatsRaw = get("seats");
  let seats: any[] = [];
  try { seats = seatsRaw ? JSON.parse(seatsRaw) : []; } catch { seats = []; }
  const number_of_tickets = get("number_of_tickets") ? Math.max(1, Math.min(10, parseInt(get("number_of_tickets"), 10) || 1)) : undefined;

  // image
  let image_url: string | undefined = undefined;
  const imageUrlText = get("image_url");
  if (imageUrlText) image_url = imageUrlText;
  const file = form.get("image") as File | null;
  if (file && typeof (file as any).arrayBuffer === "function" && (file as any).size > 0) {
    try {
      const buf = Buffer.from(await (file as File).arrayBuffer());
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `ticketswap/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supa.storage.from("ticket-images").upload(path, buf, { contentType: file.type || (ext === "png" ? "image/png" : "image/jpeg"), upsert: false });
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
  const price = priceRaw !== "" ? Number(priceRaw.replace(/[^0-9.]/g, "")) : undefined;

  // build patch — only fields that were sent (allow clearing bank fields with empty string -> null)
  const patch: any = {};
  const setIf = (col: string, val: any) => { if (val !== undefined) patch[col] = val; };
  // use helper to map form keys to columns — empty string becomes null for nullable text
  const toNull = (v: string) => (v === "" ? null : v);
  if (form.has("artist_name")) setIf("artist_name", toNull(get("artist_name")));
  if (form.has("event_name")) setIf("event_name", toNull(get("event_name")));
  if (form.has("artist_name") || form.has("event_name")) {
    const a = form.has("artist_name") ? get("artist_name") : undefined;
    const e = form.has("event_name") ? get("event_name") : undefined;
    // recompute title if either provided
    if (a !== undefined || e !== undefined) {
      // need current values if one missing — fetch full row
      const { data: full } = await supa.from("ticketswap_tickets").select("artist_name,event_name,title").eq("receipt_code", receipt_code).maybeSingle();
      const finalArtist = a !== undefined ? (a || null) : full?.artist_name;
      const finalEvent = e !== undefined ? (e || null) : full?.event_name;
      patch.title = (finalEvent || finalArtist || full?.title || "My Ticket").trim();
    }
  }
  if (form.has("section")) setIf("section", toNull(get("section")));
  if (form.has("row_label")) setIf("row_label", toNull(get("row_label")));
  if (form.has("row")) setIf("row_label", toNull(get("row")));
  if (form.has("seat")) setIf("seat", toNull(get("seat")));
  if (form.has("date") && date) setIf("date", date);
  if (form.has("time")) setIf("time", toNull(get("time")));
  if (form.has("location")) setIf("location", toNull(get("location")));
  if (form.has("address")) { setIf("address", toNull(get("address"))); setIf("description", toNull(get("address"))); }
  if (form.has("city")) setIf("city", toNull(get("city")));
  if (form.has("ticket_type")) setIf("ticket_type", toNull(get("ticket_type")));
  if (form.has("level")) setIf("level", toNull(get("level")));
  if (number_of_tickets !== undefined) { setIf("number_of_tickets", number_of_tickets); setIf("seats", seats); }
  else if (form.has("seats")) setIf("seats", seats);
  if (image_url !== undefined) setIf("image_url", image_url);
  if (price !== undefined) setIf("price", isNaN(price as number) ? 0 : price);
  if (form.has("seller_name")) setIf("seller_name", toNull(get("seller_name")) || authEmail);
  if (form.has("seller_email")) setIf("seller_email", toNull(get("seller_email")) || authEmail);
  if (form.has("beneficiary_name")) setIf("beneficiary_name", toNull(get("beneficiary_name")));
  if (form.has("account_number")) setIf("account_number", toNull(get("account_number")));
  if (form.has("sort_code")) setIf("sort_code", toNull(get("sort_code")));
  if (form.has("bic_swift")) setIf("bic_swift", toNull(get("bic_swift")));
  if (form.has("apple_pay_details")) setIf("apple_pay_details", toNull(get("apple_pay_details")));
  if (form.has("venmo_handle")) setIf("venmo_handle", toNull(get("venmo_handle")));
  if (form.has("zelle_details")) setIf("zelle_details", toNull(get("zelle_details")));
  if (form.has("cashapp_cashtag")) setIf("cashapp_cashtag", toNull(get("cashapp_cashtag")));
  // legacy fallback
  if (form.has("bank_name")) setIf("bank_name", toNull(get("bank_name")));
  if (form.has("bank_account_holder")) setIf("bank_account_holder", toNull(get("bank_account_holder")));
  if (form.has("bank_iban")) setIf("bank_iban", toNull(get("bank_iban")));

  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 400 });

  const { error } = await supa.from("ticketswap_tickets").update(patch).eq("receipt_code", receipt_code);
  if (error) {
    if (error.message.toLowerCase().includes("column")) return NextResponse.json({ error: error.message + " — run supabase_ticketswap_tickets.sql in Supabase SQL Editor to add missing columns, then retry." }, { status: 500 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, receipt_code });
}
