import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="" width={28} height={28} className="h-7 w-7" loading="lazy" />
            <span className="text-sm font-semibold tracking-tight">
              Smart Bharat <span className="text-primary">AI</span>
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Your intelligent civic companion. Making Government of India services simple, smart and accessible for every
            citizen.
          </p>
        </div>
        <FooterCol
          title="Product"
          links={[
            ["/assistant", "AI Assistant"],
            ["/schemes", "Scheme Recommender"],
            ["/complaints", "Complaint Generator"],
            ["/documents", "Document Assistant"],
          ]}
        />
        <FooterCol title="Your data" links={[["/my-space", "My Space"]]} />
        <FooterCol
          title="Official portals"
          external={[
            ["https://www.india.gov.in", "india.gov.in"],
            ["https://www.myscheme.gov.in", "MyScheme"],
            ["https://digilocker.gov.in", "DigiLocker"],
            ["https://pgportal.gov.in", "CPGRAMS"],
          ]}
        />
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            © {new Date().getFullYear()} Smart Bharat AI · Powered by Google Gemini · Not an official Government of
            India service.
          </span>
          <span>Built for the Global Prompt Challenge.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
  external,
}: {
  title: string;
  links?: [string, string][];
  external?: [string, string][];
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {links?.map(([to, label]) => (
          <li key={to}>
            <Link to={to} className="text-foreground/80 transition-colors hover:text-foreground">
              {label}
            </Link>
          </li>
        ))}
        {external?.map(([href, label]) => (
          <li key={href}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/80 transition-colors hover:text-foreground"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
