import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeVoiceText } from '../services/geminiService';
import { VoiceAnalysisResult } from '../types';
import Card from './shared/Card';
import Spinner from './shared/Spinner';

interface VoiceAnalyzerProps {
  setResult: (result: VoiceAnalysisResult) => void;
}

// Check for browser support for Web Speech API
// FIX: Cast window to any to access non-standard SpeechRecognition API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

const VoiceAnalyzer: React.FC<VoiceAnalyzerProps> = ({ setResult }) => {
  const [transcript, setTranscript] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VoiceAnalysisResult | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  
  // FIX: Use 'any' for the ref type to avoid type conflicts with the SpeechRecognition variable
  const recognitionRef = useRef<any | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (transcript.trim().length < 20) {
      setError('Please provide a more detailed description of your feelings (at least 20 characters).');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeVoiceText(transcript);
      setAnalysisResult(result);
      setResult(result);
    } catch (err) {
      setError('An error occurred during analysis. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [transcript, setResult]);

  const handleToggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      // onend will handle setting isRecording to false
    } else {
      if (!isSpeechRecognitionSupported) {
        setError("Speech recognition is not supported in your browser. Please type your transcript manually.");
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interim_transcript = '';
        let final_transcript = '';

        for (let i = 0; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final_transcript += transcriptPart + ' ';
          } else {
            interim_transcript += transcriptPart;
          }
        }
        setTranscript(final_transcript + interim_transcript);
      };

      recognition.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}. Please ensure microphone access is granted.`);
        setIsRecording(false); // Force stop on error
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          setTranscript('');
          setAnalysisResult(null);
          setError(null);
          recognition.start();
          setIsRecording(true);
        })
        .catch(err => {
          setError("Microphone access denied. Please allow microphone access in your browser settings and try again.");
          console.error("Microphone access error:", err);
        });
    }
  };

  useEffect(() => {
    // Cleanup function to stop recognition if the component unmounts
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  const getRiskColor = (band: 'Low' | 'Medium' | 'High') => {
    switch (band) {
      case 'Low': return 'text-green-600 dark:text-green-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'High': return 'text-red-600 dark:text-red-400';
      default: return 'text-slate-600 dark:text-slate-300';
    }
  };


  return (
    <Card className="max-w-4xl mx-auto">
      <div className="p-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Voice Mental Health Screening</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Click the microphone to start recording. Speak for 30-60 seconds about how you've been feeling lately. Your speech will be transcribed in real-time.</p>
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/40 border-l-4 border-yellow-400 dark:border-yellow-500 text-yellow-700 dark:text-yellow-300">
          <p className="font-bold">Disclaimer:</p>
          <p className="text-sm">This is a screening tool, not a diagnostic one. It is not a substitute for professional medical advice.</p>
        </div>

        {isSpeechRecognitionSupported && (
          <div className="mt-6 flex flex-col items-center">
            <button
              onClick={handleToggleRecording}
              className={`flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-500 hover:bg-red-600 shadow-lg' : 'bg-sky-600 hover:bg-sky-700 shadow-md'} text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${isRecording ? 'focus:ring-red-500' : 'focus:ring-sky-500'}`}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? <StopIcon /> : <MicIcon />}
            </button>
            <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">{isRecording ? 'Recording...' : 'Tap to start recording'}</p>
          </div>
        )}

        <div className="mt-4">
          <label htmlFor="transcript-textarea" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Transcript
          </label>
          <textarea
            id="transcript-textarea"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={isSpeechRecognitionSupported ? "Your transcribed text will appear here..." : "Your browser does not support speech recognition. Please type your entry here."}
            className="w-full h-40 p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-400 transition"
            disabled={isLoading}
            readOnly={isRecording}
          />
        </div>
        
        <div className="mt-4">
          <button
            onClick={handleAnalyze}
            disabled={!transcript || isLoading || isRecording}
            className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Voice Input'}
          </button>
        </div>

        {error && <p className="text-red-500 dark:text-red-400 text-sm mt-4 text-center">{error}</p>}
        
        {isLoading && <div className="mt-6"><Spinner /></div>}
        
        {analysisResult && (
          <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
            <h3 className="font-bold text-lg mb-4 text-center">Screening Results</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Risk Band</p>
                <p className={`text-2xl font-bold ${getRiskColor(analysisResult.risk_band)}`}>{analysisResult.risk_band}</p>
              </div>
               <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Risk Score</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{analysisResult.risk_score.toFixed(2)}</p>
              </div>
               <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Confidence</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{`${(analysisResult.confidence * 100).toFixed(0)}%`}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Detected Cues:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {analysisResult.cues.map((cue, index) => (
                  <span key={index} className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-xs font-medium px-2 py-1 rounded-full">{cue}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};


const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);
  
const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 6h12v12H6z" />
    </svg>
);

export default VoiceAnalyzer;
