
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

interface GradeDonutChartProps {
  score: number;
}

const getGradeColor = (score: number) => {
    if (score >= 90) return '#10B981'; // Emerald 500
    if (score >= 75) return '#3B82F6'; // Blue 500
    if (score >= 60) return '#F59E0B'; // Amber 500
    return '#EF4444'; // Red 500
};

export const GradeDonutChart: React.FC<GradeDonutChartProps> = ({ score }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];
  
  const color = getGradeColor(score);

  return (
    <div style={{ width: '180px', height: '180px', position: 'relative' }}>
        <ResponsiveContainer>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="100%"
                    fill="#8884d8"
                    paddingAngle={0}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                >
                    <Cell fill={color} stroke={color}/>
                    <Cell fill="#E5E7EB" stroke="#E5E7EB"/>
                     <Label 
                        value={`${score}`} 
                        position="center" 
                        fill={color}
                        className="text-5xl font-bold"
                        dy={0}
                    />
                     <Label 
                        value="/ 100" 
                        position="center" 
                        fill="#6B7280"
                        className="text-base"
                        dy={25}
                    />
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    </div>
  );
};
