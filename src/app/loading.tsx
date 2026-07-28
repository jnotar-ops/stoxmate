import Image from "next/image";

const loadingSteps = [
  "Connecting to market data",
  "Refreshing watchlists",
  "Analysing portfolio signals",
  "Preparing AI insights",
];

export default function Loading() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#0C1222] px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="stoxmate-splash-glow absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:42px_42px]" />
      </div>

      <section className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        <div className="stoxmate-splash-logo relative">
          <div className="absolute inset-2 rounded-[28%] bg-emerald-400/20 blur-2xl" />

          <Image
            src="/icons/smicon.png"
            alt="StoxMate"
            width={112}
            height={112}
            priority
            className="relative h-28 w-28"
          />
        </div>

        <div className="stoxmate-splash-copy mt-7">
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">
            StoxMate
          </h1>

          <p className="mt-2 text-sm tracking-wide text-slate-400">
            Investment intelligence, distilled.
          </p>
        </div>

        <div className="stoxmate-splash-steps mt-10 w-full rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 text-left shadow-2xl shadow-black/20 backdrop-blur">
          <div className="space-y-4">
            {loadingSteps.map((step, index) => (
              <div
                key={step}
                className="stoxmate-loading-step flex items-center gap-3"
                style={{
                  animationDelay: `${0.35 + index * 0.28}s`,
                }}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
                  <svg
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    className="h-3 w-3 text-emerald-400"
                    fill="none"
                  >
                    <path
                      d="M5 10.5 8.2 13.5 15 6.8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <span className="text-sm text-slate-300">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 h-[2px] w-36 overflow-hidden rounded-full bg-white/[0.08]">
          <div className="stoxmate-loading-line h-full w-1/2 rounded-full bg-emerald-400" />
        </div>
      </section>
    </main>
  );
}