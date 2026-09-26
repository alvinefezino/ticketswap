import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest){
  const form = await req.formData().catch(()=> null);
  const body = form ? Object.fromEntries(form.entries()) : {};
  console.log("checkout (clone demo — SecureSwap held)", Object.fromEntries((form as any)?.entries?.() || []));
  // Demo: redirect to how-it-works with held message
  return NextResponse.redirect(new URL("/how-it-works?held=1", req.url), 303);
}
