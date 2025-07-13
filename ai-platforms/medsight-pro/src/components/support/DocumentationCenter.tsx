"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Star, 
  Heart, 
  User, 
  Calendar, 
  Tag, 
  Eye, 
  ThumbsUp, 
  MessageCircle, 
  Share, 
  ExternalLink, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Clock, 
  Users, 
  BarChart3, 
  TrendingUp,
  Shield,
  Lock,
  Globe,
  Code,
  Terminal,
  Database,
  Server,
  Cpu,
  Monitor,
  Smartphone,
  Tablet,
  Headphones,
  Mail,
  Phone,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  Info,
  Lightbulb,
  Bookmark,
  Flag,
  Archive,
  Folder,
  FolderOpen,
  File,
  Image,
  Video,
  PlayCircle,
  PauseCircle,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Copy,
  Printer,
  Clipboard,
  Link,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  RefreshCw,
  Navigation,
  Compass,
  Map,
  Target,
  Zap,
  Activity,
  Gauge,
  Layers,
  Grid,
  List,
  GridIcon,
  LayoutGrid,
  Layout,
  Sidebar,
  Menu,
  X,
  Bell,
  BellOff,
  Check,
  CheckSquare,
  Square,
  Circle,
  Dot,
  Hash,
  AtSign,
  Percent,
  DollarSign,
  Euro,
  Wrench,
  Cog,
  Hammer,
  Scissors,
  Ruler,
  Pen,
  PenTool,
  Pencil,
  Eraser,
  Paintbrush,
  Palette,
  Droplet,
  Beaker,
  FlaskConical,
  TestTube,
  Microscope,
  Stethoscope,
  Syringe,
  Pill,
  Bandage,
  Cross,
  Plus as PlusIcon,
  Minus,
  Divide,
  Equal,
  Calculator,
  Percent as PercentIcon,
  DollarSign as DollarSignIcon
} from 'lucide-react';

interface DocumentationSection {
  id: string;
  title: string;
  category: 'user_guide' | 'technical' | 'api' | 'compliance' | 'tutorial' | 'troubleshooting';
  description: string;
  content: string;
  author: string;
  lastUpdated: Date;
  views: number;
  likes: number;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number;
  featured: boolean;
  medicalCompliance: boolean;
  attachments: {
    type: 'pdf' | 'video' | 'image' | 'code';
    name: string;
    url: string;
    size: string;
  }[];
}

interface DocumentationCategory {
  id: string;
  name: string;
  icon: any;
  description: string;
  color: string;
  sections: DocumentationSection[];
}

interface SearchResult {
  section: DocumentationSection;
  relevance: number;
  highlights: string[];
}

