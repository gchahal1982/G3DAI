'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/../../shared/components/ui/ScrollArea';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/../../shared/components/ui/Separator';
import { 
  MessageSquare, 
  Brain, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Send,
  Mic,
  MicOff,
  FileText,
  Stethoscope,
  Heart,
  Zap,
  TrendingUp,
  BookOpen,
  Shield,
  User,
  Bot,
  Download,
  Copy,
  RefreshCw,
  Search,
  Filter,
  Settings,
  Star,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Plus,
  X
} from 'lucide-react';
import { AIAnalysisIntegration } from '@/lib/ai/ai-analysis-integration';
// import { toast } from 'sonner'; // TODO: Install sonner package or replace with alternative

interface MedicalQuery {
  id: string;
  type: 'diagnostic' | 'treatment' | 'medication' | 'procedure' | 'research' | 'general';
  query: string;
  context?: {
    patientId?: string;
    demographics?: any;
    symptoms?: string[];
    history?: string[];
    labs?: any[];
    imaging?: any[];
    vitals?: any;
  };
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface AIResponse {
  id: string;
  queryId: string;
  type: 'clinical_decision' | 'differential_diagnosis' | 'treatment_plan' | 'medication_review' | 'risk_assessment' | 'research_summary';
  content: {
    summary: string;
    details: string;
    recommendations: Recommendation[];
    warnings: Warning[];
    confidence: number;
    references: Reference[];
    followUp: string[];
  };
  timestamp: Date;
  processingTime: number;
  modelUsed: string;
  validated: boolean;
  rating?: number;
}

interface Recommendation {
  id: string;
  type: 'diagnostic' | 'treatment' | 'medication' | 'monitoring' | 'referral' | 'lifestyle';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  evidence: string;
  confidence: number;
  contraindications?: string[];
  alternatives?: string[];
}

interface Warning {
  id: string;
  type: 'safety' | 'interaction' | 'allergy' | 'contraindication' | 'regulatory';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  details: string;
  action: string;
}

interface Reference {
  id: string;
  type: 'guideline' | 'study' | 'literature' | 'database';
  title: string;
  source: string;
  url?: string;
  relevance: number;
  datePublished?: string;
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  queryId?: string;
  responseId?: string;
  attachments?: any[];
}

const MedicalAIAssistant: React.FC = () => {
  const [queries, setQueries] = useState<MedicalQuery[]>([]);
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [selectedQueryType, setSelectedQueryType] = useState<MedicalQuery['type']>('general');
  const [selectedPriority, setSelectedPriority] = useState<MedicalQuery['priority']>('medium');
  const [patientContext, setPatientContext] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysisIntegration | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | MedicalQuery['type']>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.8);
  const [maxRecommendations, setMaxRecommendations] = useState(5);
  const [enableWarnings, setEnableWarnings] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any | null>(null); // TODO: Add SpeechRecognition type
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    const initializeAI = async () => {
      try {
        const ai = new AIAnalysisIntegration();
        // await ai.initialize(); // TODO: Add initialize method to AIAnalysisIntegration
        setAIAnalysis(ai);
      } catch (error) {
        console.error('Failed to initialize AI analysis:', error);
        // console.error('Failed to initialize AI assistant'); // TODO: Replace with proper toast
      }
    };

