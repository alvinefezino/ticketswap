import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !service) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  const supa = createClient(url, service);

  // try adding columns by attempting to select then inferring error is ok to run DDL via REST? We can't run DDL directly,
  // so we try an insert with new columns and handle "column does not exist" by telling user to run SQL.
  // Instead we attempt to use Supabase's postgres exec if available via service role REST: use plain fetch to pg REST? fallback.

  // Best effort: try to add columns via supa.rpc if pg function exists, else instruct.
  // We use a trick: Supabase service role can do POST to /rest/v1/rpc/exec_sql if function created earlier.
  // Simpler: just check if columns exist and if not, try using fetch to Supabase Management API with DDL.

  // Direct DDL via service role JS client is not supported - so we return the SQL for manual run,
  // but also attempt to add columns by using the Supabase SQL via fetch to the postgres connection via edge function hack:
  // We'll try to create the columns by updating a dummy row with nulls and catching column error, then use the `supabase` admin to run raw SQL via PostgREST not possible.
  // So we expose the SQL and also try via `supa.from('ticketswap_tickets').select('beneficiary_name').limit(1)` to detect.
  const { error: testErr } = await supa.from("ticketswap_tickets").select("beneficiary_name,account_number,sort_code,bic_swift").limit(1);
  if (!testErr) return NextResponse.json({ ok: true, message: "Columns already exist - old tickets already support new fields." });

  if (testErr.message.toLowerCase().includes("column") && testErr.message.toLowerCase().includes("does not exist")) {
  return NextResponse.json({
  ok: false,
  needsManual: true,
  error: testErr.message,
  sql: `alter table ticketswap_tickets add column if not exists beneficiary_name text;\nalter table ticketswap_tickets add column if not exists account_number text;\nalter table ticketswap_tickets add column if not exists sort_code text;\nalter table ticketswap_tickets add column if not exists bic_swift text;`,
  instructions: "Paste the SQL above into Supabase Dashboard > SQL Editor > New query > Run. Then retry this endpoint or create/edit a ticket.",
  }, { status: 200 });
  }
  return NextResponse.json({ error: testErr.message }, { status: 500 });
}

export async function GET() { return POST(new NextRequest("http://local")); }
