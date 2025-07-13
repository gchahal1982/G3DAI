'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Save, 
  Download, 
  Eye, 
  Settings, 
  Mic, 
  MicOff,
  Undo, 
  Redo,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  FileText,
  Search,
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Clipboard as Paste,
  Edit3,
  MessageSquare,
  Clock,
  User,
  Shield,
  BookOpen,
  Sparkles
} from 'lucide-react';

import { MedicalReport, Finding, Impression, Recommendation } from '@/lib/reporting/medical-reports';
import { ReportTemplate, ReportSection, TemplateMacro, TemplateValidationResult } from '@/lib/reporting/report-templates';

// Component Props
interface ReportEditorProps {
  report: MedicalReport;
  template?: ReportTemplate;
  onSave: (report: MedicalReport) => void;
  onValidate: (report: MedicalReport) => Promise<TemplateValidationResult>;
  onPreview: (report: MedicalReport) => void;
  onExport: (report: MedicalReport, format: string) => void;
  readonly?: boolean;
  className?: string;
}

// Editor State
interface EditorState {
  content: Record<string, any>;
  isDirty: boolean;
  isValidating: boolean;
  validationResult?: TemplateValidationResult;
  activeSection: string | null;
  isVoiceRecording: boolean;
  aiSuggestions: AISuggestion[];
  macros: TemplateMacro[];
  searchQuery: string;
  selectedMacro: TemplateMacro | null;
  preferences: EditorPreferences;
  history: EditorHistory[];
  historyIndex: number;
  autoSaveEnabled: boolean;
  lastSaved: Date | null;
}

interface AISuggestion {
  id: string;
  section: string;
  type: 'finding' | 'impression' | 'recommendation' | 'correction';
  content: string;
  confidence: number;
  reasoning: string;
  accepted: boolean;
}

interface EditorPreferences {
  fontSize: number;
  fontFamily: string;
  theme: 'light' | 'dark';
  showLineNumbers: boolean;
  enableSpellCheck: boolean;
  enableAIAssistance: boolean;
  autoSaveInterval: number;
  highlightRequired: boolean;
  showWordCount: boolean;
  showValidationInline: boolean;
}

interface EditorHistory {
  timestamp: Date;
  action: string;
  content: Record<string, any>;
  section: string;
}

// Format Bar Component
const FormatBar: React.FC<{
  onFormat: (format: string) => void;
  disabled: boolean;
}> = ({ onFormat, disabled }) => (
  <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
    <div className="flex items-center gap-1">
      <button
        onClick={() => onFormat('bold')}
        disabled={disabled}
        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => onFormat('italic')}
        disabled={disabled}
        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => onFormat('underline')}
        disabled={disabled}
        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
        title="Underline"
      >
        <Underline className="w-4 h-4" />
      </button>
    </div>
    <div className="w-px h-6 bg-gray-300 mx-2" />
    <div className="flex items-center gap-1">
      <button
        onClick={() => onFormat('alignLeft')}
        disabled={disabled}
        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => onFormat('alignCenter')}
        disabled={disabled}
        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        onClick={() => onFormat('alignRight')}
        disabled={disabled}
        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </button>
    </div>
    <div className="w-px h-6 bg-gray-300 mx-2" />
    <div className="flex items-center gap-1">
      <button
        onClick={() => onFormat('list')}
        disabled={disabled}
        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
        title="List"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// Macro Selector Component
