import { useGetDashboardSummary, useGetPipelineTimeline, useListAlerts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, ShieldCheck, AlertTriangle, Cpu, Fingerprint, GitCommit } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: timeline, isLoading: isLoadingTimeline } = useGetPipelineTimeline();
  const { data: alerts, isLoading: isLoadingAlerts } = useListAlerts({ status: "open" });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Command Center</h1>
        <p className="text-muted-foreground mt-1">Real-time supply chain security operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Builds" 
          value={summary?.totalBuilds} 
          subtitle={`${summary?.successfulBuilds} successful`}
          icon={<Cpu className="w-4 h-4 text-primary" />} 
          loading={isLoadingSummary} 
        />
        <MetricCard 
          title="Active Alerts" 
          value={summary?.activeAlerts} 
          subtitle={`${summary?.criticalAlerts} critical`}
          icon={<AlertTriangle className="w-4 h-4 text-destructive" />} 
          loading={isLoadingSummary}
          valueColor={summary?.activeAlerts && summary.activeAlerts > 0 ? "text-destructive" : ""}
        />
        <MetricCard 
          title="Verified Artifacts" 
          value={summary?.artifactsVerified} 
          subtitle="Signed & Attested"
          icon={<Fingerprint className="w-4 h-4 text-green-500" />} 
          loading={isLoadingSummary} 
        />
        <MetricCard 
          title="Detection Rate" 
          value={summary ? `${(summary.avgTpr * 100).toFixed(1)}%` : undefined} 
          subtitle={`FPR: ${(summary?.avgFpr || 0 * 100).toFixed(2)}%`}
          icon={<ShieldCheck className="w-4 h-4 text-chart-4" />} 
          loading={isLoadingSummary} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-primary" />
                  Live Pipeline Timeline
                </CardTitle>
                <CardDescription>Recent events across the SLSA supply chain</CardDescription>
              </div>
              <Badge variant="outline" className="font-mono bg-primary/10 text-primary border-primary/20">
                Mode {summary?.frameworkMode || "C"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingTimeline ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full bg-muted/50" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {timeline?.map((event, i) => (
                  <div key={event.id} className="flex gap-4 relative">
                    {i !== timeline.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-[-16px] w-[2px] bg-border" />
                    )}
                    <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border ${
                      event.status === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-500' :
                      event.status === 'error' ? 'bg-destructive/10 border-destructive/30 text-destructive' :
                      event.status === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' :
                      'bg-primary/10 border-primary/30 text-primary'
                    }`}>
                      <GitCommit className="w-3 h-3" />
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-foreground">{event.eventType.replace('_', ' ').toUpperCase()}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {format(new Date(event.timestamp), 'HH:mm:ss.SSS')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <p className="text-xs font-mono text-primary mt-1">{event.imageRef}</p>
                    </div>
                  </div>
                ))}
                {!timeline?.length && <div className="text-sm text-muted-foreground text-center py-4">No events found.</div>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Recent Alerts
            </CardTitle>
            <CardDescription>Open incidents requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAlerts ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full bg-muted/50" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {alerts?.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="p-3 rounded-md border border-border bg-background/50 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className={`
                        ${alert.severity === 'critical' ? 'border-destructive text-destructive' : ''}
                        ${alert.severity === 'high' ? 'border-orange-500 text-orange-500' : ''}
                        ${alert.severity === 'medium' ? 'border-yellow-500 text-yellow-500' : ''}
                        ${alert.severity === 'low' ? 'border-primary text-primary' : ''}
                      `}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">{format(new Date(alert.detectedAt), 'HH:mm')}</span>
                    </div>
                    <p className="text-sm font-medium mb-1 truncate">{alert.type.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground truncate font-mono">{alert.podName}</p>
                  </div>
                ))}
                {!alerts?.length && (
                  <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-md">
                    No active alerts. System secure.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon, loading, valueColor = "text-foreground" }: { 
  title: string, 
  value?: number | string, 
  subtitle: string, 
  icon: React.ReactNode, 
  loading: boolean,
  valueColor?: string
}) {
  return (
    <Card className="bg-card/50 backdrop-blur border-border shadow-sm hover:shadow-md transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        <div className="p-2 bg-muted rounded-md">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24 mb-1" />
        ) : (
          <div className={`text-3xl font-bold font-mono tracking-tight ${valueColor}`}>{value ?? '-'}</div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
