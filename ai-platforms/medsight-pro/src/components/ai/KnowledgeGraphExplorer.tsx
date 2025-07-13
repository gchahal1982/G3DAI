'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Network, 
  Search, 
  Filter, 
  Eye, 
  Brain, 
  BookOpen, 
  Database, 
  Zap, 
  Target, 
  Link, 
  Layers, 
  Settings, 
  Download, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Play, 
  Pause, 
  Square, 
  ChevronRight, 
  ChevronDown, 
  Info, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Users, 
  Activity, 
  TrendingUp, 
  Hash, 
  Code, 
  Globe, 
  Microscope, 
  Stethoscope, 
  Pill, 
  Heart, 
  Dna
} from 'lucide-react';
import { AIAnalysisIntegration } from '@/lib/ai/ai-analysis-integration';

interface KnowledgeNode {
  id: string;
  name: string;
  type: 'disease' | 'symptom' | 'treatment' | 'anatomy' | 'biomarker' | 'drug' | 'procedure';
  description: string;
  synonyms: string[];
  codes: MedicalCode[];
  attributes: Record<string, any>;
  confidence: number;
  x?: number;
  y?: number;
  selected?: boolean;
  highlighted?: boolean;
  size?: number;
  color?: string;
}

interface MedicalCode {
  system: 'ICD10' | 'ICD11' | 'SNOMED' | 'LOINC' | 'CPT' | 'RADLEX' | 'UMLS';
  code: string;
  display: string;
  version?: string;
}

interface KnowledgeRelationship {
  id: string;
  source: string;
  target: string;
  type: string;
  weight: number;
  confidence: number;
  evidence: Evidence[];
  bidirectional?: boolean;
  color?: string;
  width?: number;
}

interface Evidence {
  type: 'publication' | 'guideline' | 'expert_opinion' | 'clinical_trial' | 'meta_analysis';
  source: string;
  title?: string;
  authors?: string[];
  year?: number;
  doi?: string;
  pmid?: string;
  strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
  quality: 'low' | 'moderate' | 'high' | 'very_high';
}

interface GraphLayout {
  nodes: KnowledgeNode[];
  relationships: KnowledgeRelationship[];
  layout: 'force' | 'hierarchical' | 'circular' | 'grid';
  center?: { x: number; y: number };
  zoom?: number;
  selectedNodes?: string[];
  filters?: GraphFilters;
}

interface GraphFilters {
  nodeTypes: string[];
  relationshipTypes: string[];
  confidenceThreshold: number;
  evidenceTypes: string[];
  maxDepth: number;
  maxNodes: number;
}

interface PathResult {
  path: string[];
  distance: number;
  relationships: KnowledgeRelationship[];
  significance: number;
  clinicalRelevance: string;
}

