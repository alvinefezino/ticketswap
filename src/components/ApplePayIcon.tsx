"use client";
export function ApplePayIcon({ size = 24 }: { size?: number }) {
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
  {/* Apple shape */}
  <path d="M12.02 3.2c.6.02 1.55.4 2.05.9.45.44.8 1.05.82 1.66-.06 0-.16-.01-.28-.02-.49-.58-1.02-.73-1.47-.87l-.15-.05c-.43-.14-.96-.15-1.48 0l-.15.05c-.45.14-.99.3-1.47.87-.11.01-.2.02-.27.02.02-.61.36-1.22.82-1.66.5-.5 1.45-.88 2.05-.9Z" fill="currentColor"/>
  <path d="M9.25 9.4c1.08 0 1.95.56 2.53 1.36.22.3.42.64.58 1.02.15-.38.35-.72.57-1.02.59-.8 1.45-1.36 2.53-1.36 1.73 0 2.8 1.18 2.8 2.95 0 .3-.04.56-.1.79H6.54c-.06-.23-.1-.49-.1-.79 0-1.77 1.07-2.95 2.81-2.95Z" fill="currentColor" opacity=".95"/>
  <path d="M12 14.6c-.9 0-1.7-.45-2.2-1.15h4.4c-.5.7-1.3 1.15-2.2 1.15Z" fill="currentColor" />
  <text x="12" y="20.5" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="6.2" letterSpacing="0.3" fill="currentColor">Pay</text>
  </svg>
  );
}

export function ApplePayBadge({ className = "" }: { className?: string }) {
  return (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black tracking-[0.4px] bg-black text-white ${className}`} aria-label="Apple Pay">
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
  <path d="M13.4 7.2c.2-.4.3-.8.3-1.2 0-.5-.2-1-.5-1.44A2.6 2.6 0 0011.4 3.8c-.3 0-.58.06-.8.18.15.48.45.93.86 1.3.42.36.92.6 1.46.69.18-.07.34-.16.48-.27Z" fill="white"/>
  <path d="M17.2 13.2c0-1.35 1.1-2.05 1.12-2.08-.6-.88-1.55-1-1.88-1.02-.8-.08-1.58.47-1.99.47-.42 0-1.06-.46-1.75-.45-.9.01-1.73.53-2.2 1.34-.94 1.63-.25 4.05.67 5.37.46.66.99 1.4 1.7 1.37.68-.03.94-.44 1.76-.44.82 0 1.05.44 1.77.42.73-.01 1.19-.66 1.64-1.33.45-.65.63-1.29.64-1.32 0-.01-1.23-.47-1.24-1.88Z" fill="white"/>
  </svg>
  Pay
  </span>
  );
}
