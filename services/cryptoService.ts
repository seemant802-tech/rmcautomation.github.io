/**
 * Calculates the SHA-256 hash of a string.
 * @param text The string to hash.
 * @returns A promise that resolves to the hex-encoded SHA-256 hash.
 */
export async function calculateSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Creates a canonical string representation of a report for hashing.
 * Important: The order of fields must be consistent to produce a stable hash.
 * @param report The report data.
 * @returns A stable, stringified version of the report's core data.
 */
export function createCanonicalReportString(report: object): string {
    // A simple but effective way to get a stable string is to stringify with sorted keys.
    // A more robust implementation might build the string manually field by field.
    const sortedReport = Object.keys(report)
        .sort()
        .reduce((acc, key) => {
            // Exclude fields that shouldn't be part of the hash
            if (key !== 'hash' && key !== 'timestamp' && !key.endsWith('Blob') && !key.endsWith('Media') && key !== 'signedReportPdf') {
                (acc as any)[key] = (report as any)[key];
            }
            return acc;
        }, {});
    
    return JSON.stringify(sortedReport);
}