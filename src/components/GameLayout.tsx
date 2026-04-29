import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import horseWhite from "@/assets/horse-white.png";
import horseBlack from "@/assets/horse-black.png";

export function GameLayout({
  title,
  subtitle,
  children,
  showHome = true,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  showHome?: boolean;
}) {
  return (
    <div className="min-h-screen pasture-bg">
      <div className="grass-pattern absolute inset-x-0 bottom-0 h-32 opacity-60 pointer-events-none" />
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-6 sm:py-10">
        <header className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-2 hover-scale">
            <img src={horseWhite} alt="" width={40} height={40} className="drop-shadow" />
            <img src={horseBlack} alt="" width={40} height={40} className="drop-shadow -ml-3" />
            <span className="text-2xl font-bold text-foreground">Matunga</span>
          </Link>
          {showHome && (
            <Button asChild variant="secondary" size="sm">
              <Link to="/">Menu</Link>
            </Button>
          )}
        </header>

        {title && (
          <div className="text-center mb-6 animate-float-in">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}

        <main>{children}</main>
      </div>
    </div>
  );
}
