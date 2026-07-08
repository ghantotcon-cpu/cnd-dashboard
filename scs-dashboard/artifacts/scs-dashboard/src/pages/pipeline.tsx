import { useListBuilds, useCreateBuild, getListBuildsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Shield, Play, Clock, Box, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Pipeline() {
  const { data: builds, isLoading } = useListBuilds();
  const createBuild = useCreateBuild();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [imageRef, setImageRef] = useState("registry.internal/frontend:v1.0.4");
  const [slsaLevel, setSlsaLevel] = useState(3);

  const handleTriggerBuild = () => {
    createBuild.mutate(
      { data: { imageRef, slsaLevel } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBuildsQueryKey() });
          toast({
            title: "Build Triggered",
            description: `Started build for ${imageRef} at SLSA L${slsaLevel}`,
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Failed to trigger build",
            description: "An error occurred while starting the pipeline.",
          });
        }
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Pipeline Builds</h1>
          <p className="text-muted-foreground mt-1">SLSA compliant build execution and provenance</p>
        </div>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader>
          <CardTitle className="text-lg">Trigger Manual Build</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 max-w-2xl">
            <div className="space-y-2 flex-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Image Ref</label>
              <Input 
                value={imageRef} 
                onChange={(e) => setImageRef(e.target.value)} 
                className="font-mono bg-background"
              />
            </div>
            <div className="space-y-2 w-32">
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Target SLSA</label>
              <Input 
                type="number" 
                min={0} max={3} 
                value={slsaLevel} 
                onChange={(e) => setSlsaLevel(parseInt(e.target.value))} 
                className="font-mono bg-background"
              />
            </div>
            <Button 
              onClick={handleTriggerBuild} 
              disabled={createBuild.isPending}
              className="font-mono"
            >
              {createBuild.isPending ? "Starting..." : <><Play className="w-4 h-4 mr-2" /> RUN BUILD</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Image Ref / Digest</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>SLSA</TableHead>
              <TableHead>Security</TableHead>
              <TableHead className="text-right">Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : builds?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No builds found. Trigger one to start.
                </TableCell>
              </TableRow>
            ) : builds?.map((build) => (
              <TableRow key={build.id} className="border-border hover:bg-muted/30 transition-colors">
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{build.id.toString().padStart(4, '0')}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{build.imageRef}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-1 truncate max-w-[300px]" title={build.imageDigest || ''}>
                    {build.imageDigest || 'Pending digest...'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`
                    ${build.status === 'completed' ? 'border-green-500/50 text-green-500 bg-green-500/10' : ''}
                    ${build.status === 'failed' ? 'border-destructive/50 text-destructive bg-destructive/10' : ''}
                    ${['pending', 'building', 'signing', 'attesting', 'scanning'].includes(build.status) ? 'border-primary/50 text-primary bg-primary/10 animate-pulse' : ''}
                  `}>
                    {build.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono">L{build.slsaLevel}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <TooltipProviderItem tooltip="Provenance Signed">
                      <Shield className={`w-4 h-4 ${build.provenanceSigned ? 'text-primary' : 'text-muted-foreground/30'}`} />
                    </TooltipProviderItem>
                    <TooltipProviderItem tooltip={`${build.sbomPackageCount} Packages Attested`}>
                      <div className="flex items-center gap-1">
                        <Box className={`w-4 h-4 ${build.sbomAttested ? 'text-primary' : 'text-muted-foreground/30'}`} />
                        {build.sbomAttested && <span className="text-xs text-muted-foreground font-mono">{build.sbomPackageCount}</span>}
                      </div>
                    </TooltipProviderItem>
                    <TooltipProviderItem tooltip={build.vulnCritical ? `${build.vulnCritical} Critical Vulns` : 'No Critical Vulns'}>
                      <div className="flex items-center gap-1">
                        <ShieldAlert className={`w-4 h-4 ${build.vulnCritical ? 'text-destructive' : 'text-green-500'}`} />
                        {!!build.vulnCritical && <span className="text-xs text-destructive font-mono">{build.vulnCritical}</span>}
                      </div>
                    </TooltipProviderItem>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-muted-foreground">
                  <div className="flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" />
                    {build.buildDurationMs ? `${(build.buildDurationMs / 1000).toFixed(1)}s` : '-'}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// Simple tooltip helper wrapper to avoid massive boilerplate
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
function TooltipProviderItem({ children, tooltip }: { children: React.ReactNode, tooltip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent><p>{tooltip}</p></TooltipContent>
    </Tooltip>
  );
}
