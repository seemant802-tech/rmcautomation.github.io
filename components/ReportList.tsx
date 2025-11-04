import React from 'react';
import { ConcreteReport } from '../types.ts';
import { EyeIcon } from './icons/EyeIcon.tsx';
import { PlusCircleIcon } from './icons/PlusCircleIcon.tsx';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon.tsx';
import { DocumentArrowUpIcon } from './icons/DocumentArrowUpIcon.tsx';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon.tsx';

interface ReportListProps {
  reports: ConcreteReport[];
  onSelectReport: (id: string) => void;
  onCreateNew: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onExportTemplate: () => void;
  onBackToLogin?: () => void;
  isGuest?: boolean;
}

const calculateAverageStrength = (report: ConcreteReport, period: 'seven' | 'twentyEight'): number => {
  const cubeSize = report.cubeSize || '150';
  
  const calculateStrength = (loadStr: string | undefined, sizeStr: string): number => {
    if (!loadStr) return 0;
    const load = parseFloat(loadStr);
    const size = parseFloat(sizeStr);
    if (isNaN(load) || isNaN(size) || size === 0 || load === 0) {
        return 0;
    }
    return (load * 1000) / (size * size);
  };

  const loads = [
    report[`${period}DaysLoad1` as keyof ConcreteReport] as string | undefined,
    report[`${period}DaysLoad2` as keyof ConcreteReport] as string | undefined,
    report[`${period}DaysLoad3` as keyof ConcreteReport] as string | undefined,
  ];

  const strengths = loads.map(load => calculateStrength(load, cubeSize));
  const validStrengths = strengths.filter(s => s > 0);

  if (validStrengths.length === 0) {
    return 0;
  }

  return validStrengths.reduce((a, b) => a + b, 0) / validStrengths.length;
};


const ReportList: React.FC<ReportListProps> = ({ reports, onSelectReport, onCreateNew, onExport, onImport, onExportTemplate, onBackToLogin, isGuest }) => {
  const importInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    importInputRef.current?.click();
  };
  
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImport(e.target.files[0]);
      e.target.value = ''; // Reset input to allow re-importing the same file
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b pb-4 gap-4">
        <div className="flex items-center gap-4">
          {isGuest && onBackToLogin && (
            <button onClick={onBackToLogin} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Login
            </button>
          )}
          <h2 className="text-xl font-semibold text-gray-800">Concrete Quality Reports</h2>
        </div>
        {!isGuest && (
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleImportClick} className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition">
            <DocumentArrowUpIcon className="h-5 w-5 mr-2" /> Import (.xlsx)
          </button>
          <input type="file" ref={importInputRef} onChange={handleFileSelected} className="hidden" accept=".xlsx, .xls" />
          
          <button onClick={onExport} className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition">
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" /> Export All (.xlsx)
          </button>
          
          <button onClick={onExportTemplate} className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition">
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" /> Download Template
          </button>
          
          <button onClick={onCreateNew} className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-dark transition">
            <PlusCircleIcon className="h-5 w-5 mr-2" /> Create New Report
          </button>
        </div>
        )}
      </div>
      <div className="overflow-x-auto">
        {reports.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No reports found.</p>
            <p className="text-sm mt-1">Create a new report or import data to get started.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref No.</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Casting Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                 <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">7d Strength (N/mm²)</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">28d Strength (N/mm²)</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quality Score</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => {
                const sevenDayStrength = report.analysis?.sevenDaysResults?.averageStrength ?? calculateAverageStrength(report, 'seven');
                const twentyEightDayStrength = report.analysis?.twentyEightDaysResults?.averageStrength ?? calculateAverageStrength(report, 'twentyEight');

                return (
                  <tr key={report.uniqueRefNo} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.uniqueRefNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.clientName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.dateOfCasting}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.grade}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center font-mono">
                      {sevenDayStrength > 0 ? sevenDayStrength.toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center font-mono">
                      {twentyEightDayStrength > 0 ? twentyEightDayStrength.toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center font-mono">
                      {report.analysis ? report.analysis.qualityScore : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => onSelectReport(report.uniqueRefNo)} className="text-brand-primary hover:text-brand-dark flex items-center gap-1 ml-auto">
                        <EyeIcon className="h-4 w-4" /> {isGuest ? 'View' : 'View/Edit'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReportList;