import { useListAttackScenarios, useSimulateAttack, useListSimulationResults, getListSimulationResultsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Crosshair, Play, Skull, ShieldCheck, ActivitySquare } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Attacks() {
  const { data: scenarios, isLoading: isLoadingScenarios } = useListAttackScenarios();
  const { data: results, isLoading: isLoadingResults } = useListSimulationResults();
  
  const simulateAttack = useSimulateAttack();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [runsPerScenario, setRunsPerScenario] = useState<Record<number, number>>({});

  const handleSimulate = (scenarioId: number) => {
    const runs = runsPerScenario[scenarioId] || 1;
    
    simulateAttack.mutate(
      { data: { scenarioId, runs } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSimulationResultsQueryKey() });
          toast({
            title: "Simulation Complete",
            description: `Executed ${runs} runs for the selected scenario.`,
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Simulation Failed",
            description: "An error occurred during execution.",
          });
        }
      }
    );
  };

  const getStageColor = (stage: string) => {
    switch(stage) {
      case 'admission': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'runtime_sbom': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'runtime_falco': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'undetected': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Attack Simulation</h1>
        <p className="text-muted-foreground mt-1">Inject adversarial scenarios to measure continuous verification efficacy</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoadingScenarios ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full bg-card/50" />)
        ) : (
          scenarios?.map((scenario) => {
            const isPending = simulateAttack.isPending && simulateAttack.variables?.data.scenarioId === scenario.id;
            const runs = runsPerScenario[scenario.id] || 1;
            
            return (
              <Card key={scenario.id} className="bg-card/50 backdrop-blur border-border flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                  {scenario.type === 'image_tampering' && <ShieldCheck className="w-32 h-32" />}
                  {scenario.type === 'malicious_dependency' && <Skull className="w-32 h-32" />}
                  {scenario.type === 'runtime_anomaly' && <ActivitySquare className="w-32 h-32" />}
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-primary" />
                    {scenario.name}
                  </CardTitle>
                  <CardDescription className="min-h-[40px]">{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6 z-10">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-mono uppercase tracking-wider text-xs">Expected Block At</span>
                      <Badge variant="outline" className={`font-mono text-[10px] ${getStageColor(scenario.expectedDetectionStage)}`}>
                        {scenario.expectedDetectionStage.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Execution Runs</label>
                      <span className="font-mono text-primary font-bold">{runs}</span>
                    </div>
                    <Slider 
                      value={[runs]} 
                      min={1} 
                      max={10} 
                      step={1}
                      onValueChange={(val) => setRunsPerScenario(prev => ({ ...prev, [scenario.id]: val[0] }))}
                      disabled={simulateAttack.isPending}
                    />
                  </div>
                </CardContent>
                <CardFooter className="pt-0 z-10">
                  <Button 
                    className="w-full font-mono" 
                    variant={isPending ? "outline" : "default"}
                    onClick={() => handleSimulate(scenario.id)}
                    disabled={simulateAttack.isPending}
                  >
                    {isPending ? "EXECUTING..." : <><Play className="w-4 h-4 mr-2" /> LAUNCH SIMULATION</>}
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>

      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader>
          <CardTitle>Simulation History</CardTitle>
          <CardDescription>Recent attack injection results and detection latency</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Time</TableHead>
                <TableHead>Scenario</TableHead>
                <TableHead className="text-center">Runs</TableHead>
                <TableHead className="text-center">Detected</TableHead>
                <TableHead>Detection Stage</TableHead>
                <TableHead className="text-right">Avg Latency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingResults ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : results?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No simulation data available. Run a scenario above.
                  </TableCell>
                </TableRow>
              ) : results?.map((result) => {
                const isFullyDetected = result.detected === result.runs;
                
                return (
                  <TableRow key={result.id} className="border-border hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {format(new Date(result.runAt), 'HH:mm:ss')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {result.scenarioName}
                    </TableCell>
                    <TableCell className="text-center font-mono text-muted-foreground">
                      {result.runs}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`font-mono ${isFullyDetected ? 'text-green-500 border-green-500/30 bg-green-500/10' : 'text-destructive border-destructive/30 bg-destructive/10'}`}>
                        {result.detected} / {result.runs}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-mono text-[10px] ${getStageColor(result.detectionStage)}`}>
                        {result.detectionStage.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {result.avgDetectionMs > 0 ? `${result.avgDetectionMs.toFixed(1)}ms` : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
