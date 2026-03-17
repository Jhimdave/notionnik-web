export default function NotionNikLogo({
  size = 65,
  showText = true,
  theme = true,
  className = "",
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src= {theme ? "/light-logo.png" : "/logo.png"}
        alt="NotionNik Logo"
        style={{ height: size }}
        className="object-contain"
      />

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className="font-display font-extrabold tracking-tight text-white"
            style={{ fontSize: size * 0.45, letterSpacing: "-0.02em" }}
          >
            NotionNik
          </span>
          <span
            className="font-mono text-brand-400/70 tracking-widest"
            style={{ fontSize: size * 0.145 }}
          >
            System · Notion · Automation
          </span>
        </div>
      )}
    </div>
  );
}
