import React from 'react';
import { AppSection } from '../types';
import Card from './shared/Card';

interface DashboardProps {
  navigateTo: (section: AppSection) => void;
  hasSkinResult: boolean;
  hasVoiceResult: boolean;
  symptomLogCount: number;
}

const FeatureCard: React.FC<{
  title: string;
  description: string;
  // Fix: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  icon: React.ReactElement;
  onClick: () => void;
  status?: string;
}> = ({ title, description, icon, onClick, status }) => (
  <Card onClick={onClick} className="flex flex-col">
    <div className="p-6 flex-grow">
      <div className="flex items-center space-x-4">
        <div className="bg-sky-100 dark:bg-sky-900/70 text-sky-600 dark:text-sky-400 p-3 rounded-full">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          {status && <span className="text-xs font-medium text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/70 px-2 py-0.5 rounded-full">{status}</span>}
        </div>
      </div>
      <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm">{description}</p>
    </div>
    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 text-right text-sm font-semibold text-sky-600 dark:text-sky-400">
        Perform Analysis &rarr;
    </div>
  </Card>
);

const Dashboard: React.FC<DashboardProps> = ({ navigateTo, hasSkinResult, hasVoiceResult, symptomLogCount }) => {
  const features = [
    { 
      id: AppSection.SKIN, 
      title: 'Skin Photo Analysis', 
      description: 'Upload a photo of a skin condition for an AI-powered visual assessment.', 
      icon: <CameraIcon />,
      status: hasSkinResult ? '1 Result' : undefined,
    },
    { 
      id: AppSection.VOICE, 
      title: 'Voice Mental Health', 
      description: 'Record a short voice sample to screen for potential markers of stress or depression.', 
      icon: <MicIcon />,
      status: hasVoiceResult ? '1 Result' : undefined,
    },
    { 
      id: AppSection.SYMPTOMS, 
      title: 'Symptom & Vitals Log', 
      description: 'Track your symptoms and vital signs over time to share with your clinician.', 
      icon: <ChartBarIcon />,
      status: symptomLogCount > 0 ? `${symptomLogCount} ${symptomLogCount > 1 ? 'Entries' : 'Entry'}` : undefined,
    },
  ];

  return (
    <div>
      <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Welcome to your Health Dashboard</h2>
        <p className="text-slate-600 dark:text-slate-300">
          Use the tools below to get AI-powered insights and track your health. All results can be compiled into a summary for your doctor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(feature => (
          <FeatureCard
            key={feature.id}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            onClick={() => navigateTo(feature.id)}
            status={feature.status}
          />
        ))}
      </div>
      
      <div className="mt-8">
        <Card className="!shadow-lg bg-gradient-to-r from-sky-500 to-indigo-500 text-white">
            <div className="p-8">
                <h3 className="text-2xl font-bold">Ready for a Consultation?</h3>
                <p className="mt-2 opacity-90">
                    Once you've used the tools, you can generate a comprehensive summary of your results to share with a healthcare provider.
                </p>
                <button
                    onClick={() => navigateTo(AppSection.SUMMARY)}
                    className="mt-6 bg-white text-sky-600 font-bold py-2 px-6 rounded-lg shadow-md hover:bg-slate-100 transition-colors"
                >
                    Generate Clinician Summary
                </button>
            </div>
        </Card>
      </div>
    </div>
  );
};

// SVG Icons
const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const ChartBarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9.5M9 19V5M12 19v-4a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2zm0 0V9.5" />
  </svg>
);


export default Dashboard;
