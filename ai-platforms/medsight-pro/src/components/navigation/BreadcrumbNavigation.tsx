'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { MedSightBadge } from '@/lib/shared-ui';

// Medical breadcrumb item interface
interface MedicalBreadcrumbItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  type: 'system' | 'workspace' | 'case' | 'study' | 'series' | 'image';
  metadata?: {
    patientId?: string;
    studyId?: string;
    seriesId?: string;
    modality?: string;
    timestamp?: Date;
    status?: 'active' | 'pending' | 'completed' | 'critical';
  };
}

// Medical breadcrumb props
interface BreadcrumbNavigationProps {
  className?: string;
  showMetadata?: boolean;
  maxItems?: number;
}

// Medical breadcrumb configuration
const MEDICAL_BREADCRUMB_CONFIG = {
  separators: {
    system: '/',
    workspace: '→',
    case: '•',
    study: '›',
    series: '›',
    image: '›'
  },
  icons: {
    system: '🏥',
    workspace: '🔬',
    case: '📋',
    study: '📊',
    series: '📷',
    image: '🖼️'
  },
  colors: {
    system: 'text-blue-400',
    workspace: 'text-green-400',
    case: 'text-yellow-400',
    study: 'text-purple-400',
    series: 'text-pink-400',
    image: 'text-orange-400'
  }
};

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  className = '',
  showMetadata = true,
  maxItems = 6
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<MedicalBreadcrumbItem[]>([]);
  const [currentCase, setCurrentCase] = useState<any>(null);

  // Generate breadcrumbs from current path
  useEffect(() => {
    const generateBreadcrumbs = (): MedicalBreadcrumbItem[] => {
      const pathSegments = pathname.split('/').filter(Boolean);
      const breadcrumbItems: MedicalBreadcrumbItem[] = [];

      // Always start with system root
      breadcrumbItems.push({
        id: 'root',
        label: 'MedSight Pro',
        href: '/dashboard',
        icon: '🏥',
        type: 'system'
      });

      // Parse path segments and build breadcrumbs
      for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        const previousSegments = pathSegments.slice(0, i + 1);
        const href = '/' + previousSegments.join('/');

        let breadcrumbItem: MedicalBreadcrumbItem | null = null;

        switch (segment) {
          case 'dashboard':
            breadcrumbItem = {
              id: 'dashboard',
              label: 'Dashboard',
              href,
              icon: '📊',
              type: 'system'
            };
            break;

          case 'workspace':
            breadcrumbItem = {
              id: 'workspace',
              label: 'Medical Workspace',
              href,
              icon: '🔬',
              type: 'workspace'
            };
            break;

          case 'imaging':
            breadcrumbItem = {
              id: 'imaging',
              label: 'Medical Imaging',
              href,
              icon: '📱',
              type: 'workspace',
              metadata: {
                status: 'active'
              }
            };
            break;

          case 'ai-analysis':
            breadcrumbItem = {
              id: 'ai-analysis',
              label: 'AI Analysis',
              href,
              icon: '🤖',
              type: 'workspace',
              metadata: {
                status: 'active'
              }
            };
            break;

          case 'collaboration':
            breadcrumbItem = {
              id: 'collaboration',
              label: 'Collaboration',
              href,
              icon: '👥',
              type: 'workspace',
              metadata: {
                status: 'active'
              }
            };
            break;

          case 'cases':
            breadcrumbItem = {
              id: 'cases',
              label: 'Medical Cases',
              href,
              icon: '📋',
              type: 'case'
            };
            break;

          case 'studies':
            breadcrumbItem = {
              id: 'studies',
              label: 'Medical Studies',
              href,
              icon: '📊',
              type: 'study'
            };
            break;

          case 'admin':
            breadcrumbItem = {
              id: 'admin',
              label: 'Administration',
              href,
              icon: '⚙️',
              type: 'system'
            };
            break;

          default:
            // Handle dynamic segments (IDs, UUIDs, etc.)
            if (segment.match(/^[a-f0-9-]{36}$/) || segment.match(/^\d+$/)) {
              // This looks like an ID - create appropriate breadcrumb
              const previousType = breadcrumbItems[breadcrumbItems.length - 1]?.type;
              
              if (previousType === 'case') {
                breadcrumbItem = {
                  id: `case-${segment}`,
                  label: `Case ${segment.slice(-8)}`,
                  href,
                  icon: '📋',
                  type: 'case',
                  metadata: {
                    patientId: segment,
                    status: 'active',
                    timestamp: new Date()
                  }
                };
              } else if (previousType === 'study') {
                breadcrumbItem = {
                  id: `study-${segment}`,
                  label: `Study ${segment.slice(-8)}`,
                  href,
                  icon: '📊',
                  type: 'study',
                  metadata: {
                    studyId: segment,
                    modality: 'CT',
                    status: 'active',
                    timestamp: new Date()
                  }
                };
              }
            } else {
              // Regular text segment
              breadcrumbItem = {
                id: segment,
                label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
                href,
                type: 'system'
              };
            }
            break;
        }

        if (breadcrumbItem) {
          breadcrumbItems.push(breadcrumbItem);
        }
      }

      return breadcrumbItems;
    };

    setBreadcrumbs(generateBreadcrumbs());
  }, [pathname]);

  // Handle breadcrumb truncation for long paths
  const getDisplayBreadcrumbs = (): MedicalBreadcrumbItem[] => {
    if (breadcrumbs.length <= maxItems) {
      return breadcrumbs;
    }

    // Always show first item (root) and last few items
    const firstItem = breadcrumbs[0];
    const lastItems = breadcrumbs.slice(-3);
    
    return [
      firstItem,
      {
        id: 'ellipsis',
        label: '...',
        href: '#',
        type: 'system'
      },
      ...lastItems
    ];
  };

  // Get separator for breadcrumb type
  const getSeparator = (type: string): string => {
    return MEDICAL_BREADCRUMB_CONFIG.separators[type as keyof typeof MEDICAL_BREADCRUMB_CONFIG.separators] || '/';
  };

  // Get color for breadcrumb type
  const getColor = (type: string): string => {
    return MEDICAL_BREADCRUMB_CONFIG.colors[type as keyof typeof MEDICAL_BREADCRUMB_CONFIG.colors] || 'text-white/70';
  };

  // Handle breadcrumb click
  const handleBreadcrumbClick = (item: MedicalBreadcrumbItem, event: React.MouseEvent) => {
    if (item.id === 'ellipsis') {
      event.preventDefault();
      return;
    }
    // Navigation will be handled by Link component
  };

  const displayBreadcrumbs = getDisplayBreadcrumbs();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Medical Status Indicator */}
      <div className="flex items-center space-x-2 mr-3">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span 
          className="text-xs text-green-400"
          style={{ 
            fontFamily: 'var(--font-primary)',
            letterSpacing: '0.01em'
          }}
        >
          Active Session
        </span>
      </div>

      {/* Breadcrumb Items */}
      <nav className="flex items-center space-x-2 flex-1">
        {displayBreadcrumbs.map((item, index) => {
          const isLast = index === displayBreadcrumbs.length - 1;
          const isEllipsis = item.id === 'ellipsis';
          
          return (
            <React.Fragment key={item.id}>
              {/* Breadcrumb Item */}
              <div className="flex items-center space-x-2">
                {isEllipsis ? (
                  <span 
                    className="text-white/40 cursor-default"
                    style={{ 
                      fontFamily: 'var(--font-primary)',
                      letterSpacing: '0.01em'
                    }}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    onClick={(e) => handleBreadcrumbClick(item, e)}
                    className={`
                      flex items-center space-x-1 transition-colors group
                      ${isLast 
                        ? `${getColor(item.type)} font-medium` 
                        : 'text-white/60 hover:text-white/80'
                      }
                    `}
                  >
                    {item.icon && (
                      <span className="text-sm">{item.icon}</span>
                    )}
                    <span 
                      className="text-sm"
                      style={{ 
                        fontFamily: 'var(--font-primary)',
                        letterSpacing: '0.01em',
                        lineHeight: '1.6'
                      }}
                    >
                      {item.label}
                    </span>
                    
                    {/* Medical Metadata */}
                    {showMetadata && item.metadata && (
                      <div className="flex items-center space-x-1 ml-2">
                        {item.metadata.status && (
                          <MedSightBadge 
                            variant="status"
                            medicalVariant={
                              item.metadata.status === 'critical' ? 'critical' :
                              item.metadata.status === 'pending' ? 'pending' :
                              item.metadata.status === 'completed' ? 'normal' : 'pending'
                            }
                            className="text-xs"
                          >
                            {item.metadata.status}
                          </MedSightBadge>
                        )}
                        
                        {item.metadata.modality && (
                          <span 
                            className="text-xs text-white/50 font-mono"
                            style={{ letterSpacing: '0.02em' }}
                          >
                            {item.metadata.modality}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                )}
              </div>

              {/* Separator */}
              {!isLast && (
                <span 
                  className="text-white/30 text-sm"
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  {getSeparator(item.type)}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Medical Context Info */}
      {showMetadata && currentCase && (
        <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-white/10">
          <div className="text-xs text-white/60">
            <span 
              style={{ 
                fontFamily: 'var(--font-primary)',
                letterSpacing: '0.01em'
              }}
            >
              Patient ID:
            </span>
            <span 
              className="text-blue-300 font-mono ml-1"
              style={{ letterSpacing: '0.02em' }}
            >
              {currentCase.patientId}
            </span>
          </div>
          
          <div className="text-xs text-white/60">
            <span 
              style={{ 
                fontFamily: 'var(--font-primary)',
                letterSpacing: '0.01em'
              }}
            >
              Study:
            </span>
            <span 
              className="text-green-300 font-mono ml-1"
              style={{ letterSpacing: '0.02em' }}
            >
              {currentCase.studyId}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}; 