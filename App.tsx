import React, { useState, useMemo } from 'react';
import { AppSection, SkinAnalysisResult, VoiceAnalysisResult, SymptomLog } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SkinAnalyzer from './components/SkinAnalyzer';
import VoiceAnalyzer from './components/VoiceAnalyzer';
import SymptomTracker from './components/SymptomTracker';
import ClinicianSummary from './components/ClinicianSummary';

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<AppSection>(AppSection.DASHBOARD);
  const [skinResult, setSkinResult] = useState<SkinAnalysisResult | null>(null);
  const [voiceResult, setVoiceResult] = useState<VoiceAnalysisResult | null>(null);
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([]);

  const addSymptomLog = (log: Omit<SymptomLog, 'id' | 'date'>) => {
    const newLog: SymptomLog = {
      ...log,
      id: new Date().toISOString(),
      date: new Date(),
    };
    setSymptomLogs(prevLogs => [...prevLogs, newLog].sort((a, b) => b.date.getTime() - a.date.getTime()));
  };
  
  const summaryData = useMemo(() => ({
    skin: skinResult,
    voice: voiceResult,
    symptoms: symptomLogs,
  }), [skinResult, voiceResult, symptomLogs]);

  const renderSection = () => {
    switch (currentSection) {
      case AppSection.SKIN:
        return <SkinAnalyzer setResult={setSkinResult} />;
      case AppSection.VOICE:
        return <VoiceAnalyzer setResult={setVoiceResult} />;
      case AppSection.SYMPTOMS:
        return <SymptomTracker logs={symptomLogs} addLog={addSymptomLog} />;
      case AppSection.SUMMARY:
        return <ClinicianSummary data={summaryData} />;
      case AppSection.DASHBOARD:
      default:
        return (
          <Dashboard 
            navigateTo={setCurrentSection}
            hasSkinResult={!!skinResult}
            hasVoiceResult={!!voiceResult}
            symptomLogCount={symptomLogs.length}
          />
        );
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200">
      <Header onHomeClick={() => setCurrentSection(AppSection.DASHBOARD)} />
      <main className="container mx-auto p-4 md:p-8">
        {currentSection !== AppSection.DASHBOARD && (
          <button
            onClick={() => setCurrentSection(AppSection.DASHBOARD)}
            className="mb-6 text-sm font-medium text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>
        )}
        {renderSection()}
      </main>
      <footer className="text-center p-4 text-xs text-slate-500 dark:text-slate-400">
        <p>Integrated Telehealth Assistant - Hackathon Demo. Not for medical use.</p>
      </footer>
    </div>
  );
};

export default App;
