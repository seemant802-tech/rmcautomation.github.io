import React, { useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';
import { ConcreteReport } from '../types.ts';

interface DashboardProps {
  reports: ConcreteReport[];
}

const ChartCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-white p-6 rounded-lg shadow-lg border border-gray-200 ${className}`}>
    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">{title}</h3>
    <div className="h-64 relative">
      {children}
    </div>
  </div>
);

const KPICard: React.FC<{ title: string; value: string; description: string }> = ({ title, value, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <p className="text-3xl font-bold text-brand-dark mt-1">{value}</p>
    <p className="text-xs text-gray-400 mt-2">{description}</p>
  </div>
);

const useChart = (type: Chart['config']['type'], data: Chart['config']['data'], options: Chart['config']['options']) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let chart: Chart | null = null;
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        chart = new Chart(ctx, { type, data, options });
      }
    }
    return () => {
      chart?.destroy();
    };
  }, [type, data, options]);

  return <canvas ref={canvasRef} />;
};


const Dashboard: React.FC<DashboardProps> = ({ reports }) => {

  const kpiData = useMemo(() => {
    const analyzedReports = reports.filter(r => r.analysis);
    const totalReports = reports.length;
    
    if (analyzedReports.length === 0) {
      return { total: totalReports, avgScore: 0, passRate: 0 };
    }
    
    const avgScore = analyzedReports.reduce((sum, r) => sum + (r.analysis?.qualityScore || 0), 0) / analyzedReports.length;
    const passedCount = analyzedReports.filter(r => r.analysis?.twentyEightDaysResults?.status === 'Pass').length;
    const passRate = (passedCount / analyzedReports.length) * 100;
    
    return { total: totalReports, avgScore, passRate };
  }, [reports]);

  const clientScoreData = useMemo(() => {
    const scoresByClient: { [key: string]: { total: number; count: number } } = {};
    reports.forEach(r => {
      if (r.clientName && r.analysis?.qualityScore) {
        if (!scoresByClient[r.clientName]) {
          scoresByClient[r.clientName] = { total: 0, count: 0 };
        }
        scoresByClient[r.clientName].total += r.analysis.qualityScore;
        scoresByClient[r.clientName].count++;
      }
    });

    const labels = Object.keys(scoresByClient);
    const data = labels.map(label => scoresByClient[label].total / scoresByClient[label].count);
    
    return {
      labels,
      datasets: [{
        label: 'Average Quality Score',
        data,
        backgroundColor: '#166534',
        borderColor: '#14532d',
        borderWidth: 1,
      }],
    };
  }, [reports]);
  
  const strengthTrendData = useMemo(() => {
    const trendPoints = reports
      .filter(r => r.dateOfCasting && r.analysis?.twentyEightDaysResults?.averageStrength > 0)
      .map(r => ({
        x: new Date(r.dateOfCasting!),
        y: r.analysis!.twentyEightDaysResults.averageStrength,
      }))
      .sort((a, b) => a.x.getTime() - b.x.getTime());
      
    return {
      datasets: [{
        label: '28-Day Avg. Strength (N/mm²)',
        data: trendPoints,
        fill: false,
        borderColor: '#15803d',
        tension: 0.1,
      }],
    };
  }, [reports]);

  const passFailData = useMemo(() => {
    const pass = reports.filter(r => r.analysis?.twentyEightDaysResults?.status === 'Pass').length;
    const fail = reports.filter(r => r.analysis?.twentyEightDaysResults?.status === 'Fail').length;

    return {
      labels: ['Pass', 'Fail'],
      datasets: [{
        label: '28-Day Test Status',
        data: [pass, fail],
        backgroundColor: ['#22c55e', '#ef4444'],
        hoverOffset: 4,
      }],
    };
  }, [reports]);


  const clientScoreChart = useChart('bar', clientScoreData, {
      responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } }
  });
  const strengthTrendChart = useChart('line', strengthTrendData, {
      responsive: true, maintainAspectRatio: false, scales: { x: { type: 'time', time: { unit: 'day' } } }
  });
  const passFailChart = useChart('doughnut', passFailData, {
      responsive: true, maintainAspectRatio: false
  });

  if (reports.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 text-center text-gray-500">
        <h2 className="text-xl font-semibold">Dashboard is Empty</h2>
        <p className="mt-2">Create or import reports to see your quality analysis dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="Total Reports" value={String(kpiData.total)} description="Total number of reports in the system." />
        <KPICard title="Average Quality Score" value={kpiData.avgScore.toFixed(1)} description="Average AI-generated score across all analyzed reports." />
        <KPICard title="28-Day Pass Rate" value={`${kpiData.passRate.toFixed(1)}%`} description="Percentage of reports passing the 28-day strength test." />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Average Quality Score by Client">
              {clientScoreData.labels.length > 0 ? clientScoreChart : <p className="text-center text-gray-500 m-auto">Not enough data to display.</p>}
          </ChartCard>
          <ChartCard title="28-Day Strength Trend">
               {strengthTrendData.datasets[0].data.length > 0 ? strengthTrendChart : <p className="text-center text-gray-500 m-auto">Not enough data to display.</p>}
          </ChartCard>
      </div>
      
      <div className="grid grid-cols-1">
        <ChartCard title="28-Day Test Pass/Fail Ratio" className="lg:max-w-md mx-auto">
            {passFailData.datasets[0].data.some(d => d > 0) ? passFailChart : <p className="text-center text-gray-500 m-auto">No completed 28-day tests.</p>}
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;
