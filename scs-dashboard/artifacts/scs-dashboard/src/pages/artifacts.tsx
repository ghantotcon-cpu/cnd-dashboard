import { useListArtifactsSecure } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileCheck, Shield, CheckCircle2, AlertOctagon } from "lucide-react";
import { format } from "date-fns";

export default function Artifacts() {
  const { data: artifacts, isLoading } = useListArtifactsSecure();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Secure Artifacts</h1>
        <p className="text-muted-foreground mt-1">Verified registry containing attested and signed containers</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card/50 backdrop-blur border-border">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : artifacts?.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-lg bg-card/20">
            <Box className="w-10 h-10 mx-auto mb-4 opacity-50" />
            No secure artifacts found. Run a pipeline build first.
          </div>
        ) : (
          artifacts?.map((artifact) => (
            <Card key={artifact.id} className="bg-card/50 backdrop-blur border-border hover:border-primary/30 transition-colors group">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6 justify-between lg:items-center">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{artifact.imageRef}</h3>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-mono">
                        SLSA L{artifact.slsaLevel}
                      </Badge>
                      {artifact.verified && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
                          <CheckCircle2 className="w-3 h-3" /> VERIFIED
                        </Badge>
                      )}
                      {artifact.admitted && (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                          ADMITTED
                        </Badge>
                      )}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground p-2 bg-muted/50 rounded inline-block">
                      {artifact.imageDigest}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold flex items-center gap-1">
                        <FileCheck className="w-3 h-3" /> Signer
                      </span>
                      <p className="font-mono truncate max-w-[120px]" title={artifact.signerIdentity}>
                        {artifact.signerIdentity.split('/').pop()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Packages</span>
                      <p className="font-mono">{artifact.sbomPackageCount}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Binaries</span>
                      <p className="font-mono">{artifact.allowedBinaries?.length || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Created</span>
                      <p className="font-mono">{format(new Date(artifact.createdAt), 'MMM d, HH:mm')}</p>
                    </div>
                  </div>
                </div>

                {/* Simulated SBOM details expander - visual only for demo */}
                <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Contains fully attested SBOM with {artifact.sbomPackageCount} components.</span>
                  <span className="text-primary hover:underline cursor-pointer flex items-center gap-1">
                    <Shield className="w-3 h-3" /> View Provenance Record
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
import { Box } from "lucide-react";