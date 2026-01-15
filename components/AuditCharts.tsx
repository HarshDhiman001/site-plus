
import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { CategoryResult } from '../types';

interface ScoreRadialProps {
  score: number;
}

export const OverallScoreChart: React.FC<ScoreRadialProps> = ({ score }) => {
  const data = [
    { name: 'Max', value: 100, fill: '#f1f5f9' }, // slate-100 for empty track
    { name: 'Score', value: score, fill: score > 89 ? '#16a34a' : score > 69 ? '#ea580c' : '#dc2626' },
  ];

  return (
    <div className="h-64 w-full relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={20} data={data} startAngle={90} endAngle={-270}>
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-5xl font-extrabold text-slate-900">{score}</span>
        <span className="text-slate-500 text-sm uppercase tracking-wide font-semibold">Overall</span>
      </div>
    </div>
  );
};

interface CategoryBarProps {
  categories: CategoryResult[];
}

export const CategoryBarChart: React.FC<CategoryBarProps> = ({ categories }) => {
  const data = categories.map(c => ({
    name: c.name,
    score: c.score,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis dataKey="name" type="category" width={100} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} />
          <Tooltip 
            cursor={{fill: 'rgba(0,0,0,0.05)'}}
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
             {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.score > 89 ? '#16a34a' : entry.score > 69 ? '#ea580c' : '#dc2626'} />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
