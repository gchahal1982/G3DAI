'use client';

import { useState } from 'react';
import { FolderOpenIcon, DocumentTextIcon, UserIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Study {
  id: string;
  patientName: string;
  description: string;
  modality: string;
  date: string;
  status: 'completed' | 'pending_review' | 'ai_flagged';
  thumbnailUrl: string;
}

const mockStudies: Study[] = [
  { id: 'study1', patientName: 'Alice Johnson', description: 'Chest CT for Lung Nodule', modality: 'CT', date: '2024-07-20', status: 'completed', thumbnailUrl: '/thumbnails/ct_chest.png' },
  { id: 'study2', patientName: 'Bob Williams', description: 'Brain MRI for Headache', modality: 'MR', date: '2024-07-19', status: 'pending_review', thumbnailUrl: '/thumbnails/mri_brain.png' },
  { id: 'study3', patientName: 'Charlie Davis', description: 'Abdominal Ultrasound', modality: 'US', date: '2024-07-19', status: 'completed', thumbnailUrl: '/thumbnails/us_abdomen.png' },
  { id: 'study4', patientName: 'Diana Miller', description: 'Knee X-Ray', modality: 'XR', date: '2024-07-18', status: 'ai_flagged', thumbnailUrl: '/thumbnails/xr_knee.png' },
];

export function RecentStudies() {
  const [studies, setStudies] = useState(mockStudies);

  const getStatusIndicator = (status: Study['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" title="Completed" />;
      case 'pending_review':
        return <ClockIcon className="w-5 h-5 text-yellow-500" title="Pending Review" />;
      case 'ai_flagged':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" title="AI Flagged" />;
    }
  };

  return (
    <div className="medsight-glass p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-medsight-primary">Recent Studies</h3>
        <a href="#" className="text-sm font-medium text-medsight-primary hover:underline">View All</a>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {studies.map(study => (
          <div key={study.id} className="flex items-center p-3 glass-card-secondary cursor-pointer">
            <div className="flex-shrink-0 w-16 h-16 rounded-md bg-gray-200 flex items-center justify-center">
              <DocumentTextIcon className="w-8 h-8 text-gray-400" />
              {/* In a real app, you'd use an actual thumbnail: <img src={study.thumbnailUrl} alt={study.description} className="w-16 h-16 rounded-md object-cover" /> */}
            </div>
            <div className="ml-4 flex-grow">
              <p className="font-semibold text-gray-900">{study.description}</p>
              <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                <div className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-1" />
                  <span>{study.patientName}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-gray-100">{study.modality}</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  <span>{study.date}</span>
                </div>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              {getStatusIndicator(study.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
