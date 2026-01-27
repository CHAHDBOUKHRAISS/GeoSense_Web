import {
  type Region,
  type ClimateRecord,
  type InsertRegion,
  type InsertClimateRecord
} from "@shared/schema";

/**
 * In-memory mock storage
 * Used for analytical reasoning without persistence
 */

export interface IStorage {
  getRegions(): Promise<Region[]>;
  getRegion(id: number): Promise<Region | undefined>;
  createRegion(region: InsertRegion): Promise<Region>;
  deleteRegion(id: number): Promise<void>;

  getClimateRecords(
    regionId: number,
    startDate: string,
    endDate: string
  ): Promise<ClimateRecord[]>;

  createClimateRecord(record: InsertClimateRecord): Promise<ClimateRecord>;
  deleteClimateRecordsByRegion(regionId: number): Promise<void>;

  countRegions(): Promise<number>;
}

let regions: Region[] = [];
let climateRecords: ClimateRecord[] = [];

let regionIdCounter = 1;
let climateIdCounter = 1;

class MockStorage implements IStorage {
  async getRegions(): Promise<Region[]> {
    return regions;
  }

  async getRegion(id: number): Promise<Region | undefined> {
    return regions.find(r => r.id === id);
  }

  async createRegion(region: InsertRegion): Promise<Region> {
    const newRegion: Region = {
      id: regionIdCounter++,
      ...region
    };
    regions.push(newRegion);
    return newRegion;
  }

  async deleteRegion(id: number): Promise<void> {
    regions = regions.filter(r => r.id !== id);
    climateRecords = climateRecords.filter(c => c.regionId !== id);
  }

  async getClimateRecords(
    regionId: number,
    startDate: string,
    endDate: string
  ): Promise<ClimateRecord[]> {
    return climateRecords.filter(
      c =>
        c.regionId === regionId &&
        c.date >= startDate &&
        c.date <= endDate
    );
  }

  async createClimateRecord(
    record: InsertClimateRecord
  ): Promise<ClimateRecord> {
    const newRecord: ClimateRecord = {
      id: climateIdCounter++,
      ...record
    };
    climateRecords.push(newRecord);
    return newRecord;
  }

  async deleteClimateRecordsByRegion(regionId: number): Promise<void> {
    climateRecords = climateRecords.filter(
      c => c.regionId !== regionId
    );
  }

  async countRegions(): Promise<number> {
    return regions.length;
  }
}

export const storage: IStorage = new MockStorage();