"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

type Ctx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};
const AuthCtx = createContext<Ctx>({ user: null, session: null, loading: true, signUp: async () => ({ error: "no supabase" }), signIn: async () => ({ error: "no supabase" }), signOut: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!supabase) { setLoading(false); return; }
  supabase.auth.getSession().then(({ data }) => {
  setSession(data.session || null);
  setUser(data.session?.user || null);
  setLoading(false);
  });
  const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
  setSession(s);
  setUser(s?.user || null);
  });
  return () => sub.subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
  if (!supabase) return { error: { message: "Supabase not configured" } };
  const { error } = await supabase.auth.signUp({ email, password });
  return { error };
  };
  const signIn = async (email: string, password: string) => {
  if (!supabase) return { error: { message: "Supabase not configured" } };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error };
  };
  const signOut = async () => {
  if (!supabase) return;
  await supabase.auth.signOut();
  };
  return <AuthCtx.Provider value={{ user, session, loading, signUp, signIn, signOut }}>{children}</AuthCtx.Provider>;
}

export function useAuth() { return useContext(AuthCtx); }
