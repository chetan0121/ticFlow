import { Check, Copy, Link2 } from "lucide-react";
import { useEffect, useState } from "react";

interface InviteCodePanelProps {
  inviteCode: string | null;
}

function InviteCodePanel({ inviteCode }: InviteCodePanelProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timeout = window.setTimeout(() => setCopied(false), 1800);

    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyInviteCode() {
    if (!inviteCode) return;

    setCopyFailed(false);

    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
    } catch {
      setCopyFailed(true);
    }
  }

  return (
    <section
      className="relative overflow-hidden rounded-xl border border-cyan-200/20 bg-cyan-200/[0.07] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_32px_rgba(8,47,73,0.16)] sm:px-4"
      aria-label="Invite a friend"
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-cyan-200/75" />
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-100/15 bg-cyan-100/10 text-cyan-100">
          <Link2 className="h-4 w-4" strokeWidth={2.35} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-['Montserrat'] text-[9px] font-bold tracking-[0.18em] text-cyan-100/70 uppercase">
            Invite a friend
          </p>
          <p className="mt-0.5 text-xs text-white/60">
            Share this code to start the match.
          </p>
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => void copyInviteCode()}
            disabled={!inviteCode}
            className="flex h-10 items-center gap-2 rounded-lg border border-cyan-200/30 bg-black/20 px-3 transition-colors hover:border-cyan-100/55 hover:bg-cyan-100/10 focus-visible:ring-2 focus-visible:ring-cyan-200/50 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
            aria-label={
              inviteCode ? `Copy invite code ${inviteCode}` : "Connecting"
            }
            title={inviteCode ? "Copy invite code" : "Connecting"}
          >
            <span className="font-['Oswald'] text-base font-semibold tracking-[0.14em] text-white">
              {inviteCode ?? "----"}
            </span>
            {copied ? (
              <Check
                className="h-3.5 w-3.5 text-emerald-200"
                strokeWidth={2.5}
                aria-label="Copied"
              />
            ) : (
              <Copy
                className="h-3.5 w-3.5 text-cyan-100/70"
                strokeWidth={2.2}
                aria-hidden="true"
              />
            )}
          </button>
          {copyFailed ? (
            <span className="absolute top-11 right-0 text-[9px] whitespace-nowrap text-rose-200">
              Copy failed
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default InviteCodePanel;
