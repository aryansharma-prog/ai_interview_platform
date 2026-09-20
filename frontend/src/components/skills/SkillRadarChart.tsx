import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface SkillRadarChartProps {
  metrics: {
    label: string;
    value: number;
  }[];
}

export default function SkillRadarChart({ metrics }: SkillRadarChartProps) {
  const data = {
    labels: metrics.map((m) => m.label),
    datasets: [
      {
        label: 'Candidate Competency',
        data: metrics.map((m) => m.value),
        backgroundColor: 'rgba(217, 119, 6, 0.25)', // Signal color with opacity
        borderColor: '#d97706', // Signal amber
        borderWidth: 2,
        pointBackgroundColor: '#d97706',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#d97706',
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(150, 150, 150, 0.15)',
        },
        grid: {
          color: 'rgba(150, 150, 150, 0.15)',
        },
        pointLabels: {
          color: 'rgba(200, 200, 210, 0.85)',
          font: {
            size: 11,
            family: "'Inter', sans-serif",
          },
        },
        ticks: {
          display: false,
          min: 0,
          max: 100,
          stepSize: 20,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1c1917',
        titleColor: '#f5f5f4',
        bodyColor: '#d97706',
        borderColor: 'rgba(217, 119, 6, 0.4)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context: any) => `${context.label}: ${context.raw}%`,
        },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Radar data={data} options={options} />
    </div>
  );
}