const MacroSelector: React.FC<{
  macros: TemplateMacro[];
  onSelect: (macro: TemplateMacro) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ macros, onSelect, searchQuery, onSearchChange, isOpen, onToggle }) => {
  const filteredMacros = macros.filter(macro =>
    macro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    macro.shortcut.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
      >
        <BookOpen className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-700">Macros</span>
        <ChevronDown className={`w-4 h-4 text-blue-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search macros..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredMacros.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No macros found</div>
            ) : (
              filteredMacros.map((macro) => (
                <button
                  key={macro.id}
                  onClick={() => onSelect(macro)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{macro.name}</div>
                      <div className="text-sm text-gray-500">{macro.description}</div>
                    </div>
                    <div className="ml-2">
                      <span className="px-2 py-1 bg-gray-100 text-xs font-mono text-gray-600 rounded">
                        {macro.shortcut}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// AI Assistant Component
const AIAssistant: React.FC<{
  suggestions: AISuggestion[];
  onAccept: (suggestion: AISuggestion) => void;
  onReject: (suggestion: AISuggestion) => void;
  isEnabled: boolean;
  onToggle: () => void;
}> = ({ suggestions, onAccept, onReject, isEnabled, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const activeSuggestions = suggestions.filter(s => !s.accepted);

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
      <div className="flex items-center justify-between p-3 border-b border-purple-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-purple-900">AI Assistant</h3>
          {activeSuggestions.length > 0 && (
            <span className="px-2 py-1 bg-purple-100 text-xs font-medium text-purple-700 rounded-full">
              {activeSuggestions.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              isEnabled 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {isEnabled ? 'Enabled' : 'Disabled'}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-purple-100"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      
      {isExpanded && isEnabled && (
        <div className="p-3">
          {activeSuggestions.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No suggestions available
            </div>
          ) : (
            <div className="space-y-3">
              {activeSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="bg-white border border-purple-200 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-purple-100 text-xs font-medium text-purple-700 rounded">
                        {suggestion.type}
                      </span>
                      <span className="text-sm text-gray-600">{suggestion.section}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">
                        {Math.round(suggestion.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-900 mb-2">{suggestion.content}</div>
                  <div className="text-xs text-gray-500 mb-3">{suggestion.reasoning}</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAccept(suggestion)}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => onReject(suggestion)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Section Editor Component
const SectionEditor: React.FC<{
  section: ReportSection;
  content: string;
  onChange: (content: string) => void;
  onFormat: (format: string) => void;
  isActive: boolean;
  onActivate: () => void;
  validationErrors: any[];
  readonly: boolean;
  preferences: EditorPreferences;
}> = ({ 
  section, 
  content, 
  onChange, 
  onFormat, 
  isActive, 
  onActivate,
  validationErrors,
  readonly,
  preferences
}) => {
  const [isExpanded, setIsExpanded] = useState(section.isExpanded);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!readonly) {
      onChange(e.target.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newContent = content.substring(0, start) + '\t' + content.substring(end);
      onChange(newContent);
    }
  };

  const errors = validationErrors.filter(error => error.field === section.id);

  return (
    <div className={`border rounded-lg ${isActive ? 'border-blue-500 shadow-md' : 'border-gray-200'}`}>
      <div 
        className={`flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 cursor-pointer ${
          isActive ? 'bg-blue-50' : ''
        }`}
        onClick={onActivate}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 rounded hover:bg-gray-200"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
          <h3 className="font-semibold text-gray-900">{section.title}</h3>
          {section.required && (
            <span className="text-red-500 text-sm">*</span>
          )}
          {errors.length > 0 && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {content.length} chars
          </span>
          {preferences.showWordCount && (
            <span className="text-xs text-gray-500">
              {content.split(/\s+/).filter(w => w.length > 0).length} words
            </span>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-3">
          {section.description && (
            <p className="text-sm text-gray-600 mb-3">{section.description}</p>
          )}
          
          {errors.length > 0 && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
              {errors.map((error, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  {error.message}
                </div>
              ))}
            </div>
          )}
          
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={section.content.placeholder}
              readOnly={readonly}
              className={`w-full min-h-[120px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
                readonly ? 'bg-gray-50' : 'bg-white'
              }`}
              style={{
                fontSize: `${preferences.fontSize}px`,
                fontFamily: preferences.fontFamily,
                lineHeight: section.formatting.lineSpacing === 'single' ? '1.2' : 
                          section.formatting.lineSpacing === 'double' ? '2' : '1.5'
              }}
              spellCheck={preferences.enableSpellCheck}
            />
            {preferences.showLineNumbers && (
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-100 border-r border-gray-300 text-xs text-gray-500 select-none pointer-events-none">
                {content.split('\n').map((_, index) => (
                  <div key={index} className="px-2 leading-6">
                    {index + 1}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Report Editor Component
export const ReportEditor: React.FC<ReportEditorProps> = ({
  report,
  template,
  onSave,
  onValidate,
  onPreview,
  onExport,
  readonly = false,
  className = ''
}) => {
  const [editorState, setEditorState] = useState<EditorState>({
    content: {},
    isDirty: false,
    isValidating: false,
    validationResult: undefined,
    activeSection: null,
    isVoiceRecording: false,
    aiSuggestions: [],
    macros: [],
    searchQuery: '',
    selectedMacro: null,
    preferences: {
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      theme: 'light',
      showLineNumbers: false,
      enableSpellCheck: true,
      enableAIAssistance: true,
      autoSaveInterval: 30000,
      highlightRequired: true,
      showWordCount: true,
      showValidationInline: true
    },
    history: [],
    historyIndex: -1,
    autoSaveEnabled: true,
    lastSaved: null
  });

  const [showMacroSelector, setShowMacroSelector] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize editor with report data
  useEffect(() => {
    if (report && template) {
      const initialContent: Record<string, any> = {};
      
      // Initialize content for each section
      template.sections.forEach(section => {
        initialContent[section.id] = '';
      });

      // Populate with existing report data
      if (report.findings) {
        initialContent['findings'] = report.findings.map(f => f.description).join('\n');
      }
      if (report.impressions) {
        initialContent['impression'] = report.impressions.map(i => i.description).join('\n');
      }
      if (report.recommendations) {
        initialContent['recommendations'] = report.recommendations.map(r => r.description).join('\n');
      }

      setEditorState(prev => ({
        ...prev,
        content: initialContent,
        activeSection: template.sections[0]?.id || null
      }));
    }
  }, [report, template]);

  // Auto-save functionality
  useEffect(() => {
    if (editorState.autoSaveEnabled && editorState.isDirty && !readonly) {
      autoSaveRef.current = setTimeout(() => {
        handleSave();
      }, editorState.preferences.autoSaveInterval);
    }

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [editorState.isDirty, editorState.autoSaveEnabled, editorState.preferences.autoSaveInterval]);

  // Handle content change
  const handleContentChange = useCallback((sectionId: string, content: string) => {
    setEditorState(prev => {
      const newContent = { ...prev.content, [sectionId]: content };
      
      // Add to history
      const newHistory = [...prev.history];
      newHistory.push({
        timestamp: new Date(),
        action: 'edit',
        content: newContent,
        section: sectionId
      });

      return {
        ...prev,
        content: newContent,
        isDirty: true,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  }, []);

  // Handle formatting
  const handleFormat = useCallback((format: string) => {
    // Implementation would apply formatting to selected text
    console.log('Format:', format);
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    if (readonly) return;

    try {
      // Update report with editor content
      const updatedReport: MedicalReport = {
        ...report,
        findings: editorState.content['findings'] ? 
          editorState.content['findings'].split('\n').map((desc: string, index: number) => ({
            id: `finding-${index}`,
            category: 'abnormal' as const,
            severity: 'moderate' as const,
            anatomicalLocation: { system: 'SNOMED-CT', region: 'Unknown' },
            description: desc,
            confidence: 0.9,
            aiGenerated: false,
            reviewStatus: 'pending' as const
          })) : [],
        impressions: editorState.content['impression'] ? 
          editorState.content['impression'].split('\n').map((desc: string, index: number) => ({
            id: `impression-${index}`,
            category: 'primary' as const,
            diagnosis: desc,
            certainty: 'probable' as const,
            codingSystem: 'ICD-10' as const,
            codes: [],
            description: desc,
            supporting_findings: [],
            differential: []
          })) : [],
        recommendations: editorState.content['recommendations'] ? 
          editorState.content['recommendations'].split('\n').map((desc: string, index: number) => ({
            id: `recommendation-${index}`,
            type: 'follow_up' as const,
            priority: 'routine' as const,
            description: desc,
            rationale: 'Based on clinical findings'
          })) : [],
        updatedAt: new Date()
      };

      await onSave(updatedReport);
      
      setEditorState(prev => ({
        ...prev,
        isDirty: false,
        lastSaved: new Date()
      }));
    } catch (error) {
      console.error('Save failed:', error);
    }
  }, [report, editorState.content, onSave, readonly]);

  // Handle validation
  const handleValidate = useCallback(async () => {
    if (!template) return;

    setEditorState(prev => ({ ...prev, isValidating: true }));

    try {
      const result = await onValidate(report);
      setEditorState(prev => ({
        ...prev,
        isValidating: false,
        validationResult: result
      }));
    } catch (error) {
      console.error('Validation failed:', error);
      setEditorState(prev => ({ ...prev, isValidating: false }));
    }
  }, [report, template, onValidate]);

  // Handle macro selection
  const handleMacroSelect = useCallback((macro: TemplateMacro) => {
    if (editorState.activeSection) {
      const currentContent = editorState.content[editorState.activeSection] || '';
      const newContent = currentContent + (currentContent ? '\n' : '') + macro.content;
      handleContentChange(editorState.activeSection, newContent);
    }
    setShowMacroSelector(false);
  }, [editorState.activeSection, editorState.content, handleContentChange]);

  // Handle AI suggestion
  const handleAISuggestionAccept = useCallback((suggestion: AISuggestion) => {
    const currentContent = editorState.content[suggestion.section] || '';
    const newContent = currentContent + (currentContent ? '\n' : '') + suggestion.content;
    handleContentChange(suggestion.section, newContent);
    
    setEditorState(prev => ({
      ...prev,
      aiSuggestions: prev.aiSuggestions.map(s => 
        s.id === suggestion.id ? { ...s, accepted: true } : s
      )
    }));
  }, [editorState.content, handleContentChange]);

  // Handle AI suggestion rejection
  const handleAISuggestionReject = useCallback((suggestion: AISuggestion) => {
    setEditorState(prev => ({
      ...prev,
      aiSuggestions: prev.aiSuggestions.filter(s => s.id !== suggestion.id)
    }));
  }, []);

  // Handle voice recording
  const handleVoiceToggle = useCallback(() => {
    setEditorState(prev => ({ ...prev, isVoiceRecording: !prev.isVoiceRecording }));
  }, []);

  // Handle undo/redo
  const handleUndo = useCallback(() => {
    if (editorState.historyIndex > 0) {
      const newIndex = editorState.historyIndex - 1;
      const historyEntry = editorState.history[newIndex];
      setEditorState(prev => ({
        ...prev,
        content: historyEntry.content,
        historyIndex: newIndex,
        isDirty: true
      }));
    }
  }, [editorState.history, editorState.historyIndex]);

  const handleRedo = useCallback(() => {
    if (editorState.historyIndex < editorState.history.length - 1) {
      const newIndex = editorState.historyIndex + 1;
      const historyEntry = editorState.history[newIndex];
      setEditorState(prev => ({
        ...prev,
        content: historyEntry.content,
        historyIndex: newIndex,
        isDirty: true
      }));
    }
  }, [editorState.history, editorState.historyIndex]);

  if (!template) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No template selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`medical-report-editor bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Medical Report Editor</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Template: {template.displayName}</span>
            {editorState.isDirty && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Unsaved changes</span>
              </div>
            )}
            {editorState.lastSaved && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Saved {editorState.lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <button
            onClick={handleUndo}
            disabled={editorState.historyIndex <= 0 || readonly}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={editorState.historyIndex >= editorState.history.length - 1 || readonly}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300" />
          
          {/* Voice Recording */}
          <button
            onClick={handleVoiceToggle}
            disabled={readonly}
            className={`p-2 rounded-md transition-colors ${
              editorState.isVoiceRecording 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'hover:bg-gray-100'
            }`}
            title={editorState.isVoiceRecording ? 'Stop Recording' : 'Start Voice Recording'}
          >
            {editorState.isVoiceRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          
          {/* Validation */}
          <button
            onClick={handleValidate}
            disabled={editorState.isValidating || readonly}
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50"
            title="Validate Report"
          >
            {editorState.isValidating ? (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 text-blue-600" />
            )}
            <span className="text-sm font-medium text-blue-700">Validate</span>
          </button>
          
          {/* Preview */}
          <button
            onClick={() => onPreview(report)}
            className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md hover:bg-green-100"
            title="Preview Report"
          >
            <Eye className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Preview</span>
          </button>
          
          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!editorState.isDirty || readonly}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            title="Save Report"
          >
            <Save className="w-4 h-4" />
            <span className="text-sm font-medium">Save</span>
          </button>
          
          {/* Settings */}
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Editor Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <MacroSelector
            macros={editorState.macros}
            onSelect={handleMacroSelect}
            searchQuery={editorState.searchQuery}
            onSearchChange={(query) => setEditorState(prev => ({ ...prev, searchQuery: query }))}
            isOpen={showMacroSelector}
            onToggle={() => setShowMacroSelector(!showMacroSelector)}
          />
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onExport(report, 'pdf')}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              title="Export as PDF"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Validation Status */}
          {editorState.validationResult && (
            <div className="flex items-center gap-2">
              {editorState.validationResult.isValid ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Valid</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">
                    {editorState.validationResult.errors.length} errors
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-600">
                Score: {editorState.validationResult.score}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Format Bar */}
      <FormatBar
        onFormat={handleFormat}
        disabled={readonly}
      />

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Left Panel - Sections */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Report Sections</h3>
            <div className="space-y-4">
              {template.sections.map((section) => (
                <SectionEditor
                  key={section.id}
                  section={section}
                  content={editorState.content[section.id] || ''}
                  onChange={(content) => handleContentChange(section.id, content)}
                  onFormat={handleFormat}
                  isActive={editorState.activeSection === section.id}
                  onActivate={() => setEditorState(prev => ({ ...prev, activeSection: section.id }))}
                  validationErrors={editorState.validationResult?.errors || []}
                  readonly={readonly}
                  preferences={editorState.preferences}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - AI Assistant */}
        <div className="w-1/3 border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            <AIAssistant
              suggestions={editorState.aiSuggestions}
              onAccept={handleAISuggestionAccept}
              onReject={handleAISuggestionReject}
              isEnabled={editorState.preferences.enableAIAssistance}
              onToggle={() => setEditorState(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  enableAIAssistance: !prev.preferences.enableAIAssistance
                }
              }))}
            />
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Editor Preferences</h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Size
                </label>
                <input
                  type="range"
                  min="10"
                  max="20"
                  value={editorState.preferences.fontSize}
                  onChange={(e) => setEditorState(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      fontSize: parseInt(e.target.value)
                    }
                  }))}
                  className="w-full"
                />
                <span className="text-sm text-gray-600">{editorState.preferences.fontSize}px</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Family
                </label>
                <select
                  value={editorState.preferences.fontFamily}
                  onChange={(e) => setEditorState(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      fontFamily: e.target.value
                    }
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Times New Roman, serif">Times New Roman</option>
                  <option value="Courier New, monospace">Courier New</option>
                  <option value="Georgia, serif">Georgia</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editorState.preferences.showLineNumbers}
                    onChange={(e) => setEditorState(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        showLineNumbers: e.target.checked
                      }
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Show Line Numbers</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editorState.preferences.enableSpellCheck}
                    onChange={(e) => setEditorState(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        enableSpellCheck: e.target.checked
                      }
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Enable Spell Check</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editorState.preferences.showWordCount}
                    onChange={(e) => setEditorState(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        showWordCount: e.target.checked
                      }
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Show Word Count</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editorState.preferences.enableAIAssistance}
                    onChange={(e) => setEditorState(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        enableAIAssistance: e.target.checked
                      }
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Enable AI Assistance</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 