import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface GradeDonutChartProps {
  score: number;
  isEditable?: boolean;
  onScoreChange?: (score: number) => void;
}

const getGradeColor = (score: number) => {
    if (score >= 90) return '#10B981'; // Emerald 500
    if (score >= 75) return '#3B82F6'; // Blue 500
    if (score >= 60) return '#F59E0B'; // Amber 500
    return '#EF4444'; // Red 500
};

const GradeDonutChart: React.FC<GradeDonutChartProps> = ({ score, isEditable = false, onScoreChange }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];
  
  const color = getGradeColor(score);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onScoreChange) {
          const newScore = parseInt(e.target.value, 10);
          if (!isNaN(newScore)) {
              onScoreChange(newScore);
          } else if (e.target.value === '') {
              onScoreChange(0);
          }
      }
  }

  return (
    <div className="w-48 h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="100%"
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                >
                    <Cell fill={color} />
                    <Cell fill="#E5E7EB" />
                </Pie>
            </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
             {isEditable ? (
                <input
                    type="number"
                    value={score}
                    onChange={handleInputChange}
                    className="w-24 text-center text-5xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                    style={{ color: color }}
                />
            ) : (
                <span className="text-5xl font-bold" style={{ color: color }}>
                    {score}
                </span>
            )}
             <span className="text-gray-500 text-lg font-medium">/ 100</span>
        </div>
    </div>
  );
};

export default GradeDonutChart;