
import React from 'react';
import { HuntResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface ResultsDashboardProps {
  result: HuntResult;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result }) => {
    const metricsData = [
        { name: 'Precision', value: result.metrics.precision },
        { name: 'Recall', value: result.metrics.recall },
        { name: 'F1-Score', value: result.metrics.f1Score },
        { name: 'FP Rate', value: result.metrics.falsePositiveRate },
    ];

    const COLORS = ['#3b82f6', '#10b981', '#f97316', '#ef4444'];

  return (
    <div className="mt-6 bg-gray-800 p-6 rounded-lg border border-gray-700 animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-4">Hunt Results</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-center">
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Duration</p>
          <p className="text-2xl font-bold text-white">{result.duration.toFixed(2)} ms</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Files Scanned</p>
          <p className="text-2xl font-bold text-white">{result.filesScanned}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Rules Applied</p>
          <p className="text-2xl font-bold text-white">{result.rulesApplied}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Total Detections</p>
          <p className="text-2xl font-bold text-red-400">{result.matches.length}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metrics Chart */}
        <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
             <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metricsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#374151', border: 'none', color: '#e5e7eb' }} />
                    <Legend wrapperStyle={{ fontSize: '14px' }}/>
                    <Bar dataKey="value" name="Score" fill="#3b82f6">
                        {metricsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
        
        {/* Detections Report */}
        <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Detections Report (JSON)</h3>
            <div className="bg-gray-900 rounded p-4 h-80 overflow-y-auto">
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                    {JSON.stringify(result.report, null, 2)}
                </pre>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
