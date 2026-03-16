import React, { useState, useEffect } from 'react';
import { generateClinicianSummary } from '../services/geminiService';
import { SkinAnalysisResult, VoiceAnalysisResult, SymptomLog } from '../types';
import Card from './shared/Card';
import Spinner from './shared/Spinner';

interface ClinicianSummaryProps {
  data: {
    skin: SkinAnalysisResult | null;
    voice: VoiceAnalysisResult | null;
    symptoms: SymptomLog[];
  };
}

const ClinicianSummary: React.FC<ClinicianSummaryProps> = ({ data }) => {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!data.skin && !data.voice && data.symptoms.length === 0) {
            setSummary("No data available to generate a summary. Please use the analysis tools first.");
        } else {
            const result = await generateClinicianSummary(data);
            setSummary(result);
        }
      } catch (err) {
        setError('Failed to generate summary. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // A simple markdown to HTML converter for display
  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <h3 key={index} className="text-lg font-bold mt-4 mb-2 text-slate-900 dark:text-slate-100">{line.substring(2, line.length - 2)}</h3>;
        }
        if (line.startsWith('* ')) {
          return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
        }
        if (line.startsWith(' - ')) {
           return <p key={index} className="ml-4">{line}</p>;
        }
        return <p key={index}>{line || <br />}</p>;
      })
      .reduce((acc, el, i) => {
        if (el.type === 'li') {
          if (i > 0 && acc[acc.length - 1].type === 'ul') {
            // FIX: Cast props to `any` to allow mutating the children array.
            (acc[acc.length - 1].props as any).children.push(el);
          } else {
            acc.push(<ul key={`ul-${i}`} className="space-y-1">{[el]}</ul>);
          }
        } else {
          acc.push(el);
        }
        return acc;
        // Fix: Replaced JSX.Element[] with React.ReactElement[] to resolve "Cannot find namespace 'JSX'" error.
      }, [] as React.ReactElement[]);
  };


  return (
    <Card className="max-w-4xl mx-auto">
      <div className="p-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Clinician Pre-Visit Summary</h2>
        <div className="flex justify-between items-center mb-6 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg">
            <p className="text-slate-600 dark:text-slate-300 text-sm">This AI-generated summary can be shared with your healthcare provider.</p>
            <button
                onClick={() => window.print()}
                className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors text-sm flex items-center space-x-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h6a2 2 0 002-2v-3h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                <span>Print / Save as PDF</span>
            </button>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <Spinner />
            <p className="mt-4 text-slate-500 dark:text-slate-400">Generating summary...</p>
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div>
            {renderMarkdown(summary)}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ClinicianSummary;
