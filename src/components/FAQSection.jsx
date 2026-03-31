import { useState } from "react";
import { Link } from "react-router-dom";
import { FAQS } from "../data";

export default function FAQSection({ isDark }) {
  const [open, setOpen] = useState(null);
  const toggle = (i) => setOpen((prev) => (prev === i ? null : i));

  const borderColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(5,38,89,0.09)";
  const headingColor = isDark ? "#f0f6ff" : "#021024";
  const bodyColor = isDark ? "rgba(186,220,255,0.72)" : "rgba(5,38,89,0.68)";
  const iconBg = isDark ? "rgba(45,142,245,0.12)" : "rgba(84,131,179,0.12)";
  const iconBorder = isDark ? "rgba(45,142,245,0.25)" : "rgba(84,131,179,0.25)";
  const iconColor = isDark ? "#7DA0CA" : "#5483B3";
  const rowHoverBg = isDark ? "rgba(255,255,255,0.025)" : "rgba(5,38,89,0.025)";

  return (
    <section className="py-24 border-y border-white/[0.05]">
      <div className="max-w-4xl mx-auto px-5 md:px-8">
        <div className="text-center mb-14 reveal">
          <p className="section-label justify-center">Got Questions?</p>
          <h2 className="section-title text-white">
            Frequently Asked{" "}
            <span className="gradient-text-blue">Questions</span>
          </h2>
          <p className="text-blue-200/55 text-base mt-4 max-w-lg mx-auto leading-relaxed">
            Everything you need to know before we talk. Still have more? Just
            send us a message.
          </p>
        </div>

        <div
          className="reveal"
          style={{
            borderRadius: 20,
            border: `1px solid ${borderColor}`,
            overflow: "hidden",
            backdropFilter: "blur(12px)",
            background: isDark
              ? "rgba(255,255,255,0.03)"
              : "rgba(255,255,255,0.50)",
          }}
        >
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            const isLast = i === FAQS.length - 1;
            return (
              <div
                key={i}
                style={{
                  borderBottom: isLast ? "none" : `1px solid ${borderColor}`,
                }}
              >
                <button
                  onClick={() => toggle(i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "20px 28px",
                    textAlign: "left",
                    background: isOpen ? rowHoverBg : "transparent",
                    border: "none",
                    cursor: "none",
                    transition: "background 0.2s",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: "15px",
                      color: isOpen ? "#2d8ef5" : headingColor,
                      lineHeight: 1.4,
                      transition: "color 0.2s",
                      flex: 1,
                    }}
                  >
                    {faq.q}
                  </span>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isOpen ? "rgba(45,142,245,0.18)" : iconBg,
                      border: `1px solid ${isOpen ? "rgba(45,142,245,0.40)" : iconBorder}`,
                      transition: "all 0.25s",
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      style={{
                        transition:
                          "transform 0.28s cubic-bezier(0.34,1.56,0.64,1)",
                        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      }}
                    >
                      <line
                        x1="6"
                        y1="1"
                        x2="6"
                        y2="11"
                        stroke={isOpen ? "#2d8ef5" : iconColor}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <line
                        x1="1"
                        y1="6"
                        x2="11"
                        y2="6"
                        stroke={isOpen ? "#2d8ef5" : iconColor}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </button>
                <div
                  style={{
                    maxHeight: isOpen ? 300 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.38s cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "14px",
                      lineHeight: 1.75,
                      color: bodyColor,
                      padding: "0 28px 22px",
                      margin: 0,
                    }}
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-blue-200/45 text-sm mt-8">
          Still have questions?{" "}
          <Link
            to="/contact"
            className="text-brand-400 hover:text-brand-300 transition-colors font-semibold underline underline-offset-4"
          >
            Send us a message →
          </Link>
        </p>
      </div>
    </section>
  );
}
