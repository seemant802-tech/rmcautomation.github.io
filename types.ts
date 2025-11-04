export interface TestResults {
  strengths: number[];
  averageStrength: number;
  status: 'Pass' | 'Fail' | 'N/A';
}

export interface ReportAnalysis {
  summary: string;
  qualityScore: number;
  sevenDaysResults: TestResults;
  twentyEightDaysResults: TestResults;
  issues: string[];
  recommendations: string[];
}

// This interface combines all possible form fields.
// It matches the data structure used in ReportForm and geminiService.
export interface ReportFormData {
  // Project Information
  dateOfCasting?: string;
  clientName?: string;
  siteOrPlant?: 'Site' | 'Plant';
  uniqueRefNo: string; // This is the key identifier

  // Casting & Mix Details
  grade?: string;
  mixCode?: string;
  ftName?: string;
  mixType?: 'Standard' | 'Customer';
  cubeSize?: string; // '100' or '150'
  opc?: string;
  flyash?: string;
  ppc?: string;

  // 7-Day Test Results
  sevenDaysTestDate?: string;
  sevenDaysWeight1?: string;
  sevenDaysWeight2?: string;
  sevenDaysWeight3?: string;
  sevenDaysLoad1?: string;
  sevenDaysLoad2?: string;
  sevenDaysLoad3?: string;
  sevenDaysCtmMedia?: File; // For form handling
  sevenDaysCtmMediaBlob?: Blob; // For storage

  // 28-Day Test Results
  twentyEightDaysTestDate?: string;
  twentyEightDaysWeight1?: string;
  twentyEightDaysWeight2?: string;
  twentyEightDaysWeight3?: string;
  twentyEightDaysLoad1?: string;
  twentyEightDaysLoad2?: string;
  twentyEightDaysLoad3?: string;
  twentyEightDaysCtmMedia?: File;
  twentyEightDaysCtmMediaBlob?: Blob;

  // Observations
  observations?: string;
}

// The complete report object, including analysis and metadata.
export interface ConcreteReport extends ReportFormData {
  analysis?: ReportAnalysis;
  timestamp?: string; // ISO string
  hash?: string; // SHA-256 hash
}
