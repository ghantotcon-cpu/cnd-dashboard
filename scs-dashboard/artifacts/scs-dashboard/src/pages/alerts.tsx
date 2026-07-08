import { useListAlerts, useResolveAlert, getListAlertsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, CheckCircle2, Clock, Terminal, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Alerts() {
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("open");
  
  const { data: alerts, isLoading } = useListAlerts({ 
    severity: severityFilter !== "all" ? severityFilter as any : undefined,
    status: statusFilter !== "all" ? statusFilter as any : undefined
  });
  
  const resolveAlert = useResolveAlert();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleResolve = (id: number) => {
    resolveAlert.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey() });
          toast({
            title: "Alert Resolved",
            description: "Alert has been marked as resolved.",
          });
        }
      }
    );
  };

  const getSeverityColor = (sev: string) => {
    switch(sev) {
      case 'critical': return 'text-destructive border-destructive/30 bg-destructive/10';
      case 'high': return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
      default: return 'text-primary border-primary/30 bg-primary/10';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Runtime Alerts</h1>
          <p className="text-muted-foreground mt-1">Continuous verification anomalies and policy violations</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[140px] bg-card border-border">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-card border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="bg-card/50 backdrop-blur border-border">
              <CardContent className="p-6 flex items-start gap-4">
                <Skeleton className="w-10 h-10 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : alerts?.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground border border-dashed border-border rounded-lg bg-card/20">
            <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-50 text-green-500" />
            <h3 className="text-lg font-medium text-foreground mb-1">Zero Alerts</h3>
            <p>No alerts matching current filters.</p>
          </div>
        ) : (
          alerts?.map((alert) => (
            <Card key={alert.id} className={`bg-card/50 backdrop-blur border-border transition-all ${alert.status === 'open' ? 'border-l-4 border-l-destructive/50' : 'opacity-70'}`}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className={`font-mono uppercase tracking-wider ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </Badge>
                      <span className="font-semibold text-foreground tracking-tight">
                        {alert.type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono ml-auto">
                        <Clock className="w-3 h-3" />
                        {format(new Date(alert.detectedAt), 'MMM d, HH:mm:ss')}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-4 leading-relaxed">{alert.message}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono bg-muted/30 p-3 rounded-md border border-border/50">
                      <div>
                        <span className="text-muted-foreground block mb-1">POD</span>
                        <span className="truncate block" title={alert.podName}>{alert.podName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-1">NAMESPACE</span>
                        <span>{alert.namespace}</span>
                      </div>
                      {alert.processBinary && (
                        <div>
                          <span className="text-muted-foreground block mb-1">PROCESS</span>
                          <span className="text-destructive truncate block">{alert.processBinary}</span>
                        </div>
                      )}
                      {alert.slsaLevel !== undefined && (
                        <div>
                          <span className="text-muted-foreground block mb-1">ATTESTED SLSA</span>
                          <span className="text-primary">L{alert.slsaLevel}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t md:border-t-0 md:border-l border-border/50 bg-muted/10 p-6 flex flex-row md:flex-col justify-between items-center md:w-48">
                    <div className="text-center md:text-left w-full">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Status</span>
                      {alert.status === 'open' ? (
                        <div className="flex items-center gap-1.5 text-destructive font-medium text-sm">
                          <AlertTriangle className="w-4 h-4" /> Open
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-green-500 font-medium text-sm">
                          <CheckCircle2 className="w-4 h-4" /> Resolved
                        </div>
                      )}
                    </div>
                    
                    {alert.status === 'open' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-0 md:mt-4 font-mono text-xs border-primary/20 hover:bg-primary/10 hover:text-primary"
                        onClick={() => handleResolve(alert.id)}
                        disabled={resolveAlert.isPending}
                      >
                        {resolveAlert.isPending ? "RESOLVING..." : "MARK RESOLVED"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
