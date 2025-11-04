import { GoogleGenAI, Type } from "@google/genai";
// Fix: Add file extension to import.
import { ReportFormData } from '../types.ts';

// Fix: Adhere to the recommended initialization format.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const testResultsSchema = {
  type: Type.OBJECT,
  properties: {
    strengths: {
      type: Type.ARRAY,
      description: 'The calculated compressive strength for each of the 3 cubes in N/mm2.',
      items: { type: Type.NUMBER },
    },
    averageStrength: {
      type: Type.NUMBER,
      description: 'The average of the three calculated strengths.',
    },
    status: {
      type: Type.STRING,
      description: 'The pass/fail status of the test based on the concrete grade requirements. Either "Pass" or "Fail".',
    },
  },
  required: ['strengths', 'averageStrength', 'status'],
};

const reportSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: 'A brief, one or two-sentence summary of the overall quality assessment of the concrete based on the tests.',
    },
    qualityScore: {
      type: Type.INTEGER,
      description: 'An overall quality score from 1 (very poor) to 100 (perfect), considering both 7 and 28-day results.',
    },
    sevenDaysResults: testResultsSchema,
    twentyEightDaysResults: testResultsSchema,
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: 'A list of specific issues, defects, or deviations found. If none, return an empty array.',
    },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: 'A list of actionable recommendations for improvement or correction. If none, return an empty array.',
    },
  },
  required: ['summary', 'qualityScore', 'sevenDaysResults', 'twentyEightDaysResults', 'issues', 'recommendations'],
};

export async function generateQualityReport(formData: ReportFormData): Promise<string> {
  const prompt = `
    Analyze the following concrete cube test data and generate a structured JSON response.

    ## Project Information
    - Client Name: ${formData.clientName}
    - Site/Plant: ${formData.siteOrPlant}
    - Unique Reference No: ${formData.uniqueRefNo}
    - Date of Casting: ${formData.dateOfCasting}

    ## Casting Details
    - Concrete Grade: ${formData.grade}
    - Mix Code: ${formData.mixCode}
    - FT Name: ${formData.ftName}
    - Mix Type: ${formData.mixType}
    - Cube Size: ${formData.cubeSize} mm
    - Mix Details: OPC=${formData.opc || 0} kg, Flyash=${formData.flyash || 0} kg, PPC=${formData.ppc || 0} kg

    ## 7-Day Test Results
    - Test Date: ${formData.sevenDaysTestDate || 'Not Provided'}
    - Cube 1: Weight=${formData.sevenDaysWeight1 || 0} kg, Load=${formData.sevenDaysLoad1 || 0} kN
    - Cube 2: Weight=${formData.sevenDaysWeight2 || 0} kg, Load=${formData.sevenDaysLoad2 || 0} kN
    - Cube 3: Weight=${formData.sevenDaysWeight3 || 0} kg, Load=${formData.sevenDaysLoad3 || 0} kN

    ## 28-Day Test Results
    - Test Date: ${formData.twentyEightDaysTestDate || 'Not Provided'}
    - Cube 1: Weight=${formData.twentyEightDaysWeight1 || 0} kg, Load=${formData.twentyEightDaysLoad1 || 0} kN
    - Cube 2: Weight=${formData.twentyEightDaysWeight2 || 0} kg, Load=${formData.twentyEightDaysLoad2 || 0} kN
    - Cube 3: Weight=${formData.twentyEightDaysWeight3 || 0} kg, Load=${formData.twentyEightDaysLoad3 || 0} kN
    
    ## Additional Observations
    ${formData.observations || 'None'}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are an expert Civil Engineer specializing in concrete quality control. Your task is to analyze the provided concrete cube testing data. Assume a cube size of ${formData.cubeSize || 150}mm x ${formData.cubeSize || 150}mm. Calculate the compressive strength for each cube using the formula: Strength (N/mm²) = (Load (kN) * 1000) / (${formData.cubeSize || 150} * ${formData.cubeSize || 150}). Calculate the average strength for both 7-day and 28-day tests. If test data (load) for a period is not provided or is zero, return zero for strengths and average, and 'N/A' for status. Determine if the concrete passes, based on standard criteria for the specified grade (e.g., for 7-day test, strength should be at least 67% of characteristic strength; for 28-day, it should meet or exceed the characteristic strength, which is the number in the grade, e.g., 25 N/mm² for M25). Also consider the provided mix details in your analysis for any recommendations. Provide a professional analysis including a summary, a quality score out of 100, the detailed test results, identified issues (if any), and actionable recommendations. The tone should be objective and formal. Generate the response in the specified JSON format.`,
        responseMimeType: "application/json",
        responseSchema: reportSchema,
      },
    });

    const text = response.text.trim();
    if (!text) {
        throw new Error("Received an empty response from the AI. Please check the input and try again.");
    }

    return text;

  } catch (error) {
    console.error("Error generating report with Gemini:", error);
    throw new Error("Failed to communicate with the AI service. Please ensure your API key is configured correctly.");
  }
}