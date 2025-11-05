import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ReportFormData, ConcreteReport, ReportAnalysis } from '../types.ts';
import ReportForm from './ReportForm.tsx';
import ReportDisplay from './ReportDisplay.tsx';
import PrintableReport from './PrintableReport.tsx';
import Loader from './Loader.tsx';
import { generateQualityReport } from '../services/geminiService.ts';
import { calculateSHA256, createCanonicalReportString } from '../services/cryptoService.ts';
import { getAllReports } from '../services/dbService.ts';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon.tsx';
import { PrinterIcon } from './icons/PrinterIcon.tsx';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon.tsx';
import { XMarkIcon } from './icons/XMarkIcon.tsx';

interface ReportWorkflowProps {
  reportId: string | null;
  initialData?: ConcreteReport;
  onBack: () => void;
  onSave: (report: ConcreteReport) => void;
  isGuest?: boolean;
}

const ReportWorkflow: React.FC<ReportWorkflowProps> = ({ reportId, initialData, onBack, onSave, isGuest }) => {
  const [formData, setFormData] = useState<Partial<ReportFormData>>(initialData || {
    siteOrPlant: 'Site',
    mixType: 'Standard',
    cubeSize: '150',
  });
  const [report, setReport] = useState<ConcreteReport | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(!!reportId);
  const [printContainer, setPrintContainer] = useState<HTMLElement | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setPrintContainer(document.getElementById('print-container'));
  }, []);
  
  useEffect(() => {
    if (isPrinting) {
      window.print();
      setIsPrinting(false); // Reset state after print dialog is triggered
    }
  }, [isPrinting]);

  // Effect for populating form with existing data
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setReport(initialData);
    }
  }, [initialData]);

  // Effect for generating a new ID for new reports
  useEffect(() => {
    // Only run for new reports (when reportId is null)
    if (!reportId) {
      const generateNewId = async () => {
        setFormData(prev => ({ ...prev, uniqueRefNo: 'Generating...' }));
        try {
          const allReports = await getAllReports();
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          const datePrefix = `${year}-${month}-${day}`;
          
          const todaysReports = allReports.filter(r => r.uniqueRefNo.startsWith(datePrefix));
          const serialNumber = todaysReports.length + 1;
          
          const newId = `${datePrefix}-${serialNumber}`;
          
          setFormData(prev => ({ ...prev, uniqueRefNo: newId }));
        } catch (e) {
          console.error("Failed to generate new report ID", e);
          setFormData(prev => ({ ...prev, uniqueRefNo: `CQR-ERR-${Date.now()}` }));
        }
      };
      generateNewId();
    }
  }, [reportId]);

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
  
  const handlePrint = () => {
      setIsPrinting(true);
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

      // The parent component will handle the actual saving
      onSave(finalReportData);
      setReport(finalReportData);
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
         <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onBack}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to List
            </button>
            {report && (
              <>
                <button
                    onClick={() => setShowPreview(true)}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                >
                    <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                    Preview Report
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                >
                    <PrinterIcon className="h-5 w-5 mr-2" />
                    Print Report
                </button>
              </>
            )}
        </div>
        <h2 className="text-xl font-semibold text-gray-800 text-right">
            {isEditing ? `Report: ${formData.uniqueRefNo}` : 'Create New Report'}
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
      
      {/* Portal for actual printing */}
      {printContainer && report && ReactDOM.createPortal(
        <PrintableReport report={report} />,
        printContainer
      )}
      
      {/* Modal for print preview */}
      {showPreview && report && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] relative"
            onClick={(e) => e.stopPropagation()} // Prevent closing modal on inner click
          >
            <div className="overflow-y-auto h-full">
               <PrintableReport report={report} />
            </div>
            <button 
              onClick={() => setShowPreview(false)} 
              className="absolute -top-3 -right-3 text-white bg-gray-700 hover:bg-gray-900 rounded-full h-8 w-8 flex items-center justify-center"
              aria-label="Close preview"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReportWorkflow;