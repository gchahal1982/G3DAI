import { MedicalDashboardClient } from './medical-dashboard-client';

// Server Component - can fetch data directly
async function getMedicalData() {
  try {
    // In development, return mock data. In production, this would fetch from medical database
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3022'}/api/medical/studies`, {
      cache: 'no-store', // Always fetch fresh data
    });
    
    if (!response.ok) {
      // Return mock data as fallback
      return getMockMedicalData();
    }
    
    return await response.json();
  } catch (error) {
    console.log('Using mock medical data in development mode');
    return getMockMedicalData();
  }
}

function getMockMedicalData() {
  return {
    stats: {
      totalStudies: 1247,
      pendingReports: 23,
      criticalFindings: 8,
      aiAccuracy: 96.8,
      averageReadTime: 12.5,
      totalPatients: 892,
      todayStudies: 45,
      radiologists: 15
    },
    recentStudies: [
      {
        id: 'study_001',
        patientId: 'PT_20240101_001',
        patientName: 'John D.',
        studyDate: Date.now() - 1000 * 60 * 30,
        modality: 'CT',
        bodyPart: 'Chest',
        description: 'CT Chest W/O Contrast',
        priority: 'routine',
        status: 'reviewed',
        findings: ['No acute findings', 'Normal lung fields'],
        radiologist: 'Dr. Smith',
        aiConfidence: 94.2,
        readTime: 8.5
      },
      {
        id: 'study_002',
        patientId: 'PT_20240101_002',
        patientName: 'Sarah M.',
        studyDate: Date.now() - 1000 * 60 * 45,
        modality: 'MRI',
        bodyPart: 'Brain',
        description: 'MRI Brain W/ and W/O Contrast',
        priority: 'urgent',
        status: 'pending',
        findings: ['Possible mass lesion', 'Requires further evaluation'],
        radiologist: 'Dr. Johnson',
        aiConfidence: 87.3,
        readTime: 15.2
      },
      {
        id: 'study_003',
        patientId: 'PT_20240101_003',
        patientName: 'Robert K.',
        studyDate: Date.now() - 1000 * 60 * 60,
        modality: 'X-Ray',
        bodyPart: 'Chest',
        description: 'Chest X-Ray PA and Lateral',
        priority: 'stat',
        status: 'critical',
        findings: ['Pneumothorax', 'Immediate attention required'],
        radiologist: 'Dr. Williams',
        aiConfidence: 98.7,
        readTime: 3.8
      },
      {
        id: 'study_004',
        patientId: 'PT_20240101_004',
        patientName: 'Lisa T.',
        studyDate: Date.now() - 1000 * 60 * 90,
        modality: 'Mammography',
        bodyPart: 'Breast',
        description: 'Diagnostic Mammography Bilateral',
        priority: 'routine',
        status: 'reviewed',
        findings: ['BIRADS 2', 'Benign findings'],
        radiologist: 'Dr. Davis',
        aiConfidence: 92.1,
        readTime: 11.3
      }
    ]
  };
}

export default async function MedicalDashboardPage() {
  const data = await getMedicalData();
  
  return (
    <div className="min-h-screen bg-medical-gradient">
      <MedicalDashboardClient 
        initialStats={data.stats}
        initialStudies={data.recentStudies}
      />
    </div>
  );
} 