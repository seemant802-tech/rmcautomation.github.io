import { ConcreteReport } from '../types.ts';

const DB_KEY = 'concreteReportsDB';

// Helper function to convert a Blob to a Base64 string
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Helper function to convert a Base64 string back to a Blob
const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: mimeType });
};

const getMimeTypeForField = (fieldName: string): string => {
    if (fieldName.includes('Pdf')) return 'application/pdf';
    if (fieldName.includes('Media')) return 'image/jpeg'; // Default for images
    return 'application/octet-stream';
}

const processReportsForSaving = async (reports: ConcreteReport[]): Promise<any[]> => {
    const processedReports = [];
    const blobFields: (keyof ConcreteReport)[] = ['sevenDaysCtmMediaBlob', 'twentyEightDaysCtmMediaBlob', 'signedReportPdfBlob'];
    for (const report of reports) {
        const newReport = { ...report };
        for (const field of blobFields) {
            if (newReport[field] instanceof Blob) {
                const base64 = await blobToBase64(newReport[field] as Blob);
                // Store base64 representation and mime type
                (newReport as any)[`${field}Base64`] = base64;
                delete newReport[field];
            }
        }
        processedReports.push(newReport);
    }
    return processedReports;
};

const processReportsAfterLoading = (reports: any[]): ConcreteReport[] => {
    const blobFields: (keyof ConcreteReport)[] = ['sevenDaysCtmMediaBlob', 'twentyEightDaysCtmMediaBlob', 'signedReportPdfBlob'];
    return reports.map(report => {
        const newReport = { ...report };
        for (const field of blobFields) {
            const base64Field = `${field}Base64`;
            if (newReport[base64Field]) {
                const mimeType = getMimeTypeForField(field);
                newReport[field] = base64ToBlob(newReport[base64Field], mimeType);
                delete newReport[base64Field];
            }
        }
        return newReport as ConcreteReport;
    });
};


/**
 * Fetches all reports from local storage.
 * @returns A promise that resolves to an array of ConcreteReport objects.
 */
export async function getAllReports(): Promise<ConcreteReport[]> {
  try {
    const rawData = localStorage.getItem(DB_KEY);
    if (!rawData) {
      return [];
    }
    const reportsFromStorage = JSON.parse(rawData);
    return processReportsAfterLoading(reportsFromStorage);
  } catch (error) {
    console.error("Error fetching reports from local storage:", error);
    throw new Error("Could not read reports from local storage.");
  }
}

/**
 * Saves all reports to local storage, overwriting existing data.
 * @param reports The full array of reports to save.
 */
async function saveAllReports(reports: ConcreteReport[]): Promise<void> {
    try {
        const reportsToSave = await processReportsForSaving(reports);
        localStorage.setItem(DB_KEY, JSON.stringify(reportsToSave));
    } catch (error) {
        console.error("Error saving reports to local storage:", error);
        throw new Error("Failed to write reports to local storage.");
    }
}


/**
 * Saves a single report. It will create a new one or overwrite an existing one.
 * @param report The ConcreteReport object to save.
 */
export async function saveReport(report: ConcreteReport): Promise<void> {
    const allReports = await getAllReports();
    const existingIndex = allReports.findIndex(r => r.uniqueRefNo === report.uniqueRefNo);
    if (existingIndex > -1) {
        allReports[existingIndex] = report;
    } else {
        allReports.unshift(report); // Add new reports to the beginning
    }
    await saveAllReports(allReports);
}

/**
 * Saves multiple reports, merging them with existing data.
 * @param reports An array of ConcreteReport objects to save.
 */
export async function saveMultipleReports(newReports: ConcreteReport[]): Promise<void> {
  if (newReports.length === 0) return;
  
  const allReports = await getAllReports();
  const reportMap = new Map(allReports.map(r => [r.uniqueRefNo, r]));

  newReports.forEach(report => {
    reportMap.set(report.uniqueRefNo, report);
  });
  
  const mergedReports = Array.from(reportMap.values());
  await saveAllReports(mergedReports);
}