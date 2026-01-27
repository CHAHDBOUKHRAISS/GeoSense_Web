
import { pgTable, text, serial, integer, doublePrecision, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  description: text("description"),
});

export const climateRecords = pgTable("climate_records", {
  id: serial("id").primaryKey(),
  regionId: integer("region_id").notNull(),
  date: date("date").notNull(),
  temperature: doublePrecision("temperature").notNull(), 
  humidity: doublePrecision("humidity").notNull(),
  windSpeed: doublePrecision("wind_speed").notNull(), 
  pressure: doublePrecision("pressure").notNull(), 
  solarRadiation: doublePrecision("solar_radiation").notNull(), 
  precipitation: doublePrecision("precipitation").notNull(), 
});


export const insertRegionSchema = createInsertSchema(regions).omit({ id: true });
export const insertClimateRecordSchema = createInsertSchema(climateRecords).omit({ id: true });

export type Region = typeof regions.$inferSelect;
export type ClimateRecord = typeof climateRecords.$inferSelect;
export type InsertRegion = z.infer<typeof insertRegionSchema>;
export type InsertClimateRecord = z.infer<typeof insertClimateRecordSchema>;



export const analysisTypeSchema = z.enum(["comfort", "agriculture", "solar", "risk"]);
export type AnalysisType = z.infer<typeof analysisTypeSchema>;

export const analysisWeightsSchema = z.object({
  temperature: z.number().min(0).max(10),
  humidity: z.number().min(0).max(10),
  wind: z.number().min(0).max(10),
  pressure: z.number().min(0).max(10),
});
export type AnalysisWeights = z.infer<typeof analysisWeightsSchema>;

export const analysisRequestSchema = z.object({
  regionId: z.coerce.number(),
  startDate: z.string(), 
  endDate: z.string(), 
  type: analysisTypeSchema,
  weights: analysisWeightsSchema,
});
export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;

export interface AnalysisResult {
  regionName: string;
  period: { start: string; end: string };
  climateIndex: number; 
  classification: "Favorable" | "Moderate" | "Risky";
  diagnosis: string[]; 
  details: {
    avgTemp: number;
    avgHumidity: number;
    avgWind: number;
    avgPressure: number;
    avgSolar: number;
    totalPrecip: number;
  };
  recommendations: string[];
}
