import { AnalysisResult } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, CheckCircle2, AlertTriangle, AlertOctagon, Activity, Droplets, Wind, Sun } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

interface ResultsDashboardProps {
  result: AnalysisResult | null;
}

export function ResultsDashboard({ result }: ResultsDashboardProps) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground border-2 border-dashed border-muted rounded-xl bg-slate-50/50">
        <Activity className="w-12 h-12 mb-4 opacity-20" />
        <p className="font-medium">No analysis data available</p>
        <p className="text-sm">Select a region and run analysis to view results</p>
      </div>
    );
  }

  const classificationColor = {
    "Favorable": "bg-green-100 text-green-800 border-green-200",
    "Moderate": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Risky": "bg-red-100 text-red-800 border-red-200",
  }[result.classification];

  const ClassificationIcon = {
    "Favorable": CheckCircle2,
    "Moderate": AlertTriangle,
    "Risky": AlertOctagon,
  }[result.classification];

  const handleExport = (format: 'json' | 'xml') => {
    const data = format === 'json' 
      ? JSON.stringify(result, null, 2)
      : `<analysis><region>${result.regionName}</region><index>${result.climateIndex}</index></analysis>`; // Simplified XML for demo
    
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analysis-${result.regionName.toLowerCase().replace(/\s+/g, '-')}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock chart data based on single point result for visual demonstration
  // In a real app, 'result' might contain a timeseries array
  const radarData = [
    { subject: 'Temp', A: (result.details.avgTemp / 40) * 100, fullMark: 100 },
    { subject: 'Humidity', A: result.details.avgHumidity, fullMark: 100 },
    { subject: 'Wind', A: (result.details.avgWind / 100) * 100, fullMark: 100 },
    { subject: 'Pressure', A: ((result.details.avgPressure - 900) / 200) * 100, fullMark: 100 },
    { subject: 'Solar', A: (result.details.avgSolar / 1000) * 100, fullMark: 100 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900">Analysis Report: {result.regionName}</h2>
          <p className="text-sm text-muted-foreground">Period: {result.period.start} to {result.period.end}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
            <Download className="w-4 h-4 mr-2" /> JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('xml')}>
            <Download className="w-4 h-4 mr-2" /> XML
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Climate Index</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold font-serif text-slate-900">{result.climateIndex}</span>
              <Activity className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Overall score (0-100)</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-slate-400 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Classification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border ${classificationColor}`}>
              <ClassificationIcon className="w-4 h-4" />
              {result.classification}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 shadow-sm hover:shadow-md transition-shadow">
           <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Key Metrics Averages</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-full text-blue-600"><Droplets className="w-4 h-4" /></div>
              <div>
                <p className="text-sm font-bold text-slate-700">{result.details.avgHumidity}%</p>
                <p className="text-[10px] text-muted-foreground">Humidity</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-50 rounded-full text-orange-600"><Sun className="w-4 h-4" /></div>
              <div>
                <p className="text-sm font-bold text-slate-700">{result.details.avgTemp}°C</p>
                <p className="text-[10px] text-muted-foreground">Temp</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-50 rounded-full text-slate-600"><Wind className="w-4 h-4" /></div>
              <div>
                <p className="text-sm font-bold text-slate-700">{result.details.avgWind} km/h</p>
                <p className="text-[10px] text-muted-foreground">Wind</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 rounded-full text-indigo-600"><Activity className="w-4 h-4" /></div>
              <div>
                <p className="text-sm font-bold text-slate-700">{result.details.totalPrecip} mm</p>
                <p className="text-[10px] text-muted-foreground">Precipitation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Tabs */}
      <Tabs defaultValue="diagnosis" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="diagnosis">Diagnostic Report</TabsTrigger>
          <TabsTrigger value="charts">Visual Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="diagnosis" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-serif">Diagnostic Factors</CardTitle>
                <CardDescription>Primary contributors to the analysis result.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.diagnosis.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-slate-700 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-serif">Recommendations</CardTitle>
                <CardDescription>Actionable insights based on classification.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.recommendations.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <div className="mt-0.5 p-1 bg-green-50 text-green-700 rounded-full flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      <span className="text-slate-700 leading-relaxed font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charts" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card>
              <CardHeader>
                <CardTitle className="text-lg font-serif">Climate Profile</CardTitle>
                <CardDescription>Multi-axis breakdown of environmental factors.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Region Profile" dataKey="A" stroke="hsl(216 30% 30%)" fill="hsl(216 30% 30%)" fillOpacity={0.3} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle className="text-lg font-serif">Comparison Baseline</CardTitle>
                <CardDescription>Relative to global averages.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                <p>Additional historical trend charts would appear here.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
