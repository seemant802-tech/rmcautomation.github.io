import * as XLSX from 'xlsx';
// Fix: Add file extension to import.
import { ConcreteReport } from '../types.ts';

/**
 * Exports an array of concrete reports to an Excel file.
 * @param reports The array of ConcreteReport objects to export.
 * @param fileName The desired name for the output Excel file.
 */
export const exportReportsToExcel = (reports: ConcreteReport[], fileName: string = 'CubeQualityAnalysisReports.xlsx'): void => {
  if (!reports || reports.length === 0) {
    console.warn('No reports provided to export.');
    return;
  }

  const dataToExport = reports.map(report => ({
    'Unique Ref. No.': report.uniqueRefNo,
    'Client Name': report.clientName,
    'Site / Plant': report.siteOrPlant,
    'Date of Casting': report.dateOfCasting,
    'Grade': report.grade,
    'Mix Code': report.mixCode,
    'FT Name': report.ftName,
    'Mix Type': report.mixType,
    'Cube Size (mm)': report.cubeSize,
    'OPC (kg)': report.opc,
    'Flyash (kg)': report.flyash,
    'PPC (kg)': report.ppc,
    '7-Day Weight 1': report.sevenDaysWeight1,
    '7-Day Weight 2': report.sevenDaysWeight2,
    '7-Day Weight 3': report.sevenDaysWeight3,
    '7-Day Load 1': report.sevenDaysLoad1,
    '7-Day Load 2': report.sevenDaysLoad2,
    '7-Day Load 3': report.sevenDaysLoad3,
    '28-Day Weight 1': report.twentyEightDaysWeight1,
    '28-Day Weight 2': report.twentyEightDaysWeight2,
    '28-Day Weight 3': report.twentyEightDaysWeight3,
    '28-Day Load 1': report.twentyEightDaysLoad1,
    '28-Day Load 2': report.twentyEightDaysLoad2,
    '28-Day Load 3': report.twentyEightDaysLoad3,
    'Observations': report.observations,
    'Overall Quality Score': report.analysis?.qualityScore ?? 'N/A',
    '7-Day Avg Strength (N/mm²)': report.analysis?.sevenDaysResults?.averageStrength?.toFixed(2) ?? 'N/A',
    '7-Day Status': report.analysis?.sevenDaysResults?.status ?? 'N/A',
    '28-Day Avg Strength (N/mm²)': report.analysis?.twentyEightDaysResults?.averageStrength?.toFixed(2) ?? 'N/A',
    '28-Day Status': report.analysis?.twentyEightDaysResults?.status ?? 'N/A',
    'Summary': report.analysis?.summary ?? 'No analysis available.',
    'Issues': report.analysis?.issues?.join('; ') || 'None',
    'Recommendations': report.analysis?.recommendations?.join('; ') || 'None',
    'Generated At': report.timestamp ? new Date(report.timestamp).toLocaleString() : '',
    'Verification Hash': report.hash ?? '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');

  // Auto-size columns for better readability
  const colWidths = Object.keys(dataToExport[0]).map(key => ({
    wch: Math.max(
      key.length,
      ...dataToExport.map(row => {
        const value = row[key as keyof typeof row];
        return value ? value.toString().length : 0;
      })
    ) + 2 // Add a little extra padding
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, fileName);
};

export const exportTemplateToExcel = (): void => {
  const instructions = [
    ['Column Header', 'Description', 'Example'],
    ['Unique Ref. No. (or Ticket No., ID, etc.)', 'Required. The unique identifier for the report.', '2024-08-01-1'],
    ['Client Name', 'Required. Name of the client.', 'Future Homes LLC'],
    ['Site / Plant', 'Required. Choose either "Site" or "Plant".', 'Site'],
    ['Date of Casting', 'Required. The date the concrete was cast in YYYY-MM-DD format.', '2024-07-28'],
    ['Grade', 'Required. The grade of the concrete mix.', 'M30'],
    ['Mix Code', 'Required. The specific code for the mix.', 'MIX-B-45'],
    ['FT Name', 'Optional. Name of the Field Technician.', 'Jane Smith'],
    ['Mix Type', 'Optional. "Standard" or "Customer". Defaults to Standard.', 'Customer'],
    ['Cube Size (mm)', 'Optional. "100" or "150". Defaults to 150.', '150'],
    ['OPC (kg)', 'Optional. Amount of OPC in kilograms.', '380'],
    ['Flyash (kg)', 'Optional. Amount of Flyash in kilograms.', '120'],
    ['PPC (kg)', 'Optional. Amount of PPC in kilograms.', '0'],
    ['7-Day Weight 1/2/3', 'Optional. Weight of the cube in kg for the 7-day test.', '8.21'],
    ['7-Day Load 1/2/3', 'Optional. Load applied in kN for the 7-day test.', '450'],
    ['28-Day Weight 1/2/3', 'Optional. Weight of the cube in kg for the 28-day test.', '8.25'],
    ['28-Day Load 1/2/3', 'Optional. Load applied in kN for the 28-day test.', '680'],
    ['Observations', 'Optional. Any additional notes or observations.', 'No issues observed during casting.'],
    ['---', '---', '---'],
    ['NOTE:', 'The columns for AI analysis (Score, Status, Summary, etc.) will be ignored during import.', 'They are populated by the system upon saving/analyzing.'],
  ];

  const sampleData = [{
    'Unique Ref. No.': '2024-08-01-1',
    'Client Name': 'Future Homes LLC',
    'Site / Plant': 'Site',
    'Date of Casting': '2024-07-28',
    'Grade': 'M30',
    'Mix Code': 'MIX-B-45',
    'FT Name': 'Jane Smith',
    'Mix Type': 'Customer',
    'Cube Size (mm)': 150,
    'OPC (kg)': 380,
    'Flyash (kg)': 120,
    'PPC (kg)': 0,
    '7-Day Weight 1': 8.21,
    '7-Day Weight 2': 8.22,
    '7-Day Weight 3': 8.19,
    '7-Day Load 1': 450,
    '7-Day Load 2': 465,
    '7-Day Load 3': 455,
    '28-Day Weight 1': '',
    '28-Day Weight 2': '',
    '28-Day Weight 3': '',
    '28-Day Load 1': '',
    '28-Day Load 2': '',
    '28-Day Load 3': '',
    'Observations': 'Casting was performed under normal conditions.',
  }];

  const ws_data = XLSX.utils.json_to_sheet(sampleData);
  const ws_instructions = XLSX.utils.aoa_to_sheet(instructions);
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, ws_data, 'Data Entry');
  XLSX.utils.book_append_sheet(workbook, ws_instructions, 'Instructions');

  // Auto-size columns for better readability
  ws_data['!cols'] = Object.keys(sampleData[0]).map(key => ({ wch: key.length + 5 }));
  ws_instructions['!cols'] = [ {wch: 40}, {wch: 60}, {wch: 40} ];

  XLSX.writeFile(workbook, 'ImportTemplate.xlsx');
};

// Helper to format a Date object to 'YYYY-MM-DD' string, avoiding timezone issues.
const formatDateToYYYYMMDD = (date: Date): string => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper to safely parse a value to a float, returning 0 for invalid input.
const safeParseFloat = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0;
    const num = parseFloat(String(value));
    return isNaN(num) ? 0 : num;
};

// FIX: Add helper function to normalize status values to the expected union type.
const normalizeStatus = (value: any): 'Pass' | 'Fail' | 'N/A' => {
  const strValue = String(value ?? 'N/A').trim().toLowerCase();
  if (strValue === 'pass') {
    return 'Pass';
  }
  if (strValue === 'fail') {
    return 'Fail';
  }
  return 'N/A';
};


/**
 * Imports and parses concrete reports from an Excel file with robust error handling.
 * @param file The Excel file to import.
 * @returns A promise that resolves to an object containing imported reports and any errors.
 */
export const importReportsFromExcel = (file: File): Promise<{ importedReports: ConcreteReport[], errors: string[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          return reject(new Error("File is empty or could not be read."));
        }
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: null });

        const importedReports: ConcreteReport[] = [];
        const errors: string[] = [];

        const findValueByHeader = (row: { [key: string]: any }, possibleHeaders: string[]): any => {
            for (const header of possibleHeaders) {
                if (row[header] !== undefined && row[header] !== null) {
                    return row[header];
                }
            }
            return null;
        }

        json.forEach((row, index) => {
          const normalizedRow: { [key: string]: any } = {};
          for (const key in row) {
            normalizedRow[key.trim().toLowerCase()] = row[key];
          }

          // Skip if row is effectively empty
          if (Object.values(normalizedRow).every(v => v === null)) {
            return;
          }

          try {
            const uniqueRefValue = findValueByHeader(normalizedRow, [
                'unique ref. no.', 'unique reference no.', 'ticket / docket no.', 'ticket no.', 'docket no.', 'ref no', 'id'
            ]);
            
            if (!uniqueRefValue) {
               errors.push(`Skipping row ${index + 2}: Missing a unique identifier column (e.g., 'Unique Ref. No.', 'Ticket No.', 'ID').`);
               return; // Skip this row
            }

            const uniqueRefNo = String(uniqueRefValue).trim();
            
            const report: ConcreteReport = {
                uniqueRefNo,
                clientName: String(findValueByHeader(normalizedRow, ['client name']) ?? ''),
                siteOrPlant: (String(findValueByHeader(normalizedRow, ['site / plant']) ?? 'site').toLowerCase() === 'plant') ? 'Plant' : 'Site',
                dateOfCasting: '',
                grade: String(findValueByHeader(normalizedRow, ['grade']) ?? ''),
                mixCode: String(findValueByHeader(normalizedRow, ['mix code']) ?? ''),
                ftName: String(findValueByHeader(normalizedRow, ['ft name', 'ftname', 'field technician', 'technician name', 'technician']) ?? ''),
                mixType: (String(findValueByHeader(normalizedRow, ['mix type']) ?? 'standard').toLowerCase() === 'customer') ? 'Customer' : 'Standard',
                opc: String(findValueByHeader(normalizedRow, ['opc (kg)']) ?? ''),
                flyash: String(findValueByHeader(normalizedRow, ['flyash (kg)']) ?? ''),
                ppc: String(findValueByHeader(normalizedRow, ['ppc (kg)']) ?? ''),
                cubeSize: String(findValueByHeader(normalizedRow, ['cube size (mm)']) ?? '150'),
                sevenDaysTestDate: '',
                sevenDaysWeight1: String(findValueByHeader(normalizedRow, ['7-day weight 1']) ?? ''),
                sevenDaysWeight2: String(findValueByHeader(normalizedRow, ['7-day weight 2']) ?? ''),
                sevenDaysWeight3: String(findValueByHeader(normalizedRow, ['7-day weight 3']) ?? ''),
                sevenDaysLoad1: String(findValueByHeader(normalizedRow, ['7-day load 1']) ?? ''),
                sevenDaysLoad2: String(findValueByHeader(normalizedRow, ['7-day load 2']) ?? ''),
                sevenDaysLoad3: String(findValueByHeader(normalizedRow, ['7-day load 3']) ?? ''),
                twentyEightDaysTestDate: '',
                twentyEightDaysWeight1: String(findValueByHeader(normalizedRow, ['28-day weight 1']) ?? ''),
                twentyEightDaysWeight2: String(findValueByHeader(normalizedRow, ['28-day weight 2']) ?? ''),
                twentyEightDaysWeight3: String(findValueByHeader(normalizedRow, ['28-day weight 3']) ?? ''),
                twentyEightDaysLoad1: String(findValueByHeader(normalizedRow, ['28-day load 1']) ?? ''),
                twentyEightDaysLoad2: String(findValueByHeader(normalizedRow, ['28-day load 2']) ?? ''),
                twentyEightDaysLoad3: String(findValueByHeader(normalizedRow, ['28-day load 3']) ?? ''),
                observations: String(findValueByHeader(normalizedRow, ['observations']) ?? ''),
                hash: String(findValueByHeader(normalizedRow, ['verification hash']) ?? ''),
                timestamp: '',
            };

            const castingDateValue = findValueByHeader(normalizedRow, ['date of casting']);
            if (castingDateValue) {
                const parsedDate = castingDateValue instanceof Date ? castingDateValue : new Date(castingDateValue);
                if (!isNaN(parsedDate.getTime())) {
                    report.dateOfCasting = formatDateToYYYYMMDD(parsedDate);

                    // Auto-calculate target test dates
                    const sevenDaysDate = new Date(parsedDate.getTime());
                    sevenDaysDate.setDate(sevenDaysDate.getDate() + 7);
                    report.sevenDaysTestDate = formatDateToYYYYMMDD(sevenDaysDate);

                    const twentyEightDaysDate = new Date(parsedDate.getTime());
                    twentyEightDaysDate.setDate(twentyEightDaysDate.getDate() + 28);
                    report.twentyEightDaysTestDate = formatDateToYYYYMMDD(twentyEightDaysDate);
                }
            }

            const timestampValue = findValueByHeader(normalizedRow, ['generated at']);
            if (timestampValue) {
                const parsedTimestamp = new Date(timestampValue);
                if (!isNaN(parsedTimestamp.getTime())) {
                    report.timestamp = parsedTimestamp.toISOString();
                }
            }

            const qualityScore = findValueByHeader(normalizedRow, ['overall quality score']);
            if (qualityScore && qualityScore !== 'N/A') {
                report.analysis = {
                    summary: String(findValueByHeader(normalizedRow, ['summary']) ?? ''),
                    qualityScore: Math.round(safeParseFloat(qualityScore)),
                    sevenDaysResults: {
                        strengths: [],
                        averageStrength: safeParseFloat(findValueByHeader(normalizedRow, ['7-day avg strength (n/mm²)'])),
                        // FIX: Use normalizeStatus to ensure the value conforms to the 'Pass' | 'Fail' | 'N/A' type.
                        status: normalizeStatus(findValueByHeader(normalizedRow, ['7-day status'])),
                    },
                    twentyEightDaysResults: {
                        strengths: [],
                        averageStrength: safeParseFloat(findValueByHeader(normalizedRow, ['28-day avg strength (n/mm²)'])),
                        // FIX: Use normalizeStatus to ensure the value conforms to the 'Pass' | 'Fail' | 'N/A' type.
                        status: normalizeStatus(findValueByHeader(normalizedRow, ['28-day status'])),
                    },
                    issues: (findValueByHeader(normalizedRow, ['issues']) && String(findValueByHeader(normalizedRow, ['issues'])).length > 0) ? String(findValueByHeader(normalizedRow, ['issues'])).split('; ') : [],
                    recommendations: (findValueByHeader(normalizedRow, ['recommendations']) && String(findValueByHeader(normalizedRow, ['recommendations'])).length > 0) ? String(findValueByHeader(normalizedRow, ['recommendations'])).split('; ') : [],
                };
            }
            importedReports.push(report);

          } catch (rowError) {
              errors.push(`Error processing row ${index + 2}: ${rowError instanceof Error ? rowError.message : String(rowError)}`);
          }
        });
        
        resolve({ importedReports, errors });

      } catch (e) {
        console.error('Failed to parse Excel file:', e);
        reject(new Error('The file is corrupted or not in the expected Excel format.'));
      }
    };

    reader.onerror = (e) => {
      reject(new Error('Failed to read the file.'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};