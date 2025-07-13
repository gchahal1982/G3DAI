"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  PlayCircle, 
  Users, 
  Award, 
  Clock, 
  CheckCircle, 
  Star, 
  BarChart3 as Progress,
  Target, 
  Trophy, 
  Shield, 
  User, 
  Calendar, 
  TrendingUp, 
  Eye, 
  ThumbsUp, 
  Download, 
  ExternalLink, 
  ArrowRight, 
  ChevronRight, 
  Settings, 
  Bell, 
  Search, 
  Filter, 
  Share, 
  Bookmark, 
  Play, 
  Pause, 
  RotateCcw, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  SkipBack, 
  SkipForward, 
  FastForward, 
  Rewind, 
  Square, 
  Circle, 
  Triangle, 
  StopCircle, 
  PauseCircle, 
  PlaySquare, 
  Square as StopSquare,
  Shuffle,
  Repeat,
  Repeat1,
  Mic,
  MicOff,
  Headphones,
  Volume2 as SpeakerIcon,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Tv,
  Radio,
  Camera,
  Video,
  Image,
  File,
  Folder,
  Archive,
  Database,
  Server,
  Cloud,
  Wifi,
  Bluetooth,
  Usb,
  HardDrive,
  Cpu,
  HardDrive as MemoryStickIcon,
  Keyboard,
  Mouse,
  Printer,
  Scan,
  Phone,
  Mail,
  MessageSquare,
  Send,
  Inbox,
  Send as OutboxIcon,
  FileText as DraftIcon,
  Trash2,
  Trash2 as DeleteIcon,
  Edit,
  Copy,
  Clipboard as PasteIcon,
  Scissors as CutIcon,
  Undo2,
  Redo2,
  Save,
  FolderOpen as OpenIcon,
  Plus as NewIcon,
  X as CloseIcon,
  LogOut as ExitIcon,
  Home,
  ArrowLeft as BackIcon,
  ArrowRight as ForwardIcon,
  ArrowUp as UpIcon,
  ArrowDown as DownIcon,
  ArrowLeft as LeftIcon,
  ArrowRight as RightIcon,
  ZoomIn,
  ZoomOut,
  Maximize2 as FullscreenIcon,
  Square as WindowIcon,
  Menu,
  MoreHorizontal as MoreIcon,
  Settings as OptionsIcon,
  Settings as PreferencesIcon,
  HelpCircle,
  Info,
  AlertTriangle as WarningIcon,
  AlertCircle as ErrorIcon,
  CheckCircle as SuccessIcon,
  HelpCircle as QuestionIcon,
  AlertTriangle as ExclamationIcon,
  Check,
  X as CrossIcon,
  Plus,
  Minus,
  Equal as EqualsIcon,
  Percent,
  DollarSign,
  Euro,
  PoundSterling,
  DollarSign as Yen,
  IndianRupee,
  DollarSign as Won,
  DollarSign as Ruble,
  DollarSign as TurkishLira,
  DollarSign as Franc,
  DollarSign as Peso,
  DollarSign as Real,
  DollarSign as Rand,
  DollarSign as Ringgit,
  DollarSign as Baht,
  DollarSign as Dong,
  DollarSign as Kip,
  DollarSign as Riel,
  DollarSign as Kyat,
  DollarSign as Rupiah,
  // Nature icons - replaced with available alternatives
  TreePine as Tree,
  Leaf as Grass,
  Flower as Cactus,
  Flower2 as Palm,
  Sprout as Seedling,
  TreePine as Deciduous,
  TreePine as Evergreen,
  Flower as Mushroom,
  // Food icons - replaced with available alternatives
  Apple as Orange,
  Apple as Lemon,
  Apple as Lime,
  Apple as Coconut,
  Apple as Avocado,
  Apple as Eggplant,
  Apple as Potato,
  Wheat as Corn,
  Flame as Chili,
  Flame as Pepper,
  Apple as Cucumber,
  Leaf as Leafy,
  Apple as Tomato,
  Apple as Onion,
  Apple as Garlic,
  Apple as Ginger,
  Cookie as Bread,
  Cookie as Bagel,
  Cookie as Pretzel,
  Cookie as Pancakes,
  Cookie as Waffle,
  Cookie as Cheese,
  Cookie as Meat,
  Cookie as Poultry,
  Cookie as Butter,
  Cookie as Yogurt,
  Cookie as Pie,
  Cookie as Chocolate,
  Droplet as Honey,
  Cookie as Jam,
  Cookie as Peanut,
  Cookie as Almond,
  Apple as CoconutIcon,
  Coffee as Drink,
  Coffee as Tea,
  Coffee as Juice,
  Coffee as Smoothie,
  Wine as Cocktail,
  Wine as Whiskey,
  Wine as Vodka,
  Wine as Rum,
  Wine as Tequila,
  Wine as Gin,
  Wine as Sake,
  Coffee as Soda,
  Droplet as Water,
  Package as Bottle,
  Coffee as Cup,
  Coffee as Mug,
  Wine as Glass,
  Package as Pitcher,
  Package as Kettle,
  Package as Teapot,
  // Utensils and kitchenware - replaced with available alternatives
  Utensils as Fork,
  Utensils as Knife,
  Utensils as Spoon,
  Circle as Plate,
  Circle as Bowl,
  Circle as Pot,
  Circle as Pan,
  Flame as Grill,
  Square as Oven,
  Square as Toaster,
  Zap as Blender,
  Square as Freezer,
  Square as Dishwasher,
  Square as Washer,
  Square as Dryer,
  Zap as IronIcon,
  Zap as Ironing,
  // Clothing icons - replaced with available alternatives
  Shirt as Dress,
  Shirt as Coat,
  Shirt as Jacket,
  Shirt as Vest,
  Shirt as Sweater,
  Shirt as Hoodie,
  Shirt as Jeans,
  Shirt as Shorts,
  Shirt as Skirt,
  Shirt as Pants,
  Shirt as Underwear,
  Shirt as Socks,
  Shirt as Shoes,
  Shirt as Boots,
  Shirt as Sandals,
  Shirt as Sneakers,
  Shirt as Heels,
  Shirt as Flip,
  Shirt as Flops,
  Shirt as Hat,
  Shirt as Cap,
  Shield as Helmet,
  Glasses as Sunglasses,
  Circle as Ring,
  Circle as Necklace,
  Circle as Bracelet,
  Circle as Earrings,
  Palette as Lipstick,
  Palette as Mascara,
  Palette as Makeup,
  Droplet as Perfume,
  Droplet as Cologne,
  Package as Soap,
  Package as Shampoo,
  Package as Conditioner,
  Package as Toothbrush,
  Package as Toothpaste,
  Package as Floss,
  Package as Mouthwash,
  Package as Razor,
  Package as Shaving,
  Package as Cream,
  Package as Lotion,
  Package as Sunscreen,
  Package as Deodorant,
  Package as Tissue,
  FileText as Paper,
  Package as Towel,
  Droplet as Shower,
  Package as Bathtub,
  Package as Sink,
  Package as Faucet,
  Package as Mirror,
  // Anatomy icons - replaced with available alternatives
  Heart as Lungs,
  Heart as Liver,
  Heart as Kidney,
  Heart as Stomach,
  Heart as Intestine,
  Heart as Bladder,
  Heart as Uterus,
  Heart as Ovary,
  Heart as Testis,
  Heart as Prostate,
  Heart as Breast,
  Zap as Muscle,
  Zap as Tendon,
  Zap as Ligament,
  Zap as Cartilage,
  Zap as Joint,
  Zap as Spine,
  Zap as Ribcage,
  Zap as Pelvis,
  Zap as Femur,
  Zap as Tibia,
  Zap as Fibula,
  Zap as Humerus,
  Zap as Ulna,
  Zap as Clavicle,
  Zap as Scapula,
  Zap as Sternum,
  Zap as Vertebra,
  Zap as Nerve,
  Brain as Neuron,
  Zap as Synapse,
  Zap as Dendrite,
  Zap as Axon,
  Zap as Myelin,
  Zap as Ganglion,
  Zap as Reflex,
  Eye as Sensory,
  Zap as Motor,
  Zap as Autonomic,
  Zap as Sympathetic,
  Zap as Parasympathetic,
  Brain as Cranial,
  Zap as Spinal,
  Zap as Peripheral,
  Zap as Central,
  Brain as Cerebral,
  Brain as Cerebellum,
  Brain as Brainstem,
  Brain as Medulla,
  Brain as Pons,
  Brain as Midbrain,
  Brain as Thalamus,
  Brain as Hypothalamus,
  Brain as Pituitary,
  Brain as Pineal,
  Heart as Thyroid,
  Heart as Parathyroid,
  Heart as Adrenal,
  Heart as Pancreas,
  Droplet as Insulin,
  Droplet as Hormone,
  Droplet as Enzyme,
  Droplet as Protein,
  Droplet as Amino,
  Droplet as Acid,
  Droplet as Carbohydrate,
  Droplet as Fat,
  Droplet as Lipid,
  Droplet as Cholesterol,
  Pill as Vitamin,
  Pill as Mineral,
  Pill as Calcium,
  Pill as Iron,
  Pill as Magnesium,
  Pill as Potassium,
  Pill as Sodium,
  Pill as Zinc,
  Pill as Copper,
  Pill as Selenium,
  Pill as Iodine,
  Pill as Fluorine,
  Pill as Chlorine,
  Pill as Bromine,
  Pill as Phosphorus,
  Pill as Sulfur,
  Pill as Nitrogen,
  Pill as Oxygen,
  Pill as Carbon,
  Pill as Hydrogen,
  Pill as Helium,
  Pill as Lithium,
  Pill as Beryllium,
  Pill as Boron,
  Pill as Neon,
  Pill as Argon,
  Pill as Krypton,
  Pill as Xenon,
  Pill as Radon,
  Pill as Francium,
  Pill as Radium,
  Pill as Actinium,
  Pill as Thorium,
  Pill as Protactinium,
  Pill as Uranium,
  Pill as Neptunium,
  Pill as Plutonium,
  Pill as Americium,
  Pill as Curium,
  Pill as Berkelium,
  Pill as Californium,
  Pill as Einsteinium,
  Pill as Fermium,
  Pill as Mendelevium,
  Pill as Nobelium,
  Pill as Lawrencium,
  Pill as Rutherfordium,
  Pill as Dubnium,
  Pill as Seaborgium,
  Pill as Bohrium,
  Pill as Hassium,
  Pill as Meitnerium,
  Pill as Darmstadtium,
  Pill as Roentgenium,
  Pill as Copernicium,
  Pill as Nihonium,
  Pill as Flerovium,
  Pill as Moscovium,
  Pill as Livermorium,
  Pill as Tennessine,
  Pill as Oganesson
} from 'lucide-react';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'imaging' | 'ai' | 'compliance' | 'advanced' | 'certification';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  type: 'video' | 'interactive' | 'text' | 'assessment' | 'simulation';
  prerequisite: string[];
  objectives: string[];
  content: {
    sections: {
      title: string;
      type: 'video' | 'text' | 'interactive' | 'quiz';
      duration: number;
      content: string;
      completed: boolean;
    }[];
  };
  progress: number;
  completed: boolean;
  score?: number;
  certificate?: {
    issued: Date;
    expiresAt: Date;
    certificateId: string;
  };
  medicalCompliance: boolean;
  cmeCredits?: number;
  lastAccessed?: Date;
  enrollmentDate: Date;
  completionDate?: Date;
}

