import React, { useState, useEffect } from 'react';
import { ReportFormData, ConcreteReport, ReportAnalysis } from '../types.ts';
import ReportForm from './ReportForm.tsx';
import ReportDisplay from './ReportDisplay.tsx';
import Loader from './Loader.tsx';
import { generateQualityReport } from '../services/geminiService.ts';
import { calculateSHA256, createCanonicalReportString } from '../services/cryptoService.ts';
import { saveReport } from '../services/dbService.ts';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon.tsx';

interface ReportWorkflowProps {
  reportId: string | null;
  initialData?: ConcreteReport;
  onBack: () => void;
  onSave: (report: ConcreteReport) => void;
  isGuest?: boolean;
}

const ReportWorkflow: React.FC<ReportWorkflowProps> = ({ reportId, initialData, onBack, onSave, isGuest }) => {
  const [formData, setFormData] = useState<Partial<ReportFormData>>(initialData || {
    uniqueRefNo: reportId || `CQR-${Date.now()}`,
    siteOrPlant: 'Site',
    mixType: 'Standard',
    cubeSize: '150',
  });
  const [report, setReport] = useState<ConcreteReport | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(!!reportId);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setReport(initialData);
    }
  }, [initialData]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    
    if (name === 'dateOfCasting' && value) {
        const castingDate = new Date(value);
        if (!isNaN(castingDate.getTime())) {
            const sevenDaysDate = new Date(castingDate);
            sevenDaysDate.setDate(castingDate.getDate() + 7);
            updatedFormData.sevenDaysTestDate = sevenDaysDate.toISOString().split('T')[0];

            const twentyEightDaysDate = new Date(castingDate);
            twentyEightDaysDate.setDate(castingDate.getDate() + 28);
            updatedFormData.twentyEightDaysTestDate = twentyEightDaysDate.toISOString().split('T')[0];
        }
    }

    setFormData(updatedFormData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      const blobName = `${name}Blob` as keyof ReportFormData;
      const reader = new FileReader();
      reader.onloadend = () => {
        const blob = new Blob([reader.result as ArrayBuffer], { type: file.type });
        setFormData(prev => ({ ...prev, [blobName]: blob, [name]: file }));
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const analysisJson = await generateQualityReport(formData as ReportFormData);
      const analysis: ReportAnalysis = JSON.parse(analysisJson);

      const finalReportData: ConcreteReport = {
        ...(formData as ReportFormData),
        analysis,
        uniqueRefNo: formData.uniqueRefNo!,
        timestamp: new Date().toISOString(),
      };
      
      const canonicalString = createCanonicalReportString(finalReportData);
      finalReportData.hash = await calculateSHA256(canonicalString);

      await saveReport(finalReportData);
      setReport(finalReportData);
      onSave(finalReportData); // Notify parent component
      setIsEditing(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Report List
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? `Viewing Report: ${formData.uniqueRefNo}` : 'Create New Report'}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            Test Report Data
          </h3>
          <ReportForm
            formData={formData}
            onFormChange={handleFormChange}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            isEditing={isEditing}
            isReadOnly={isGuest}
          />
        </div>

        <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            AI Quality Analysis
          </h3>
          {isLoading && <Loader />}
          {error && <div className="text-red-600 bg-red-50 p-4 rounded-md">{error}</div>}
          {!isLoading && report?.analysis ? (
             <ReportDisplay report={report} />
          ) : (
             !isLoading && <div className="text-center py-10 text-gray-500">Analysis will appear here after saving the report.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportWorkflow;