"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const TEAL = "#00C2A8";
const BORDER = "#E5E7EB";
const BLACK = "#0A0E14";

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  if (!email.trim() || !password || password.length < 6) { setError("Email and password (min 6 chars) required"); return; }
  setBusy(true);
  const { error: err } = await signUp(email.trim(), password);
  setBusy(false);
  if (err) { setError(err.message || String(err)); return; }
  setDone(true);
  };

  return (
  <div className="min-h-screen bg-white">
  <header className="sticky top-0 z-40 bg-white border-b" style={{ borderColor: BORDER }}>
  <div className="mx-auto max-w-[960px] px-3 sm:px-4 h-[56px] sm:h-[64px] flex items-center justify-between">
  <Link href="/" className="font-black text-[20px] tracking-[-0.6px]" style={{ color: BLACK }}>
  ticketswap<span className="w-1.5 h-1.5 rounded-full inline-block ml-0.5" style={{ background: TEAL }} />
  </Link>
  <Link href="/login" className="text-[13px] font-bold hover:underline">Log in</Link>
  </div>
  </header>
  <div className="mx-auto max-w-[480px] px-4 py-8 sm:py-14">
  <h1 className="text-2xl font-black tracking-[-0.6px]">Create account</h1>
  <p className="mt-2 text-[13px] text-[#6B7280]">Sign up to create tickets and access My Tickets.</p>
  {done ? (
  <div className="mt-6 rounded-2xl border p-5" style={{ borderColor: TEAL, background: "#F0FDFB" }}>
  <div className="font-bold">Check your email</div>
  <div className="mt-1 text-sm text-[#374151]">We sent a confirmation link to <b>{email}</b>. Confirm, then <Link href="/login" className="underline font-bold" style={{ color: TEAL }}>log in</Link> to see My Tickets.</div>
  <div className="mt-1 text-[11px] text-[#6B7280]">If email confirmation is disabled in Supabase Auth, you can log in right away.</div>
  <Link href="/login" className="mt-4 inline-flex rounded-full px-6 py-2.5 text-sm font-bold text-white" style={{ background: TEAL }}>Go to log in</Link>
  </div>
  ) : (
  <>
  {error ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
  <form onSubmit={onSubmit} className="mt-6 grid gap-4">
  <label className="grid gap-1 text-[13px] font-bold">Email
  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com" className="border rounded-xl px-4 py-3 font-normal outline-none" style={{ borderColor: BORDER }} />
  </label>
  <label className="grid gap-1 text-[13px] font-bold">Password
  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="******** (min 6)" className="border rounded-xl px-4 py-3 font-normal outline-none" style={{ borderColor: BORDER }} />
  </label>
  <button disabled={busy} className="rounded-full py-3.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60" style={{ background: TEAL }}>
  {busy ? "Creating..." : "Sign up"}
  </button>
  </form>
  <p className="mt-4 text-center text-[13px] text-[#6B7280]">Already have an account? <Link href="/login" className="font-bold underline" style={{ color: TEAL }}>Log in</Link></p>
  </>
  )}
  </div>
  </div>
  );
}
