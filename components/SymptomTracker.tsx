import React, { useState } from 'react';
import { SymptomLog } from '../types';
import Card from './shared/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

interface SymptomTrackerProps {
  logs: SymptomLog[];
  addLog: (log: Omit<SymptomLog, 'id' | 'date'>) => void;
}

const commonSymptoms = ["Headache", "Fever", "Cough", "Fatigue", "Nausea", "Sore Throat"];

const SymptomTracker: React.FC<SymptomTrackerProps> = ({ logs, addLog }) => {
  const { theme } = useTheme();
  const [temperature, setTemperature] = useState<string>('');
  const [heartRate, setHeartRate] = useState<string>('');
  const [spo2, setSpo2] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const handleAddCustomSymptom = () => {
    const newSymptom = customSymptom.trim();
    if (newSymptom && !selectedSymptoms.includes(newSymptom)) {
      setSelectedSymptoms(prev => [...prev, newSymptom]);
      setCustomSymptom('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim() && !temperature && !heartRate && !spo2 && selectedSymptoms.length === 0) {
      setError('Please fill in at least one field.');
      return;
    }
    setError('');
    addLog({
      temperature: temperature ? parseFloat(temperature) : undefined,
      heartRate: heartRate ? parseInt(heartRate) : undefined,
      spo2: spo2 ? parseInt(spo2) : undefined,
      symptoms: selectedSymptoms,
      notes: notes.trim(),
    });
    // Reset form
    setTemperature('');
    setHeartRate('');
    setSpo2('');
    setNotes('');
    setSelectedSymptoms([]);
    setCustomSymptom('');
  };

  const chartData = logs
    .filter(log => log.temperature != null)
    .map(log => ({
      date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: new Date(log.date).toLocaleString(),
      temperature: log.temperature,
    }))
    .reverse();
    
  const chartColors = {
    light: {
      grid: '#e2e8f0',
      axis: '#64748b',
      line: '#0284c7',
      brushFill: '#f1f5f9',
      tooltipBg: 'rgba(255, 255, 255, 0.95)',
      tooltipBorder: '#e2e8f0',
      tooltipLabel: '#0f172a',
    },
    dark: {
      grid: '#334155',
      axis: '#94a3b8',
      line: '#38bdf8',
      brushFill: '#1e293b',
      tooltipBg: 'rgba(30, 41, 59, 0.95)',
      tooltipBorder: '#334155',
      tooltipLabel: '#f1f5f9',
    }
  };

  const currentChartColors = chartColors[theme];

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Log Symptoms & Vitals</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Vitals Inputs */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Temperature (°C)</label>
                <input type="number" step="0.1" value={temperature} onChange={e => setTemperature(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Heart Rate (bpm)</label>
                <input type="number" value={heartRate} onChange={e => setHeartRate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">SpO2 (%)</label>
                <input type="number" value={spo2} onChange={e => setSpo2(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700"/>
              </div>

              {/* Symptom Selector */}
              <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Symptoms</label>
                 <div className="mt-2 flex flex-wrap gap-2">
                    {commonSymptoms.map(symptom => (
                      <button
                        type="button"
                        key={symptom}
                        onClick={() => handleSymptomToggle(symptom)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedSymptoms.includes(symptom) ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}
                      >
                        {symptom}
                      </button>
                    ))}
                 </div>
                 <div className="mt-2 flex items-center">
                    <input 
                        type="text" 
                        value={customSymptom} 
                        onChange={e => setCustomSymptom(e.target.value)}
                        placeholder="Add a custom symptom..."
                        className="flex-grow px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-l-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700"
                    />
                    <button type="button" onClick={handleAddCustomSymptom} className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-r-md hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors text-sm">Add</button>
                 </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700" placeholder="Any additional details..."></textarea>
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button type="submit" className="w-full bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors">Add Log</button>
            </form>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="p-6 h-full">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Health Timeline</h2>
            {logs.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {logs.map(log => (
                        <div key={log.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{new Date(log.date).toLocaleString()}</p>
                            {log.symptoms.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {log.symptoms.map((symptom, i) => (
                                        <span key={i} className="bg-sky-100 text-sky-800 dark:bg-sky-900/70 dark:text-sky-300 text-xs font-medium px-2.5 py-0.5 rounded-full">{symptom}</span>
                                    ))}
                                </div>
                            )}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-2">
                                {log.temperature && <span>Temp: <strong>{log.temperature}°C</strong></span>}
                                {log.heartRate && <span>HR: <strong>{log.heartRate} bpm</strong></span>}
                                {log.spo2 && <span>SpO2: <strong>{log.spo2}%</strong></span>}
                            </div>
                            {log.notes && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">Notes: {log.notes}</p>}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-slate-500 dark:text-slate-400">No logs yet. Add your first entry using the form.</p>
            )}

            {chartData.length > 1 && (
                <div className="mt-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Temperature Trend</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Hover over points for details. Click and drag on the range below to zoom.</p>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={currentChartColors.grid} />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke={currentChartColors.axis} />
                            <YAxis 
                                domain={['dataMin - 1', 'dataMax + 1']} 
                                tick={{ fontSize: 12 }} 
                                stroke={currentChartColors.axis}
                                unit="°C"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: currentChartColors.tooltipBg,
                                    border: `1px solid ${currentChartColors.tooltipBorder}`,
                                    borderRadius: '0.5rem',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                                }}
                                labelStyle={{ color: currentChartColors.tooltipLabel, fontWeight: 'bold', marginBottom: '4px', display: 'block', borderBottom: `1px solid ${currentChartColors.tooltipBorder}`, paddingBottom: '4px' }}
                                itemStyle={{ color: currentChartColors.line, fontWeight: '500' }}
                                formatter={(value: number, name: string) => [`${value.toFixed(1)}°C`, 'Temperature']}
                                labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
                            />
                            <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                            <Line type="monotone" dataKey="temperature" stroke={currentChartColors.line} strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 3 }} />
                            <Brush dataKey="date" height={30} stroke={currentChartColors.line} travellerWidth={20} fill={currentChartColors.brushFill} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </Card>
      </div>
    </div>
  );
};

export default SymptomTracker;
