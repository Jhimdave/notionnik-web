// ── Case Studies Data ─────────────────────────────────────────────────────
export const CASE_STUDIES = [
  {
    id: "notion-workspace-aura",
    icon: "🎨",
    title: "Notion Workspace Automation for Creative Agency",
    tag: "Notion",
    client: "Aura Creative Studio",
    duration: "3 weeks",
    subtitle: "Centralized project management system with automated workflows reducing admin time by 70%",
    desc: "Built a comprehensive Notion workspace with automated project pipelines, resource allocation, and client portals.",
    result: "70% less admin time",
    challenge: "Aura Creative Studio was struggling with fragmented project management across multiple tools. Their team of 15 designers and developers used a mix of Trello, Google Sheets, and Slack, leading to missed deadlines, duplicated work, and poor client visibility. They needed a unified system that could automate status updates, resource allocation, and client reporting without adding administrative overhead.",
    solution: "We architected a custom Notion workspace that served as their central command center. The solution included interconnected databases for Projects, Clients, Resources, and Finances with automated rollups and relations. We implemented button-triggered automations for project status changes, automated weekly client reports using Notion's API synced with their Slack channels, and created template galleries for rapid project initialization.",
    outcome: "Aura Creative reduced project setup time from 2 hours to 15 minutes. Automated status updates eliminated the need for daily standup meetings, saving 5 hours per week across the team. Client satisfaction scores increased by 40% due to real-time project visibility. The agency scaled from 15 to 25 employees without hiring additional project managers.",
    tools: ["Notion", "Make (Integromat)", "Slack API", "Zapier", "Google Calendar API"],
    metrics: [
      { label: "Time Saved/Week", value: "35 hrs" },
      { label: "Project Setup Time", value: "-87%" },
      { label: "Client Satisfaction", value: "+40%" },
      { label: "ROI", value: "320%" }
    ],
    process: [
      "Audited existing tools and mapped current workflow pain points with team interviews",
      "Designed Notion database schema with relations, rollups, and formula properties",
      "Built core workspace with Projects, Clients, Resources, and Content Calendar databases",
      "Implemented Make.com automations for status changes and Slack notifications",
      "Created template library for rapid project initialization and resource allocation",
      "Developed client portal views with automated weekly progress reports",
      "Trained team and provided documentation for ongoing maintenance"
    ],
    images: [
      "https://kimi-web-img.moonshot.cn/img/s3-us-west-2.amazonaws.com/1bdbfebaead99c3f13b2ad0da1d871901bc7529c.png",
      "https://kimi-web-img.moonshot.cn/img/www.notion.com/624c643cf6a6b08374e7c478a580b1c1f21dfa05",
      "https://kimi-web-img.moonshot.cn/img/assets.ycodeapp.com/bdf67e7a6f7d9b46dbb887c2fabb01f56ab87002.webp"
    ]
  },
  {
    id: "crm-hubspot-elite",
    icon: "🏢",
    title: "CRM Automation for Real Estate Firm",
    tag: "CRM",
    client: "Elite Properties Group",
    duration: "6 weeks",
    subtitle: "End-to-end sales pipeline automation with lead scoring and follow-up sequences",
    desc: "Implemented HubSpot CRM with custom automation workflows, lead scoring, and integrated property matching algorithms.",
    result: "3x faster lead conversion",
    challenge: "Elite Properties was losing high-value leads due to slow response times and poor lead qualification. Their agents spent 60% of their time on administrative tasks like data entry and follow-up emails rather than closing deals. With 500+ monthly leads from various sources (Zillow, website, referrals), they lacked a systematic way to prioritize hot leads and nurture cold ones automatically.",
    solution: "We implemented a complete HubSpot CRM overhaul with intelligent automation. The solution included custom lead scoring based on property type preference, budget range, and engagement level. We built automated email sequences for different buyer personas, Slack notifications for high-intent leads, and integrated their MLS database for automatic property matching. Custom dashboards provided real-time visibility into pipeline health and agent performance.",
    outcome: "Lead response time dropped from 4 hours to under 5 minutes through instant Slack alerts and auto-assignment. Conversion rates improved by 180% in the first quarter. Agents reclaimed 25 hours per week previously spent on admin tasks, allowing them to focus on high-value client relationships. The firm closed 45% more transactions in the first 6 months post-implementation.",
    tools: ["HubSpot CRM", "Slack", "Zapier", "MLS Integration", "Make", "Gmail API"],
    metrics: [
      { label: "Response Time", value: "< 5 min" },
      { label: "Lead Conversion", value: "+180%" },
      { label: "Admin Time Saved", value: "25 hrs/wk" },
      { label: "Revenue Increase", value: "+45%" }
    ],
    process: [
      "Mapped current lead flow and identified bottlenecks in qualification process",
      "Configured HubSpot CRM with custom properties for real estate specific data",
      "Built automated lead scoring model based on behavior and demographic data",
      "Created multi-channel follow-up sequences (email, SMS, calls) via workflows",
      "Integrated MLS database for real-time property alerts matching client criteria",
      "Developed agent performance dashboards and pipeline analytics",
      "Implemented automated reporting for weekly sales meetings"
    ],
    images: [
      "https://kimi-web-img.moonshot.cn/img/www.hubspot.com/7923040d1a4a325d33e087d6fd6194f7ec8585d7.png",
      "https://kimi-web-img.moonshot.cn/img/www.hubspot.com/a45b118965fcbb4c948a532b3f6b50080b185688.png"
    ]
  },
  {
    id: "ai-support-techflow",
    icon: "🤖",
    title: "AI Support Automation for E-commerce",
    tag: "AI Automation",
    client: "TechFlow Electronics",
    duration: "4 weeks",
    subtitle: "GPT-4 powered support system handling 80% of inquiries automatically",
    desc: "Deployed intelligent chatbot with order tracking, return processing, and escalation protocols integrated with Shopify.",
    result: "80% automated resolution",
    challenge: "TechFlow Electronics faced explosive growth during holiday seasons, with support tickets increasing 300% month-over-month. Their 5-person support team was overwhelmed, leading to 48-hour response delays and negative reviews. They needed a solution that could handle repetitive inquiries (order status, returns, troubleshooting) while seamlessly escalating complex issues to human agents with full context.",
    solution: "We built an AI-first support ecosystem using GPT-4 integrated with their Shopify store and Zendesk. The chatbot was trained on their product catalog, shipping policies, and historical support tickets to handle order tracking, initiate returns, and provide technical troubleshooting. For complex issues, the AI generated detailed summaries and context for human handoff. We also implemented sentiment analysis to prioritize angry customers and automated follow-up surveys.",
    outcome: "The AI system now resolves 80% of inquiries without human intervention, including order tracking, password resets, and basic troubleshooting. Average response time decreased from 48 hours to instant. Customer satisfaction scores improved to 4.8/5 despite reducing human support staff involvement. The company saved $120,000 annually in support costs while handling 3x ticket volume.",
    tools: ["OpenAI GPT-4", "Shopify API", "Zendesk", "Make", "Pinecone (Vector DB)", "Slack"],
    metrics: [
      { label: "Auto-Resolution", value: "80%" },
      { label: "Response Time", value: "Instant" },
      { label: "CSAT Score", value: "4.8/5" },
      { label: "Cost Savings", value: "$120k/yr" }
    ],
    process: [
      "Analyzed 6 months of support tickets to identify automation opportunities",
      "Fine-tuned GPT-4 model with product catalog and support documentation",
      "Built vector database for semantic search across knowledge base articles",
      "Created conversation flows for order tracking, returns, and troubleshooting",
      "Implemented escalation protocols with context preservation for human agents",
      "Integrated with Shopify for real-time order status and inventory checks",
      "Deployed sentiment analysis for priority routing and quality monitoring"
    ],
    images: [
      "https://kimi-web-img.moonshot.cn/img/www.goodfellastech.com/6e90c61b29debdd1cf6228ae95ca93eb50d77b57.png",
      "https://kimi-web-img.moonshot.cn/img/cdn.prod.website-files.com/694e51857165e2c0c39e53adfb495b8e8c994b46.webp"
    ]
  },
  {
    id: "email-saas-growth",
    icon: "📧",
    title: "Email Automation for SaaS Platform",
    tag: "Marketing",
    client: "CloudSync SaaS",
    duration: "5 weeks",
    subtitle: "Behavioral email sequences increasing trial-to-paid conversion by 65%",
    desc: "Designed automated onboarding, feature adoption, and re-engagement campaigns based on user behavior triggers.",
    result: "+65% trial conversion",
    challenge: "CloudSync had a generous 14-day free trial but only saw 8% conversion to paid plans. Generic email blasts were ignored, and users weren't discovering key features during trial periods. They lacked visibility into which features indicated high intent, and their manual email process couldn't react to user behavior in real-time.",
    solution: "We architected a sophisticated behavioral email automation system using Customer.io integrated with their product analytics. The solution included feature-based onboarding tracks (users who didn't connect their first integration received targeted tutorials), usage-based escalation (power users got advanced tips, low-usage users got simplification offers), and predictive churn alerts. We built dynamic content blocks that personalized emails based on the user's industry and team size.",
    outcome: "Trial-to-paid conversion increased from 8% to 13.2% (65% improvement) within two billing cycles. Feature adoption rates for critical integrations increased by 120%. The automated win-back campaign recovered 15% of churned users. Overall, the email automation generated an additional $240,000 in ARR (Annual Recurring Revenue) in the first quarter alone.",
    tools: ["Customer.io", "Segment", "Mixpanel", "Stripe", "Zapier", "Clearbit", "OpenAI"],
    metrics: [
      { label: "Trial Conversion", value: "+65%" },
      { label: "Feature Adoption", value: "+120%" },
      { label: "Win-back Rate", value: "15%" },
      { label: "New ARR", value: "$240k" }
    ],
    process: [
      "Mapped user journey and identified key activation milestones in the product",
      "Segmented users by behavior, industry, and engagement levels",
      "Built behavioral triggers based on product usage and inactivity patterns",
      "Created dynamic email templates with personalized feature recommendations",
      "Implemented lead scoring for sales handoff of high-intent trial users",
      "Set up A/B testing framework for subject lines and send times",
      "Created automated reporting dashboard for campaign performance"
    ],
    images: [
      "https://kimi-web-img.moonshot.cn/img/static.coupler.io/1c64db5df5c7a7a76ce2427725797ac7e6a1bb94.png",
      "https://kimi-web-img.moonshot.cn/img/i0.wp.com/51e7d76eadf0037e56def0a3bc1319e4346515b6.png"
    ]
  },
  {
    id: "workflow-finance-apex",
    icon: "⚡",
    title: "Workflow Automation for Financial Services",
    tag: "Integration",
    client: "Apex Financial Advisors",
    duration: "8 weeks",
    subtitle: "End-to-end document processing and compliance workflow automation",
    desc: "Integrated Salesforce, DocuSign, and internal compliance systems with automated approval chains and audit trails.",
    result: "90% faster processing",
    challenge: "Apex Financial managed client onboarding through a complex web of manual processes involving 12 different systems. A single client onboarding required 47 manual data entries, took 3 weeks to complete, and had a 23% error rate due to manual transcription. Compliance documentation was frequently delayed, putting the firm at regulatory risk.",
    solution: "We built an enterprise-grade automation architecture using Workato as the integration platform. The solution connected Salesforce CRM, DocuSign for signatures, SharePoint for document storage, and their proprietary compliance database. We implemented intelligent document processing using OCR for form recognition, automated compliance checks against regulatory databases, and multi-level approval workflows with Slack notifications. Every action was logged in an immutable audit trail.",
    outcome: "Client onboarding time reduced from 3 weeks to 1.5 days (90% improvement). Data entry errors dropped to near zero through system-to-system integration. The compliance team saved 30 hours per week on manual verification. The firm successfully passed their regulatory audit with zero findings related to process documentation, and client satisfaction scores regarding onboarding experience improved by 85%.",
    tools: ["Workato", "Salesforce API", "DocuSign", "SharePoint", "OCR (AWS Textract)", "Slack", "SQL Server"],
    metrics: [
      { label: "Processing Time", value: "-90%" },
      { label: "Error Rate", "value": "0.1%" },
      { label: "Compliance Time", value: "-30 hrs/wk" },
      { label: "Audit Findings", value: "0" }
    ],
    process: [
      "Documented current state process mapping with 47 manual touchpoints identified",
      "Designed integration architecture with API connections between all 12 systems",
      "Built document intake automation with OCR for data extraction and validation",
      "Created conditional approval workflows based on client risk profiles",
      "Implemented automated compliance checks against regulatory watchlists",
      "Developed real-time audit trail and reporting dashboards",
      "Trained staff on exception handling and monitoring protocols"
    ],
    images: [
      "https://kimi-web-img.moonshot.cn/img/media.mktg.workday.com/be5d8dd68f8a1332b527e693f584154bdc045b65",
      "https://kimi-web-img.moonshot.cn/img/cdn.prod.website-files.com/694e51857165e2c0c39e53adfb495b8e8c994b46.webp"
    ]
  }
]

