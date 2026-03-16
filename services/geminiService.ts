
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { SkinAnalysisResult, VoiceAnalysisResult, SymptomLog } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export const analyzeSkinImage = async (base64Image: string, mimeType: string): Promise<SkinAnalysisResult> => {
  const imagePart = fileToGenerativePart(base64Image, mimeType);
  
  const prompt = `You are a dermatology assistant AI. Analyze the provided image of a skin condition. 
  Based on visual characteristics, provide a list of the top 3 most likely conditions with estimated confidence scores. 
  Also, provide a brief, clear recommendation for the user. The recommendation should be cautious and always suggest consulting a healthcare professional.
  Do not provide a diagnosis. Present the information as if you are providing possibilities for a clinician to review.`;
  
  const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, {text: prompt}] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  confidence: { type: Type.NUMBER }
                },
                required: ["label", "confidence"]
              }
            },
            recommendation: { type: Type.STRING }
          },
          required: ["predictions", "recommendation"]
        },
      }
  });
  
  const jsonText = response.text.trim();
  return JSON.parse(jsonText);
};

export const analyzeVoiceText = async (transcript: string): Promise<VoiceAnalysisResult> => {
    const prompt = `You are a mental health screening assistant AI. Analyze the following text, which is a transcript of a person speaking about their feelings for 30-60 seconds.
    Based on the text, assess the potential risk for stress or depression. Provide a risk score from 0.0 to 1.0, a risk band ('Low', 'Medium', or 'High'), a list of detected linguistic cues (e.g., "low energy", "monotone speech", "negative sentiment"), and a confidence score for your overall assessment.
    This is a screening tool, not a diagnostic one. Your output must be cautious.
    Transcript: "${transcript}"`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              risk_score: { type: Type.NUMBER },
              risk_band: { type: Type.STRING },
              cues: { type: Type.ARRAY, items: { type: Type.STRING } },
              confidence: { type: Type.NUMBER }
            },
            required: ["risk_score", "risk_band", "cues", "confidence"]
          }
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};


export const generateClinicianSummary = async (data: { skin: SkinAnalysisResult | null; voice: VoiceAnalysisResult | null; symptoms: SymptomLog[] }): Promise<string> => {
    const prompt = `
      You are an AI assistant for clinicians. Generate a concise, well-structured pre-visit summary based on the following patient-provided data. Use markdown for formatting.

      **PATIENT DATA:**

      **1. Skin Analysis Results:**
      ${data.skin ? 
        ` - Predictions: ${data.skin.predictions.map(p => `${p.label} (${(p.confidence * 100).toFixed(0)}%)`).join(', ')}\n - Patient Recommendation Given: ${data.skin.recommendation}` : 
        'No skin analysis performed.'
      }

      **2. Voice-Based Mental Health Screening:**
      ${data.voice ? 
        ` - Risk Band: ${data.voice.risk_band} (Score: ${data.voice.risk_score.toFixed(2)})\n - Detected Cues: ${data.voice.cues.join(', ')}\n - Assessment Confidence: ${(data.voice.confidence * 100).toFixed(0)}%` : 
        'No voice analysis performed.'
      }

      **3. Symptom & Vitals Log (most recent first):**
      ${data.symptoms.length > 0 ? 
        data.symptoms.map(log => 
          ` - **Date:** ${log.date.toLocaleString()}\n   - Symptoms: ${log.symptoms.length > 0 ? log.symptoms.join(', ') : 'None reported'}\n   - Vitals: Temp: ${log.temperature || 'N/A'}°C, HR: ${log.heartRate || 'N/A'} bpm, SpO2: ${log.spo2 || 'N/A'}%\n   - Notes: ${log.notes || 'N/A'}`
        ).join('\n') : 
        'No symptoms logged.'
      }

      **INSTRUCTIONS:**
      Synthesize the above information into a clinical summary. Highlight any potential correlations or areas of concern (e.g., high stress score combined with reports of skin flare-ups). Start with a "Key Alerts" section for any high-risk findings.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return response.text;
};