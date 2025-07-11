import { NextRequest, NextResponse } from 'next/server';

// Mock medical data for development - in production this would come from medical database
const mockMedicalStats = {
  totalStudies: 1247,
  pendingReports: 23,
  criticalFindings: 8,
  aiAccuracy: 96.8,
  averageReadTime: 12.5,
  totalPatients: 892,
  todayStudies: 45,
  radiologists: 15
};

const mockMedicalStudies = [
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
    readTime: 8.5,
    seriesCount: 3,
    imageCount: 245,
    studySize: '125 MB',
    accessionNumber: 'ACC001',
    studyUID: '1.2.840.113619.2.55.3.604688119.971.1234567890.1'
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
    readTime: 15.2,
    seriesCount: 8,
    imageCount: 456,
    studySize: '287 MB',
    accessionNumber: 'ACC002',
    studyUID: '1.2.840.113619.2.55.3.604688119.971.1234567890.2'
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
    readTime: 3.8,
    seriesCount: 2,
    imageCount: 2,
    studySize: '8.2 MB',
    accessionNumber: 'ACC003',
    studyUID: '1.2.840.113619.2.55.3.604688119.971.1234567890.3'
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
    readTime: 11.3,
    seriesCount: 4,
    imageCount: 8,
    studySize: '45 MB',
    accessionNumber: 'ACC004',
    studyUID: '1.2.840.113619.2.55.3.604688119.971.1234567890.4'
  },
  {
    id: 'study_005',
    patientId: 'PT_20240101_005',
    patientName: 'Michael R.',
    studyDate: Date.now() - 1000 * 60 * 120,
    modality: 'Ultrasound',
    bodyPart: 'Abdomen',
    description: 'Abdominal Ultrasound',
    priority: 'routine',
    status: 'pending',
    findings: ['Evaluation in progress'],
    radiologist: 'Dr. Brown',
    aiConfidence: 89.5,
    readTime: 0,
    seriesCount: 1,
    imageCount: 24,
    studySize: '12 MB',
    accessionNumber: 'ACC005',
    studyUID: '1.2.840.113619.2.55.3.604688119.971.1234567890.5'
  }
];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const modality = url.searchParams.get('modality');
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let filteredStudies = mockMedicalStudies;

    // Apply filters
    if (modality && modality !== 'all') {
      filteredStudies = filteredStudies.filter(study => study.modality === modality);
    }

    if (status && status !== 'all') {
      filteredStudies = filteredStudies.filter(study => study.status === status);
    }

    if (priority && priority !== 'all') {
      filteredStudies = filteredStudies.filter(study => study.priority === priority);
    }

    // Apply pagination
    const paginatedStudies = filteredStudies.slice(offset, offset + limit);

    const data = {
      stats: mockMedicalStats,
      recentStudies: paginatedStudies,
      totalCount: filteredStudies.length,
      hasMore: offset + limit < filteredStudies.length
    };

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Medical studies API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical studies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields for new medical study
    if (!body.patientId || !body.modality || !body.bodyPart) {
      return NextResponse.json(
        { error: 'Patient ID, modality, and body part are required' },
        { status: 400 }
      );
    }

    // In production, this would create a study in the medical database
    const newStudy = {
      id: `study_${Date.now()}`,
      patientId: body.patientId,
      patientName: body.patientName || 'Unknown Patient',
      studyDate: Date.now(),
      modality: body.modality,
      bodyPart: body.bodyPart,
      description: body.description || `${body.modality} ${body.bodyPart}`,
      priority: body.priority || 'routine',
      status: 'pending',
      findings: [],
      radiologist: body.radiologist || 'Unassigned',
      aiConfidence: 0,
      readTime: 0,
      seriesCount: 0,
      imageCount: 0,
      studySize: '0 MB',
      accessionNumber: `ACC${Date.now()}`,
      studyUID: `1.2.840.113619.2.55.3.604688119.971.${Date.now()}`
    };

    return NextResponse.json(newStudy, {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Create medical study API error:', error);
    return NextResponse.json(
      { error: 'Failed to create medical study' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields for study update
    if (!body.id) {
      return NextResponse.json(
        { error: 'Study ID is required' },
        { status: 400 }
      );
    }

    // In production, this would update the study in the medical database
    const updatedStudy = {
      ...body,
      lastUpdated: Date.now()
    };

    return NextResponse.json(updatedStudy, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Update medical study API error:', error);
    return NextResponse.json(
      { error: 'Failed to update medical study' },
      { status: 500 }
    );
  }
} 