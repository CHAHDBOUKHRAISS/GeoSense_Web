import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useRegions, useRunAnalysis, useCreateRegion } from "@/hooks/use-climate-data";
import { analysisRequestSchema } from "@shared/schema";
import { createRegionInputSchema } from "@shared/routes";
import { AnalysisMap } from "@/components/AnalysisMap";
import { ResultsDashboard } from "@/components/ResultsDashboard";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Settings2, Globe, MapPin, Plus } from "lucide-react";

export default function Dashboard() {
  const { data: regions = [], isLoading: isLoadingRegions } = useRegions();
  const { mutate: runAnalysis, isPending: isAnalyzing, data: analysisResult } = useRunAnalysis();
  const { mutate: createRegion, isPending: isCreatingRegion } = useCreateRegion();
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [pendingMarker, setPendingMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRegionName, setNewRegionName] = useState("");

  const form = useForm<z.infer<typeof analysisRequestSchema>>({
    resolver: zodResolver(analysisRequestSchema),
    defaultValues: {
      type: "comfort",
      startDate: "2023-01-01",
      endDate: "2023-01-30",
      weights: {
        temperature: 5,
        humidity: 5,
        wind: 5,
        pressure: 5,
      },
      regionId: 0,
    },
  });

  const onSubmit = (data: z.infer<typeof analysisRequestSchema>) => {
    runAnalysis(data);
  };

  const handleRegionSelect = (id: number) => {
    setSelectedRegionId(id);
    form.setValue("regionId", id);
    setPendingMarker(null);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setPendingMarker({ lat, lng });
    setNewRegionName("");
    setShowCreateDialog(true);
  };

  const handleCreateRegion = () => {
    if (!pendingMarker || !newRegionName.trim()) return;
    
    createRegion({
      name: newRegionName.trim(),
      latitude: pendingMarker.lat,
      longitude: pendingMarker.lng,
    }, {
      onSuccess: (newRegion) => {
        setShowCreateDialog(false);
        setPendingMarker(null);
        setNewRegionName("");
        handleRegionSelect(newRegion.id);
      }
    });
  };

  const handleCancelCreate = () => {
    setShowCreateDialog(false);
    setPendingMarker(null);
    setNewRegionName("");
  };

  if (isLoadingRegions) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Loading geospatial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <header className="h-14 border-b bg-white flex items-center px-6 shadow-sm z-20 shrink-0">
        <div className="flex items-center gap-2 text-primary font-bold text-xl font-serif">
          <Globe className="w-6 h-6" />
          <span>GeoSense Web – Regional Climate Analysis</span>
        </div>
        <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {regions.length} regions
          </span>
          <div className="h-4 w-px bg-slate-200" />
          <span className="font-mono text-xs">v1.0.5</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 bg-white border-r flex flex-col shrink-0 z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Settings2 className="w-5 h-5 text-slate-500" />
                <h2 className="font-serif font-bold text-lg text-slate-800">Configuration</h2>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Analysis Model</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-analysis-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="comfort">Human Comfort Index</SelectItem>
                            <SelectItem value="agriculture">Agricultural Viability</SelectItem>
                            <SelectItem value="solar">Solar Potential</SelectItem>
                            <SelectItem value="risk">Climate Risk Assessment</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          Defines the algorithm used for classification.
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-start-date" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-end-date" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900">Variable Weights</h3>
                    
                    <FormField
                      control={form.control}
                      name="weights.temperature"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between mb-1">
                            <FormLabel className="text-xs">Temperature</FormLabel>
                            <span className="text-xs font-mono text-muted-foreground">{field.value}</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={0}
                              max={10}
                              step={1}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              data-testid="slider-temperature"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="weights.humidity"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between mb-1">
                            <FormLabel className="text-xs">Humidity</FormLabel>
                            <span className="text-xs font-mono text-muted-foreground">{field.value}</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={0}
                              max={10}
                              step={1}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              data-testid="slider-humidity"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="weights.wind"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between mb-1">
                            <FormLabel className="text-xs">Wind Speed</FormLabel>
                            <span className="text-xs font-mono text-muted-foreground">{field.value}</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={0}
                              max={10}
                              step={1}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              data-testid="slider-wind"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="weights.pressure"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between mb-1">
                            <FormLabel className="text-xs">Atm. Pressure</FormLabel>
                            <span className="text-xs font-mono text-muted-foreground">{field.value}</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={0}
                              max={10}
                              step={1}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              data-testid="slider-pressure"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full font-semibold shadow-md"
                    disabled={!selectedRegionId || isAnalyzing}
                    data-testid="button-run-analysis"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Run Analysis"
                    )}
                  </Button>
                  {!selectedRegionId && (
                    <p className="text-xs text-destructive text-center">Select a region on the map first.</p>
                  )}
                </form>
              </Form>
            </div>
          </ScrollArea>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50/50">
          <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
            
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3 border-b bg-white/50">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg font-serif">Geospatial Selection</CardTitle>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Plus className="w-3 h-3" />
                    Click map to add region
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <AnalysisMap 
                  regions={regions} 
                  selectedRegionId={selectedRegionId} 
                  onSelectRegion={handleRegionSelect}
                  onMapClick={handleMapClick}
                  pendingMarker={pendingMarker}
                />
              </CardContent>
            </Card>

            <div id="results-anchor">
              <ResultsDashboard result={analysisResult || null} />
            </div>

          </div>
        </main>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Add New Region
            </DialogTitle>
            <DialogDescription>
              Name this location to add it as a new analysis region. 
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="region-name">Region Name</Label>
              <Input
                id="region-name"
                placeholder="e.g., Northern Valley, Coastal Zone..."
                value={newRegionName}
                onChange={(e) => setNewRegionName(e.target.value)}
                data-testid="input-new-region-name"
              />
            </div>
            {pendingMarker && (
              <div className="text-xs text-muted-foreground bg-slate-100 p-2 rounded">
                <span className="font-medium">Coordinates:</span> {pendingMarker.lat.toFixed(4)}, {pendingMarker.lng.toFixed(4)}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancelCreate} data-testid="button-cancel-create">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateRegion} 
              disabled={!newRegionName.trim() || isCreatingRegion}
              data-testid="button-confirm-create"
            >
              {isCreatingRegion ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Region"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
