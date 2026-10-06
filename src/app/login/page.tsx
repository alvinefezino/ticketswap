"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const TEAL = "#00C2A8";
const BORDER = "#E5E7EB";
const BLACK = "#0A0E14";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  if (!email.trim() || !password) { setError("Email and password required"); return; }
  setBusy(true);
  const { error: err } = await signIn(email.trim(), password);
  setBusy(false);
  if (err) { setError(err.message || String(err)); return; }
  router.push("/my-tickets");
  };

  return (
  <div className="min-h-screen bg-white">
  <header className="sticky top-0 z-40 bg-white border-b" style={{ borderColor: BORDER }}>
  <div className="mx-auto max-w-[960px] px-3 sm:px-4 h-[56px] sm:h-[64px] flex items-center justify-between">
  <Link href="/" className="flex items-center gap-1.5">
  <img src="/ticketswaplogo.png" alt="TicketSwap" className="h-7 w-auto object-contain" />
  <span className="font-black text-[20px] tracking-[-0.6px]" style={{ color: "#000" }}>ticketswap</span>
  </Link>
  <Link href="/" className="text-[13px] font-bold hover:underline">Back to discover</Link>
  </div>
  </header>
  <div className="mx-auto max-w-[480px] px-4 py-8 sm:py-14">
  <h1 className="text-2xl font-black tracking-[-0.6px]">Log in</h1>
  <p className="mt-2 text-[13px] text-[#6B7280]">My Tickets is only for registered users - log in to create tickets and see yours.</p>
  {error ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
  <form onSubmit={onSubmit} className="mt-6 grid gap-4">
  <label className="grid gap-1 text-[13px] font-bold">Email
  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com" className="border rounded-xl px-4 py-3 font-normal outline-none" style={{ borderColor: BORDER }} />
  </label>
  <label className="grid gap-1 text-[13px] font-bold">Password
  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" className="border rounded-xl px-4 py-3 font-normal outline-none" style={{ borderColor: BORDER }} />
  </label>
  <button disabled={busy} className="rounded-full py-3.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60" style={{ background: TEAL }}>
  {busy ? "Logging in..." : "Log in"}
  </button>
  </form>
  <p className="mt-4 text-center text-[13px] text-[#6B7280]">No account? <Link href="/signup" className="font-bold underline" style={{ color: TEAL }}>Sign up</Link></p>
  </div>
  </div>
  );
}