const KnowledgeGraphExplorer: React.FC = () => {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [relationships, setRelationships] = useState<KnowledgeRelationship[]>([]);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<KnowledgeRelationship | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeNode[]>([]);
  const [filters, setFilters] = useState<GraphFilters>({
    nodeTypes: ['disease', 'symptom', 'treatment', 'anatomy', 'biomarker', 'drug', 'procedure'],
    relationshipTypes: ['causes', 'treats', 'related_to', 'part_of', 'interacts_with'],
    confidenceThreshold: 0.7,
    evidenceTypes: ['publication', 'guideline', 'clinical_trial'],
    maxDepth: 3,
    maxNodes: 100
  });
  const [layout, setLayout] = useState<'force' | 'hierarchical' | 'circular' | 'grid'>('force');
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('explorer');
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysisIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pathResults, setPathResults] = useState<PathResult[]>([]);
  const [sourceNode, setSourceNode] = useState<string>('');
  const [targetNode, setTargetNode] = useState<string>('');
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeKnowledgeGraph = async () => {
      try {
        const ai = new AIAnalysisIntegration();
        setAIAnalysis(ai);
        await loadSampleData();
      } catch (error) {
        console.error('Failed to initialize knowledge graph:', error);
      }
    };

    initializeKnowledgeGraph();
  }, []);

  const loadSampleData = async () => {
    // Load sample medical knowledge graph data
    const sampleNodes: KnowledgeNode[] = [
      {
        id: 'diabetes',
        name: 'Diabetes Mellitus',
        type: 'disease',
        description: 'A group of metabolic disorders characterized by high blood sugar',
        synonyms: ['diabetes', 'DM', 'diabetes mellitus'],
        codes: [
          { system: 'ICD10', code: 'E11', display: 'Type 2 diabetes mellitus' },
          { system: 'SNOMED', code: '73211009', display: 'Diabetes mellitus' }
        ],
        attributes: { prevalence: 0.09, severity: 'moderate' },
        confidence: 0.95,
        x: 100,
        y: 100,
        size: 20,
        color: '#ff6b6b'
      },
      {
        id: 'hypertension',
        name: 'Hypertension',
        type: 'disease',
        description: 'A long-term medical condition in which blood pressure is persistently elevated',
        synonyms: ['high blood pressure', 'HTN'],
        codes: [
          { system: 'ICD10', code: 'I10', display: 'Essential hypertension' },
          { system: 'SNOMED', code: '38341003', display: 'Hypertensive disorder' }
        ],
        attributes: { prevalence: 0.45, severity: 'moderate' },
        confidence: 0.92,
        x: 200,
        y: 150,
        size: 18,
        color: '#4ecdc4'
      },
      {
        id: 'metformin',
        name: 'Metformin',
        type: 'drug',
        description: 'A medication used to treat type 2 diabetes',
        synonyms: ['metformin hydrochloride', 'glucophage'],
        codes: [
          { system: 'SNOMED', code: '387467008', display: 'Metformin' }
        ],
        attributes: { class: 'biguanide', mechanism: 'glucose_reduction' },
        confidence: 0.98,
        x: 50,
        y: 200,
        size: 15,
        color: '#45b7d1'
      },
      {
        id: 'cardiovascular_disease',
        name: 'Cardiovascular Disease',
        type: 'disease',
        description: 'A class of diseases that involve the heart or blood vessels',
        synonyms: ['CVD', 'heart disease', 'cardiac disease'],
        codes: [
          { system: 'ICD10', code: 'I25', display: 'Chronic ischemic heart disease' }
        ],
        attributes: { severity: 'high', mortality: 'high' },
        confidence: 0.94,
        x: 300,
        y: 100,
        size: 22,
        color: '#f7b731'
      },
      {
        id: 'insulin',
        name: 'Insulin',
        type: 'drug',
        description: 'A hormone that regulates blood sugar levels',
        synonyms: ['human insulin', 'insulin therapy'],
        codes: [
          { system: 'SNOMED', code: '67866001', display: 'Insulin' }
        ],
        attributes: { class: 'hormone', mechanism: 'glucose_regulation' },
        confidence: 0.99,
        x: 150,
        y: 250,
        size: 16,
        color: '#a55eea'
      }
    ];

    const sampleRelationships: KnowledgeRelationship[] = [
      {
        id: 'diabetes_metformin',
        source: 'diabetes',
        target: 'metformin',
        type: 'treated_by',
        weight: 0.9,
        confidence: 0.95,
        evidence: [
          {
            type: 'clinical_trial',
            source: 'UKPDS',
            title: 'Effect of metformin on diabetes outcomes',
            year: 1998,
            strength: 'very_strong',
            quality: 'very_high'
          }
        ],
        color: '#26de81',
        width: 3
      },
      {
        id: 'diabetes_hypertension',
        source: 'diabetes',
        target: 'hypertension',
        type: 'associated_with',
        weight: 0.8,
        confidence: 0.88,
        evidence: [
          {
            type: 'meta_analysis',
            source: 'Cochrane',
            title: 'Diabetes and hypertension comorbidity',
            year: 2020,
            strength: 'strong',
            quality: 'high'
          }
        ],
        bidirectional: true,
        color: '#fd9644',
        width: 2
      },
      {
        id: 'diabetes_cvd',
        source: 'diabetes',
        target: 'cardiovascular_disease',
        type: 'increases_risk_of',
        weight: 0.85,
        confidence: 0.92,
        evidence: [
          {
            type: 'publication',
            source: 'AHA',
            title: 'Diabetes as cardiovascular risk factor',
            year: 2021,
            strength: 'very_strong',
            quality: 'high'
          }
        ],
        color: '#fc5c65',
        width: 4
      },
      {
        id: 'diabetes_insulin',
        source: 'diabetes',
        target: 'insulin',
        type: 'treated_by',
        weight: 0.95,
        confidence: 0.98,
        evidence: [
          {
            type: 'guideline',
            source: 'ADA',
            title: 'Standards of Medical Care in Diabetes',
            year: 2023,
            strength: 'very_strong',
            quality: 'very_high'
          }
        ],
        color: '#26de81',
        width: 3
      }
    ];

    setNodes(sampleNodes);
    setRelationships(sampleRelationships);
  };

  const searchKnowledge = async (query: string) => {
    if (!query.trim() || !aiAnalysis) return;

    setIsLoading(true);
    try {
      const results = await aiAnalysis.searchMedicalKnowledge(query, {
        types: filters.nodeTypes,
        confidenceThreshold: filters.confidenceThreshold
      });

      if (results) {
        const searchNodes = results.map(node => ({
          id: node.id,
          name: node.name,
          type: node.type,
          description: node.description,
          synonyms: node.synonyms,
          codes: node.codes,
          attributes: node.attributes,
          confidence: node.confidence,
          x: Math.random() * 400,
          y: Math.random() * 400,
          size: 15,
          color: getNodeColor(node.type)
        }));

        setSearchResults(searchNodes);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const expandNode = async (nodeId: string) => {
    if (!aiAnalysis) return;

    setIsLoading(true);
    try {
      const result = await aiAnalysis.getRelatedConcepts(nodeId, undefined, 2);
      
      if (result) {
        const newNodes = result.nodes.map(node => ({
          id: node.id,
          name: node.name,
          type: node.type,
          description: node.description,
          synonyms: node.synonyms,
          codes: node.codes,
          attributes: node.attributes,
          confidence: node.confidence,
          x: Math.random() * 400,
          y: Math.random() * 400,
          size: 12,
          color: getNodeColor(node.type)
        }));

        const newRelationships = result.relationships.map(rel => ({
          id: rel.id,
          source: rel.source,
          target: rel.target,
          type: rel.type,
          weight: rel.weight,
          confidence: rel.confidence,
          evidence: rel.evidence,
          color: getRelationshipColor(rel.type),
          width: Math.max(1, rel.weight * 3)
        }));

        setNodes(prev => [...prev, ...newNodes.filter(n => !prev.find(p => p.id === n.id))]);
        setRelationships(prev => [...prev, ...newRelationships.filter(r => !prev.find(p => p.id === r.id))]);
        setExpandedNodes(prev => new Set([...prev, nodeId]));
      }
    } catch (error) {
      console.error('Failed to expand node:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const findPath = (sourceId: string, targetId: string) => {
    // Simple path finding algorithm
    const visited = new Set<string>();
    const queue: { node: string; path: string[]; distance: number }[] = [
      { node: sourceId, path: [sourceId], distance: 0 }
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current.node === targetId) {
        const pathRelationships = [];
        for (let i = 0; i < current.path.length - 1; i++) {
          const rel = relationships.find(r => 
            (r.source === current.path[i] && r.target === current.path[i + 1]) ||
            (r.target === current.path[i] && r.source === current.path[i + 1])
          );
          if (rel) pathRelationships.push(rel);
        }

        const pathResult: PathResult = {
          path: current.path,
          distance: current.distance,
          relationships: pathRelationships,
          significance: pathRelationships.reduce((sum, rel) => sum + rel.confidence, 0) / pathRelationships.length,
          clinicalRelevance: 'High clinical significance pathway identified'
        };

        setPathResults([pathResult]);
        return;
      }

      if (visited.has(current.node)) continue;
      visited.add(current.node);

      const connectedNodes = relationships
        .filter(r => r.source === current.node || r.target === current.node)
        .map(r => r.source === current.node ? r.target : r.source);

      for (const nextNode of connectedNodes) {
        if (!visited.has(nextNode)) {
          queue.push({
            node: nextNode,
            path: [...current.path, nextNode],
            distance: current.distance + 1
          });
        }
      }
    }

    setPathResults([]);
  };

  const getNodeColor = (type: string) => {
    const colors = {
      disease: '#ff6b6b',
      symptom: '#4ecdc4',
      treatment: '#45b7d1',
      anatomy: '#96ceb4',
      biomarker: '#feca57',
      drug: '#a55eea',
      procedure: '#fd9644'
    };
    return colors[type as keyof typeof colors] || '#95a5a6';
  };

  const getRelationshipColor = (type: string) => {
    const colors = {
      causes: '#fc5c65',
      treats: '#26de81',
      related_to: '#fd9644',
      part_of: '#4b7bec',
      interacts_with: '#a55eea',
      increases_risk_of: '#fc5c65',
      decreases_risk_of: '#26de81'
    };
    return colors[type as keyof typeof colors] || '#95a5a6';
  };

  const handleNodeClick = (node: KnowledgeNode) => {
    setSelectedNode(node);
    setNodes(prev => prev.map(n => ({ ...n, selected: n.id === node.id })));
  };

  const handleRelationshipClick = (relationship: KnowledgeRelationship) => {
    setSelectedRelationship(relationship);
  };

  const resetView = () => {
    setZoom(1);
    setCenter({ x: 0, y: 0 });
    setNodes(prev => prev.map(n => ({ ...n, selected: false, highlighted: false })));
    setSelectedNode(null);
    setSelectedRelationship(null);
    setPathResults([]);
  };

  const exportGraph = () => {
    const graphData = {
      nodes,
      relationships,
      filters,
      layout,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-graph-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const GraphVisualization = () => (
    <div className="relative w-full h-96 border rounded-lg bg-gray-50">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${-200 + center.x} ${-200 + center.y} ${400 / zoom} ${400 / zoom}`}
        className="cursor-grab"
      >
        {/* Relationships */}
        {relationships.map((rel) => {
          const sourceNode = nodes.find(n => n.id === rel.source);
          const targetNode = nodes.find(n => n.id === rel.target);
          
          if (!sourceNode || !targetNode) return null;

          return (
            <g key={rel.id}>
              <line
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={rel.color}
                strokeWidth={rel.width}
                opacity={0.8}
                className="cursor-pointer"
                onClick={() => handleRelationshipClick(rel)}
              />
              {rel.type && (
                <text
                  x={(sourceNode.x! + targetNode.x!) / 2}
                  y={(sourceNode.y! + targetNode.y!) / 2}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 pointer-events-none"
                >
                  {rel.type.replace('_', ' ')}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={node.size}
              fill={node.color}
              stroke={node.selected ? '#2563eb' : 'white'}
              strokeWidth={node.selected ? 3 : 2}
              opacity={0.9}
              className="cursor-pointer"
              onClick={() => handleNodeClick(node)}
            />
            <text
              x={node.x}
              y={node.y! + node.size! + 15}
              textAnchor="middle"
              className="text-xs fill-gray-700 pointer-events-none"
            >
              {node.name.length > 15 ? node.name.substring(0, 15) + '...' : node.name}
            </text>
          </g>
        ))}
      </svg>

      {/* Graph Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button size="sm" variant="outline" onClick={() => setZoom(prev => Math.min(prev * 1.2, 3))}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => setZoom(prev => Math.max(prev / 1.2, 0.3))}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={resetView}>
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => setIsFullscreen(!isFullscreen)}>
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );

  const NodeDetails = ({ node }: { node: KnowledgeNode }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: node.color }} />
          {node.name}
          <Badge variant="outline">{node.type}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-sm text-gray-600">{node.description}</p>
        </div>

        {node.synonyms.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Synonyms</h4>
            <div className="flex flex-wrap gap-1">
              {node.synonyms.map((synonym, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {synonym}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {node.codes.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Medical Codes</h4>
            <div className="space-y-1">
              {node.codes.map((code, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{code.system}</Badge>
                  <code className="bg-gray-100 px-2 py-1 rounded">{code.code}</code>
                  <span className="text-gray-600">{code.display}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="font-medium mb-2">Confidence Score</h4>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${node.confidence * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium">{(node.confidence * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={() => expandNode(node.id)}>
            <Network className="w-4 h-4 mr-1" />
            Expand
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSourceNode(node.id)}>
            <Target className="w-4 h-4 mr-1" />
            Set as Source
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ExplorerTab = () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search medical knowledge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchKnowledge(searchQuery)}
          />
        </div>
        <Button onClick={() => searchKnowledge(searchQuery)} disabled={isLoading}>
          <Search className="w-4 h-4 mr-2" />
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      <GraphVisualization />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium mb-2">Graph Statistics</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-sm text-gray-600">Nodes</div>
              <div className="font-semibold">{nodes.length}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-sm text-gray-600">Relationships</div>
              <div className="font-semibold">{relationships.length}</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Path Analysis</h3>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Source node"
              value={sourceNode}
              onChange={(e) => setSourceNode(e.target.value)}
            />
            <Input
              placeholder="Target node"
              value={targetNode}
              onChange={(e) => setTargetNode(e.target.value)}
            />
          </div>
          <Button 
            className="mt-2 w-full" 
            onClick={() => findPath(sourceNode, targetNode)}
            disabled={!sourceNode || !targetNode}
          >
            Find Path
          </Button>
        </div>
      </div>

      {selectedNode && (
        <NodeDetails node={selectedNode} />
      )}
    </div>
  );

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="h-full backdrop-blur-sm bg-white/90 border border-white/20 rounded-xl shadow-xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Network className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Knowledge Graph Explorer</h1>
                <p className="text-gray-600">Medical Knowledge Visualization & Discovery</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Database className="w-3 h-3" />
                {nodes.length} Nodes
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Link className="w-3 h-3" />
                {relationships.length} Relations
              </Badge>
              <Button variant="outline" size="sm" onClick={exportGraph}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <div className="h-[calc(100%-120px)] p-4">
          <div className="h-full overflow-auto">
            <ExplorerTab />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraphExplorer; 