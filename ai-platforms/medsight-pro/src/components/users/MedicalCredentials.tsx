import React from 'react';
import { 
  Award, Shield, Calendar, Edit, 
  MoreVertical, Download, CheckCircle,
  AlertTriangle, Clock
} from 'lucide-react';

interface MedicalCredentialsProps {
  className?: string;
}

export default function MedicalCredentials({ className = '' }: MedicalCredentialsProps) {
  const credentials = [
    {
      type: 'Medical License',
      number: 'MD-12345678',
      state: 'NY',
      status: 'active',
      expiry: '2025-12-31',
    },
    {
      type: 'Board Certification',
      specialty: 'Radiology',
      board: 'ABR',
      status: 'active',
      expiry: '2028-08-15',
    },
    {
      type: 'DEA License',
      number: 'DEA-BM1234567',
      status: 'active',
      expiry: '2026-06-30',
    },
    {
      type: 'NPI Number',
      number: '1234567890',
      status: 'active',
      expiry: 'N/A',
    },
    {
      type: 'BLS Certification',
      provider: 'AHA',
      status: 'expired',
      expiry: '2023-10-31',
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-medsight-secondary';
      case 'expired': return 'text-medsight-abnormal';
      case 'warning': return 'text-medsight-pending';
      default: return 'text-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-medsight-secondary" />;
      case 'expired': return <AlertTriangle className="w-4 h-4 text-medsight-abnormal" />;
      case 'warning': return <Clock className="w-4 h-4 text-medsight-pending" />;
      default: return <Award className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className={`medsight-glass rounded-xl p-6 border border-medsight-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <Award className="w-5 h-5 text-medsight-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-medsight-primary">Medical Credentials</h3>
            <p className="text-sm text-slate-600">Licenses and certifications</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1 hover:bg-slate-100 rounded">
            <Edit className="w-4 h-4 text-slate-500" />
          </button>
          <button className="p-1 hover:bg-slate-100 rounded">
            <MoreVertical className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {credentials.map((cred, index) => (
          <div key={index} className="medsight-control-glass rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h5 className="font-medium text-slate-800">{cred.type}</h5>
                {cred.specialty && <p className="text-xs text-slate-600">{cred.specialty} ({cred.board})</p>}
                <p className="text-sm text-medsight-primary font-mono mt-1">{cred.number}</p>
              </div>
              <div className={`flex items-center space-x-2 text-xs font-medium ${getStatusColor(cred.status)}`}>
                {getStatusIcon(cred.status)}
                <span>{cred.status.charAt(0).toUpperCase() + cred.status.slice(1)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/50">
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <Calendar className="w-3 h-3" />
                <span>Expires: {cred.expiry}</span>
              </div>
              <button className="btn-medsight text-xs px-2 py-1">
                <Download className="w-3 h-3 mr-1" />
                Verify
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 