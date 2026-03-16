
export enum AppSection {
  DASHBOARD = 'DASHBOARD',
  SKIN = 'SKIN',
  VOICE = 'VOICE',
  SYMPTOMS = 'SYMPTOMS',
  SUMMARY = 'SUMMARY',
}

export interface SkinPrediction {
  label: string;
  confidence: number;
}

export interface SkinAnalysisResult {
  predictions: SkinPrediction[];
  recommendation: string;
}

export interface VoiceAnalysisResult {
  risk_score: number;
  risk_band: 'Low' | 'Medium' | 'High';
  cues: string[];
  confidence: number;
}

export interface SymptomLog {
  id: string;
  date: Date;
  temperature?: number;
  heartRate?: number;
  spo2?: number;
  symptoms: string[];
  notes: string;
}