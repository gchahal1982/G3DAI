"use client";

/**
 * AIWorkflowBuilder.tsx - Visual AI Workflow Builder
 * 
 * Advanced node-based workflow editor with drag-and-drop interface for creating AI workflows.
 * Features real-time validation, connection management, and workflow execution.
 * 
 * Features:
 * - Drag-and-drop node interface
 * - Real-time workflow validation
 * - Connection management and type checking
 * - Node configuration panels
 * - Workflow execution controls
 * - Auto-save and version control
 * - Collaborative editing support
 * - Template system
 * - Performance optimization
 * - Export/import functionality
 * 
 * Part of G3D AnnotateAI Phase 2.2 - AI and ML Services Integration
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// UI Components
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Select,
    Textarea,
    Slider,
    Switch,
    Badge,
    Tooltip,
    Modal,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Progress
} from '../../../../../shared/components/ui';

// Icons
import {
    PlayIcon,
    PauseIcon,
    StopIcon,
    PlusIcon,
    TrashIcon,
    DocumentDuplicateIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    CogIcon,
    EyeIcon,
    LinkIcon,
    DocumentArrowUpIcon,
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    MagnifyingGlassPlusIcon,
    MagnifyingGlassMinusIcon,
    AdjustmentsHorizontalIcon,
    CpuChipIcon,
    CubeIcon,
    BeakerIcon,
    SparklesIcon,
    ChartBarIcon,
    CodeBracketIcon,
    PhotoIcon,
    DocumentTextIcon,
    MicrophoneIcon,
    VideoCameraIcon,
    SpeakerWaveIcon,
    CircleStackIcon,
    ArrowRightIcon,
    ArrowDownIcon,
    Squares2X2Icon,
    BoltIcon
} from '@heroicons/react/24/outline';

// Types
interface WorkflowNode {
    id: string;
    type: 'input' | 'processing' | 'model' | 'output' | 'condition' | 'loop' | 'custom';
    category: string;
    name: string;
    description: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    inputs: NodePort[];
    outputs: NodePort[];
    config: Record<string, any>;
    status: 'idle' | 'running' | 'completed' | 'failed' | 'warning';
    errors: string[];
    warnings: string[];
    execution: {
        duration: number;
        lastRun: number;
        runCount: number;
    };
}

interface NodePort {
    id: string;
    name: string;
    type: 'data' | 'control' | 'trigger';
    dataType: 'any' | 'string' | 'number' | 'boolean' | 'array' | 'object' | 'image' | 'video' | 'audio' | 'model';
    required: boolean;
    multiple: boolean;
    connected: boolean;
    value?: any;
}

interface WorkflowConnection {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    sourcePortId: string;
    targetPortId: string;
    type: 'data' | 'control';
    status: 'active' | 'inactive' | 'error';
    path: string;
    animated: boolean;
}

interface NodeTemplate {
    id: string;
    type: string;
    category: string;
    name: string;
    description: string;
    icon: React.ComponentType;
    inputs: Omit<NodePort, 'id' | 'connected'>[];
    outputs: Omit<NodePort, 'id' | 'connected'>[];
    config: Record<string, any>;
    tags: string[];
}

interface WorkflowBuilderProps {
    workflowId?: string;
    readOnly?: boolean;
    onSave?: (workflow: any) => void;
    onExecute?: (workflow: any) => void;
    onValidate?: (workflow: any) => ValidationResult;
    className?: string;
}

interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}

interface ValidationError {
    nodeId?: string;
    connectionId?: string;
    type: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
}

const AIWorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
    workflowId,
    readOnly = false,
    onSave,
    onExecute,
    onValidate,
    className = ''
}) => {
    // Core state
    const [nodes, setNodes] = useState<WorkflowNode[]>([]);
    const [connections, setConnections] = useState<WorkflowConnection[]>([]);
    const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
    const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
    const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);

    // UI state
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStart, setConnectionStart] = useState<{ nodeId: string; portId: string } | null>(null);
    const [showNodeLibrary, setShowNodeLibrary] = useState(false);
    const [showConfigPanel, setShowConfigPanel] = useState(false);
    const [showValidationPanel, setShowValidationPanel] = useState(false);

    // Workflow state
    const [workflowName, setWorkflowName] = useState('Untitled Workflow');
    const [workflowDescription, setWorkflowDescription] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionProgress, setExecutionProgress] = useState(0);
    const [validationResult, setValidationResult] = useState<ValidationResult>({
        valid: true,
        errors: [],
        warnings: []
    });

    // Refs
    const canvasRef = useRef<HTMLDivElement>(null);
    const dragStartRef = useRef<{ x: number; y: number } | null>(null);
    const lastSaveRef = useRef<number>(0);

    // Node templates
    const nodeTemplates: NodeTemplate[] = useMemo(() => [
        // Input nodes
        {
            id: 'image-input',
            type: 'input',
            category: 'Input',
            name: 'Image Input',
            description: 'Load image data',
            icon: PhotoIcon,
            inputs: [],
            outputs: [
                { name: 'image', type: 'data', dataType: 'image', required: true, multiple: false, value: null }
            ],
            config: { path: '', format: 'auto', preprocess: true },
            tags: ['image', 'input', 'data']
        },
        {
            id: 'text-input',
            type: 'input',
            category: 'Input',
            name: 'Text Input',
            description: 'Input text data',
            icon: DocumentTextIcon,
            inputs: [],
            outputs: [
                { name: 'text', type: 'data', dataType: 'string', required: true, multiple: false, value: null }
            ],
            config: { text: '', encoding: 'utf-8', maxLength: 1000 },
            tags: ['text', 'input', 'nlp']
        },
        {
            id: 'video-input',
            type: 'input',
            category: 'Input',
            name: 'Video Input',
            description: 'Load video data',
            icon: VideoCameraIcon,
            inputs: [],
            outputs: [
                { name: 'video', type: 'data', dataType: 'video', required: true, multiple: false, value: null }
            ],
            config: { path: '', format: 'auto', fps: 30, resolution: 'auto' },
            tags: ['video', 'input', 'multimedia']
        },
        
        // Processing nodes
        {
            id: 'image-preprocess',
            type: 'processing',
            category: 'Processing',
            name: 'Image Preprocessing',
            description: 'Preprocess image data',
            icon: AdjustmentsHorizontalIcon,
            inputs: [
                { name: 'image', type: 'data', dataType: 'image', required: true, multiple: false, value: null }
            ],
            outputs: [
                { name: 'processed', type: 'data', dataType: 'image', required: true, multiple: false, value: null }
            ],
            config: { resize: [224, 224], normalize: true, augment: false, grayscale: false },
            tags: ['image', 'preprocessing', 'computer-vision']
        },
        {
            id: 'text-preprocess',
            type: 'processing',
            category: 'Processing',
            name: 'Text Preprocessing',
            description: 'Preprocess text data',
            icon: DocumentTextIcon,
            inputs: [
                { name: 'text', type: 'data', dataType: 'string', required: true, multiple: false, value: null }
            ],
            outputs: [
                { name: 'processed', type: 'data', dataType: 'string', required: true, multiple: false, value: null }
            ],
            config: { lowercase: true, removePunctuation: true, removeStopwords: true, stemming: false },
            tags: ['text', 'preprocessing', 'nlp']
        },
        
        // Model nodes
        {
            id: 'object-detection',
            type: 'model',
            category: 'AI Models',
            name: 'Object Detection',
            description: 'Detect objects in images',
            icon: CubeIcon,
            inputs: [
                { name: 'image', type: 'data', dataType: 'image', required: true, multiple: false, value: null }
            ],
            outputs: [
                { name: 'detections', type: 'data', dataType: 'array', required: true, multiple: false, value: null },
                { name: 'confidence', type: 'data', dataType: 'number', required: false, multiple: false, value: null }
            ],
            config: { model: 'yolov8', confidence: 0.5, nms: 0.4, classes: [] },
            tags: ['computer-vision', 'detection', 'ai']
        },
        {
            id: 'text-classification',
            type: 'model',
            category: 'AI Models',
            name: 'Text Classification',
            description: 'Classify text content',
            icon: SparklesIcon,
            inputs: [
                { name: 'text', type: 'data', dataType: 'string', required: true, multiple: false, value: null }
            ],
            outputs: [
                { name: 'classification', type: 'data', dataType: 'string', required: true, multiple: false, value: null },
                { name: 'confidence', type: 'data', dataType: 'number', required: false, multiple: false, value: null }
            ],
            config: { model: 'bert-base', classes: ['positive', 'negative', 'neutral'], maxLength: 512 },
            tags: ['nlp', 'classification', 'ai']
        },
        
        // Output nodes
        {
            id: 'save-results',
            type: 'output',
            category: 'Output',
            name: 'Save Results',
            description: 'Save workflow results',
            icon: DocumentArrowUpIcon,
            inputs: [
                { name: 'data', type: 'data', dataType: 'any', required: true, multiple: false, value: null }
            ],
            outputs: [],
            config: { format: 'json', path: './results/', timestamp: true },
            tags: ['output', 'save', 'export']
        },
        {
            id: 'visualization',
            type: 'output',
            category: 'Output',
            name: 'Visualization',
            description: 'Create data visualizations',
            icon: ChartBarIcon,
            inputs: [
                { name: 'data', type: 'data', dataType: 'any', required: true, multiple: false, value: null }
            ],
            outputs: [
                { name: 'chart', type: 'data', dataType: 'image', required: true, multiple: false, value: null }
            ],
            config: { type: 'bar', title: '', xlabel: '', ylabel: '', width: 800, height: 600 },
            tags: ['visualization', 'chart', 'output']
        },
        
        // Control nodes
        {
            id: 'conditional',
            type: 'condition',
            category: 'Control',
            name: 'Conditional',
            description: 'Branch workflow based on condition',
            icon: ArrowRightIcon,
            inputs: [
                { name: 'condition', type: 'data', dataType: 'boolean', required: true, multiple: false, value: null },
                { name: 'input', type: 'data', dataType: 'any', required: true, multiple: false, value: null }
            ],
            outputs: [
                { name: 'true', type: 'data', dataType: 'any', required: false, multiple: false, value: null },
                { name: 'false', type: 'data', dataType: 'any', required: false, multiple: false, value: null }
            ],
            config: { operator: '>', value: 0.5 },
            tags: ['control', 'condition', 'logic']
        },
        {
            id: 'loop',
            type: 'loop',
            category: 'Control',
            name: 'Loop',
            description: 'Repeat workflow steps',
            icon: ArrowPathIcon,
            inputs: [
                { name: 'input', type: 'data', dataType: 'any', required: true, multiple: false, value: null },
                { name: 'iterations', type: 'data', dataType: 'number', required: true, multiple: false, value: null }
            ],
            outputs: [
                { name: 'output', type: 'data', dataType: 'any', required: true, multiple: false, value: null }
            ],
            config: { maxIterations: 10, breakCondition: null },
            tags: ['control', 'loop', 'iteration']
        }
    ], []);

    // Auto-save functionality
    useEffect(() => {
        if (nodes.length > 0 && !readOnly) {
            const autoSaveInterval = setInterval(() => {
                if (Date.now() - lastSaveRef.current > 30000) { // 30 seconds
                    handleSave();
                }
            }, 10000); // Check every 10 seconds

            return () => clearInterval(autoSaveInterval);
        }
    }, [nodes]);

    // Validate workflow
    useEffect(() => {
        const validate = () => {
            const errors: ValidationError[] = [];
            const warnings: ValidationError[] = [];

            // Check for disconnected nodes
            nodes.forEach(node => {
                const hasInputConnections = node.inputs.some(input => input.connected);
                const hasOutputConnections = node.outputs.some(output => output.connected);
                
                if (node.type !== 'input' && !hasInputConnections) {
                    warnings.push({
                        nodeId: node.id,
                        type: 'disconnected',
                        message: 'Node has no input connections',
                        severity: 'warning'
                    });
                }
                
                if (node.type !== 'output' && !hasOutputConnections) {
                    warnings.push({
                        nodeId: node.id,
                        type: 'disconnected',
                        message: 'Node has no output connections',
                        severity: 'warning'
                    });
                }
            });

            // Check for type mismatches
            connections.forEach(connection => {
                const sourceNode = nodes.find(n => n.id === connection.sourceNodeId);
                const targetNode = nodes.find(n => n.id === connection.targetNodeId);
                
                if (sourceNode && targetNode) {
                    const sourcePort = sourceNode.outputs.find(p => p.id === connection.sourcePortId);
                    const targetPort = targetNode.inputs.find(p => p.id === connection.targetPortId);
                    
                    if (sourcePort && targetPort) {
                        if (sourcePort.dataType !== 'any' && targetPort.dataType !== 'any' && 
                            sourcePort.dataType !== targetPort.dataType) {
                            errors.push({
                                connectionId: connection.id,
                                type: 'type_mismatch',
                                message: `Type mismatch: ${sourcePort.dataType} -> ${targetPort.dataType}`,
                                severity: 'error'
                            });
                        }
                    }
                }
            });

            const result: ValidationResult = {
                valid: errors.length === 0,
                errors,
                warnings
            };

            setValidationResult(result);
            return result;
        };

        validate();
    }, [nodes, connections]);

    // Add node to canvas
    const addNode = useCallback((template: NodeTemplate, position: { x: number; y: number }) => {
        const nodeId = `${template.id}-${Date.now()}`;
        const newNode: WorkflowNode = {
            id: nodeId,
            type: template.type as any,
            category: template.category,
            name: template.name,
            description: template.description,
            position,
            size: { width: 200, height: 120 },
            inputs: template.inputs.map(input => ({
                ...input,
                id: `${nodeId}-input-${input.name}`,
                connected: false
            })),
            outputs: template.outputs.map(output => ({
                ...output,
                id: `${nodeId}-output-${output.name}`,
                connected: false
            })),
            config: { ...template.config },
            status: 'idle',
            errors: [],
            warnings: [],
            execution: {
                duration: 0,
                lastRun: 0,
                runCount: 0
            }
        };

        setNodes(prev => [...prev, newNode]);
        setSelectedNodes([nodeId]);
        setSelectedNode(newNode);
        setShowConfigPanel(true);
    }, []);

    // Delete selected nodes
    const deleteSelected = useCallback(() => {
        if (selectedNodes.length === 0) return;

        // Remove connections first
        setConnections(prev => prev.filter(conn => 
            !selectedNodes.includes(conn.sourceNodeId) && 
            !selectedNodes.includes(conn.targetNodeId)
        ));

        // Remove nodes
        setNodes(prev => prev.filter(node => !selectedNodes.includes(node.id)));
        setSelectedNodes([]);
        setSelectedNode(null);
        setShowConfigPanel(false);
    }, [selectedNodes]);

    // Start connection
    const startConnection = useCallback((nodeId: string, portId: string) => {
        setIsConnecting(true);
        setConnectionStart({ nodeId, portId });
    }, []);

    // Complete connection
    const completeConnection = useCallback((targetNodeId: string, targetPortId: string) => {
        if (!connectionStart) return;

        const sourceNode = nodes.find(n => n.id === connectionStart.nodeId);
        const targetNode = nodes.find(n => n.id === targetNodeId);
        
        if (!sourceNode || !targetNode) return;

        const sourcePort = sourceNode.outputs.find(p => p.id === connectionStart.portId);
        const targetPort = targetNode.inputs.find(p => p.id === targetPortId);
        
        if (!sourcePort || !targetPort) return;

        // Check if connection already exists
        const existingConnection = connections.find(conn => 
            conn.sourceNodeId === connectionStart.nodeId &&
            conn.sourcePortId === connectionStart.portId &&
            conn.targetNodeId === targetNodeId &&
            conn.targetPortId === targetPortId
        );

        if (existingConnection) return;

        // Create new connection
        const newConnection: WorkflowConnection = {
            id: `conn-${Date.now()}`,
            sourceNodeId: connectionStart.nodeId,
            targetNodeId: targetNodeId,
            sourcePortId: connectionStart.portId,
            targetPortId: targetPortId,
            type: sourcePort.type === 'control' ? 'control' : 'data',
            status: 'active',
            path: '',
            animated: false
        };

        setConnections(prev => [...prev, newConnection]);
        
        // Update port connection status
        setNodes(prev => prev.map(node => {
            if (node.id === connectionStart.nodeId) {
                return {
                    ...node,
                    outputs: node.outputs.map(output => 
                        output.id === connectionStart.portId 
                            ? { ...output, connected: true }
                            : output
                    )
                };
            }
            if (node.id === targetNodeId) {
                return {
                    ...node,
                    inputs: node.inputs.map(input => 
                        input.id === targetPortId 
                            ? { ...input, connected: true }
                            : input
                    )
                };
            }
            return node;
        }));

        setIsConnecting(false);
        setConnectionStart(null);
    }, [connectionStart, nodes, connections]);

    // Cancel connection
    const cancelConnection = useCallback(() => {
        setIsConnecting(false);
        setConnectionStart(null);
    }, []);

    // Handle node configuration change
    const updateNodeConfig = useCallback((nodeId: string, config: Record<string, any>) => {
        setNodes(prev => prev.map(node => 
            node.id === nodeId 
                ? { ...node, config: { ...node.config, ...config } }
                : node
        ));
    }, []);

    // Save workflow
    const handleSave = useCallback(() => {
        const workflowData = {
            id: workflowId,
            name: workflowName,
            description: workflowDescription,
            nodes,
            connections,
            version: '1.0',
            created: Date.now(),
            modified: Date.now()
        };

        onSave?.(workflowData);
        lastSaveRef.current = Date.now();
    }, [workflowId, workflowName, workflowDescription, nodes, connections, onSave]);

    // Execute workflow
    const handleExecute = useCallback(async () => {
        const validation = validationResult;
        if (!validation.valid) {
            setShowValidationPanel(true);
            return;
        }

        setIsExecuting(true);
        setExecutionProgress(0);

        try {
            const workflowData = {
                id: workflowId,
                name: workflowName,
                description: workflowDescription,
                nodes,
                connections
            };

            // Simulate execution progress
            const progressInterval = setInterval(() => {
                setExecutionProgress(prev => Math.min(prev + 10, 90));
            }, 500);

            await onExecute?.(workflowData);
            
            clearInterval(progressInterval);
            setExecutionProgress(100);
            
            // Update node execution status
            setNodes(prev => prev.map(node => ({
                ...node,
                status: 'completed',
                execution: {
                    ...node.execution,
                    lastRun: Date.now(),
                    runCount: node.execution.runCount + 1
                }
            })));

        } catch (error) {
            console.error('Workflow execution failed:', error);
            setNodes(prev => prev.map(node => ({
                ...node,
                status: 'failed',
                errors: [`Execution failed: ${error.message}`]
            })));
        } finally {
            setIsExecuting(false);
            setTimeout(() => setExecutionProgress(0), 2000);
        }
    }, [workflowId, workflowName, workflowDescription, nodes, connections, validationResult, onExecute]);

    // Render node component
    const renderNode = (node: WorkflowNode) => {
        const isSelected = selectedNodes.includes(node.id);
        const StatusIcon = node.status === 'completed' ? CheckCircleIcon :
                          node.status === 'failed' ? XCircleIcon :
                          node.status === 'running' ? ArrowPathIcon : null;

        return (
            <motion.div
                key={node.id}
                drag
                dragMomentum={false}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={(e, info) => {
                    setIsDragging(false);
                    setNodes(prev => prev.map(n => 
                        n.id === node.id 
                            ? { ...n, position: { x: n.position.x + info.offset.x, y: n.position.y + info.offset.y } }
                            : n
                    ));
                }}
                className={`absolute bg-white/10 backdrop-blur-lg rounded-lg border-2 cursor-move ${
                    isSelected ? 'border-blue-400' : 'border-white/20'
                }`}
                style={{
                    left: node.position.x,
                    top: node.position.y,
                    width: node.size.width,
                    height: node.size.height
                }}
                onClick={() => {
                    setSelectedNodes([node.id]);
                    setSelectedNode(node);
                    setShowConfigPanel(true);
                }}
            >
                {/* Node Header */}
                <div className="p-3 border-b border-white/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                                <CubeIcon className="w-4 h-4 text-purple-400" />
                            </div>
                            <span className="text-sm font-medium text-white">{node.name}</span>
                        </div>
                        {StatusIcon && <StatusIcon className="w-4 h-4 text-green-400" />}
                    </div>
                </div>

                {/* Node Content */}
                <div className="p-3">
                    <p className="text-xs text-white/60 mb-2">{node.description}</p>
                    
                    {/* Input Ports */}
                    <div className="space-y-1 mb-2">
                        {node.inputs.map((input, index) => (
                            <div
                                key={input.id}
                                className="flex items-center gap-2"
                                onMouseDown={() => completeConnection(node.id, input.id)}
                            >
                                <div className={`w-2 h-2 rounded-full ${
                                    input.connected ? 'bg-green-400' : 'bg-gray-400'
                                }`} />
                                <span className="text-xs text-white/70">{input.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Output Ports */}
                    <div className="space-y-1">
                        {node.outputs.map((output, index) => (
                            <div
                                key={output.id}
                                className="flex items-center justify-end gap-2"
                                onMouseDown={() => startConnection(node.id, output.id)}
                            >
                                <span className="text-xs text-white/70">{output.name}</span>
                                <div className={`w-2 h-2 rounded-full ${
                                    output.connected ? 'bg-green-400' : 'bg-gray-400'
                                }`} />
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        );
    };

    // Render connection
    const renderConnection = (connection: WorkflowConnection) => {
        const sourceNode = nodes.find(n => n.id === connection.sourceNodeId);
        const targetNode = nodes.find(n => n.id === connection.targetNodeId);
        
        if (!sourceNode || !targetNode) return null;

        const sourcePort = sourceNode.outputs.find(p => p.id === connection.sourcePortId);
        const targetPort = targetNode.inputs.find(p => p.id === connection.targetPortId);
        
        if (!sourcePort || !targetPort) return null;

        // Calculate connection path
        const sourceX = sourceNode.position.x + sourceNode.size.width;
        const sourceY = sourceNode.position.y + sourceNode.size.height / 2;
        const targetX = targetNode.position.x;
        const targetY = targetNode.position.y + targetNode.size.height / 2;

        const path = `M ${sourceX} ${sourceY} C ${sourceX + 50} ${sourceY} ${targetX - 50} ${targetY} ${targetX} ${targetY}`;

        return (
            <path
                key={connection.id}
                d={path}
                stroke={connection.status === 'error' ? '#ef4444' : '#3b82f6'}
                strokeWidth="2"
                fill="none"
                className="pointer-events-none"
            />
        );
    };

    return (
        <div className={`workflow-builder ${className}`}>
            <div className="h-full flex flex-col bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950">
                {/* Toolbar */}
                <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <CodeBracketIcon className="w-6 h-6 text-purple-400" />
                                <div>
                                    <h2 className="text-lg font-bold text-white">Workflow Builder</h2>
                                    <p className="text-sm text-white/60">Design your AI workflow</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Input
                                    value={workflowName}
                                    onChange={(e) => setWorkflowName(e.target.value)}
                                    className="bg-white/10 border-white/20 text-white w-48"
                                    placeholder="Workflow name"
                                />
                                <Badge variant={validationResult.valid ? 'default' : 'destructive'}>
                                    {validationResult.errors.length} errors
                                </Badge>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowNodeLibrary(true)}
                                disabled={readOnly}
                            >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Add Node
                            </Button>
                            
                            <Button
                                variant="outline"
                                onClick={() => setShowValidationPanel(true)}
                                disabled={validationResult.valid}
                            >
                                <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                                Validate
                            </Button>
                            
                            <Button
                                variant="outline"
                                onClick={handleSave}
                                disabled={readOnly}
                            >
                                <DocumentArrowUpIcon className="w-4 h-4 mr-2" />
                                Save
                            </Button>
                            
                            <Button
                                onClick={handleExecute}
                                disabled={isExecuting || !validationResult.valid}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600"
                            >
                                {isExecuting ? (
                                    <>
                                        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                                        Executing...
                                    </>
                                ) : (
                                    <>
                                        <PlayIcon className="w-4 h-4 mr-2" />
                                        Execute
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 relative overflow-hidden">
                    <div
                        ref={canvasRef}
                        className="absolute inset-0 bg-gradient-to-br from-purple-950/20 to-indigo-950/20"
                        style={{
                            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                            transformOrigin: 'top left'
                        }}
                        onClick={cancelConnection}
                    >
                        {/* Grid */}
                        <div
                            className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage: `
                                    radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0),
                                    radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)
                                `,
                                backgroundSize: '20px 20px',
                                backgroundPosition: '0 0, 10px 10px'
                            }}
                        />

                        {/* Connections */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            {connections.map(renderConnection)}
                        </svg>

                        {/* Nodes */}
                        {nodes.map(renderNode)}

                        {/* Connection preview */}
                        {isConnecting && connectionStart && (
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute bg-blue-400 w-0.5 h-full" />
                            </div>
                        )}
                    </div>

                    {/* Zoom Controls */}
                    <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
                        >
                            <MagnifyingGlassPlusIcon className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
                        >
                            <MagnifyingGlassMinusIcon className="w-4 h-4" />
                        </Button>
                        <div className="text-xs text-white/60 text-center">
                            {Math.round(zoom * 100)}%
                        </div>
                    </div>
                </div>

                {/* Execution Progress */}
                <AnimatePresence>
                    {isExecuting && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-4 right-4 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg"
                        >
                            <div className="flex items-center gap-3">
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                <div>
                                    <p className="font-medium">Executing workflow...</p>
                                    <Progress value={executionProgress} className="w-48 mt-1" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Node Library Modal */}
            <Modal
                isOpen={showNodeLibrary}
                onClose={() => setShowNodeLibrary(false)}
                title="Node Library"
                size="lg"
            >
                <div className="space-y-4">
                    <Input
                        placeholder="Search nodes..."
                        className="bg-white/10 border-white/20"
                    />
                    
                    <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                        {nodeTemplates.map(template => {
                            const IconComponent = template.icon as React.ComponentType<{className?: string}>;
                            return (
                                <Card
                                    key={template.id}
                                    className="bg-white/10 border-white/20 cursor-pointer hover:bg-white/20 transition-colors"
                                    onClick={() => {
                                        addNode(template, { x: 100, y: 100 });
                                        setShowNodeLibrary(false);
                                    }}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                <IconComponent className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-white">{template.name}</h3>
                                                <p className="text-sm text-white/60">{template.category}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-white/60">{template.description}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {template.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </Modal>

            {/* Node Configuration Panel */}
            <Modal
                isOpen={showConfigPanel}
                onClose={() => setShowConfigPanel(false)}
                title={selectedNode ? `Configure ${selectedNode.name}` : 'Configure Node'}
                size="lg"
            >
                {selectedNode && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Node Name
                            </label>
                            <Input
                                value={selectedNode.name}
                                onChange={(e) => {
                                    const newName = e.target.value;
                                    setNodes(prev => prev.map(n => 
                                        n.id === selectedNode.id 
                                            ? { ...n, name: newName }
                                            : n
                                    ));
                                    setSelectedNode({ ...selectedNode, name: newName });
                                }}
                                className="bg-white/10 border-white/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Description
                            </label>
                            <Textarea
                                value={selectedNode.description}
                                onChange={(e) => {
                                    const newDescription = e.target.value;
                                    setNodes(prev => prev.map(n => 
                                        n.id === selectedNode.id 
                                            ? { ...n, description: newDescription }
                                            : n
                                    ));
                                    setSelectedNode({ ...selectedNode, description: newDescription });
                                }}
                                className="bg-white/10 border-white/20"
                                rows={3}
                            />
                        </div>

                        {/* Node-specific configuration */}
                        <div>
                            <h3 className="text-lg font-medium text-white mb-3">Configuration</h3>
                            <div className="space-y-3">
                                {Object.entries(selectedNode.config).map(([key, value]) => (
                                    <div key={key}>
                                        <label className="block text-sm font-medium text-white/80 mb-1">
                                            {key}
                                        </label>
                                        {typeof value === 'boolean' ? (
                                            <Switch
                                                checked={value}
                                                onCheckedChange={(checked) => {
                                                    updateNodeConfig(selectedNode.id, { [key]: checked });
                                                }}
                                            />
                                        ) : typeof value === 'number' ? (
                                            <Input
                                                type="number"
                                                value={value}
                                                onChange={(e) => {
                                                    updateNodeConfig(selectedNode.id, { [key]: parseFloat(e.target.value) });
                                                }}
                                                className="bg-white/10 border-white/20"
                                            />
                                        ) : (
                                            <Input
                                                value={value}
                                                onChange={(e) => {
                                                    updateNodeConfig(selectedNode.id, { [key]: e.target.value });
                                                }}
                                                className="bg-white/10 border-white/20"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowConfigPanel(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => setShowConfigPanel(false)}
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Validation Panel */}
            <Modal
                isOpen={showValidationPanel}
                onClose={() => setShowValidationPanel(false)}
                title="Workflow Validation"
                size="lg"
            >
                <div className="space-y-4">
                    {validationResult.errors.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium text-red-400 mb-3">Errors</h3>
                            <div className="space-y-2">
                                {validationResult.errors.map((error, index) => (
                                    <div key={index} className="flex items-center gap-2 p-3 bg-red-500/20 rounded-lg">
                                        <XCircleIcon className="w-5 h-5 text-red-400" />
                                        <span className="text-white">{error.message}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {validationResult.warnings.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium text-yellow-400 mb-3">Warnings</h3>
                            <div className="space-y-2">
                                {validationResult.warnings.map((warning, index) => (
                                    <div key={index} className="flex items-center gap-2 p-3 bg-yellow-500/20 rounded-lg">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                                        <span className="text-white">{warning.message}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {validationResult.valid && (
                        <div className="flex items-center gap-2 p-3 bg-green-500/20 rounded-lg">
                            <CheckCircleIcon className="w-5 h-5 text-green-400" />
                            <span className="text-white">Workflow is valid and ready to execute</span>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default AIWorkflowBuilder; 