// ── Services Data ──────────────────────────────────────────────────────────
export const SERVICES_DATA = [
  {
    id: 'notion-workspace',
    icon: '◈',
    title: 'Notion Workspaces',
    tagline: 'Your entire business, beautifully organized in Notion',
    desc: 'Custom-built Notion databases, dashboards, and wikis tailored to your team\'s exact workflow.',
    long: 'We design and build Notion workspaces from scratch — or restructure your existing one. Every database, relation, and view is intentional. We build company wikis, CRMs, project management systems, HR databases, content calendars, and more.',
    features: ['Custom database architecture', 'Linked databases & relations', 'Filtered views per team role', 'Automated status updates', 'Template systems', 'Team onboarding docs'],
    color: '#2d8ef5',
    tools: ['Notion', 'Notion API'],
  },
  {
    id: 'workflow-automation',
    icon: '⟳',
    title: 'Workflow Automation',
    tagline: 'Repetitive tasks eliminated. Permanent.',
    desc: 'End-to-end automation using n8n, Make, and Zapier — connecting your tools to work seamlessly together.',
    long: 'We map your manual workflows and replace them with automated pipelines. From simple triggers to complex multi-step sequences with conditionals, error handling, and retries. If you do it more than once a week, we can automate it.',
    features: ['Trigger-based automations', 'Multi-step workflows', 'Conditional logic', 'Error handling & retries', 'Slack/email notifications', 'Monitoring dashboards'],
    color: '#5aabff',
    tools: ['n8n', 'Make', 'Zapier'],
  },
  {
    id: 'ai-integrations',
    icon: '⬡',
    title: 'AI Integrations',
    tagline: 'GPT-powered logic embedded into your actual business',
    desc: 'Embed GPT-powered logic and AI workflows directly into your Notion workspace and business processes.',
    long: 'We integrate AI into your existing systems — not as a separate tool, but woven into your actual workflows. AI that summarizes meetings, classifies leads, writes first-draft content, answers support queries from your knowledge base, and flags anomalies in your data.',
    features: ['GPT-4 integrations', 'Document summarization', 'Lead scoring & classification', 'AI content generation', 'Smart email drafts', 'Knowledge base Q&A'],
    color: '#2d8ef5',
    tools: ['OpenAI', 'n8n', 'Notion'],
  },
  {
    id: 'google-workspace',
    icon: '⌘',
    title: 'Google Workspace',
    tagline: 'Sheets, Docs, Gmail, Drive — automated and connected',
    desc: 'Automate Sheets, Docs, Gmail, Drive, and Calendar — connected to your core operational systems.',
    long: 'Google Workspace is powerful but most teams use 10% of what\'s possible. We automate report generation from Sheets, document creation from templates, Gmail workflows, Drive organization, and Calendar-triggered actions — all connected to your Notion and automation stack.',
    features: ['Sheets → Doc generation', 'Gmail automation', 'Drive auto-organization', 'Calendar triggers', 'Google Forms → Notion', 'Apps Script development'],
    color: '#5aabff',
    tools: ['Google Sheets', 'Apps Script', 'Gmail API'],
  },
  {
    id: 'api-connections',
    icon: '✦',
    title: 'API Connections',
    tagline: 'Any tool. Any platform. We build the bridge.',
    desc: 'Bridge any tool to any platform with robust, production-grade API integrations and webhooks.',
    long: 'Have a custom app, niche SaaS tool, or internal system that doesn\'t have native integrations? We build custom API connections, webhooks, and middleware that make your unique stack talk to each other — reliably and at scale.',
    features: ['REST & GraphQL APIs', 'Webhook configuration', 'Custom middleware', 'Rate limit handling', 'Auth & token management', 'API documentation'],
    color: '#2d8ef5',
    tools: ['REST APIs', 'Webhooks', 'Node.js'],
  },
  {
    id: 'system-design',
    icon: '◉',
    title: 'System Design',
    tagline: 'Architecture that scales — built right from the start',
    desc: 'Architecture consulting to design scalable operational systems that grow and adapt with your business.',
    long: 'Before writing a single automation, we help you design the right system architecture. We map your tools, data flows, team roles, and growth plans — then design an operations stack that won\'t need to be rebuilt every 6 months.',
    features: ['Operations audit', 'Tool stack optimization', 'Data flow mapping', 'Scalability planning', 'Team workflow design', 'Documentation framework'],
    color: '#5aabff',
    tools: ['Miro', 'Notion', 'Loom'],
  },
]

