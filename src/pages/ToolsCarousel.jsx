/* ── Tools Carousel Data ───────────────────────────────────── */
const TOOLS = [
  { name: "Make.com", image: "https://www.make.com/en/logos/make-logo-march-2026.png" },
  { name: "n8n", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/N8n-logo-new.svg/1280px-N8n-logo-new.svg.png" },
  { name: "Slack", image: "https://cdn.freebiesupply.com/logos/large/2x/slack-logo-icon.png" },
  { name: "JobNimbus", image: "https://www.freelogovectors.net/wp-content/uploads/2022/07/jobnimbus-logo-freelogovectors.net_.png" },
  { name: "Apps Script", image: "https://cdn-icons-png.flaticon.com/512/2965/2965300.png" },
  { name: "Google Sheets", image: "https://mailmeteor.com/logos/assets/PNG/Google_Sheets_Logo_512px.png" },
  { name: "Notion", image: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" },
  { name: "Zapier", image: "https://cdn.freebiesupply.com/logos/large/2x/zapier-logo-png-transparent.png" },
  { name: "Wix", image: "https://upload.wikimedia.org/wikipedia/commons/5/54/Wix.com_Logo.png" },
  { name: "Render", image: "https://images.seeklogo.com/logo-png/53/2/render-logo-png_seeklogo-532232.png" },
  { name: "VS Code", image: "https://www.clipartmax.com/png/middle/352-3522803_code-transparent-visual-clipart-free-visual-studio-code-logo.png" },
  { name: "GitHub", image: "https://img.icons8.com/ios11/512/FFFFFF/github.png" },
  { name: "Claude", image: "https://upload.wikimedia.org/wikipedia/commons/0/06/Claude_AI_logo.png" },
  { name: "Kimi AI", image: "https://avatars.githubusercontent.com/u/129152888?s=200&v=4" },
  { name: "LinkedIn", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/960px-LinkedIn_logo_initials.png" },
  { name: "HubSpot", image: "https://www.pngall.com/wp-content/uploads/15/Hubspot-Logo-PNG-Pic.png" },
  { name: "Relay", image: "https://framerusercontent.com/images/0G1NyBSFSQsxjO6wG14LjRiMbmc.png" },
  { name: "OpenAI", image: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg" },
  { name: "Airtable", image: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Airtable_Logo.svg" },
  { name: "Calendly", image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Calendly_Logo.svg" },
  { name: "Typeform", image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Typeform_Logo.svg" },
  { name: "Stripe", image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Stripe_Logo.svg" },
  { name: "Twilio", image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Twilio_Logo.svg" },
  { name: "SendGrid", image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/SendGrid_Logo.svg" },
];

export function ToolsCarousel() {
  // Double the tools array for seamless infinite scroll
  const duplicatedTools = [...TOOLS, ...TOOLS];

  return (
    <section className="py-16 overflow-hidden border-y border-white/[0.05] bg-navy-900/20">
      <div className="max-w-7xl mx-auto px-5 md:px-8 mb-10">
        <div className="text-center reveal">
          <p className="section-label justify-center mb-2">Our Tech Stack</p>
          <h3 className="text-white/60 text-sm font-body">
            Tools we use to build your automations
          </h3>
        </div>
      </div>
      
      <div className="relative">
        {/* Gradient masks for smooth edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-navy-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-navy-900 to-transparent z-10 pointer-events-none" />
        
        {/* Scrolling container */}
        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {duplicatedTools.map((tool, index) => (
            <div
              key={`${tool.name}-${index}`}
              className="flex-shrink-0 mx-8 group"
            >
              <div className="w-32 h-20 rounded-xl bg-navy-800/40 border border-white/[0.08] backdrop-blur-sm flex items-center justify-center p-4 hover:border-brand-500/30 hover:bg-navy-800/60 transition-all duration-300">
                <img
                  src={tool.image}
                  alt={tool.name}
                  className="max-w-full max-h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300 filter brightness-100 group-hover:brightness-110"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <span className="hidden text-xs text-blue-200/70 font-mono text-center">
                  {tool.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Second row scrolling opposite direction */}
      <div className="relative mt-6">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-navy-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-navy-900 to-transparent z-10 pointer-events-none" />
        
        <div className="flex animate-marquee-reverse hover:[animation-play-state:paused]">
          {[...duplicatedTools].reverse().map((tool, index) => (
            <div
              key={`${tool.name}-reverse-${index}`}
              className="flex-shrink-0 mx-8 group"
            >
              <div className="w-32 h-20 rounded-xl bg-navy-800/30 border border-white/[0.06] backdrop-blur-sm flex items-center justify-center p-4 hover:border-brand-500/30 hover:bg-navy-800/50 transition-all duration-300">
                <img
                  src={tool.image}
                  alt={tool.name}
                  className="max-w-full max-h-full object-contain opacity-50 group-hover:opacity-100 transition-opacity duration-300 filter brightness-90 group-hover:brightness-110"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <span className="hidden text-xs text-blue-200/70 font-mono text-center">
                  {tool.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 40s linear infinite;
        }
      `}</style>
    </section>
  );
}