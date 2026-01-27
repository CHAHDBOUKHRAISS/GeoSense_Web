import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { type AnalysisRequest, type AnalysisResult, type ClimateRecord } from "@shared/schema";
import { runReasoningEngine } from "./engine/climateReasoningEngine";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {


  app.get(api.regions.list.path, async (req, res) => {
    const regions = await storage.getRegions();
    res.json(regions);
  });

  app.get(api.regions.get.path, async (req, res) => {
    const region = await storage.getRegion(Number(req.params.id));
    if (!region) {
      return res.status(404).json({ message: "Region not found" });
    }
    res.json(region);
  });

  app.post(api.regions.create.path, async (req, res) => {
    try {
      const input = api.regions.create.input.parse(req.body);
      
      const newRegion = await storage.createRegion({
        name: input.name,
        latitude: input.latitude,
        longitude: input.longitude,
        description: input.description || `Custom region at ${input.latitude.toFixed(4)}, ${input.longitude.toFixed(4)}`,
      });


      await generateClimateDataForRegion(newRegion.id, input.latitude);

      res.status(201).json(newRegion);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      console.error("Create Region Error:", err);
      res.status(500).json({ message: "Failed to create region" });
    }
  });


  app.delete(api.regions.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const region = await storage.getRegion(id);
    if (!region) {
      return res.status(404).json({ message: "Region not found" });
    }
    await storage.deleteRegion(id);
    res.status(204).send();
  });



  app.post(api.analysis.run.path, async (req, res) => {
    try {
      const input = api.analysis.run.input.parse(req.body);
      
      const region = await storage.getRegion(input.regionId);
      if (!region) {
        return res.status(404).json({ message: "Region not found" });
      }


      const records = await storage.getClimateRecords(input.regionId, input.startDate, input.endDate);
      
      if (records.length === 0) {
        return res.status(400).json({ message: "No climate data available for this region and time period." });
      }

    
      const result = runReasoningEngine(region.name, records, input);
      
      res.json(result);

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Analysis Error:", err);
      res.status(500).json({ message: "Internal Server Error during analysis" });
    }
  });

  await seedDatabase();

  return httpServer;
}


async function generateClimateDataForRegion(regionId: number, latitude: number) {
  const baseDate = new Date("2023-01-01");
  

  const absLat = Math.abs(latitude);
  let baseTemp = 30 - (absLat * 0.5); 
  baseTemp = Math.max(-10, Math.min(40, baseTemp)); 

  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    await storage.createClimateRecord({
      regionId: regionId,
      date: dateStr,
      temperature: baseTemp + (Math.random() * 10 - 5),
      humidity: 40 + Math.random() * 40,
      windSpeed: Math.random() * 30,
      pressure: 1000 + Math.random() * 20,
      solarRadiation: 200 + Math.random() * 600,
      precipitation: Math.random() > 0.8 ? Math.random() * 20 : 0
    });
  }
}

async function seedDatabase() {
  const existing = await storage.countRegions();
  if (existing > 0) return;

  const regionA = await storage.createRegion({
    name: "Coastal Bay Area",
    latitude: 37.7749,
    longitude: -122.4194,
    description: "Marine climate with moderate temperatures."
  });

  const regionB = await storage.createRegion({
    name: "Laayoune, Moroccan Sahara",
    latitude: 27.1253,
    longitude: -13.1625,
    description: "Arid climate with coastal influence, located in the Moroccan Sahara."
  });

  const regionC = await storage.createRegion({
    name: "Dakhla, Moroccan Sahara",
    latitude: 23.6848,
    longitude: -15.9579,
    description: "Coastal desert climate, famous for its bay and solar potential."
  });


  const regions = [regionA, regionB, regionC];
  const baseDate = new Date("2023-01-01");

  for (const reg of regions) {
    for (let i = 0; i < 30; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];


      let baseTemp = 20;
      if (reg.name.includes("Valley")) baseTemp = 30;
      if (reg.name.includes("Alpine")) baseTemp = 5;

      await storage.createClimateRecord({
        regionId: reg.id,
        date: dateStr,
        temperature: baseTemp + (Math.random() * 10 - 5),
        humidity: 40 + Math.random() * 40,
        windSpeed: Math.random() * 30,
        pressure: 1000 + Math.random() * 20,
        solarRadiation: 200 + Math.random() * 600,
        precipitation: Math.random() > 0.8 ? Math.random() * 20 : 0
      });
    }
  }
}
