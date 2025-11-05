import React, { useState, useEffect, useCallback } from 'react';
import ReportList from './ReportList.tsx';
import ReportWorkflow from './ReportWorkflow.tsx';
import { ConcreteReport } from '../types.ts';
import * as dbService from '../services/dbService.ts';
import { exportReportsToExcel, importReportsFromExcel, exportTemplateToExcel } from '../services/excelService.ts';

type View = 'list' | 'workflow';

interface WorkspaceManagerProps {
    isGuest?: boolean;
    onBackToLogin?: () => void;
}

const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({ isGuest, onBackToLogin }) => {
    const [view, setView] = useState<View>('list');
    const [reports, setReports] = useState<ConcreteReport[]>([]);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReports = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const localReports = await dbService.getAllReports();
            setReports(localReports.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || '')));
        } catch (err) {
             const message = err instanceof Error ? err.message : 'An unknown error occurred.';
             setError(`Failed to fetch reports from local storage: ${message}.`);
             alert(`Failed to load data: ${message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);
    
    const handleSelectReport = (id: string) => {
        setSelectedReportId(id);
        setView('workflow');
    };

    const handleCreateNew = () => {
        setSelectedReportId(null);
        setView('workflow');
    };

    const handleBackToList = () => {
        setSelectedReportId(null);
        setView('list');
    };

    const handleSaveReport = async (savedReport: ConcreteReport) => {
        if (isGuest) return; // Guests can't save

        try {
            await dbService.saveReport(savedReport);
            // Optimistically update local state
            setReports(prevReports => {
                const existingIndex = prevReports.findIndex(r => r.uniqueRefNo === savedReport.uniqueRefNo);
                if (existingIndex > -1) {
                    const updatedReports = [...prevReports];
                    updatedReports[existingIndex] = savedReport;
                    return updatedReports;
                }
                return [savedReport, ...prevReports];
            });
        } catch (err) {
             const message = err instanceof Error ? err.message : 'An unknown error occurred while saving.';
             setError(message);
             alert(`Save failed: ${message}`);
        }
    };

    const handleExport = () => {
        exportReportsToExcel(reports);
    };

    const handleExportTemplate = () => {
        exportTemplateToExcel();
    };
    
    const handleImport = async (file: File) => {
        setLoading(true);
        setError(null);
        try {
            const { importedReports, errors } = await importReportsFromExcel(file);
            if (errors.length > 0) {
                alert(`Import completed with some issues:\n- ${errors.join('\n- ')}`);
            }
            if (importedReports.length > 0) {
              await dbService.saveMultipleReports(importedReports);
              alert(`Successfully saved ${importedReports.length} reports locally.`);
            }
            // Refresh data from local storage
            await fetchReports();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred during import.';
            setError(message);
            alert(`Import failed: ${message}`);
        } finally {
            setLoading(false);
        }
    };
    
    const getSelectedReport = () => {
        if (!selectedReportId) return undefined;
        return reports.find(r => r.uniqueRefNo === selectedReportId);
    };

    if (loading) {
        return <div className="text-center p-10">Loading reports from local storage...</div>;
    }
    
    if (error) {
        return <div className="text-center p-10 text-red-600">{error}</div>
    }

    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
            {view === 'list' ? (
                <ReportList
                    reports={reports}
                    onSelectReport={handleSelectReport}
                    onCreateNew={handleCreateNew}
                    onExport={handleExport}
                    onImport={handleImport}
                    onExportTemplate={handleExportTemplate}
                    onBackToLogin={onBackToLogin}
                    isGuest={isGuest}
                />
            ) : (
                <ReportWorkflow
                    key={selectedReportId || 'new'}
                    reportId={selectedReportId}
                    initialData={getSelectedReport()}
                    onBack={handleBackToList}
                    onSave={handleSaveReport}
                    isGuest={isGuest}
                />
            )}
        </main>
    );
};

export default WorkspaceManager;