const DocumentationCenter = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('user_guide');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<DocumentationSection | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [documentationCategories, setDocumentationCategories] = useState<DocumentationCategory[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'updated' | 'popular' | 'alphabetical'>('updated');
  const [filterBy, setFilterBy] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<DocumentationSection[]>([]);

  // Initialize documentation data
  useEffect(() => {
    const initializeDocumentation = () => {
      const categories: DocumentationCategory[] = [
        {
          id: 'user_guide',
          name: 'User Guide',
          icon: User,
          description: 'Complete user guides and getting started documentation',
          color: 'blue',
          sections: [
            {
              id: 'getting-started',
              title: 'Getting Started with MedSight Pro',
              category: 'user_guide',
              description: 'Complete introduction to MedSight Pro platform and basic workflows',
              content: `
                # Getting Started with MedSight Pro
                
                Welcome to MedSight Pro, your comprehensive medical imaging and AI analysis platform.
                
                ## Overview
                MedSight Pro is designed to provide healthcare professionals with advanced medical imaging capabilities, AI-assisted diagnostics, and comprehensive patient data management tools.
                
                ## Key Features
                - **DICOM Imaging**: Full support for medical imaging standards
                - **AI Analysis**: Advanced machine learning for diagnostic assistance
                - **3D Visualization**: Interactive 3D medical imaging and rendering
                - **Workflow Management**: Streamlined clinical workflows
                - **Compliance**: HIPAA, FDA, and medical device compliance
                
                ## First Steps
                1. **Login**: Use your medical professional credentials
                2. **Dashboard**: Navigate to your personalized medical dashboard
                3. **Workspace**: Select the appropriate workspace for your specialty
                4. **Imaging**: Upload and analyze medical images
                5. **Reports**: Generate and manage patient reports
                
                ## Medical Workspaces
                - **Imaging Workspace**: DICOM processing and analysis
                - **AI Analysis**: Machine learning diagnostic tools
                - **Collaboration**: Multi-provider case review
                - **XR Workspace**: Virtual and augmented reality tools
                
                ## Getting Help
                - Use the help icon (?) for contextual assistance
                - Contact technical support for urgent issues
                - Access training materials in the Documentation Center
                
                ## Medical Compliance
                All features are designed to meet medical device regulations and healthcare compliance standards.
              `,
              author: 'MedSight Pro Team',
              lastUpdated: new Date(),
              views: 1284,
              likes: 156,
              tags: ['getting-started', 'basics', 'overview', 'medical'],
              difficulty: 'beginner',
              estimatedReadTime: 8,
              featured: true,
              medicalCompliance: true,
              attachments: [
                {
                  type: 'pdf',
                  name: 'MedSight Pro Quick Start Guide.pdf',
                  url: '/docs/quick-start-guide.pdf',
                  size: '2.3 MB'
                },
                {
                  type: 'video',
                  name: 'Platform Overview Video',
                  url: '/videos/platform-overview.mp4',
                  size: '45.7 MB'
                }
              ]
            },
            {
              id: 'medical-imaging',
              title: 'Medical Imaging Workflows',
              category: 'user_guide',
              description: 'Comprehensive guide to DICOM processing and medical imaging workflows',
              content: `
                # Medical Imaging Workflows
                
                ## DICOM Processing
                Learn how to work with DICOM medical images in MedSight Pro.
                
                ### Supported Modalities
                - **CT (Computed Tomography)**: Cross-sectional imaging
                - **MRI (Magnetic Resonance Imaging)**: Soft tissue imaging
                - **X-Ray**: Radiographic imaging
                - **Ultrasound**: Real-time imaging
                - **PET (Positron Emission Tomography)**: Metabolic imaging
                - **Mammography**: Breast imaging
                
                ### Image Upload and Processing
                1. Navigate to the Imaging Workspace
                2. Select "Upload DICOM" from the toolbar
                3. Choose your DICOM files or series
                4. Wait for processing and quality checks
                5. View images in the integrated viewer
                
                ### Viewing and Analysis
                - **Window/Level**: Adjust image contrast and brightness
                - **Measurements**: Distance, area, and volume measurements
                - **Annotations**: Add clinical notes and markers
                - **MPR (Multi-Planar Reconstruction)**: View in multiple planes
                - **3D Rendering**: Generate 3D visualizations
                
                ### AI-Assisted Analysis
                - Enable AI analysis for diagnostic assistance
                - Review AI-generated findings and recommendations
                - Validate AI results with clinical expertise
                - Generate comprehensive reports
                
                ## Clinical Workflows
                - **Case Management**: Organize patient studies
                - **Report Generation**: Create clinical reports
                - **Collaboration**: Share findings with colleagues
                - **Archive**: Store and retrieve historical studies
                
                ## Quality Assurance
                - Image quality validation
                - DICOM conformance checking
                - Clinical workflow validation
                - Audit trail maintenance
              `,
              author: 'Dr. Sarah Chen, Radiologist',
              lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
              views: 892,
              likes: 124,
              tags: ['medical-imaging', 'dicom', 'workflow', 'radiology'],
              difficulty: 'intermediate',
              estimatedReadTime: 12,
              featured: true,
              medicalCompliance: true,
              attachments: [
                {
                  type: 'pdf',
                  name: 'DICOM Workflow Guide.pdf',
                  url: '/docs/dicom-workflow.pdf',
                  size: '4.1 MB'
                },
                {
                  type: 'video',
                  name: 'Medical Imaging Tutorial',
                  url: '/videos/medical-imaging-tutorial.mp4',
                  size: '78.3 MB'
                }
              ]
            },
            {
              id: 'ai-diagnostics',
              title: 'AI-Assisted Diagnostics',
              category: 'user_guide',
              description: 'Guide to using AI tools for diagnostic assistance and analysis',
              content: `
                # AI-Assisted Diagnostics
                
                ## Introduction
                MedSight Pro's AI capabilities provide diagnostic assistance while maintaining clinical oversight.
                
                ### AI Features
                - **Image Analysis**: Automated image interpretation
                - **Pattern Recognition**: Identification of abnormalities
                - **Quantitative Analysis**: Measurement and scoring
                - **Predictive Analytics**: Risk assessment and prognosis
                - **Comparative Analysis**: Historical case comparison
                
                ### Using AI Tools
                1. **Select AI Model**: Choose appropriate AI model for your case
                2. **Configure Parameters**: Set analysis parameters
                3. **Run Analysis**: Execute AI processing
                4. **Review Results**: Validate AI findings
                5. **Clinical Correlation**: Integrate with clinical assessment
                
                ### AI Model Types
                - **Chest X-Ray Analysis**: Pneumonia, fractures, masses
                - **CT Scan Analysis**: Tumor detection, organ segmentation
                - **MRI Analysis**: Brain lesions, cardiac function
                - **Pathology Analysis**: Cell classification, tissue analysis
                
                ### Clinical Decision Support
                - AI recommendations with confidence scores
                - Evidence-based clinical guidelines
                - Differential diagnosis suggestions
                - Treatment planning assistance
                
                ### Quality and Validation
                - AI model validation and performance metrics
                - Clinical validation requirements
                - Continuous learning and improvement
                - Regulatory compliance (FDA approval)
                
                ## Best Practices
                - Always validate AI results with clinical expertise
                - Understand AI model limitations and capabilities
                - Maintain clinical oversight and responsibility
                - Document AI assistance in clinical records
                
                ## Ethical Considerations
                - Patient privacy and data protection
                - Informed consent for AI analysis
                - Transparency in AI-assisted decisions
                - Bias detection and mitigation
              `,
              author: 'Dr. Michael Rodriguez, AI Specialist',
              lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
              views: 672,
              likes: 89,
              tags: ['ai', 'diagnostics', 'machine-learning', 'clinical-decision-support'],
              difficulty: 'advanced',
              estimatedReadTime: 15,
              featured: false,
              medicalCompliance: true,
              attachments: [
                {
                  type: 'pdf',
                  name: 'AI Diagnostics Guide.pdf',
                  url: '/docs/ai-diagnostics.pdf',
                  size: '3.7 MB'
                }
              ]
            }
          ]
        },
        {
          id: 'technical',
          name: 'Technical Documentation',
          icon: Code,
          description: 'Technical implementation details and system architecture',
          color: 'green',
          sections: [
            {
              id: 'system-architecture',
              title: 'System Architecture Overview',
              category: 'technical',
              description: 'Comprehensive overview of MedSight Pro system architecture',
              content: `
                # System Architecture Overview
                
                ## Architecture Principles
                MedSight Pro is built on a modern, scalable, and secure architecture designed for medical applications.
                
                ### Core Components
                - **Frontend**: React-based web application with TypeScript
                - **Backend**: Node.js microservices architecture
                - **Database**: PostgreSQL with medical data optimization
                - **DICOM Server**: Orthanc DICOM server integration
                - **AI Engine**: TensorFlow/PyTorch ML model serving
                - **Storage**: HIPAA-compliant cloud storage
                
                ### Medical Standards Compliance
                - **DICOM**: Full DICOM 3.0 compliance
                - **HL7 FHIR**: Healthcare interoperability
                - **HIPAA**: Privacy and security compliance
                - **FDA**: Medical device software validation
                
                ### Security Architecture
                - **Authentication**: Multi-factor authentication
                - **Authorization**: Role-based access control
                - **Encryption**: End-to-end data encryption
                - **Audit**: Comprehensive audit logging
                - **Network**: Secure network communication
                
                ### Scalability and Performance
                - **Load Balancing**: Multi-instance deployment
                - **Caching**: Redis-based caching layer
                - **CDN**: Content delivery network
                - **Database**: Read replicas and partitioning
                - **Monitoring**: Real-time performance monitoring
                
                ## Deployment Architecture
                - **Production**: Kubernetes orchestration
                - **Development**: Docker containerization
                - **Testing**: Automated CI/CD pipeline
                - **Monitoring**: Comprehensive observability
                
                ## Integration Points
                - **EMR Systems**: Electronic medical records
                - **PACS**: Picture archiving and communication
                - **RIS**: Radiology information systems
                - **LIS**: Laboratory information systems
                - **Medical Devices**: Direct device integration
              `,
              author: 'Technical Architecture Team',
              lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
              views: 543,
              likes: 67,
              tags: ['architecture', 'technical', 'system-design', 'medical-standards'],
              difficulty: 'advanced',
              estimatedReadTime: 18,
              featured: false,
              medicalCompliance: true,
              attachments: [
                {
                  type: 'pdf',
                  name: 'Architecture Diagram.pdf',
                  url: '/docs/architecture-diagram.pdf',
                  size: '5.2 MB'
                }
              ]
            },
            {
              id: 'dicom-integration',
              title: 'DICOM Integration Guide',
              category: 'technical',
              description: 'Technical guide for DICOM server integration and configuration',
              content: `
                # DICOM Integration Guide
                
                ## DICOM Server Configuration
                Step-by-step guide to configure DICOM server integration.
                
                ### Orthanc Configuration
                - Server installation and setup
                - Configuration file parameters
                - Plugin management
                - Security configuration
                
                ### Network Configuration
                - AE Title configuration
                - Port and network settings
                - Firewall and security rules
                - SSL/TLS configuration
                
                ### Storage Configuration
                - Storage backend setup
                - Compression settings
                - Backup and recovery
                - Data retention policies
                
                ## DICOM Services
                - **C-STORE**: Store DICOM objects
                - **C-FIND**: Query DICOM objects
                - **C-MOVE**: Retrieve DICOM objects
                - **C-GET**: Get DICOM objects
                - **C-ECHO**: Verify DICOM connectivity
                
                ## Custom DICOM Tags
                - Private tag handling
                - Tag modification
                - Anonymization rules
                - Metadata extraction
                
                ## Performance Optimization
                - Concurrent connection limits
                - Memory and CPU optimization
                - Network bandwidth management
                - Query optimization
                
                ## Troubleshooting
                - Common connectivity issues
                - Performance problems
                - Data integrity issues
                - Error message interpretation
              `,
              author: 'DICOM Integration Team',
              lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
              views: 234,
              likes: 45,
              tags: ['dicom', 'integration', 'orthanc', 'technical'],
              difficulty: 'advanced',
              estimatedReadTime: 25,
              featured: false,
              medicalCompliance: true,
              attachments: [
                {
                  type: 'code',
                  name: 'orthanc-config.json',
                  url: '/code/orthanc-config.json',
                  size: '12 KB'
                }
              ]
            }
          ]
        },
        {
          id: 'api',
          name: 'API Reference',
          icon: Terminal,
          description: 'Complete API documentation and integration guides',
          color: 'purple',
          sections: [
            {
              id: 'rest-api',
              title: 'REST API Reference',
              category: 'api',
              description: 'Complete REST API documentation with examples',
              content: `
                # REST API Reference
                
                ## Authentication
                All API requests require authentication using JWT tokens.
                
                ### Authentication Flow
                1. **Login**: POST /api/auth/login
                2. **Token**: Receive JWT token
                3. **Headers**: Include token in Authorization header
                4. **Refresh**: Use refresh token for renewal
                
                ### Base URL
                \`\`\`
                https://api.medsight-pro.com/v1
                \`\`\`
                
                ## Medical Imaging API
                
                ### Upload DICOM
                \`\`\`http
                POST /api/imaging/upload
                Content-Type: multipart/form-data
                Authorization: Bearer <token>
                
                {
                  "file": <dicom-file>,
                  "patient_id": "string",
                  "study_id": "string",
                  "metadata": {}
                }
                \`\`\`
                
                ### Get Study
                \`\`\`http
                GET /api/imaging/studies/{study_id}
                Authorization: Bearer <token>
                
                Response:
                {
                  "study_id": "string",
                  "patient_id": "string",
                  "study_date": "2023-01-01",
                  "modality": "CT",
                  "series": [...]
                }
                \`\`\`
                
                ## AI Analysis API
                
                ### Run Analysis
                \`\`\`http
                POST /api/ai/analyze
                Authorization: Bearer <token>
                
                {
                  "study_id": "string",
                  "model_type": "chest_xray",
                  "parameters": {}
                }
                \`\`\`
                
                ### Get Analysis Results
                \`\`\`http
                GET /api/ai/results/{analysis_id}
                Authorization: Bearer <token>
                
                Response:
                {
                  "analysis_id": "string",
                  "status": "completed",
                  "results": {
                    "findings": [...],
                    "confidence": 0.95,
                    "recommendations": [...]
                  }
                }
                \`\`\`
                
                ## Error Handling
                All API endpoints return standard HTTP status codes and structured error responses.
                
                ### Error Response Format
                \`\`\`json
                {
                  "error": {
                    "code": "INVALID_REQUEST",
                    "message": "Description of error",
                    "details": {}
                  }
                }
                \`\`\`
                
                ## Rate Limiting
                - **Rate Limit**: 1000 requests per hour
                - **Headers**: X-RateLimit-Limit, X-RateLimit-Remaining
                - **Exceeded**: 429 Too Many Requests
                
                ## SDK and Libraries
                - **JavaScript**: npm install medsight-pro-sdk
                - **Python**: pip install medsight-pro-sdk
                - **Java**: Maven/Gradle integration
                - **C#**: NuGet package
              `,
              author: 'API Development Team',
              lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
              views: 456,
              likes: 78,
              tags: ['api', 'rest', 'integration', 'development'],
              difficulty: 'intermediate',
              estimatedReadTime: 20,
              featured: true,
              medicalCompliance: true,
              attachments: [
                {
                  type: 'pdf',
                  name: 'API Reference.pdf',
                  url: '/docs/api-reference.pdf',
                  size: '8.4 MB'
                }
              ]
            }
          ]
        },
        {
          id: 'compliance',
          name: 'Medical Compliance',
          icon: Shield,
          description: 'Regulatory compliance and medical standards documentation',
          color: 'red',
          sections: [
            {
              id: 'hipaa-compliance',
              title: 'HIPAA Compliance Guide',
              category: 'compliance',
              description: 'Complete HIPAA compliance documentation and procedures',
              content: `
                # HIPAA Compliance Guide
                
                ## Overview
                MedSight Pro is designed to meet HIPAA (Health Insurance Portability and Accountability Act) requirements.
                
                ### HIPAA Requirements
                - **Privacy Rule**: PHI protection standards
                - **Security Rule**: Administrative, physical, and technical safeguards
                - **Breach Notification**: Incident response procedures
                - **Business Associate**: Third-party compliance
                
                ### Technical Safeguards
                - **Access Control**: Unique user identification
                - **Audit Controls**: Hardware, software, and procedural mechanisms
                - **Integrity**: PHI alteration or destruction protection
                - **Person or Entity Authentication**: User identity verification
                - **Transmission Security**: End-to-end encryption
                
                ### Administrative Safeguards
                - **Security Officer**: Assigned security responsibility
                - **Workforce Training**: Security awareness education
                - **Information Access**: Minimum necessary access
                - **Contingency Plan**: Data backup and recovery
                
                ### Physical Safeguards
                - **Facility Access**: Controlled access to systems
                - **Workstation Use**: Restricted access to PHI
                - **Device Controls**: Hardware and media protection
                
                ## Implementation
                - **Risk Assessment**: Regular security evaluations
                - **Policies and Procedures**: Documented security measures
                - **Training**: Staff education and certification
                - **Monitoring**: Continuous compliance monitoring
                
                ## Audit and Reporting
                - **Audit Logs**: Comprehensive access logging
                - **Regular Audits**: Periodic compliance reviews
                - **Incident Response**: Breach notification procedures
                - **Documentation**: Compliance evidence maintenance
                
                ## Patient Rights
                - **Access Rights**: Patient access to PHI
                - **Amendment Rights**: PHI correction procedures
                - **Accounting**: PHI disclosure tracking
                - **Complaints**: Patient complaint procedures
              `,
              author: 'Compliance Team',
              lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
              views: 789,
              likes: 112,
              tags: ['hipaa', 'compliance', 'privacy', 'security'],
              difficulty: 'intermediate',
              estimatedReadTime: 16,
              featured: true,
              medicalCompliance: true,
              attachments: [
                {
                  type: 'pdf',
                  name: 'HIPAA Compliance Manual.pdf',
                  url: '/docs/hipaa-compliance.pdf',
                  size: '6.8 MB'
                }
              ]
            },
            {
              id: 'fda-compliance',
              title: 'FDA Medical Device Compliance',
              category: 'compliance',
              description: 'FDA Class II medical device software compliance documentation',
              content: `
                # FDA Medical Device Compliance
                
                ## FDA Classification
                MedSight Pro is classified as a Class II medical device software.
                
                ### Regulatory Requirements
                - **510(k) Clearance**: Premarket notification
                - **Quality System**: ISO 13485 compliance
                - **Clinical Evaluation**: Safety and effectiveness
                - **Labeling**: Device labeling requirements
                
                ### Software Lifecycle
                - **IEC 62304**: Medical device software lifecycle
                - **Risk Management**: ISO 14971 risk analysis
                - **Usability**: IEC 62366 usability engineering
                - **Cybersecurity**: FDA cybersecurity guidance
                
                ### Documentation Requirements
                - **Device Description**: Intended use and indications
                - **Software Documentation**: Architecture and design
                - **Risk Analysis**: Hazard identification and mitigation
                - **Verification and Validation**: Testing documentation
                
                ## Quality Management
                - **Design Controls**: Systematic design process
                - **Change Control**: Modification procedures
                - **Configuration Management**: Version control
                - **Corrective and Preventive Actions**: CAPA procedures
                
                ## Post-Market Surveillance
                - **Adverse Event Reporting**: MDR requirements
                - **Software Updates**: Change notification
                - **Performance Monitoring**: Real-world evidence
                - **Recall Procedures**: Product correction protocols
                
                ## Clinical Evidence
                - **Clinical Evaluation**: Performance validation
                - **Literature Review**: Scientific evidence
                - **Post-Market Studies**: Ongoing clinical data
                - **Real-World Evidence**: Usage data analysis
              `,
              author: 'Regulatory Affairs Team',
              lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
              views: 345,
              likes: 56,
              tags: ['fda', 'medical-device', 'compliance', 'regulatory'],
              difficulty: 'advanced',
              estimatedReadTime: 22,
              featured: false,
              medicalCompliance: true,
              attachments: [
                {
                  type: 'pdf',
                  name: 'FDA Compliance Guide.pdf',
                  url: '/docs/fda-compliance.pdf',
                  size: '9.1 MB'
                }
              ]
            }
          ]
        },
        {
          id: 'tutorial',
          name: 'Tutorials',
          icon: PlayCircle,
          description: 'Step-by-step tutorials and learning materials',
          color: 'orange',
          sections: [
            {
              id: 'basic-workflow',
              title: 'Basic Medical Imaging Workflow',
              category: 'tutorial',
              description: 'Step-by-step tutorial for basic medical imaging workflow',
              content: `
                # Basic Medical Imaging Workflow Tutorial
                
                ## Overview
                This tutorial walks through a complete medical imaging workflow from image upload to report generation.
                
                ### Prerequisites
                - MedSight Pro account with appropriate permissions
                - Sample DICOM images or access to medical imaging data
                - Basic understanding of medical imaging concepts
                
                ## Step 1: Login and Dashboard
                1. Navigate to MedSight Pro login page
                2. Enter your medical professional credentials
                3. Complete multi-factor authentication
                4. Review your personalized dashboard
                
                ## Step 2: Access Imaging Workspace
                1. Click on "Imaging Workspace" from the main menu
                2. Review the workspace overview and tools
                3. Familiarize yourself with the interface layout
                
                ## Step 3: Upload DICOM Images
                1. Click "Upload DICOM" button
                2. Select DICOM files from your computer
                3. Verify patient information and study details
                4. Wait for upload and processing completion
                
                ## Step 4: Image Review and Analysis
                1. Open the uploaded study in the DICOM viewer
                2. Adjust window/level settings for optimal viewing
                3. Navigate through image series and slices
                4. Use measurement tools for quantitative analysis
                
                ## Step 5: AI-Assisted Analysis
                1. Enable AI analysis for the study
                2. Select appropriate AI models for your case
                3. Review AI-generated findings and recommendations
                4. Validate AI results with your clinical expertise
                
                ## Step 6: Annotations and Findings
                1. Add clinical annotations to relevant images
                2. Mark areas of interest or abnormalities
                3. Document key findings and observations
                4. Create structured reports based on findings
                
                ## Step 7: Report Generation
                1. Use the report template for your specialty
                2. Include key images and measurements
                3. Document clinical impressions and recommendations
                4. Review and finalize the report
                
                ## Step 8: Collaboration and Sharing
                1. Share findings with colleagues for consultation
                2. Use collaboration tools for case discussion
                3. Obtain second opinions when needed
                4. Document collaborative decisions
                
                ## Step 9: Archive and Storage
                1. Save the completed study and report
                2. Ensure proper archival and backup
                3. Maintain audit trail for compliance
                4. Update patient records as needed
                
                ## Best Practices
                - Always verify patient identity before analysis
                - Document all clinical decisions and reasoning
                - Use AI as an aid, not a replacement for clinical judgment
                - Maintain patient privacy and confidentiality
                - Follow institutional protocols and guidelines
                
                ## Troubleshooting
                - Image quality issues: Check DICOM tags and reconstruction
                - AI analysis errors: Verify model compatibility and parameters
                - Report generation problems: Check template configuration
                - Collaboration issues: Verify user permissions and access
              `,
              author: 'Medical Training Team',
              lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
              views: 1123,
              likes: 198,
              tags: ['tutorial', 'workflow', 'medical-imaging', 'step-by-step'],
              difficulty: 'beginner',
              estimatedReadTime: 25,
              featured: true,
              medicalCompliance: true,
              attachments: [
                {
                  type: 'video',
                  name: 'Basic Workflow Tutorial.mp4',
                  url: '/videos/basic-workflow-tutorial.mp4',
                  size: '156.7 MB'
                },
                {
                  type: 'pdf',
                  name: 'Workflow Checklist.pdf',
                  url: '/docs/workflow-checklist.pdf',
                  size: '1.2 MB'
                }
              ]
            }
          ]
        },
        {
          id: 'troubleshooting',
          name: 'Troubleshooting',
          icon: Wrench,
          description: 'Common issues and solutions for MedSight Pro',
          color: 'yellow',
          sections: [
            {
              id: 'common-issues',
              title: 'Common Issues and Solutions',
              category: 'troubleshooting',
              description: 'Frequently encountered issues and their solutions',
              content: `
                # Common Issues and Solutions
                
                ## Image Upload Issues
                
                ### Problem: DICOM Upload Fails
                **Symptoms**: Upload progress stops, error messages, file rejection
                
                **Solutions**:
                1. **File Format**: Ensure files are valid DICOM format
                2. **File Size**: Check file size limits (max 2GB per file)
                3. **Network**: Verify stable internet connection
                4. **Permissions**: Confirm user has upload permissions
                5. **Disk Space**: Check available server storage
                
                ### Problem: Image Quality Issues
                **Symptoms**: Blurry images, incorrect contrast, missing metadata
                
                **Solutions**:
                1. **Reconstruction**: Check DICOM reconstruction parameters
                2. **Compression**: Verify compression settings
                3. **Metadata**: Validate DICOM tags and headers
                4. **Calibration**: Ensure proper imaging device calibration
                
                ## AI Analysis Issues
                
                ### Problem: AI Analysis Fails
                **Symptoms**: Analysis timeouts, error messages, no results
                
                **Solutions**:
                1. **Model Compatibility**: Verify AI model supports image type
                2. **Image Quality**: Ensure adequate image resolution
                3. **Processing Queue**: Check system load and queue status
                4. **Parameters**: Validate analysis parameters
                5. **Retry**: Attempt analysis with different settings
                
                ### Problem: Incorrect AI Results
                **Symptoms**: Unexpected findings, low confidence scores
                
                **Solutions**:
                1. **Image Preparation**: Ensure proper image preprocessing
                2. **Model Selection**: Choose appropriate AI model
                3. **Clinical Validation**: Always validate with clinical expertise
                4. **Parameter Tuning**: Adjust analysis parameters
                5. **Feedback**: Report issues to improve AI models
                
                ## Performance Issues
                
                ### Problem: Slow Loading Times
                **Symptoms**: Long wait times, timeouts, unresponsive interface
                
                **Solutions**:
                1. **Network**: Check internet connection speed
                2. **Browser**: Clear cache and cookies
                3. **Hardware**: Verify system requirements
                4. **Server Load**: Check system status page
                5. **Optimization**: Enable performance optimization settings
                
                ### Problem: Memory Issues
                **Symptoms**: Browser crashes, out of memory errors
                
                **Solutions**:
                1. **Close Tabs**: Reduce open browser tabs
                2. **Clear Cache**: Clear browser cache and temporary files
                3. **RAM**: Ensure adequate system memory
                4. **Large Files**: Process large studies in smaller batches
                5. **Browser Update**: Update to latest browser version
                
                ## Login and Access Issues
                
                ### Problem: Cannot Login
                **Symptoms**: Login failures, authentication errors
                
                **Solutions**:
                1. **Credentials**: Verify username and password
                2. **Account Status**: Check account activation status
                3. **Two-Factor**: Ensure 2FA device is working
                4. **Password Reset**: Use password reset if needed
                5. **Support**: Contact technical support
                
                ### Problem: Permission Errors
                **Symptoms**: Access denied, feature restrictions
                
                **Solutions**:
                1. **Role Assignment**: Verify user role and permissions
                2. **License**: Check software license status
                3. **Account Type**: Confirm account type and features
                4. **Administrator**: Contact system administrator
                5. **Compliance**: Ensure medical license validation
                
                ## Report Generation Issues
                
                ### Problem: Report Generation Fails
                **Symptoms**: Empty reports, formatting errors, missing data
                
                **Solutions**:
                1. **Template**: Check report template configuration
                2. **Data**: Verify required data is available
                3. **Permissions**: Confirm report generation permissions
                4. **Format**: Try different report formats
                5. **Manual**: Generate report manually if needed
                
                ## Getting Additional Help
                
                ### Contact Support
                - **Email**: support@medsight-pro.com
                - **Phone**: 1-800-MEDSIGHT
                - **Live Chat**: Available 24/7 for urgent issues
                - **Portal**: Submit tickets through support portal
                
                ### Resources
                - **Knowledge Base**: Search comprehensive help articles
                - **Video Tutorials**: Step-by-step visual guides
                - **Community Forum**: Connect with other users
                - **Training**: Schedule personalized training sessions
                
                ### Emergency Support
                For critical issues affecting patient care:
                - **Emergency Hotline**: 1-800-MEDHELP
                - **24/7 Support**: Available around the clock
                - **Escalation**: Automatic escalation for urgent cases
                - **Backup Systems**: Alternative access methods
              `,
              author: 'Technical Support Team',
              lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
              views: 2156,
              likes: 287,
              tags: ['troubleshooting', 'support', 'issues', 'solutions'],
              difficulty: 'intermediate',
              estimatedReadTime: 18,
              featured: true,
              medicalCompliance: true,
              attachments: [
                {
                  type: 'pdf',
                  name: 'Troubleshooting Guide.pdf',
                  url: '/docs/troubleshooting-guide.pdf',
                  size: '4.3 MB'
                }
              ]
            }
          ]
        }
      ];

      setDocumentationCategories(categories);
    };

    initializeDocumentation();
  }, []);

  // Search functionality
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate search with scoring
    const results: SearchResult[] = [];
    
    documentationCategories.forEach(category => {
      category.sections.forEach(section => {
        let relevance = 0;
        const highlights: string[] = [];
        
        // Search in title
        if (section.title.toLowerCase().includes(query.toLowerCase())) {
          relevance += 10;
          highlights.push(section.title);
        }
        
        // Search in description
        if (section.description.toLowerCase().includes(query.toLowerCase())) {
          relevance += 5;
          highlights.push(section.description);
        }
        
        // Search in content
        if (section.content.toLowerCase().includes(query.toLowerCase())) {
          relevance += 3;
          // Find relevant sentences
          const sentences = section.content.split('\n').filter(line => 
            line.toLowerCase().includes(query.toLowerCase())
          );
          highlights.push(...sentences.slice(0, 3));
        }
        
        // Search in tags
        section.tags.forEach(tag => {
          if (tag.toLowerCase().includes(query.toLowerCase())) {
            relevance += 2;
            highlights.push(`Tag: ${tag}`);
          }
        });
        
        if (relevance > 0) {
          results.push({
            section,
            relevance,
            highlights: highlights.slice(0, 5)
          });
        }
      });
    });
    
    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    
    setSearchResults(results);
    setIsSearching(false);
  };

  // Handle search input
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  // Get sections for current category
  const getCurrentSections = () => {
    const category = documentationCategories.find(cat => cat.id === selectedCategory);
    return category?.sections || [];
  };

  // Filter and sort sections
  const getFilteredSections = () => {
    let sections = getCurrentSections();
    
    // Apply difficulty filter
    if (filterBy !== 'all') {
      sections = sections.filter(section => section.difficulty === filterBy);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'popular':
        sections.sort((a, b) => b.views - a.views);
        break;
      case 'alphabetical':
        sections.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'updated':
      default:
        sections.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
        break;
    }
    
    return sections;
  };

  // Toggle favorite
  const toggleFavorite = (sectionId: string) => {
    setFavorites(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Add to recently viewed
  const addToRecentlyViewed = (section: DocumentationSection) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(item => item.id !== section.id);
      return [section, ...filtered].slice(0, 5);
    });
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-400 bg-green-400/20';
      case 'intermediate':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'advanced':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  // Get category color
  const getCategoryColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-blue-400 bg-blue-400/20';
      case 'green':
        return 'text-green-400 bg-green-400/20';
      case 'purple':
        return 'text-purple-400 bg-purple-400/20';
      case 'red':
        return 'text-red-400 bg-red-400/20';
      case 'orange':
        return 'text-orange-400 bg-orange-400/20';
      case 'yellow':
        return 'text-yellow-400 bg-yellow-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Documentation Center
              </h1>
              <p className="text-slate-300">
                Comprehensive documentation and resources for MedSight Pro
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-6 h-6 text-blue-400" />
                <div className="text-right">
                  <div className="text-xl font-bold text-white">
                    {documentationCategories.reduce((sum, cat) => sum + cat.sections.length, 0)}
                  </div>
                  <div className="text-slate-400 text-sm">Documents</div>
                </div>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Request Documentation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Search Results ({searchResults.length})
            </h2>
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <motion.div
                  key={result.section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => {
                    setSelectedSection(result.section);
                    addToRecentlyViewed(result.section);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{result.section.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(result.section.difficulty)}`}>
                          {result.section.difficulty}
                        </span>
                        {result.section.medicalCompliance && (
                          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                            Medical Compliant
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 mb-3">{result.section.description}</p>
                      <div className="space-y-1">
                        {result.highlights.map((highlight, i) => (
                          <p key={i} className="text-slate-400 text-sm">
                            • {highlight.length > 100 ? highlight.substring(0, 100) + '...' : highlight}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-blue-400 font-semibold">
                        {result.relevance}% match
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(result.section.id);
                        }}
                        className={`p-2 rounded-lg ${
                          favorites.includes(result.section.id)
                            ? 'text-yellow-400 bg-yellow-400/20'
                            : 'text-slate-400 hover:text-yellow-400'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        {!searchQuery && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 sticky top-8">
                <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
                <div className="space-y-2">
                  {documentationCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <category.icon className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs opacity-75">
                          {category.sections.length} documents
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Recently Viewed */}
                {recentlyViewed.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Recently Viewed</h4>
                    <div className="space-y-2">
                      {recentlyViewed.map(section => (
                        <button
                          key={section.id}
                          onClick={() => setSelectedSection(section)}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          <div className="text-sm text-white truncate">{section.title}</div>
                          <div className="text-xs text-slate-400 capitalize">{section.category.replace('_', ' ')}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              {selectedSection ? (
                /* Document View */
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => setSelectedSection(null)}
                      className="text-blue-400 hover:text-blue-300 flex items-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to {documentationCategories.find(c => c.id === selectedCategory)?.name}</span>
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleFavorite(selectedSection.id)}
                        className={`p-2 rounded-lg ${
                          favorites.includes(selectedSection.id)
                            ? 'text-yellow-400 bg-yellow-400/20'
                            : 'text-slate-400 hover:text-yellow-400'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg text-slate-400 hover:text-white">
                        <Share className="w-4 h-4" />
                      </button>
                                             <button className="p-2 rounded-lg text-slate-400 hover:text-white">
                         <Printer className="w-4 h-4" />
                       </button>
                    </div>
                  </div>

                  {/* Document Header */}
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-white mb-4">{selectedSection.title}</h1>
                    <p className="text-slate-300 text-lg mb-4">{selectedSection.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded text-sm font-medium ${getDifficultyColor(selectedSection.difficulty)}`}>
                          {selectedSection.difficulty}
                        </span>
                        {selectedSection.medicalCompliance && (
                          <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm">
                            Medical Compliant
                          </span>
                        )}
                        <div className="flex items-center space-x-1 text-slate-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{selectedSection.estimatedReadTime} min read</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">{selectedSection.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{selectedSection.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document Content */}
                  <div className="prose prose-invert max-w-none">
                    <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {selectedSection.content}
                    </div>
                  </div>

                  {/* Attachments */}
                  {selectedSection.attachments.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-700">
                      <h3 className="text-lg font-semibold text-white mb-4">Attachments</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedSection.attachments.map((attachment, index) => (
                          <div key={index} className="bg-slate-700/50 rounded-lg p-4 flex items-center space-x-3">
                            <div className="text-blue-400">
                              {attachment.type === 'pdf' && <FileText className="w-6 h-6" />}
                              {attachment.type === 'video' && <PlayCircle className="w-6 h-6" />}
                              {attachment.type === 'image' && <Image className="w-6 h-6" />}
                              {attachment.type === 'code' && <Code className="w-6 h-6" />}
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium">{attachment.name}</div>
                              <div className="text-slate-400 text-sm">{attachment.size}</div>
                            </div>
                            <button className="text-blue-400 hover:text-blue-300">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Document Footer */}
                  <div className="mt-8 pt-6 border-t border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-slate-400">By {selectedSection.author}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-400">Updated {selectedSection.lastUpdated.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedSection.tags.map(tag => (
                          <span key={tag} className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Category View */
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {documentationCategories.find(c => c.id === selectedCategory)?.name}
                      </h2>
                      <p className="text-slate-300">
                        {documentationCategories.find(c => c.id === selectedCategory)?.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        <option value="updated">Recently Updated</option>
                        <option value="popular">Most Popular</option>
                        <option value="alphabetical">Alphabetical</option>
                      </select>
                      <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value as any)}
                        className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        <option value="all">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                      <div className="flex items-center space-x-1 bg-slate-800 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                        >
                          <Grid className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Documents Grid/List */}
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
                    {getFilteredSections().map((section, index) => (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 cursor-pointer hover:border-blue-500 transition-colors ${
                          viewMode === 'list' ? 'flex items-center space-x-6' : ''
                        }`}
                        onClick={() => {
                          setSelectedSection(section);
                          addToRecentlyViewed(section);
                        }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                            <div className="flex items-center space-x-2">
                              {section.featured && (
                                <Star className="w-4 h-4 text-yellow-400" />
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(section.id);
                                }}
                                className={`p-1 rounded ${
                                  favorites.includes(section.id)
                                    ? 'text-yellow-400'
                                    : 'text-slate-400 hover:text-yellow-400'
                                }`}
                              >
                                <Heart className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-slate-300 mb-3">{section.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(section.difficulty)}`}>
                                {section.difficulty}
                              </span>
                              {section.medicalCompliance && (
                                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                                  Medical
                                </span>
                              )}
                              <div className="flex items-center space-x-1 text-slate-400">
                                <Clock className="w-3 h-3" />
                                <span className="text-xs">{section.estimatedReadTime}min</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 text-slate-400">
                              <div className="flex items-center space-x-1">
                                <Eye className="w-3 h-3" />
                                <span className="text-xs">{section.views}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <ThumbsUp className="w-3 h-3" />
                                <span className="text-xs">{section.likes}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {viewMode === 'list' && (
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Medical Compliance Footer */}
        <div className="mt-12 bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Medical Documentation Standards</h3>
                <p className="text-slate-400">
                  HIPAA Compliant • FDA Validated • Medical Device Documentation • Clinical Guidelines
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-green-400 font-semibold">Documentation Validated</p>
              <p className="text-slate-400 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationCenter; 