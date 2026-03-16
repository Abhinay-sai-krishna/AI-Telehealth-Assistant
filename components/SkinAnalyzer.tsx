import React, { useState, useCallback } from 'react';
import { analyzeSkinImage } from '../services/geminiService';
import { SkinAnalysisResult } from '../types';
import Card from './shared/Card';
import Spinner from './shared/Spinner';

interface SkinAnalyzerProps {
  setResult: (result: SkinAnalysisResult) => void;
}

const SkinAnalyzer: React.FC<SkinAnalyzerProps> = ({ setResult }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SkinAnalysisResult | null>(null);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAnalysisResult(null);
      setError(null);
      setShowHeatmap(false);
    }
  };

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });

  const handleAnalyze = useCallback(async () => {
    if (!imageFile) {
      setError('Please select an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const base64Image = await toBase64(imageFile);
      const result = await analyzeSkinImage(base64Image, imageFile.type);
      setAnalysisResult(result);
      setResult(result);
    } catch (err) {
      setError('An error occurred during analysis. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, setResult]);

  return (
    <Card className="max-w-4xl mx-auto">
      <div className="p-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Skin Photo Analysis</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Upload a clear photo of a skin condition. Our AI will provide a preliminary analysis to help guide your next steps.</p>
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/40 border-l-4 border-yellow-400 dark:border-yellow-500 text-yellow-700 dark:text-yellow-300">
          <p className="font-bold">Disclaimer:</p>
          <p className="text-sm">This is not a medical diagnosis. Always consult a qualified healthcare professional for any health concerns.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
            {imagePreview ? (
              <div className="relative w-full h-64">
                <img src={imagePreview} alt="Skin condition preview" className="w-full h-full object-contain rounded-lg" />
                 {analysisResult && (
                  <div 
                    className={`absolute inset-0 bg-red-500 transition-opacity duration-500 rounded-lg ${showHeatmap ? 'opacity-40' : 'opacity-0'}`}
                    style={{ mixBlendMode: 'multiply' }}
                    aria-hidden="true"
                  ></div>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="mt-2">Image preview will appear here</p>
              </div>
            )}
            <input type="file" id="imageUpload" accept="image/*" onChange={handleImageChange} className="hidden" />
            <label htmlFor="imageUpload" className="mt-4 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
              {imagePreview ? 'Change Image' : 'Select Image'}
            </label>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>}
              {isLoading && <Spinner />}
              {analysisResult && (
                 <div>
                  <h3 className="font-bold text-lg mb-2">Analysis Results</h3>
                  <ul className="space-y-2">
                    {analysisResult.predictions.map((p, index) => (
                      <li key={index} className="flex justify-between items-center text-sm">
                        <span>{p.label}</span>
                        <span className="font-semibold">{`${(p.confidence * 100).toFixed(0)}%`}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 p-3 bg-sky-50 dark:bg-sky-900/40 border-l-4 border-sky-400 dark:border-sky-500 text-sky-800 dark:text-sky-200 rounded-r-lg">
                    <p className="font-bold text-sm">Recommendation:</p>
                    <p className="text-sm">{analysisResult.recommendation}</p>
                  </div>
                  <div className="mt-4">
                    <label className="flex items-center space-x-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={showHeatmap} onChange={() => setShowHeatmap(!showHeatmap)} className="rounded dark:bg-slate-900 border-slate-400 dark:border-slate-500" />
                      <span>Show Saliency Heatmap (Demo)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleAnalyze}
              disabled={!imageFile || isLoading}
              className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Image'}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SkinAnalyzer;
