import React from 'react';
// Fix: Add file extension to import.
import { ConcreteReport, TestResults } from '../types.ts';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon.tsx';
import { PaperClipIcon } from './icons/PaperClipIcon.tsx';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon.tsx';

interface ReportDisplayProps {
  report: ConcreteReport;
}

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const getScoreColor = () => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className={`px-4 py-2 rounded-lg text-center ${getScoreColor()} border`}>
      <div className="text-sm font-medium">Overall Quality Score</div>
      <div className="text-3xl font-bold">{score}</div>
    </div>
  );
};

const TestResultsDisplay: React.FC<{ title: string; results?: TestResults; mediaBlob?: Blob }> = ({ title, results, mediaBlob }) => {
    if (!results || !results.averageStrength) return (
      <div>
        <h4 className="text-md font-semibold text-gray-700 mb-2">{title}</h4>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center text-gray-500">
          Awaiting test data.
        </div>
      </div>
    );

    const statusColor = results.status.toLowerCase() === 'pass' 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800';

    return (
        <div>
            <h4 className="text-md font-semibold text-gray-700 mb-2">{title}</h4>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Average Strength</p>
                    <p className="font-mono text-3xl font-bold text-brand-dark mt-1">
                        {results.averageStrength.toFixed(2)}
                        <span className="text-lg font-medium text-gray-500"> N/mm²</span>
                    </p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                    <span className="font-semibold text-gray-600">Status:</span>
                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${statusColor}`}>{results.status}</span>
                </div>
                <div>
                    <span className="font-semibold text-gray-600 block mb-1">Individual Strengths (N/mm²):</span>
                     <div className="grid grid-cols-3 gap-2 text-center">
                        {results.strengths.map((s, i) => (
                           <div key={i} className="bg-white p-2 border rounded-md font-mono text-sm">{s.toFixed(2)}</div>
                        ))}
                    </div>
                </div>
                {mediaBlob && (
                  <div className="pt-3 border-t">
                    <a href={URL.createObjectURL(mediaBlob)} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:underline">
                      <PaperClipIcon className="h-4 w-4 mr-1" /> View Attached CTM Media
                    </a>
                  </div>
                )}
            </div>
        </div>
    )
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ report }) => {
  if (!report.analysis) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No analysis has been generated for this report yet.</p>
        <p className="text-sm mt-2">Enter test results in the form and save to generate the analysis.</p>
      </div>
    );
  }

  const { analysis } = report;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="p-4 bg-brand-light rounded-lg">
        <h3 className="text-lg font-semibold text-brand-dark mb-2">Analysis Summary</h3>
        <p className="text-gray-700">{analysis.summary}</p>
      </div>
      
      <ScoreBadge score={analysis.qualityScore} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TestResultsDisplay title="7-Day Test Results" results={analysis.sevenDaysResults} mediaBlob={report.sevenDaysCtmMediaBlob} />
        <TestResultsDisplay title="28-Day Test Results" results={analysis.twentyEightDaysResults} mediaBlob={report.twentyEightDaysCtmMediaBlob} />
      </div>

      {analysis.issues.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-700 mb-2">Identified Issues</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-600 bg-gray-50 p-3 rounded-md border">
            {analysis.issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.recommendations.length > 0 && (
         <div>
          <h4 className="text-md font-semibold text-gray-700 mb-2">Recommendations</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-600 bg-gray-50 p-3 rounded-md border">
            {analysis.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {report.timestamp && report.hash && (
        <div className="pt-4 mt-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-brand-dark mb-3 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2 text-green-600"/>
              Verification Details
          </h3>
          <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg break-words border">
              <p><strong>Generated At:</strong> {new Date(report.timestamp).toLocaleString()}</p>
              <p><strong>Verification Hash (SHA-256):</strong> <span className="font-mono text-xs">{report.hash}</span></p>
              {report.signedReportPdfBlob && (
                <div className="pt-2 border-t mt-2">
                  <p className="font-semibold">Final Signed Report:</p>
                  <a
                    href={URL.createObjectURL(report.signedReportPdfBlob)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-blue-600 hover:underline mt-1"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-1"/> View Uploaded PDF
                  </a>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDisplay;