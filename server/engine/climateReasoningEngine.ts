import { type AnalysisRequest, type AnalysisResult, type ClimateRecord } from "@shared/schema";

// ==========================================
// REASONING ENGINE (Deterministic, Rule-Based)
// ==========================================

export function runReasoningEngine(
  regionName: string, 
  records: ClimateRecord[], 
  input: AnalysisRequest
): AnalysisResult {
  
  // 1. Aggregation
  const totalRecs = records.length;
  const avgTemp = records.reduce((sum, r) => sum + r.temperature, 0) / totalRecs;
  const avgHumidity = records.reduce((sum, r) => sum + r.humidity, 0) / totalRecs;
  const avgWind = records.reduce((sum, r) => sum + r.windSpeed, 0) / totalRecs;
  const avgPressure = records.reduce((sum, r) => sum + r.pressure, 0) / totalRecs;
  const avgSolar = records.reduce((sum, r) => sum + r.solarRadiation, 0) / totalRecs;
  const totalPrecip = records.reduce((sum, r) => sum + r.precipitation, 0);

  // 2. Score Calculation (0-100) based on Analysis Type
  let rawScore = 0;
  let maxPossibleScore = 0;
  const diagnosis: string[] = [];
  const recommendations: string[] = [];

  // Weights normalization
  const w = input.weights;
  
  // Helper to add reasoning
  const diagnose = (condition: boolean, msg: string) => {
    if (condition) diagnosis.push(msg);
  };

  if (input.type === "comfort") {
    // Human Comfort: Moderate temps, low humidity, low wind preferred
    // Ideal: Temp 20-25, Hum 30-50, Wind < 10

    // Temperature Score (40%)
    const tempDiff = Math.abs(avgTemp - 22); // Distance from ideal 22
    const tempScore = Math.max(0, 100 - (tempDiff * 5)); 
    rawScore += tempScore * w.temperature;
    maxPossibleScore += 100 * w.temperature;
    
    diagnose(avgTemp < 10, "Average temperature is very low, requiring heating.");
    diagnose(avgTemp > 30, "Average temperature is high, creating heat stress risks.");
    diagnose(avgTemp >= 18 && avgTemp <= 26, "Temperature is within the optimal thermal comfort range.");

    // Humidity Score (30%)
    const humDiff = Math.abs(avgHumidity - 45); // Distance from ideal 45
    const humScore = Math.max(0, 100 - (humDiff * 2));
    rawScore += humScore * w.humidity;
    maxPossibleScore += 100 * w.humidity;

    diagnose(avgHumidity > 70, "High humidity levels may reduce evaporative cooling comfort.");
    
    // Wind Score (20%) - low wind is better usually, unless hot
    const windScore = Math.max(0, 100 - (avgWind * 2));
    rawScore += windScore * w.wind;
    maxPossibleScore += 100 * w.wind;

    // Pressure (10%) - stable high pressure usually good weather
    const pressScore = avgPressure > 1010 ? 90 : (avgPressure < 1000 ? 60 : 80);
    rawScore += pressScore * w.pressure;
    maxPossibleScore += 100 * w.pressure;

  } else if (input.type === "agriculture") {
    // Agriculture: Needs rain, sun, moderate temps
    
    // Precip Score (needs > 0)
    const precipScore = Math.min(100, (totalPrecip / 50) * 100); // 50mm arbitrary baseline for period
    diagnose(totalPrecip < 10, "Precipitation is critically low for most crops without irrigation.");
    diagnose(totalPrecip > 100, "High precipitation detected; ensure drainage systems are adequate.");
    
    // Solar (photosynthesis)
    const solarScore = Math.min(100, (avgSolar / 200) * 100);
    
    // Temp (growing degree days proxy)
    const tempScore = (avgTemp > 10 && avgTemp < 35) ? 100 : 40;

    rawScore += tempScore * w.temperature + precipScore * 2 + solarScore * 1; // Custom weights logic + user weights
    maxPossibleScore += 100 * w.temperature + 200 + 100;
    
    if (avgTemp < 5) recommendations.push("Frost protection measures advised.");

  } else if (input.type === "solar") {
    // Solar Energy: High solar, low clouds (high pressure proxy), low temp (efficiency)
    
    // Solar Score
    const solarScore = Math.min(100, (avgSolar / 800) * 100); // 800 W/m2 peak
    diagnose(avgSolar > 600, "Excellent solar irradiance potential.");
    diagnose(avgSolar < 200, "Solar potential is limited by cloud cover or latitude.");

    // Panels lose efficiency at high temps
    const tempEfficiency = avgTemp > 25 ? Math.max(0, 100 - (avgTemp - 25) * 2) : 100;

    rawScore += solarScore * 5 + tempEfficiency * w.temperature;
    maxPossibleScore += 500 + 100 * w.temperature;
    
    if (avgSolar > 500) recommendations.push("High potential for PV installation.");

  } else if (input.type === "risk") {
    // Risk: Extreme events. High wind, High Precip, Extreme Temps
    // Here, HIGHER score means HIGHER SAFETY (Lower Risk)
    
    // Wind Risk
    const windRisk = avgWind > 50 ? 100 : (avgWind / 50) * 100;
    const windSafety = 100 - windRisk;
    diagnose(avgWind > 40, "High wind speeds detected; structural risks increased.");

    // Temp Risk (Freezing or Heatwave)
    const tempRisk = (avgTemp < 0 || avgTemp > 35) ? 100 : 0;
    const tempSafety = 100 - tempRisk;
    diagnose(avgTemp > 35, "Heatwave conditions detected.");
    
    rawScore += windSafety * w.wind + tempSafety * w.temperature;
    maxPossibleScore += 100 * w.wind + 100 * w.temperature;
  }

  // 3. Final Index Calculation
  const maxPossible = maxPossibleScore || 1; // Avoid divide by zero
  const finalIndex = Math.round((rawScore / maxPossible) * 100);

  // 4. Classification
  let classification: "Favorable" | "Moderate" | "Risky" = "Moderate";
  if (finalIndex >= 75) classification = "Favorable";
  if (finalIndex <= 40) classification = "Risky";

  // 5. Default Diagnosis if empty
  if (diagnosis.length === 0) {
    diagnosis.push("Conditions are nominal based on the selected parameters.");
  }
  
  if (recommendations.length === 0) {
    if (classification === "Favorable") recommendations.push("No specific interventions required.");
    if (classification === "Risky") recommendations.push("Review safety protocols and mitigation strategies.");
  }

  return {
    regionName,
    period: { start: input.startDate, end: input.endDate },
    climateIndex: finalIndex,
    classification,
    diagnosis,
    details: {
      avgTemp: Math.round(avgTemp * 10) / 10,
      avgHumidity: Math.round(avgHumidity * 10) / 10,
      avgWind: Math.round(avgWind * 10) / 10,
      avgPressure: Math.round(avgPressure),
      avgSolar: Math.round(avgSolar),
      totalPrecip: Math.round(totalPrecip * 10) / 10,
    },
    recommendations
  };
}
