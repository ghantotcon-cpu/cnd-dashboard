import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Pipeline from "@/pages/pipeline";
import Artifacts from "@/pages/artifacts";
import Alerts from "@/pages/alerts";
import Attacks from "@/pages/attacks";
import Metrics from "@/pages/metrics";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/pipeline" component={Pipeline} />
        <Route path="/artifacts" component={Artifacts} />
        <Route path="/alerts" component={Alerts} />
        <Route path="/attacks" component={Attacks} />
        <Route path="/metrics" component={Metrics} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const rawBase = import.meta.env.BASE_URL ?? "/";
  const base = String(rawBase).replace(/\/$/, "");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={base}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
