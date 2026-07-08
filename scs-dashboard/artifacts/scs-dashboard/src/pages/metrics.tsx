import { useGetDetectionMetrics, useGetPerformanceMetrics } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Line
} from "recharts";

export default function Metrics() {
  const { data: detection, isLoading: isLoadingDetection } = useGetDetectionMetrics();
  const { data: performance, isLoading: isLoadingPerf } = useGetPerformanceMetrics();

  // Format detection data for charts
  const detectionAccuracyData = detection?.scenarios.map(s => ({
    name: s.scenario.replace('_', ' '),
    TPR: Number((s.tpr * 100).toFixed(1)),
    FPR: Number((s.fpr * 100).toFixed(1)),
    FNR: Number((s.fnr * 100).toFixed(1))
  })) || [];

  const latencyData = detection?.scenarios.map(s => ({
    name: s.scenario.replace('_', ' '),
    latency: s.avgLatencyMs
  })) || [];

  // Format performance data
  const perfData = performance ? [
    performance.modeA,
    performance.modeB,
    performance.modeC
  ].map(m => ({
    name: `Mode ${m.mode}`,
    CPU: m.avgCpuPercent,
    Memory: m.avgMemoryMb,
    BuildTime: m.avgBuildTimeMs / 1000, // seconds
    Overhead: m.avgSigningOverheadMs + m.avgAdmissionLatencyMs
  })) : [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/90 backdrop-blur border border-border p-3 rounded-md shadow-xl">
          <p className="font-semibold text-sm mb-2 text-foreground capitalize">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs font-mono">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-bold text-foreground">{entry.value}{entry.name === 'TPR' || entry.name === 'FPR' || entry.name === 'FNR' || entry.name === 'CPU' ? '%' : ''}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Metrics & Analysis</h1>
        <p className="text-muted-foreground mt-1">Research evaluation data comparing baseline vs continuous verification</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight border-b border-border pb-2">1. Detection Accuracy</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="text-base">True/False Positive Rates</CardTitle>
              <CardDescription>Accuracy across different attack vectors</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoadingDetection ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={detectionAccuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} className="capitalize" />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="TPR" name="True Positive" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    <Bar dataKey="FPR" name="False Positive" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="text-base">Detection Latency</CardTitle>
              <CardDescription>Time from anomaly injection to alert generation</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoadingDetection ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={latencyData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}ms`} />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={120} className="capitalize" />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                    <Bar dataKey="latency" name="Latency (ms)" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} barSize={24} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight border-b border-border pb-2">2. Performance Overhead</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Comparing Mode A (Baseline), Mode B (SLSA+Sigstore), and Mode C (Full Continuous Verification)
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-card/50 backdrop-blur border-border lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Resource Utilization</CardTitle>
              <CardDescription>CPU and Memory impact across framework modes</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoadingPerf ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={perfData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}MB`} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar yAxisId="left" dataKey="CPU" name="CPU (%)" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    <Bar yAxisId="right" dataKey="Memory" name="Memory (MB)" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="text-base">Time Overhead</CardTitle>
              <CardDescription>Pipeline delay introduced by verification</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoadingPerf ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={perfData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                    <Radar name="Build Time (s)" dataKey="BuildTime" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    <Radar name="Overhead (ms)" dataKey="Overhead" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.3} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