    initializeAI();
  }, []);

  useEffect(() => {
    // Setup speech recognition
    if (voiceEnabled && 'webkitSpeechRecognition' in window) {
      // const recognition = new (window as any).webkitSpeechRecognition();
      // recognitionRef.current = recognition;
      // TODO: Implement speech recognition setup
    }

    // Setup speech synthesis
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        // recognitionRef.current.stop(); // TODO: Add stop method
      }
    };
  }, [voiceEnabled]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitQuery = async () => {
    if (!currentQuery.trim() || !aiAnalysis) return;

    const queryId = `query-${Date.now()}`;
    const newQuery: MedicalQuery = {
      id: queryId,
      type: selectedQueryType,
      query: currentQuery,
      context: patientContext,
      timestamp: new Date(),
      status: 'pending',
      priority: selectedPriority
    };

    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: currentQuery,
      timestamp: new Date(),
      queryId
    };

    setQueries(prev => [...prev, newQuery]);
    setConversation(prev => [...prev, userMessage]);
    setCurrentQuery('');
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Simulate processing progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Process the query based on type
      let analysisResult;
      switch (selectedQueryType) {
        case 'diagnostic':
          // analysisResult = await aiAnalysis.runDiagnosticAnalysis(currentQuery, patientContext); // TODO: Add method
          break;
        case 'treatment':
          // analysisResult = await aiAnalysis.runTreatmentAnalysis(currentQuery, patientContext); // TODO: Add method
          break;
        case 'medication':
          // analysisResult = await aiAnalysis.runMedicationAnalysis(currentQuery, patientContext); // TODO: Add method
          break;
        case 'procedure':
          // analysisResult = await aiAnalysis.runProcedureAnalysis(currentQuery, patientContext); // TODO: Add method
          break;
        case 'research':
          // analysisResult = await aiAnalysis.runResearchAnalysis(currentQuery); // TODO: Add method
          break;
        default:
          // analysisResult = await aiAnalysis.runGeneralMedicalAnalysis(currentQuery, patientContext); // TODO: Add method
          break;
      }

      clearInterval(progressInterval);
      setProcessingProgress(100);

      // Create AI response
      const aiResponse: AIResponse = {
        id: `response-${Date.now()}`,
        queryId,
        type: 'clinical_decision',
        content: {
          summary: 'Analysis not yet implemented', // TODO: Replace with actual analysis
          details: 'Analysis details not yet implemented', // TODO: Replace with actual analysis
          recommendations: [], // TODO: Replace with actual analysis
          warnings: [], // TODO: Replace with actual analysis
          confidence: 0.9, // TODO: Replace with actual confidence
          references: [], // TODO: Replace with actual analysis
          followUp: [] // TODO: Replace with actual analysis
        },
        timestamp: new Date(),
        processingTime: Date.now() - new Date(newQuery.timestamp).getTime(),
        modelUsed: 'Mock Model', // TODO: Replace with actual model
        validated: true // TODO: Replace with actual validation
      };

      const assistantMessage: ConversationMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: aiResponse.content.summary,
        timestamp: new Date(),
        responseId: aiResponse.id
      };

      setResponses(prev => [...prev, aiResponse]);
      setConversation(prev => [...prev, assistantMessage]);

      // Update query status
      setQueries(prev => prev.map(q => 
        q.id === queryId ? { ...q, status: 'completed' } : q
      ));

      // Speak response if voice is enabled
      if (voiceEnabled && synthesisRef.current) {
        const utterance = new SpeechSynthesisUtterance(aiResponse.content.summary);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        synthesisRef.current.speak(utterance);
      }

      // Auto-save if enabled
      if (autoSave) {
        await saveConversation();
      }

      // console.log('AI analysis completed successfully'); // TODO: Replace with proper toast
    } catch (error) {
      console.error('Query processing failed:', error);
      
      // Update query status to failed
      setQueries(prev => prev.map(q => 
        q.id === queryId ? { ...q, status: 'failed' } : q
      ));

      const errorMessage: ConversationMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.',
        timestamp: new Date()
      };

      setConversation(prev => [...prev, errorMessage]);
      // console.error('Failed to process medical query'); // TODO: Replace with proper toast
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleVoiceToggle = () => {
    if (!voiceEnabled) {
      // console.error('Voice recognition not supported in this browser'); // TODO: Replace with proper toast
      return;
    }

    if (isRecording) {
      // recognitionRef.current.stop(); // TODO: Add stop method
      setIsRecording(false);
    } else {
      // recognitionRef.current.start(); // TODO: Add start method
      setIsRecording(true);
    }
  };

  const handleRateResponse = async (responseId: string, rating: number) => {
    setResponses(prev => prev.map(r => 
      r.id === responseId ? { ...r, rating } : r
    ));
    
    // Send rating to backend
    try {
      // await aiAnalysis?.submitFeedback(responseId, rating); // TODO: Add method
      // console.log('Thank you for your feedback!'); // TODO: Replace with proper toast
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  };

  const handleCopyResponse = (content: string) => {
    navigator.clipboard.writeText(content);
    // console.log('Response copied to clipboard'); // TODO: Replace with proper toast
  };

  const handleDownloadReport = async (responseId: string) => {
    const response = responses.find(r => r.id === responseId);
    if (!response) return;

    const report = {
      query: queries.find(q => q.id === response.queryId),
      response,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-ai-report-${responseId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveConversation = async () => {
    try {
      const conversationData = {
        conversation,
        queries,
        responses,
        timestamp: new Date().toISOString()
      };
      
      // Save to local storage or backend
      localStorage.setItem('medicalAIConversation', JSON.stringify(conversationData));
      
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  };

  const loadConversation = async () => {
    try {
      const saved = localStorage.getItem('medicalAIConversation');
      if (saved) {
        const data = JSON.parse(saved);
        setConversation(data.conversation || []);
        setQueries(data.queries || []);
        setResponses(data.responses || []);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const clearConversation = () => {
    setConversation([]);
    setQueries([]);
    setResponses([]);
    localStorage.removeItem('medicalAIConversation');
    // console.log('Conversation cleared'); // TODO: Replace with proper toast
  };

  const filteredQueries = queries.filter(query => {
    const matchesSearch = query.query.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || query.type === filterType;
    return matchesSearch && matchesType;
  });

  const getPriorityColor = (priority: MedicalQuery['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: MedicalQuery['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'processing': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getWarningColor = (severity: Warning['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-800';
      case 'error': return 'bg-red-50 border-red-400 text-red-700';
      case 'warning': return 'bg-yellow-50 border-yellow-400 text-yellow-700';
      case 'info': return 'bg-blue-50 border-blue-400 text-blue-700';
      default: return 'bg-gray-50 border-gray-400 text-gray-700';
    }
  };

  const QueryTypeSelector = () => (
    <div className="flex flex-wrap gap-2">
      {(['general', 'diagnostic', 'treatment', 'medication', 'procedure', 'research'] as const).map(type => (
        <Button
          key={type}
          variant={selectedQueryType === type ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedQueryType(type)}
          className="capitalize"
        >
          {type}
        </Button>
      ))}
    </div>
  );

  const PrioritySelector = () => (
    <div className="flex gap-2">
      {(['low', 'medium', 'high', 'urgent'] as const).map(priority => (
        <Button
          key={priority}
          variant={selectedPriority === priority ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedPriority(priority)}
          className="capitalize"
        >
          <div className={`w-2 h-2 rounded-full mr-1 ${getPriorityColor(priority)}`} />
          {priority}
        </Button>
      ))}
    </div>
  );

  const ChatInterface = () => (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {conversation.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.role === 'assistant' && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyResponse(message.content)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      {message.responseId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadReport(message.responseId!)}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                {message.responseId && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">Rate this response:</span>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRateResponse(message.responseId!, rating)}
                          className="p-1"
                        >
                          <Star className="w-3 h-3" />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  <div>
                    <p className="text-sm">Processing your medical query...</p>
                    <Progress value={processingProgress} className="mt-2" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>
      
      <div className="border-t p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Query Type:</span>
            <QueryTypeSelector />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Priority:</span>
            <PrioritySelector />
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              placeholder="Ask me anything about medical diagnosis, treatment, medications, or procedures..."
              className="min-h-[80px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitQuery();
                }
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleVoiceToggle}
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              disabled={!voiceEnabled}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              onClick={handleSubmitQuery}
              disabled={!currentQuery.trim() || isProcessing}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const ResponseDetails = ({ response }: { response: AIResponse }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{response.type.replace('_', ' ').toUpperCase()}</CardTitle>
          <Badge variant="outline">
            Confidence: {(response.content.confidence * 100).toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Summary</h4>
          <p className="text-sm text-gray-600">{response.content.summary}</p>
        </div>
        
        {response.content.details && (
          <div>
            <h4 className="font-medium mb-2">Details</h4>
            <p className="text-sm text-gray-600">{response.content.details}</p>
          </div>
        )}
        
        {response.content.recommendations.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Recommendations</h4>
            <div className="space-y-2">
              {response.content.recommendations.map((rec) => (
                <div key={rec.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{rec.title}</h5>
                      <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {rec.priority}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Confidence: {(rec.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {response.content.warnings.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Warnings & Alerts</h4>
            <div className="space-y-2">
              {response.content.warnings.map((warning) => (
                <Alert key={warning.id} className={getWarningColor(warning.severity)}>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    <strong>{warning.type.toUpperCase()}:</strong> {warning.message}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}
        
        {response.content.references.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">References</h4>
            <div className="space-y-1">
              {response.content.references.map((ref) => (
                <div key={ref.id} className="text-sm">
                  <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {ref.title}
                  </a>
                  <span className="text-gray-500 ml-2">({ref.source})</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-xs text-gray-500">
            Processed by {response.modelUsed} in {response.processingTime}ms
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleCopyResponse(response.content.summary)}>
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownloadReport(response.id)}>
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const QueryHistory = () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search queries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All Types</option>
          <option value="general">General</option>
          <option value="diagnostic">Diagnostic</option>
          <option value="treatment">Treatment</option>
          <option value="medication">Medication</option>
          <option value="procedure">Procedure</option>
          <option value="research">Research</option>
        </select>
      </div>
      
      <div className="space-y-3">
        {filteredQueries.map((query) => (
          <Card key={query.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{query.type}</Badge>
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(query.priority)}`} />
                  <span className="text-xs text-gray-500">{query.priority}</span>
                </div>
                <p className="text-sm font-medium">{query.query}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {query.timestamp.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 ${getStatusColor(query.status)}`}>
                  {query.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                  {query.status === 'processing' && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {query.status === 'failed' && <AlertTriangle className="w-4 h-4" />}
                  {query.status === 'pending' && <Clock className="w-4 h-4" />}
                  <span className="text-xs capitalize">{query.status}</span>
                </div>
              </div>
            </div>
            
            {query.context && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-600">
                  Context: {query.context.patientId && `Patient ID: ${query.context.patientId}`}
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  const ResponsesTab = () => (
    <div className="space-y-4">
      {responses.map((response) => (
        <ResponseDetails key={response.id} response={response} />
      ))}
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Assistant Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Voice Responses</span>
            <Button
              variant={voiceEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
            >
              {voiceEnabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Auto-save Conversations</span>
            <Button
              variant={autoSave ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoSave(!autoSave)}
            >
              {autoSave ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Safety Warnings</span>
            <Button
              variant={enableWarnings ? "default" : "outline"}
              size="sm"
              onClick={() => setEnableWarnings(!enableWarnings)}
            >
              {enableWarnings ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Confidence Threshold</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{(confidenceThreshold * 100).toFixed(0)}%</span>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Recommendations</label>
            <input
              type="number"
              min="1"
              max="10"
              value={maxRecommendations}
              onChange={(e) => setMaxRecommendations(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={saveConversation} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Save Conversation
            </Button>
            <Button onClick={loadConversation} variant="outline" className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Load Conversation
            </Button>
            <Button onClick={clearConversation} variant="destructive" className="flex-1">
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="h-full backdrop-blur-sm bg-white/90 border border-white/20 rounded-xl shadow-xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Medical AI Assistant</h1>
                <p className="text-gray-600">Clinical Decision Support & Medical Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {aiAnalysis ? 'Connected' : 'Connecting...'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="h-[calc(100%-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="responses" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Responses
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="h-full">
              <ChatInterface />
            </TabsContent>

            <TabsContent value="responses" className="h-full p-4">
              <ScrollArea className="h-full">
                <ResponsesTab />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="history" className="h-full p-4">
              <ScrollArea className="h-full">
                <QueryHistory />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="settings" className="h-full p-4">
              <ScrollArea className="h-full">
                <SettingsTab />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MedicalAIAssistant; 