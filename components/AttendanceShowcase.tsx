import Reveal from "@/components/Reveal";

/**
 * M8 Payroll & HRIS: time and attendance, with mobile clock-in.
 *
 * The phone and the attendance board are illustrations built in HTML and CSS,
 * hidden from assistive technology: everything they show is also said in the
 * copy beside them. Names and times are sample data.
 *
 * Every claim here mirrors what lib/products.ts already states for M8 — app
 * clock-in with geofencing, biometric devices, shift schedules, exceptions for
 * late, undertime and overtime, and pay computed from attendance — so the page
 * never promises more than the product description does.
 */

const POINTS = [
  {
    title: "Mobile clock-in, checked against the site",
    detail:
      "Staff punch in and out on their phone, and the geofence confirms they are at the right branch or job site before the punch counts.",
  },
  {
    title: "Biometrics in the same record",
    detail:
      "Punches from existing biometric devices land in the same attendance log, so office, branch and field staff are tracked one way.",
  },
  {
    title: "Exceptions flagged as they happen",
    detail:
      "Late arrivals, undertime and overtime are marked against each employee's shift for a supervisor to review, not discovered at cut-off.",
  },
  {
    title: "Straight into payroll",
    detail:
      "Reviewed hours become pay, with premiums applied by your rules. Nobody retypes a timesheet.",
  },
] as const;

const BOARD = [
  { name: "Ana Reyes", time: "7:56", status: "On time", tone: "ok" },
  { name: "Mark Santos", time: "8:14", status: "Late, 14 min", tone: "warn" },
  { name: "Joy Cruz", time: "7:48", status: "On time", tone: "ok" },
  { name: "Paolo Lim", time: "—", status: "On leave", tone: "muted" },
] as const;

const TONE_CLASS: Record<(typeof BOARD)[number]["tone"], string> = {
  ok: "bg-brand-50 text-brand-700",
  warn: "bg-accent-50 text-accent-700",
  muted: "bg-ink-100 text-ink-600",
};

export default function AttendanceShowcase() {
  return (
    <section aria-labelledby="attendance-heading" className="py-20 sm:py-24">
      <div className="container-page">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
          {/* Copy */}
          <div className="lg:col-span-5">
            <Reveal>
              <span className="eyebrow">Time and attendance</span>
              <h2 id="attendance-heading" className="h2 mt-5">
                Clock in from the phone in their pocket
              </h2>
              <p className="lede mt-5">
                No more logbook photos. Attendance is captured as it happens, from a phone or a
                biometric device, and flows into the payroll it decides.
              </p>
            </Reveal>

            <ul className="mt-10 space-y-6">
              {POINTS.map((point, index) => (
                <Reveal as="li" key={point.title} delay={80 * index} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-900 text-white"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink-900">{point.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-600">{point.detail}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>

          {/* Illustration: the phone in front, the branch's board behind it. */}
          <Reveal variant="scale" delay={120} className="lg:col-span-7">
            <div aria-hidden="true" className="relative mx-auto flex max-w-2xl select-none flex-col sm:block sm:pb-10">
              {/* Attendance board */}
              <div className="w-full rounded-3xl border border-ink-200 bg-white p-5 shadow-card sm:mt-10 sm:w-auto sm:py-6 sm:pl-12 sm:pr-6 sm:[margin-left:13.5rem]">
                <div className="flex items-start justify-between gap-3 border-b border-ink-200 pb-4">
                  <div>
                    <p className="text-xs font-semibold text-ink-500">Today&apos;s attendance</p>
                    <p className="mt-0.5 text-sm font-bold text-ink-900">Makati branch</p>
                  </div>
                  <span className="badge whitespace-nowrap bg-brand-50 text-brand-700">Morning shift</span>
                </div>
                <ul className="mt-2 divide-y divide-ink-100">
                  {BOARD.map((row) => (
                    <li key={row.name} className="flex items-center gap-3 py-3">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-xs font-bold text-ink-700">
                        {row.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink-900">
                        {row.name}
                      </span>
                      <span className="w-10 text-right text-sm tabular-nums text-ink-600">{row.time}</span>
                      <span className={`badge whitespace-nowrap ${TONE_CLASS[row.tone]}`}>{row.status}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 rounded-xl bg-ink-50 px-3.5 py-2.5 text-xs text-ink-600">
                  3 of 4 clocked in. 1 on approved leave. Hours sync to the next payroll run.
                </p>
              </div>

              {/* Phone */}
              <div className="relative order-first mx-auto mb-6 w-[15.5rem] sm:absolute sm:left-0 sm:top-0 sm:mb-0">
                <div className="rounded-[2.4rem] bg-brand-900 p-2.5 shadow-[0_30px_70px_-25px_rgb(10_26_62/0.6)]">
                  <div className="overflow-hidden rounded-[1.9rem] bg-white">
                    {/* Status bar */}
                    <div className="flex items-center justify-between px-5 pb-1 pt-3 text-[0.65rem] font-semibold text-ink-700">
                      <span>8:02</span>
                      <span className="h-1.5 w-12 rounded-full bg-ink-200" />
                      <span>100%</span>
                    </div>

                    <div className="px-5 pb-6 pt-3">
                      <p className="text-xs text-ink-500">Good morning,</p>
                      <p className="text-base font-bold text-ink-900">Ana Reyes</p>

                      <div className="mt-4 rounded-2xl bg-brand-50 px-4 py-3">
                        <p className="text-[0.7rem] font-semibold text-brand-700">Morning shift</p>
                        <p className="text-sm font-bold text-ink-900">8:00 to 17:00</p>
                      </div>

                      <p className="mt-5 text-center text-4xl font-bold tabular-nums tracking-tight text-ink-900">
                        08:02
                      </p>
                      <p className="text-center text-xs text-ink-500">Monday, 23 November</p>

                      {/* Clock-in button: the illustration's one moving part. */}
                      <div className="relative mx-auto mt-5 h-28 w-28">
                        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-accent-500/40" />
                        <span className="relative flex h-full w-full flex-col items-center justify-center rounded-full bg-accent-600 text-white shadow-[0_14px_30px_-10px_rgb(231_88_10/0.7)]">
                          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 2" />
                          </svg>
                          <span className="mt-1 text-sm font-bold">Clock in</span>
                        </span>
                      </div>

                      <p className="mt-5 flex items-center justify-center gap-1.5 text-xs font-medium text-brand-700">
                        <svg className="h-3.5 w-3.5 text-accent-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
                        </svg>
                        Inside Makati branch geofence
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
