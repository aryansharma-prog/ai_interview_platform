import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function ProgressChart({
  labels,
  data,
}: {
  labels: string[];
  data: number[];
}) {
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: 'Average score',
            data,
            borderColor: '#FFB020',
            backgroundColor: 'rgba(255,176,32,0.12)',
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointBackgroundColor: '#FFB020',
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#8B93A7' } },
          y: {
            min: 0,
            max: 100,
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#8B93A7' },
          },
        },
      }}
    />
  );
}
