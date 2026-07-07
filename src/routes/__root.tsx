import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">404</p>
        <h1 className="mt-2 font-display text-4xl font-normal text-foreground">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has moved. Try the assistant instead.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
          <Link
            to="/assistant"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-input bg-background px-5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Ask the assistant
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. You can retry or head home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-input bg-background px-5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Smart Bharat AI — Your Intelligent Civic Companion" },
      {
        name: "description",
        content:
          "AI-powered civic companion for India. Access government schemes, generate professional complaints, understand documents, and get 24/7 multilingual guidance powered by Google Gemini.",
      },
      { name: "author", content: "Smart Bharat AI" },
      { name: "theme-color", content: "#1e2a5e" },
      { property: "og:title", content: "Smart Bharat AI — Your Intelligent Civic Companion" },
      {
        property: "og:description",
        content:
          "Making Government of India services simple, smart and accessible for every citizen. Powered by Google Gemini.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Smart Bharat AI" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Smart Bharat AI — Your Intelligent Civic Companion" },
      {
        name: "twitter:description",
        content: "AI-powered civic companion for India. Schemes, complaints, documents, multilingual guidance.",
      },
      { name: "description", content: "India's AI-powered civic companion. Access government services, discover eligible schemes, generate professional complaints, understand official documents." },
      { property: "og:description", content: "India's AI-powered civic companion. Access government services, discover eligible schemes, generate professional complaints, understand official documents." },
      { name: "twitter:description", content: "India's AI-powered civic companion. Access government services, discover eligible schemes, generate professional complaints, understand official documents." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/84b75faa-2f06-41c6-a2ec-8689edbe6f11/id-preview-057454b6--c12ac0cc-98a4-4b8a-9f8b-224c0321f41e.lovable.app-1783404808733.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/84b75faa-2f06-41c6-a2ec-8689edbe6f11/id-preview-057454b6--c12ac0cc-98a4-4b8a-9f8b-224c0321f41e.lovable.app-1783404808733.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <div className="flex min-h-dvh flex-col">
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
            >
              Skip to main content
            </a>
            <SiteNav />
            <main id="main" className="flex-1">
              <Outlet />
            </main>
            <SiteFooter />
          </div>
          <Toaster position="bottom-right" richColors closeButton />
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