interface UserProgress {
  userId: string;
  name: string;
  role: string;
  department: string;
  totalModules: number;
  completedModules: number;
  averageScore: number;
  totalCMECredits: number;
  certificates: number;
  lastActivity: Date;
  weakAreas: string[];
  strengths: string[];
  upcomingDeadlines: {
    moduleId: string;
    title: string;
    dueDate: Date;
  }[];
}

interface TrainingPath {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  modules: string[];
  prerequisites: string[];
  certification: boolean;
  cmeCredits: number;
  medicalSpecialty: string;
  progress: number;
  enrolledUsers: number;
  completionRate: number;
}

const UserTraining = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'paths' | 'progress' | 'certificates' | 'settings'>('overview');
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [trainingPaths, setTrainingPaths] = useState<TrainingPath[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'basics' | 'imaging' | 'ai' | 'compliance' | 'advanced' | 'certification'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'difficulty' | 'progress' | 'duration'>('title');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [showCertificates, setShowCertificates] = useState(false);

  // Initialize training data
  useEffect(() => {
    const initializeTraining = () => {
      // Initialize training modules
      const modules: TrainingModule[] = [
        {
          id: 'medsight-basics',
          title: 'MedSight Pro Fundamentals',
          description: 'Complete introduction to MedSight Pro platform and basic medical workflows',
          category: 'basics',
          difficulty: 'beginner',
          duration: 45,
          type: 'interactive',
          prerequisite: [],
          objectives: [
            'Navigate the MedSight Pro interface',
            'Understand basic medical imaging concepts',
            'Learn patient data management',
            'Master basic workflow procedures'
          ],
          content: {
            sections: [
              {
                title: 'Platform Overview',
                type: 'video',
                duration: 10,
                content: 'Introduction to MedSight Pro platform and medical imaging capabilities',
                completed: true
              },
              {
                title: 'Navigation and Interface',
                type: 'interactive',
                duration: 15,
                content: 'Interactive tutorial on platform navigation and interface elements',
                completed: true
              },
              {
                title: 'Basic Medical Workflows',
                type: 'text',
                duration: 15,
                content: 'Understanding clinical workflows and patient data management',
                completed: false
              },
              {
                title: 'Knowledge Assessment',
                type: 'quiz',
                duration: 5,
                content: 'Quiz on platform basics and medical imaging fundamentals',
                completed: false
              }
            ]
          },
          progress: 50,
          completed: false,
          medicalCompliance: true,
          cmeCredits: 1.5,
          lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          enrollmentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        },
        {
          id: 'dicom-imaging',
          title: 'DICOM Medical Imaging',
          description: 'Comprehensive training on DICOM standards and medical imaging workflows',
          category: 'imaging',
          difficulty: 'intermediate',
          duration: 90,
          type: 'video',
          prerequisite: ['medsight-basics'],
          objectives: [
            'Understand DICOM standards and protocols',
            'Master medical imaging workflows',
            'Learn image processing techniques',
            'Implement quality assurance procedures'
          ],
          content: {
            sections: [
              {
                title: 'DICOM Standards Overview',
                type: 'video',
                duration: 20,
                content: 'Comprehensive overview of DICOM standards and medical imaging protocols',
                completed: true
              },
              {
                title: 'Image Processing Workflows',
                type: 'interactive',
                duration: 30,
                content: 'Hands-on training in medical image processing and analysis',
                completed: false
              },
              {
                title: 'Quality Assurance',
                type: 'text',
                duration: 25,
                content: 'Quality control procedures and image validation techniques',
                completed: false
              },
              {
                title: 'Practical Assessment',
                type: 'quiz',
                duration: 15,
                content: 'Practical assessment of DICOM knowledge and imaging skills',
                completed: false
              }
            ]
          },
          progress: 25,
          completed: false,
          medicalCompliance: true,
          cmeCredits: 3.0,
          lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
          enrollmentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
        },
        {
          id: 'ai-diagnostics',
          title: 'AI-Assisted Diagnostics',
          description: 'Advanced training on AI tools for medical diagnosis and clinical decision support',
          category: 'ai',
          difficulty: 'advanced',
          duration: 120,
          type: 'simulation',
          prerequisite: ['medsight-basics', 'dicom-imaging'],
          objectives: [
            'Understand AI diagnostic capabilities',
            'Learn AI model validation techniques',
            'Master clinical decision support tools',
            'Implement AI ethics and compliance'
          ],
          content: {
            sections: [
              {
                title: 'AI in Medical Imaging',
                type: 'video',
                duration: 25,
                content: 'Introduction to AI applications in medical imaging and diagnostics',
                completed: false
              },
              {
                title: 'AI Model Validation',
                type: 'interactive',
                duration: 40,
                content: 'Hands-on training in AI model validation and clinical correlation',
                completed: false
              },
              {
                title: 'Clinical Decision Support',
                type: 'text',
                duration: 30,
                content: 'Using AI tools for clinical decision making and patient care',
                completed: false
              },
              {
                title: 'Ethics and Compliance',
                type: 'text',
                duration: 15,
                content: 'AI ethics, bias detection, and regulatory compliance',
                completed: false
              },
              {
                title: 'Comprehensive Assessment',
                type: 'quiz',
                duration: 10,
                content: 'Comprehensive assessment of AI diagnostic knowledge',
                completed: false
              }
            ]
          },
          progress: 0,
          completed: false,
          medicalCompliance: true,
          cmeCredits: 4.0,
          enrollmentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        },
        {
          id: 'hipaa-compliance',
          title: 'HIPAA Compliance Training',
          description: 'Essential training on HIPAA regulations and medical data privacy',
          category: 'compliance',
          difficulty: 'intermediate',
          duration: 60,
          type: 'text',
          prerequisite: ['medsight-basics'],
          objectives: [
            'Understand HIPAA requirements',
            'Learn data privacy best practices',
            'Master breach notification procedures',
            'Implement security safeguards'
          ],
          content: {
            sections: [
              {
                title: 'HIPAA Overview',
                type: 'text',
                duration: 15,
                content: 'Comprehensive overview of HIPAA regulations and requirements',
                completed: true
              },
              {
                title: 'Privacy and Security',
                type: 'interactive',
                duration: 20,
                content: 'Interactive training on data privacy and security measures',
                completed: true
              },
              {
                title: 'Breach Response',
                type: 'text',
                duration: 15,
                content: 'Procedures for breach notification and incident response',
                completed: true
              },
              {
                title: 'Compliance Assessment',
                type: 'quiz',
                duration: 10,
                content: 'Assessment of HIPAA compliance knowledge and procedures',
                completed: true
              }
            ]
          },
          progress: 100,
          completed: true,
          score: 92,
          certificate: {
            issued: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
            certificateId: 'HIPAA-2024-001'
          },
          medicalCompliance: true,
          cmeCredits: 2.0,
          lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
          enrollmentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
          completionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
        },
        {
          id: 'advanced-3d',
          title: 'Advanced 3D Visualization',
          description: 'Master advanced 3D medical visualization and rendering techniques',
          category: 'advanced',
          difficulty: 'advanced',
          duration: 150,
          type: 'interactive',
          prerequisite: ['dicom-imaging'],
          objectives: [
            'Master 3D rendering techniques',
            'Learn volume visualization',
            'Understand multi-planar reconstruction',
            'Implement virtual reality applications'
          ],
          content: {
            sections: [
              {
                title: '3D Rendering Fundamentals',
                type: 'video',
                duration: 30,
                content: 'Fundamentals of 3D medical image rendering and visualization',
                completed: false
              },
              {
                title: 'Volume Visualization',
                type: 'interactive',
                duration: 45,
                content: 'Hands-on training in volume rendering and visualization techniques',
                completed: false
              },
              {
                title: 'Multi-Planar Reconstruction',
                type: 'interactive',
                duration: 40,
                content: 'Advanced MPR techniques and clinical applications',
                completed: false
              },
              {
                title: 'Virtual Reality Applications',
                type: 'text',
                duration: 25,
                content: 'VR applications in medical imaging and surgical planning',
                completed: false
              },
              {
                title: 'Advanced Assessment',
                type: 'quiz',
                duration: 10,
                content: 'Advanced assessment of 3D visualization skills',
                completed: false
              }
            ]
          },
          progress: 0,
          completed: false,
          medicalCompliance: true,
          cmeCredits: 5.0,
          enrollmentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        },
        {
          id: 'certification-prep',
          title: 'Medical Imaging Certification Prep',
          description: 'Comprehensive preparation for medical imaging certification examinations',
          category: 'certification',
          difficulty: 'advanced',
          duration: 240,
          type: 'assessment',
          prerequisite: ['dicom-imaging', 'ai-diagnostics', 'advanced-3d'],
          objectives: [
            'Review comprehensive medical imaging knowledge',
            'Practice certification exam questions',
            'Master advanced diagnostic techniques',
            'Prepare for professional certification'
          ],
          content: {
            sections: [
              {
                title: 'Comprehensive Review',
                type: 'text',
                duration: 90,
                content: 'Comprehensive review of medical imaging principles and practices',
                completed: false
              },
              {
                title: 'Practice Examinations',
                type: 'quiz',
                duration: 120,
                content: 'Multiple practice examinations with detailed explanations',
                completed: false
              },
              {
                title: 'Advanced Techniques',
                type: 'interactive',
                duration: 20,
                content: 'Advanced imaging techniques and clinical applications',
                completed: false
              },
              {
                title: 'Final Assessment',
                type: 'quiz',
                duration: 10,
                content: 'Final comprehensive assessment for certification preparation',
                completed: false
              }
            ]
          },
          progress: 0,
          completed: false,
          medicalCompliance: true,
          cmeCredits: 8.0,
          enrollmentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        }
      ];

      // Initialize training paths
      const paths: TrainingPath[] = [
        {
          id: 'radiologist-track',
          title: 'Radiologist Track',
          description: 'Complete training path for radiologists using MedSight Pro',
          category: 'Medical Specialty',
          estimatedDuration: 360,
          difficulty: 'advanced',
          modules: ['medsight-basics', 'dicom-imaging', 'ai-diagnostics', 'advanced-3d', 'certification-prep'],
          prerequisites: ['Medical degree', 'Radiology residency'],
          certification: true,
          cmeCredits: 21.5,
          medicalSpecialty: 'Radiology',
          progress: 35,
          enrolledUsers: 1247,
          completionRate: 78
        },
        {
          id: 'technologist-track',
          title: 'Medical Imaging Technologist Track',
          description: 'Training path for medical imaging technologists',
          category: 'Technical',
          estimatedDuration: 195,
          difficulty: 'intermediate',
          modules: ['medsight-basics', 'dicom-imaging', 'hipaa-compliance'],
          prerequisites: ['Imaging technology certification'],
          certification: true,
          cmeCredits: 6.5,
          medicalSpecialty: 'Medical Imaging Technology',
          progress: 70,
          enrolledUsers: 892,
          completionRate: 85
        },
        {
          id: 'administrator-track',
          title: 'System Administrator Track',
          description: 'Training for medical system administrators',
          category: 'Administration',
          estimatedDuration: 120,
          difficulty: 'intermediate',
          modules: ['medsight-basics', 'hipaa-compliance'],
          prerequisites: ['System administration experience'],
          certification: true,
          cmeCredits: 3.5,
          medicalSpecialty: 'Medical Administration',
          progress: 50,
          enrolledUsers: 234,
          completionRate: 92
        }
      ];

      // Initialize user progress
      const progress: UserProgress = {
        userId: 'user-001',
        name: 'Dr. Sarah Chen',
        role: 'Radiologist',
        department: 'Radiology',
        totalModules: 6,
        completedModules: 1,
        averageScore: 92,
        totalCMECredits: 2.0,
        certificates: 1,
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        weakAreas: ['AI Model Validation', '3D Rendering'],
        strengths: ['DICOM Standards', 'HIPAA Compliance'],
        upcomingDeadlines: [
          {
            moduleId: 'dicom-imaging',
            title: 'DICOM Medical Imaging',
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)
          },
          {
            moduleId: 'ai-diagnostics',
            title: 'AI-Assisted Diagnostics',
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
          }
        ]
      };

      setTrainingModules(modules);
      setTrainingPaths(paths);
      setUserProgress(progress);
    };

    initializeTraining();
  }, []);

  // Filter and sort modules
  const getFilteredModules = () => {
    let filtered = trainingModules;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(module => 
        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(module => module.category === filterCategory);
    }

    // Apply difficulty filter
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(module => module.difficulty === filterDifficulty);
    }

    // Apply sorting
    switch (sortBy) {
      case 'difficulty':
        filtered.sort((a, b) => {
          const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        });
        break;
      case 'progress':
        filtered.sort((a, b) => b.progress - a.progress);
        break;
      case 'duration':
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      case 'title':
      default:
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
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

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basics':
        return <BookOpen className="w-5 h-5" />;
              case 'imaging':
          return <Monitor className="w-5 h-5" />;
        case 'ai':
          return <Cpu className="w-5 h-5" />;
      case 'compliance':
        return <Shield className="w-5 h-5" />;
      case 'advanced':
        return <Target className="w-5 h-5" />;
      case 'certification':
        return <Award className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
          switch (type) {
        case 'video':
          return <Video className="w-4 h-4" />;
        case 'interactive':
          return <Monitor className="w-4 h-4" />;
        case 'text':
          return <File className="w-4 h-4" />;
        case 'assessment':
          return <Target className="w-4 h-4" />;
        case 'simulation':
          return <Cpu className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  // Start module
  const startModule = (module: TrainingModule) => {
    setSelectedModule(module);
    setCurrentSection(0);
    setIsPlaying(true);
  };

  // Complete section
  const completeSection = (sectionIndex: number) => {
    if (selectedModule) {
      const updatedModule = {
        ...selectedModule,
        content: {
          ...selectedModule.content,
          sections: selectedModule.content.sections.map((section, index) => 
            index === sectionIndex ? { ...section, completed: true } : section
          )
        }
      };

      // Update progress
      const completedSections = updatedModule.content.sections.filter(s => s.completed).length;
      const totalSections = updatedModule.content.sections.length;
      updatedModule.progress = Math.round((completedSections / totalSections) * 100);

      // Check if module is completed
      if (completedSections === totalSections) {
        updatedModule.completed = true;
        updatedModule.completionDate = new Date();
        
        // Award certificate if applicable
        if (updatedModule.category === 'certification' || updatedModule.medicalCompliance) {
          updatedModule.certificate = {
            issued: new Date(),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
            certificateId: `${updatedModule.id.toUpperCase()}-${Date.now()}`
          };
        }
      }

      setSelectedModule(updatedModule);
      setTrainingModules(prev => prev.map(m => m.id === updatedModule.id ? updatedModule : m));
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
                Medical Training Center
              </h1>
              <p className="text-slate-300">
                Comprehensive medical training and certification programs
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Award className="w-6 h-6 text-blue-400" />
                <div className="text-right">
                  <div className="text-xl font-bold text-white">
                    {userProgress?.completedModules || 0}
                  </div>
                  <div className="text-slate-400 text-sm">Completed</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <div className="text-right">
                  <div className="text-xl font-bold text-white">
                    {userProgress?.certificates || 0}
                  </div>
                  <div className="text-slate-400 text-sm">Certificates</div>
                </div>
              </div>
                              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Enroll</span>
                </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: Progress },
              { id: 'modules', label: 'Modules', icon: BookOpen },
              { id: 'paths', label: 'Learning Paths', icon: Target },
              { id: 'progress', label: 'Progress', icon: TrendingUp },
              { id: 'certificates', label: 'Certificates', icon: Award },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Overall Progress</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {userProgress ? Math.round((userProgress.completedModules / userProgress.totalModules) * 100) : 0}%
                    </p>
                  </div>
                  <div className="bg-blue-400/20 p-3 rounded-full">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-blue-400 text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span>{userProgress?.completedModules || 0} of {userProgress?.totalModules || 0} modules</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">CME Credits</p>
                    <p className="text-2xl font-bold text-green-400">
                      {userProgress?.totalCMECredits || 0}
                    </p>
                  </div>
                  <div className="bg-green-400/20 p-3 rounded-full">
                    <Award className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-green-400 text-sm">
                  <Star className="w-4 h-4 mr-1" />
                  <span>Accredited credits earned</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Average Score</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {userProgress?.averageScore || 0}%
                    </p>
                  </div>
                  <div className="bg-yellow-400/20 p-3 rounded-full">
                    <Target className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-yellow-400 text-sm">
                  <Trophy className="w-4 h-4 mr-1" />
                  <span>Assessment performance</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Certificates</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {userProgress?.certificates || 0}
                    </p>
                  </div>
                  <div className="bg-purple-400/20 p-3 rounded-full">
                    <Award className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-purple-400 text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span>Certifications earned</span>
                </div>
              </motion.div>
            </div>

            {/* Recent Activity and Upcoming Deadlines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {trainingModules
                    .filter(module => module.lastAccessed)
                    .sort((a, b) => (b.lastAccessed?.getTime() || 0) - (a.lastAccessed?.getTime() || 0))
                    .slice(0, 3)
                    .map(module => (
                      <div key={module.id} className="flex items-center space-x-3">
                        <div className="text-blue-400">
                          {getCategoryIcon(module.category)}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{module.title}</p>
                          <p className="text-slate-400 text-sm">
                            Last accessed: {module.lastAccessed?.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-blue-400 font-semibold">{module.progress}%</div>
                          <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-400 transition-all duration-500"
                              style={{ width: `${module.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-4">Upcoming Deadlines</h3>
                <div className="space-y-4">
                  {userProgress?.upcomingDeadlines.map(deadline => (
                    <div key={deadline.moduleId} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{deadline.title}</p>
                        <p className="text-slate-400 text-sm">
                          Due: {deadline.dueDate.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-orange-400">
                          <Clock className="w-4 h-4" />
                        </div>
                        <span className="text-orange-400 text-sm">
                          {Math.ceil((deadline.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Learning Recommendations */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Recommended Learning</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trainingModules
                  .filter(module => !module.completed && module.prerequisite.every(prereq => 
                    trainingModules.find(m => m.id === prereq)?.completed
                  ))
                  .slice(0, 4)
                  .map(module => (
                    <div key={module.id} className="bg-slate-700/50 rounded-lg p-4 flex items-center space-x-3">
                      <div className="text-blue-400">
                        {getCategoryIcon(module.category)}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{module.title}</p>
                        <p className="text-slate-400 text-sm">{module.duration} minutes</p>
                      </div>
                      <button 
                        onClick={() => startModule(module)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Start
                      </button>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search modules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg"
                >
                  <option value="all">All Categories</option>
                  <option value="basics">Basics</option>
                  <option value="imaging">Imaging</option>
                  <option value="ai">AI</option>
                  <option value="compliance">Compliance</option>
                  <option value="advanced">Advanced</option>
                  <option value="certification">Certification</option>
                </select>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg"
                >
                  <option value="title">Title</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="progress">Progress</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredModules().map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-400">
                        {getCategoryIcon(module.category)}
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                          {module.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-blue-400">
                        {getTypeIcon(module.type)}
                      </div>
                      {module.medicalCompliance && (
                        <div className="bg-green-500/20 text-green-400 p-1 rounded">
                          <Shield className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">{module.title}</h3>
                  <p className="text-slate-300 text-sm mb-4">{module.description}</p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-white">{module.duration} minutes</span>
                    </div>
                    {module.cmeCredits && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">CME Credits:</span>
                        <span className="text-green-400">{module.cmeCredits}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Progress:</span>
                      <span className="text-blue-400">{module.progress}%</span>
                    </div>
                  </div>

                  <div className="mt-4 mb-4">
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-400 transition-all duration-500"
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {module.completed && (
                        <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                          Completed
                        </div>
                      )}
                      {module.certificate && (
                        <div className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">
                          Certified
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => startModule(module)}
                      className={`px-4 py-2 rounded text-sm font-medium ${
                        module.completed 
                          ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      disabled={module.completed}
                    >
                      {module.completed ? 'Completed' : module.progress > 0 ? 'Continue' : 'Start'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Module Player */}
        {selectedModule && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white">{selectedModule.title}</h2>
                <button 
                  onClick={() => setSelectedModule(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <CrossIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Content Area */}
                  <div className="lg:col-span-2">
                    <div className="bg-slate-800 rounded-lg p-6 h-96 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-blue-400 mb-4">
                          {getTypeIcon(selectedModule.content.sections[currentSection]?.type || 'text')}
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {selectedModule.content.sections[currentSection]?.title}
                        </h3>
                        <p className="text-slate-300 mb-4">
                          {selectedModule.content.sections[currentSection]?.content}
                        </p>
                        <div className="flex items-center justify-center space-x-4">
                          <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            <span>{isPlaying ? 'Pause' : 'Play'}</span>
                          </button>
                          <button 
                            onClick={() => completeSection(currentSection)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Complete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="lg:col-span-1">
                    <div className="bg-slate-800 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-4">Module Contents</h4>
                      <div className="space-y-2">
                        {selectedModule.content.sections.map((section, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSection(index)}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                              currentSection === index 
                                ? 'bg-blue-600 text-white' 
                                : 'hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="text-sm">
                                  {getTypeIcon(section.type)}
                                </div>
                                <span className="font-medium">{section.title}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs">{section.duration}min</span>
                                {section.completed && (
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medical Compliance Footer */}
        <div className="mt-12 bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Medical Training Standards</h3>
                <p className="text-slate-400">
                  CME Accredited • FDA Compliant • Medical Education Standards • Professional Certification
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-green-400 font-semibold">Training Validated</p>
              <p className="text-slate-400 text-sm">Accredited by: ACCME, ARRT, AHRA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTraining; 