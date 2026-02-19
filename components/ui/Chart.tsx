
import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, ChartData, ChartOptions, BarController, PieController, DoughnutController } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, BarController, PieController, DoughnutController);

interface ChartProps {
  type: 'bar' | 'pie' | 'doughnut';
  data: ChartData<any>;
  options?: ChartOptions<any>;
}

const Chart: React.FC<ChartProps> = ({ type, data, options }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
      chartRef.current = new ChartJS(canvasRef.current, {
        type,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: '#94a3b8', // slate-400
                font: {
                  family: 'inherit'
                }
              }
            },
            tooltip: {
                backgroundColor: '#1e293b', // slate-800
                titleColor: '#e2e8f0',
                bodyColor: '#e2e8f0',
                borderColor: '#334155',
                borderWidth: 1
            }
          },
          scales: type === 'bar' ? {
            x: {
              ticks: { color: '#94a3b8' },
              grid: { color: '#334155' }
            },
            y: {
              ticks: { color: '#94a3b8' },
              grid: { color: '#334155' }
            }
          } : undefined,
          ...options
        }
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [type, data, options]);

  return <canvas ref={canvasRef}></canvas>;
};

export default Chart;
