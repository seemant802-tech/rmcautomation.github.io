import React from 'react';
// Fix: Add file extension to import.
import { ReportFormData } from '../types.ts';
import { PaperClipIcon } from './icons/PaperClipIcon.tsx';

interface ReportFormProps {
  formData: Partial<ReportFormData>;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  isEditing: boolean;
  isReadOnly?: boolean;
}

const ReportForm: React.FC<ReportFormProps> = ({ formData, onFormChange, onFileChange, onSubmit, isLoading, isEditing, isReadOnly }) => {
  
  const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-brand-accent focus:border-brand-accent transition disabled:bg-gray-100 disabled:cursor-not-allowed";

  const is7DayComplete = !!formData.sevenDaysLoad1 && !!formData.sevenDaysLoad2 && !!formData.sevenDaysLoad3;
  const is28DayComplete = !!formData.twentyEightDaysLoad1 && !!formData.twentyEightDaysLoad2 && !!formData.twentyEightDaysLoad3;

  const calculateStrength = (loadStr: string, sizeStr: string): number => {
    const load = parseFloat(loadStr);
    const size = parseFloat(sizeStr);
    if (isNaN(load) || isNaN(size) || size === 0 || load === 0) {
        return 0;
    }
    return (load * 1000) / (size * size);
  };

  const cubeSize = formData.cubeSize || '150';

  const strengths7d = [
      calculateStrength(formData.sevenDaysLoad1 || '', cubeSize),
      calculateStrength(formData.sevenDaysLoad2 || '', cubeSize),
      calculateStrength(formData.sevenDaysLoad3 || '', cubeSize),
  ];
  const validStrengths7d = strengths7d.filter(s => s > 0);
  const avgStrength7d = validStrengths7d.length > 0 ? validStrengths7d.reduce((a, b) => a + b, 0) / validStrengths7d.length : 0;

  const strengths28d = [
      calculateStrength(formData.twentyEightDaysLoad1 || '', cubeSize),
      calculateStrength(formData.twentyEightDaysLoad2 || '', cubeSize),
      calculateStrength(formData.twentyEightDaysLoad3 || '', cubeSize),
  ];
  const validStrengths28d = strengths28d.filter(s => s > 0);
  const avgStrength28d = validStrengths28d.length > 0 ? validStrengths28d.reduce((a, b) => a + b, 0) / validStrengths28d.length : 0;

  const renderFileInput = (name: 'sevenDaysCtmMedia' | 'twentyEightDaysCtmMedia', label: string, disabled: boolean, existingBlob?: Blob) => (
    <div className="md:col-span-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {existingBlob ? (
        <a 
          href={URL.createObjectURL(existingBlob)} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center text-sm text-blue-600 hover:underline"
        >
          <PaperClipIcon className="h-4 w-4 mr-1"/> View Attached Media
        </a>
      ) : (
        <input type="file" id={name} name={name} onChange={onFileChange} disabled={isReadOnly || disabled || isLoading} accept="image/*,video/*" className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-brand-primary hover:file:bg-green-100 disabled:opacity-50" />
      )}
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset className="space-y-4 border border-gray-200 p-4 rounded-lg">
        <legend className="text-lg font-medium text-gray-800 px-2">Project Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
            <label htmlFor="dateOfCasting" className="block text-sm font-medium text-gray-700 mb-1">Date of Casting</label>
            <input type="date" id="dateOfCasting" name="dateOfCasting" value={formData.dateOfCasting || ''} onChange={onFormChange} required disabled={isReadOnly || isEditing || isLoading} className={inputClass} />
          </div>
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
            <input type="text" id="clientName" name="clientName" value={formData.clientName || ''} onChange={onFormChange} required disabled={isReadOnly || isEditing || isLoading} className={inputClass} placeholder="e.g., ABC Construction" />
          </div>
          <div>
            <label htmlFor="siteOrPlant" className="block text-sm font-medium text-gray-700 mb-1">Site / Plant</label>
            <select id="siteOrPlant" name="siteOrPlant" value={formData.siteOrPlant || ''} onChange={onFormChange} disabled={isReadOnly || isEditing || isLoading} className={inputClass}>
              <option>Site</option>
              <option>Plant</option>
            </select>
          </div>
           <div>
            <label htmlFor="uniqueRefNo" className="block text-sm font-medium text-gray-700 mb-1">Unique Reference No.</label>
            <input type="text" id="uniqueRefNo" name="uniqueRefNo" value={formData.uniqueRefNo || ''} readOnly disabled className={inputClass} />
          </div>
        </div>
      </fieldset>
      
      <fieldset className="space-y-4 border border-gray-200 p-4 rounded-lg">
        <legend className="text-lg font-medium text-gray-800 px-2">Casting & Mix Details</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
            <input type="text" id="grade" name="grade" value={formData.grade || ''} onChange={onFormChange} required disabled={isReadOnly || isEditing || isLoading} className={inputClass} placeholder="e.g., M25" />
          </div>
          <div>
            <label htmlFor="mixCode" className="block text-sm font-medium text-gray-700 mb-1">Mix Code</label>
            <input type="text" id="mixCode" name="mixCode" value={formData.mixCode || ''} onChange={onFormChange} required disabled={isReadOnly || isEditing || isLoading} className={inputClass} placeholder="e.g., MC-02-A" />
          </div>
          <div>
            <label htmlFor="ftName" className="block text-sm font-medium text-gray-700 mb-1">FT Name</label>
            <input type="text" id="ftName" name="ftName" value={formData.ftName || ''} onChange={onFormChange} disabled={isReadOnly || isLoading} className={inputClass} placeholder="e.g., John Doe" />
          </div>
          <div>
            <label htmlFor="mixType" className="block text-sm font-medium text-gray-700 mb-1">Mix Type</label>
            <select id="mixType" name="mixType" value={formData.mixType || ''} onChange={onFormChange} disabled={isReadOnly || isLoading} className={inputClass}>
                <option>Standard</option>
                <option>Customer</option>
            </select>
          </div>
          <div>
            <label htmlFor="cubeSize" className="block text-sm font-medium text-gray-700 mb-1">Cube Size</label>
             <select id="cubeSize" name="cubeSize" value={formData.cubeSize || '150'} onChange={onFormChange} disabled={isReadOnly || isEditing || isLoading} className={inputClass}>
                <option value="100">100 mm</option>
                <option value="150">150 mm</option>
              </select>
          </div>
           <div>
            <label htmlFor="opc" className="block text-sm font-medium text-gray-700 mb-1">OPC (kg)</label>
            <input type="number" step="any" id="opc" name="opc" value={formData.opc || ''} onChange={onFormChange} disabled={isReadOnly || isLoading} className={inputClass} placeholder="0.00" />
          </div>
           <div>
            <label htmlFor="flyash" className="block text-sm font-medium text-gray-700 mb-1">Flyash (kg)</label>
            <input type="number" step="any" id="flyash" name="flyash" value={formData.flyash || ''} onChange={onFormChange} disabled={isReadOnly || isLoading} className={inputClass} placeholder="0.00" />
          </div>
           <div>
            <label htmlFor="ppc" className="block text-sm font-medium text-gray-700 mb-1">PPC (kg)</label>
            <input type="number" step="any" id="ppc" name="ppc" value={formData.ppc || ''} onChange={onFormChange} disabled={isReadOnly || isLoading} className={inputClass} placeholder="0.00" />
          </div>
        </div>
      </fieldset>

      <fieldset className="border border-gray-200 p-4 rounded-lg">
        <legend className="text-lg font-medium text-gray-800 px-2">7-Day Test Results</legend>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
            <div className="md:col-span-4">
                <label htmlFor="sevenDaysTestDate" className="block text-sm font-medium text-gray-700 mb-1">Target Test Date</label>
                <input type="date" id="sevenDaysTestDate" name="sevenDaysTestDate" value={formData.sevenDaysTestDate || ''} disabled className={inputClass} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-center">Cube #</label>
                <div className="text-center font-semibold p-2 h-10">Weight (kg)</div>
                <div className="text-center font-semibold p-2 h-10">Load (kN)</div>
                <div className="text-center font-semibold p-2 h-10 text-brand-primary">Strength (N/mm²)</div>
            </div>
            { [1, 2, 3].map(i => (
                <div key={`7d-${i}`}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-center">{i}</label>
                    <input type="number" step="any" name={`sevenDaysWeight${i}`} value={formData[`sevenDaysWeight${i}` as keyof ReportFormData] || ''} onChange={onFormChange} disabled={isReadOnly || is7DayComplete || isLoading} className={`${inputClass} mb-2 text-center`} placeholder="0.00" />
                    <input type="number" step="any" name={`sevenDaysLoad${i}`} value={formData[`sevenDaysLoad${i}` as keyof ReportFormData] || ''} onChange={onFormChange} disabled={isReadOnly || is7DayComplete || isLoading} className={`${inputClass} text-center`} placeholder="0.00" />
                    <div className="text-center p-2 mt-2 font-mono text-brand-dark bg-gray-100 rounded h-10 flex items-center justify-center">
                        {strengths7d[i-1].toFixed(2)}
                    </div>
                </div>
            ))}
            <div className="md:col-span-4 mt-4 pt-4 border-t">
                <span className="font-semibold text-gray-600">Average 7-Day Strength:</span>
                <span className="font-mono text-lg font-bold text-brand-dark ml-2">{avgStrength7d.toFixed(2)} N/mm²</span>
            </div>
            {renderFileInput('sevenDaysCtmMedia', 'Attach CTM Media (Image/Video)', is7DayComplete, formData.sevenDaysCtmMediaBlob)}
        </div>
      </fieldset>
      
      <fieldset className="border border-gray-200 p-4 rounded-lg">
        <legend className="text-lg font-medium text-gray-800 px-2">28-Day Test Results</legend>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
            <div className="md:col-span-4">
                <label htmlFor="twentyEightDaysTestDate" className="block text-sm font-medium text-gray-700 mb-1">Target Test Date</label>
                <input type="date" id="twentyEightDaysTestDate" name="twentyEightDaysTestDate" value={formData.twentyEightDaysTestDate || ''} disabled className={inputClass} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-center">Cube #</label>
                <div className="text-center font-semibold p-2 h-10">Weight (kg)</div>
                <div className="text-center font-semibold p-2 h-10">Load (kN)</div>
                <div className="text-center font-semibold p-2 h-10 text-brand-primary">Strength (N/mm²)</div>
            </div>
            { [1, 2, 3].map(i => (
                <div key={`28d-${i}`}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-center">{i}</label>
                    <input type="number" step="any" name={`twentyEightDaysWeight${i}`} value={formData[`twentyEightDaysWeight${i}` as keyof ReportFormData] || ''} onChange={onFormChange} disabled={isReadOnly || is28DayComplete || isLoading} className={`${inputClass} mb-2 text-center`} placeholder="0.00" />
                    <input type="number" step="any" name={`twentyEightDaysLoad${i}`} value={formData[`twentyEightDaysLoad${i}` as keyof ReportFormData] || ''} onChange={onFormChange} disabled={isReadOnly || is28DayComplete || isLoading} className={`${inputClass} text-center`} placeholder="0.00" />
                    <div className="text-center p-2 mt-2 font-mono text-brand-dark bg-gray-100 rounded h-10 flex items-center justify-center">
                        {strengths28d[i-1].toFixed(2)}
                    </div>
                </div>
            ))}
            <div className="md:col-span-4 mt-4 pt-4 border-t">
                <span className="font-semibold text-gray-600">Average 28-Day Strength:</span>
                <span className="font-mono text-lg font-bold text-brand-dark ml-2">{avgStrength28d.toFixed(2)} N/mm²</span>
            </div>
            {renderFileInput('twentyEightDaysCtmMedia', 'Attach CTM Media (Image/Video)', is28DayComplete, formData.twentyEightDaysCtmMediaBlob)}
        </div>
      </fieldset>

      <div>
        <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-1">Observations</label>
        <textarea id="observations" name="observations" rows={4} value={formData.observations || ''} onChange={onFormChange} disabled={isReadOnly || isLoading} className={inputClass} placeholder="Note any visual defects, anomalies, or special conditions..."></textarea>
      </div>

      {!isReadOnly && (
        <div className="pt-2">
          <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-brand-primary hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isLoading ? 'Saving & Analyzing...' : (isEditing ? 'Save Changes & Re-Analyze' : 'Create Report & Analyze')}
          </button>
        </div>
      )}
    </form>
  );
};

export default ReportForm;