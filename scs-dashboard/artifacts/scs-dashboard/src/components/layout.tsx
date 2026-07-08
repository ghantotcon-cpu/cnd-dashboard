import { Link, useLocation } from "wouter";
import { 
  Activity, 
  Box, 
  ShieldAlert, 
  GitCommit, 
  Crosshair, 
  BarChart2, 
  Terminal,
  LogOut,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const navItems = [
  { href: "/", label: "Command Center", icon: Activity },
  { href: "/pipeline", label: "Pipeline", icon: GitCommit },
  { href: "/artifacts", label: "Artifacts", icon: Box },
  { href: "/alerts", label: "Runtime Alerts", icon: ShieldAlert },
  { href: "/attacks", label: "Simulations", icon: Crosshair },
  { href: "/metrics", label: "Analysis", icon: BarChart2 },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-border bg-card">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-md">
            <Terminal className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-widest text-primary uppercase">SCS-C2</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Supply Chain Sec</p>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 border border-transparent",
                location === item.href
                  ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_rgba(var(--primary),0.1)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className={cn("w-4 h-4", location === item.href ? "text-primary" : "text-muted-foreground")} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background relative">
        {/* Subtle grid background */}
        <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] bg-[length:20px_20px]" />
        
        <header className="h-14 border-b border-border flex items-center px-6 justify-between shrink-0 bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-primary uppercase tracking-wider">System Live • Framework Mode C</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <span>Uptime: 99.99%</span>
            <span>Latency: 12ms</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 z-10">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