// ── FAQs ──────────────────────────────────────────────────────────────────
export const FAQS = [
  {
    q: "What exactly does NotionNik do?",
    a: "We build custom Notion workspaces and automation systems that eliminate repetitive manual work from your business. Think CRMs, project management systems, AI integrations, and multi-tool workflows — all engineered to run smoothly without constant babysitting."
  },
  {
    q: "Do I need to know Notion to work with you?",
    a: "Not at all. We handle everything from scratch — design, build, and training. By the end of the project you'll have a system you fully understand and can maintain yourself. We also provide documentation and 30-day post-launch support."
  },
  {
    q: "How long does a typical project take?",
    a: "Most Notion workspace projects are delivered in 1–3 weeks. Automation and AI integration projects typically take 2–6 weeks depending on complexity. We'll give you a clear timeline during the free discovery call before any work begins."
  },
  {
    q: "What tools do you integrate with?",
    a: "Our core stack includes Notion, Make (Integromat), n8n, Zapier, Google Workspace (Sheets, Docs, Gmail, Drive), OpenAI, Slack, and most REST APIs. If you use a specific tool, ask us — we've likely integrated it before."
  },
  {
    q: "How much does it cost?",
    a: "Pricing depends on scope and complexity. Simple Notion setups start lower, while full automation stacks are higher. We always provide a fixed-price quote after the discovery call — no hidden fees, no surprises."
  },
  {
    q: "What happens after the project is delivered?",
    a: "Every project includes a handover session, full documentation, and 30 days of support for questions or minor adjustments. If you want ongoing maintenance or to expand the system later, we offer retainer packages too."
  },
  {
    q: "Can you work with an existing Notion workspace?",
    a: "Yes. We regularly audit and restructure existing workspaces. We'll map what you have, identify what's working and what isn't, then redesign around your actual workflow rather than starting from scratch unnecessarily."
  },
  {
    q: "Is the discovery call really free?",
    a: "100% free, no strings attached. The 30-minute call is for us to understand your workflow and for you to see if we're the right fit. You'll leave with actionable clarity even if we don't end up working together."
  },
  {
    q: "Do you work with teams or solo founders?",
    a: "Both. We've built systems for solo operators who need to automate everything themselves, and for teams of 50+ who need role-based workflows, permission structures, and collaborative databases. We design for your actual team size."
  },
]
