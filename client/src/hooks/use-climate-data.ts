import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl, type CreateRegionInput } from "@shared/routes";
import { type Region, type AnalysisRequest, type AnalysisResult } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export function useRegions() {
  return useQuery<Region[]>({
    queryKey: [api.regions.list.path],
    queryFn: async () => {
      const res = await fetch(api.regions.list.path);
      if (!res.ok) throw new Error("Failed to fetch regions");
      return api.regions.list.responses[200].parse(await res.json());
    },
  });
}

export function useRegion(id: number | null) {
  return useQuery<Region>({
    queryKey: [api.regions.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error("ID required");
      const url = buildUrl(api.regions.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch region");
      return api.regions.get.responses[200].parse(await res.json());
    },
  });
}

export function useRunAnalysis() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: AnalysisRequest) => {
      const res = await fetch(api.analysis.run.path, {
        method: api.analysis.run.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Analysis failed" }));
        throw new Error(error.message || "Failed to run analysis");
      }

      return (await res.json()) as AnalysisResult;
    },
    onError: (error) => {
      toast({
        title: "Analysis Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "New climate data has been processed successfully.",
      });
    }
  });
}

export function useCreateRegion() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: CreateRegionInput) => {
      const res = await fetch(api.regions.create.path, {
        method: api.regions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to create region" }));
        throw new Error(error.message || "Failed to create region");
      }

      return (await res.json()) as Region;
    },
    onSuccess: (newRegion) => {
      queryClient.invalidateQueries({ queryKey: [api.regions.list.path] });
      toast({
        title: "Region Created",
        description: `"${newRegion.name}" has been added with climate data.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useDeleteRegion() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.regions.delete.path, { id });
      const res = await fetch(url, {
        method: api.regions.delete.method,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to delete region" }));
        throw new Error(error.message || "Failed to delete region");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.regions.list.path] });
      toast({
        title: "Region Deleted",
        description: "The region has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
