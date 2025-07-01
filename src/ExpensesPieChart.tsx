import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';

// Registramos los elementos que nuestro gráfico de pastel necesita
ChartJS.register(ArcElement, Tooltip, Legend);

// Definimos los 'props' que nuestro componente recibirá
interface PieChartProps {
  chartData: ChartData<'pie'>;
}

export const ExpensesPieChart: React.FC<PieChartProps> = ({ chartData }) => {
  return (
    <div className="flex-1 p-6 border border-[#d7e0db] rounded-xl bg-white flex justify-center items-center min-h-[300px]">
      <Pie 
        data={chartData} 
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: true,
              text: 'Distribución de Gastos',
              font: {
                size: 18
              }
            }
          }
        }} 
      />
    </div>
  );
};