import { useState } from "react";
import { Link } from "react-router-dom";
import { CASE_STUDIES } from "../data";

const ALL_TAGS = [
  "All",
  ...Array.from(new Set(CASE_STUDIES.map((c) => c.tag))),
];

function CaseCard({ cs, i }) {
  return (
    <Link
      to={`/case-studies/${cs.id}`}
      className="card-glass p-7 flex flex-col gap-5 group block"
      style={{ transitionDelay: `${i * 0.07}s` }}
    >
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl bg-brand-500/12 border border-brand-500/22 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
          {cs.icon}
        </div>
        <span className="tag">{cs.tag}</span>
      </div>
      <div>
        <h3 className="font-display font-bold text-white text-[1.05rem] mb-2 group-hover:text-brand-300 transition-colors">
          {cs.title}
        </h3>
        <p className="text-blue-200/55 text-sm leading-relaxed">{cs.desc}</p>
      </div>
      <div className="flex items-center gap-2 bg-emerald-400/[0.07] border border-emerald-400/15 rounded-xl px-4 py-2.5">
        <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-emerald-400/70">
          RESULT
        </span>
        <span className="text-emerald-400 font-bold text-sm">{cs.result}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {cs.tools.map((t) => (
          <span
            key={t}
            className="font-mono text-[10px] text-blue-300/50 bg-navy-700/60 border border-white/[0.06] px-2 py-0.5 rounded"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-brand-400 text-sm font-semibold mt-auto">
        <span>Read Case Study</span>
        <svg
          width="13"
          height="13"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
          className="group-hover:translate-x-1 transition-transform"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 12h14M12 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}

export default function CaseStudies() {
  const [filter, setFilter] = useState("All");
  const shown =
    filter === "All"
      ? CASE_STUDIES
      : CASE_STUDIES.filter((c) => c.tag === filter);

  return (
    <main className="pt-24">
      <section className="py-16 border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <p className="section-label">Real Results</p>
          <h1 className="section-title text-white mb-4">
            Case <span className="gradient-text-blue">Studies</span>
          </h1>
          <p className="text-blue-200/60 text-base max-w-lg leading-relaxed">
            Real automation systems built for real clients. Click any project to
            read the full story.
          </p>
        </div>
      </section>

      <div className="sticky top-[68px] z-40 border-b border-white/[0.05] bg-navy-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex gap-2 py-3 overflow-x-auto">
            {ALL_TAGS.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 font-body
                  ${filter === t ? "bg-brand-500/15 border border-brand-500/30 text-brand-300" : "text-blue-200/50 border border-transparent hover:text-white"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {shown.map((cs, i) => (
              <CaseCard key={cs.id} cs={cs} i={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="glow-divider mb-14" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-3xl font-extrabold text-white mb-2">
                Want results like these?
              </h2>
              <p className="text-blue-200/55">
                Let's build your automation system together.
              </p>
            </div>
            <Link to="/book">
              <button className="btn-primary px-8 py-4 text-base">
                <span>Book a Free Call →</span>
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
