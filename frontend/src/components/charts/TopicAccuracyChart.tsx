import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function TopicAccuracyChart({
  topics,
}: {
  topics: { topic: string; accuracy: number }[];
}) {
  return (
    <Bar
      data={{
        labels: topics.map((t) => t.topic),
        datasets: [
          {
            label: 'Accuracy',
            data: topics.map((t) => t.accuracy),
            backgroundColor: topics.map((t) =>
              t.accuracy >= 80 ? '#3DDC97' : t.accuracy >= 60 ? '#FFB020' : '#FF6B5E'
            ),
            borderRadius: 6,
            maxBarThickness: 28,
          },
        ],
      }}
      options={{
        indexAxis: 'y' as const,
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8B93A7' } },
          y: { grid: { display: false }, ticks: { color: '#B9C0CE' } },
        },
      }}
    />
  );
}
