import { type AnalysisRequest, type AnalysisResult, type ClimateRecord } from "@shared/schema";

export function runReasoningEngine(
  regionName: string, 
  records: ClimateRecord[], 
  input: AnalysisRequest
): AnalysisResult {
  
  
  const totalRecs = records.length;
  const avgTemp = records.reduce((sum, r) => sum + r.temperature, 0) / totalRecs;
  const avgHumidity = records.reduce((sum, r) => sum + r.humidity, 0) / totalRecs;
  const avgWind = records.reduce((sum, r) => sum + r.windSpeed, 0) / totalRecs;
  const avgPressure = records.reduce((sum, r) => sum + r.pressure, 0) / totalRecs;
  const avgSolar = records.reduce((sum, r) => sum + r.solarRadiation, 0) / totalRecs;
  const totalPrecip = records.reduce((sum, r) => sum + r.precipitation, 0);


  let rawScore = 0;
  let maxPossibleScore = 0;
  const diagnosis: string[] = [];
  const recommendations: string[] = [];

  const w = input.weights;
  

  const diagnose = (condition: boolean, msg: string) => {
    if (condition) diagnosis.push(msg);
  };

  if (input.type === "comfort") {

    const tempDiff = Math.abs(avgTemp - 22);
    const tempScore = Math.max(0, 100 - (tempDiff * 5)); 
    rawScore += tempScore * w.temperature;
    maxPossibleScore += 100 * w.temperature;
    
    diagnose(avgTemp < 10, "Average temperature is very low, requiring heating.");
    diagnose(avgTemp > 30, "Average temperature is high, creating heat stress risks.");
    diagnose(avgTemp >= 18 && avgTemp <= 26, "Temperature is within the optimal thermal comfort range.");

    
    const humDiff = Math.abs(avgHumidity - 45); 
    const humScore = Math.max(0, 100 - (humDiff * 2));
    rawScore += humScore * w.humidity;
    maxPossibleScore += 100 * w.humidity;

    diagnose(avgHumidity > 70, "High humidity levels may reduce evaporative cooling comfort.");
    
    const windScore = Math.max(0, 100 - (avgWind * 2));
    rawScore += windScore * w.wind;
    maxPossibleScore += 100 * w.wind;

    const pressScore = avgPressure > 1010 ? 90 : (avgPressure < 1000 ? 60 : 80);
    rawScore += pressScore * w.pressure;
    maxPossibleScore += 100 * w.pressure;

  } else if (input.type === "agriculture") {

    const precipScore = Math.min(100, (totalPrecip / 50) * 100); 
    diagnose(totalPrecip < 10, "Precipitation is critically low for most crops without irrigation.");
    diagnose(totalPrecip > 100, "High precipitation detected; ensure drainage systems are adequate.");
    
    const solarScore = Math.min(100, (avgSolar / 200) * 100);

    const tempScore = (avgTemp > 10 && avgTemp < 35) ? 100 : 40;

    rawScore += tempScore * w.temperature + precipScore * 2 + solarScore * 1; 
    maxPossibleScore += 100 * w.temperature + 200 + 100;
    
    if (avgTemp < 5) recommendations.push("Frost protection measures advised.");

  } else if (input.type === "solar") {

    
    const solarScore = Math.min(100, (avgSolar / 800) * 100); 
    diagnose(avgSolar > 600, "Excellent solar irradiance potential.");
    diagnose(avgSolar < 200, "Solar potential is limited by cloud cover or latitude.");

    const tempEfficiency = avgTemp > 25 ? Math.max(0, 100 - (avgTemp - 25) * 2) : 100;

    rawScore += solarScore * 5 + tempEfficiency * w.temperature;
    maxPossibleScore += 500 + 100 * w.temperature;
    
    if (avgSolar > 500) recommendations.push("High potential for PV installation.");

  } else if (input.type === "risk") {

    const windRisk = avgWind > 50 ? 100 : (avgWind / 50) * 100;
    const windSafety = 100 - windRisk;
    diagnose(avgWind > 40, "High wind speeds detected; structural risks increased.");

    const tempRisk = (avgTemp < 0 || avgTemp > 35) ? 100 : 0;
    const tempSafety = 100 - tempRisk;
    diagnose(avgTemp > 35, "Heatwave conditions detected.");
    
    rawScore += windSafety * w.wind + tempSafety * w.temperature;
    maxPossibleScore += 100 * w.wind + 100 * w.temperature;
  }


  const maxPossible = maxPossibleScore || 1; 
  const finalIndex = Math.round((rawScore / maxPossible) * 100);


  let classification: "Favorable" | "Moderate" | "Risky" = "Moderate";
  if (finalIndex >= 75) classification = "Favorable";
  if (finalIndex <= 40) classification = "Risky";


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
