import React from 'react';
import { ConcreteReport } from '../types.ts';

interface PrintableReportProps {
  report: ConcreteReport;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{ marginBottom: '20px', pageBreakInside: 'avoid' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px', marginBottom: '12px' }}>
            {title}
        </h3>
        <div style={{ fontSize: '14px' }}>{children}</div>
    </div>
);

const DetailGrid: React.FC<{ children: React.ReactNode; columns?: number }> = ({ children, columns = 3 }) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '20px' }}>{children}</div>
);

const DetailItem: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
    <div>
        <p style={{ color: '#6b7280', marginBottom: '2px', fontSize: '12px' }}>{label}</p>
        <p style={{ fontWeight: '500' }}>{value || 'N/A'}</p>
    </div>
);

const calculateStrength = (loadStr?: string, sizeStr?: string): number => {
    const load = parseFloat(loadStr || '');
    const size = parseFloat(sizeStr || '150');
    if (isNaN(load) || isNaN(size) || size === 0 || load === 0) {
        return 0;
    }
    return (load * 1000) / (size * size);
};

interface TestDataTableProps {
    weights: (string | undefined)[];
    loads: (string | undefined)[];
    cubeSize: string;
}

const TestDataTable: React.FC<TestDataTableProps> = ({ weights, loads, cubeSize }) => {
    const strengths = loads.map(load => calculateStrength(load, cubeSize));
    const validStrengths = strengths.filter(s => s > 0);
    const averageStrength = validStrengths.length > 0
        ? validStrengths.reduce((a, b) => a + b, 0) / validStrengths.length
        : 0;

    const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '13px' };
    const thStyle: React.CSSProperties = { border: '1px solid #ddd', padding: '8px', backgroundColor: '#f9fafb', textAlign: 'center' };
    const tdStyle: React.CSSProperties = { border: '1px solid #ddd', padding: '8px', textAlign: 'center' };

    return (
        <div>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>Cube #</th>
                        <th style={thStyle}>Weight (kg)</th>
                        <th style={thStyle}>Load (kN)</th>
                        <th style={thStyle}>Strength (N/mm²)</th>
                    </tr>
                </thead>
                <tbody>
                    {[1, 2, 3].map((i) => (
                        <tr key={i}>
                            <td style={tdStyle}>{i}</td>
                            <td style={tdStyle}>{weights[i-1] || 'N/A'}</td>
                            <td style={tdStyle}>{loads[i-1] || 'N/A'}</td>
                            <td style={tdStyle}>{strengths[i-1] > 0 ? strengths[i-1].toFixed(2) : 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ marginTop: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>
                Average Strength: <span style={{ fontFamily: 'monospace', marginLeft: '8px', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>
                    {averageStrength > 0 ? averageStrength.toFixed(2) : 'N/A'} N/mm²
                </span>
            </div>
        </div>
    );
};


const PrintableReport: React.FC<PrintableReportProps> = ({ report }) => {
  return (
    <div style={{ fontFamily: 'sans-serif', color: '#111827', padding: '20mm' }}>
      <header style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Concrete Cube Quality Report</h1>
        <p style={{ fontSize: '14px', color: '#4b5563' }}>Report Ref: {report.uniqueRefNo}</p>
      </header>
      
      <main>
        <DetailSection title="Project Information">
            <DetailGrid>
                <DetailItem label="Client Name" value={report.clientName} />
                <DetailItem label="Date of Casting" value={report.dateOfCasting} />
                <DetailItem label="Site / Plant" value={report.siteOrPlant} />
            </DetailGrid>
        </DetailSection>

        <DetailSection title="Casting & Mix Details">
            <DetailGrid columns={4}>
                <DetailItem label="Grade" value={report.grade} />
                <DetailItem label="Mix Code" value={report.mixCode} />
                <DetailItem label="Mix Type" value={report.mixType} />
                <DetailItem label="FT Name" value={report.ftName} />
                <DetailItem label="Cube Size" value={`${report.cubeSize} mm`} />
                <DetailItem label="OPC" value={`${report.opc || 0} kg`} />
                <DetailItem label="Flyash" value={`${report.flyash || 0} kg`} />
                <DetailItem label="PPC" value={`${report.ppc || 0} kg`} />
            </DetailGrid>
        </DetailSection>

        <DetailSection title="7-Day Test Results">
          <TestDataTable
              weights={[report.sevenDaysWeight1, report.sevenDaysWeight2, report.sevenDaysWeight3]}
              loads={[report.sevenDaysLoad1, report.sevenDaysLoad2, report.sevenDaysLoad3]}
              cubeSize={report.cubeSize || '150'}
          />
        </DetailSection>
        
        <DetailSection title="28-Day Test Results">
            <TestDataTable
                weights={[report.twentyEightDaysWeight1, report.twentyEightDaysWeight2, report.twentyEightDaysWeight3]}
                loads={[report.twentyEightDaysLoad1, report.twentyEightDaysLoad2, report.twentyEightDaysLoad3]}
                cubeSize={report.cubeSize || '150'}
            />
        </DetailSection>
        
        <DetailSection title="Observations">
            <p style={{ minHeight: '60px', border: '1px solid #e5e7eb', padding: '8px', borderRadius: '4px', backgroundColor: '#f9fafb' }}>
                {report.observations || 'No observations noted.'}
            </p>
        </DetailSection>
        
        <footer style={{ marginTop: '80px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', fontSize: '14px', color: '#1f2937', pageBreakInside: 'avoid' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'flex-end' }}>
                 <div>
                    <p style={{ marginBottom: '60px' }}><strong>Quality Incharge Name:</strong></p>
                    <div style={{ borderTop: '1px solid #6b7280', paddingTop: '4px' }}>
                        (Name)
                    </div>
                 </div>
                 <div style={{ textAlign: 'left' }}>
                    <p style={{ marginBottom: '60px' }}><strong>Quality Incharge Signature:</strong></p>
                    <div style={{ borderTop: '1px solid #6b7280', paddingTop: '4px' }}>
                        (Signature & Date)
                    </div>
                 </div>
            </div>
             <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '10px', color: '#6b7280' }}>
                This document is generated for physical sign-off. The signed copy should be uploaded to the system to finalize the report.
            </p>
        </footer>
      </main>
    </div>
  );
};

export default PrintableReport;