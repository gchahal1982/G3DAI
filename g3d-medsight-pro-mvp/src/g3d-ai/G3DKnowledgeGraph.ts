/**
 * G3D MedSight Pro - Knowledge Graph System
 * Comprehensive medical knowledge graph for semantic understanding and reasoning
 * 
 * Features:
 * - Medical ontology management
 * - Semantic relationship modeling
 * - Intelligent reasoning and inference
 * - Clinical decision support
 * - Drug-disease interactions
 * - Evidence-based recommendations
 */

import { vec3, mat4 } from 'gl-matrix';

// Knowledge Graph Types
export interface G3DKnowledgeGraphConfig {
    enableSemanticReasoning: boolean;
    enableOntologyInference: boolean;
    enableClinicalRules: boolean;
    enableDrugInteractions: boolean;
    confidenceThreshold: number;
    maxInferenceDepth: number;
    cacheSize: number;
    updateFrequency: 'realtime' | 'daily' | 'weekly';
}

export interface G3DKnowledgeNode {
    id: string;
    type: G3DNodeType;
    label: string;
    description: string;
    properties: Record<string, any>;
    confidence: number;
    source: G3DKnowledgeSource;
    lastUpdated: Date;
    aliases: string[];
    metadata: G3DNodeMetadata;
}

export type G3DNodeType =
    | 'disease' | 'symptom' | 'finding' | 'anatomy' | 'drug' | 'procedure'
    | 'biomarker' | 'gene' | 'pathway' | 'concept' | 'guideline' | 'evidence';

export interface G3DKnowledgeSource {
    name: string;
    version: string;
    reliability: number;
    lastVerified: Date;
    url?: string;
    citation?: string;
}

export interface G3DNodeMetadata {
    createdAt: Date;
    updatedAt: Date;
    version: number;
    tags: string[];
    category: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    reviewStatus: 'pending' | 'approved' | 'deprecated';
}

export interface G3DKnowledgeEdge {
    id: string;
    sourceId: string;
    targetId: string;
    relationship: G3DRelationshipType;
    weight: number;
    confidence: number;
    evidence: G3DEvidence[];
    properties: Record<string, any>;
    bidirectional: boolean;
    temporal: G3DTemporalConstraint[];
    context: G3DContextConstraint[];
}

export type G3DRelationshipType =
    | 'causes' | 'treats' | 'prevents' | 'indicates' | 'contraindicates'
    | 'interacts_with' | 'located_in' | 'part_of' | 'associated_with'
    | 'precedes' | 'follows' | 'increases_risk' | 'decreases_risk'
    | 'manifests_as' | 'diagnosed_by' | 'measured_by' | 'affects' | 'detects';

export interface G3DEvidence {
    type: 'clinical_trial' | 'meta_analysis' | 'case_study' | 'expert_opinion' | 'guideline';
    level: 'I' | 'II' | 'III' | 'IV' | 'V';
    strength: 'strong' | 'moderate' | 'weak' | 'insufficient';
    source: string;
    pubmedId?: string;
    doi?: string;
    confidence: number;
    sampleSize?: number;
    studyType?: string;
}

export interface G3DTemporalConstraint {
    type: 'before' | 'after' | 'during' | 'concurrent';
    timeframe?: string;
    duration?: number;
    unit?: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
}

export interface G3DContextConstraint {
    type: 'age' | 'gender' | 'condition' | 'severity' | 'stage' | 'location';
    value: string | number;
    operator: 'equals' | 'greater_than' | 'less_than' | 'in_range' | 'contains';
    unit?: string;
}

export interface G3DSemanticQuery {
    id: string;
    query: string;
    queryType: 'concept' | 'relationship' | 'path' | 'inference' | 'similarity';
    parameters: Record<string, any>;
    filters: G3DQueryFilter[];
    includeInferred: boolean;
    maxResults: number;
    confidenceThreshold: number;
}

export interface G3DQueryFilter {
    field: string;
    operator: 'equals' | 'contains' | 'starts_with' | 'greater_than' | 'less_than';
    value: any;
    negate?: boolean;
}

export interface G3DSemanticResult {
    queryId: string;
    timestamp: Date;
    results: G3DKnowledgeMatch[];
    totalCount: number;
    executionTime: number;
    confidence: number;
    inferenceChain?: G3DInferenceStep[];
}

export interface G3DKnowledgeMatch {
    node?: G3DKnowledgeNode;
    edge?: G3DKnowledgeEdge;
    path?: G3DKnowledgePath;
    score: number;
    confidence: number;
    relevance: number;
    explanation: string;
}

export interface G3DKnowledgePath {
    nodes: G3DKnowledgeNode[];
    edges: G3DKnowledgeEdge[];
    length: number;
    totalWeight: number;
    confidence: number;
    semanticMeaning: string;
}

export interface G3DInferenceStep {
    rule: string;
    premises: G3DKnowledgeNode[];
    conclusion: G3DKnowledgeNode;
    confidence: number;
    reasoning: string;
}

export interface G3DClinicalRule {
    id: string;
    name: string;
    description: string;
    conditions: G3DRuleCondition[];
    actions: G3DRuleAction[];
    priority: number;
    enabled: boolean;
    evidence: G3DEvidence[];
    lastValidated: Date;
}

export interface G3DRuleCondition {
    type: 'node_exists' | 'relationship_exists' | 'property_value' | 'path_exists';
    nodeType?: G3DNodeType;
    relationship?: G3DRelationshipType;
    property?: string;
    value?: any;
    operator?: 'equals' | 'greater_than' | 'less_than' | 'contains';
    confidence?: number;
}

export interface G3DRuleAction {
    type: 'infer_node' | 'infer_relationship' | 'recommend' | 'alert' | 'contraindicate';
    target?: string;
    relationship?: G3DRelationshipType;
    confidence: number;
    message: string;
    severity?: 'info' | 'warning' | 'error' | 'critical';
}

export interface G3DDrugInteraction {
    id: string;
    drug1: string;
    drug2: string;
    interactionType: 'major' | 'moderate' | 'minor' | 'contraindicated';
    mechanism: string;
    effect: string;
    clinicalSignificance: string;
    management: string;
    evidence: G3DEvidence[];
    frequency: 'common' | 'uncommon' | 'rare' | 'very_rare';
}

export interface G3DOntologyMapping {
    sourceOntology: string;
    targetOntology: string;
    mappings: G3DConceptMapping[];
    confidence: number;
    lastUpdated: Date;
}

export interface G3DConceptMapping {
    sourceId: string;
    targetId: string;
    mappingType: 'exact' | 'broader' | 'narrower' | 'related' | 'approximate';
    confidence: number;
    verified: boolean;
}

// Medical Ontologies
export class G3DMedicalOntologies {
    // Standard medical ontologies
    static readonly SNOMED_CT = {
        name: 'SNOMED CT',
        version: '2024-03',
        concepts: 350000,
        relationships: 1400000,
        description: 'Systematized Nomenclature of Medicine Clinical Terms'
    };

    static readonly ICD_11 = {
        name: 'ICD-11',
        version: '2024',
        concepts: 55000,
        relationships: 120000,
        description: 'International Classification of Diseases 11th Revision'
    };

    static readonly LOINC = {
        name: 'LOINC',
        version: '2.76',
        concepts: 98000,
        relationships: 45000,
        description: 'Logical Observation Identifiers Names and Codes'
    };

    static readonly RXNORM = {
        name: 'RxNorm',
        version: '2024-01',
        concepts: 140000,
        relationships: 280000,
        description: 'Normalized naming system for clinical drugs'
    };

    static readonly RADLEX = {
        name: 'RadLex',
        version: '4.1',
        concepts: 46000,
        relationships: 180000,
        description: 'Radiology lexicon for uniform indexing and retrieval'
    };
}

// Main Knowledge Graph System
export class G3DKnowledgeGraph {
    private config: G3DKnowledgeGraphConfig;
    private nodes: Map<string, G3DKnowledgeNode> = new Map();
    private edges: Map<string, G3DKnowledgeEdge> = new Map();
    private nodeIndex: Map<string, Set<string>> = new Map(); // Type -> Node IDs
    private edgeIndex: Map<string, Set<string>> = new Map(); // Relationship -> Edge IDs
    private clinicalRules: Map<string, G3DClinicalRule> = new Map();
    private drugInteractions: Map<string, G3DDrugInteraction> = new Map();
    private ontologyMappings: Map<string, G3DOntologyMapping> = new Map();
    private inferenceCache: Map<string, G3DSemanticResult> = new Map();
    private isInitialized: boolean = false;

    constructor(config: Partial<G3DKnowledgeGraphConfig> = {}) {
        this.config = {
            enableSemanticReasoning: true,
            enableOntologyInference: true,
            enableClinicalRules: true,
            enableDrugInteractions: true,
            confidenceThreshold: 0.7,
            maxInferenceDepth: 5,
            cacheSize: 10000,
            updateFrequency: 'daily',
            ...config
        };
    }

    async initialize(): Promise<void> {
        try {
            console.log('Initializing G3D Knowledge Graph System...');

            // Load medical ontologies
            await this.loadMedicalOntologies();

            // Load clinical rules
            await this.loadClinicalRules();

            // Load drug interactions
            await this.loadDrugInteractions();

            // Build indices
            this.buildIndices();

            this.isInitialized = true;
            console.log('G3D Knowledge Graph System initialized successfully');
            console.log(`Loaded ${this.nodes.size} nodes and ${this.edges.size} edges`);
        } catch (error) {
            console.error('Failed to initialize G3D Knowledge Graph System:', error);
            throw error;
        }
    }

    private async loadMedicalOntologies(): Promise<void> {
        // Load core medical concepts
        await this.loadDiseaseOntology();
        await this.loadAnatomyOntology();
        await this.loadDrugOntology();
        await this.loadProcedureOntology();
        await this.loadFindingOntology();
    }

    private async loadDiseaseOntology(): Promise<void> {
        // Sample disease nodes
        const diseases = [
            {
                id: 'disease:pneumonia',
                label: 'Pneumonia',
                description: 'Infection that inflames air sacs in one or both lungs',
                properties: {
                    icd11: '1C62',
                    snomedCt: '233604007',
                    severity: 'variable',
                    infectious: true
                }
            },
            {
                id: 'disease:lung_cancer',
                label: 'Lung Cancer',
                description: 'Cancer that begins in the lungs',
                properties: {
                    icd11: '2C25',
                    snomedCt: '363358000',
                    malignant: true,
                    mortality_rate: 'high'
                }
            },
            {
                id: 'disease:copd',
                label: 'Chronic Obstructive Pulmonary Disease',
                description: 'Progressive lung disease characterized by airflow limitation',
                properties: {
                    icd11: 'CA22',
                    snomedCt: '13645005',
                    chronic: true,
                    progressive: true
                }
            }
        ];

        for (const disease of diseases) {
            this.addNode({
                id: disease.id,
                type: 'disease',
                label: disease.label,
                description: disease.description,
                properties: disease.properties,
                confidence: 1.0,
                source: {
                    name: 'SNOMED CT',
                    version: '2024-03',
                    reliability: 0.95,
                    lastVerified: new Date()
                },
                lastUpdated: new Date(),
                aliases: [],
                metadata: {
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    version: 1,
                    tags: ['disease', 'medical'],
                    category: 'pathology',
                    priority: 'high',
                    reviewStatus: 'approved'
                }
            });
        }
    }

    private async loadAnatomyOntology(): Promise<void> {
        // Sample anatomy nodes
        const anatomyStructures = [
            {
                id: 'anatomy:lung',
                label: 'Lung',
                description: 'Paired respiratory organs in the chest cavity',
                properties: {
                    fma: '7195',
                    snomedCt: '39607008',
                    system: 'respiratory',
                    paired: true
                }
            },
            {
                id: 'anatomy:heart',
                label: 'Heart',
                description: 'Muscular organ that pumps blood through the circulatory system',
                properties: {
                    fma: '7088',
                    snomedCt: '80891009',
                    system: 'cardiovascular',
                    chambers: 4
                }
            },
            {
                id: 'anatomy:brain',
                label: 'Brain',
                description: 'Central organ of the nervous system',
                properties: {
                    fma: '50801',
                    snomedCt: '12738006',
                    system: 'nervous',
                    protected_by: 'skull'
                }
            }
        ];

        for (const anatomy of anatomyStructures) {
            this.addNode({
                id: anatomy.id,
                type: 'anatomy',
                label: anatomy.label,
                description: anatomy.description,
                properties: anatomy.properties,
                confidence: 1.0,
                source: {
                    name: 'FMA',
                    version: '4.14',
                    reliability: 0.98,
                    lastVerified: new Date()
                },
                lastUpdated: new Date(),
                aliases: [],
                metadata: {
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    version: 1,
                    tags: ['anatomy', 'structure'],
                    category: 'anatomy',
                    priority: 'high',
                    reviewStatus: 'approved'
                }
            });
        }
    }

    private async loadDrugOntology(): Promise<void> {
        // Sample drug nodes
        const drugs = [
            {
                id: 'drug:amoxicillin',
                label: 'Amoxicillin',
                description: 'Beta-lactam antibiotic used to treat bacterial infections',
                properties: {
                    rxcui: '723',
                    atc: 'J01CA04',
                    class: 'antibiotic',
                    mechanism: 'beta_lactam'
                }
            },
            {
                id: 'drug:albuterol',
                label: 'Albuterol',
                description: 'Short-acting beta2-adrenergic receptor agonist used for bronchospasm',
                properties: {
                    rxcui: '435',
                    atc: 'R03AC02',
                    class: 'bronchodilator',
                    mechanism: 'beta2_agonist'
                }
            }
        ];

        for (const drug of drugs) {
            this.addNode({
                id: drug.id,
                type: 'drug',
                label: drug.label,
                description: drug.description,
                properties: drug.properties,
                confidence: 1.0,
                source: {
                    name: 'RxNorm',
                    version: '2024-01',
                    reliability: 0.95,
                    lastVerified: new Date()
                },
                lastUpdated: new Date(),
                aliases: [],
                metadata: {
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    version: 1,
                    tags: ['drug', 'medication'],
                    category: 'pharmacology',
                    priority: 'high',
                    reviewStatus: 'approved'
                }
            });
        }
    }

    private async loadProcedureOntology(): Promise<void> {
        // Sample procedure nodes
        const procedures = [
            {
                id: 'procedure:chest_xray',
                label: 'Chest X-ray',
                description: 'Radiographic examination of the chest',
                properties: {
                    cpt: '71045',
                    snomedCt: '399208008',
                    modality: 'radiography',
                    body_part: 'chest'
                }
            },
            {
                id: 'procedure:ct_chest',
                label: 'CT Chest',
                description: 'Computed tomography of the chest',
                properties: {
                    cpt: '71250',
                    snomedCt: '169069000',
                    modality: 'ct',
                    body_part: 'chest'
                }
            }
        ];

        for (const procedure of procedures) {
            this.addNode({
                id: procedure.id,
                type: 'procedure',
                label: procedure.label,
                description: procedure.description,
                properties: procedure.properties,
                confidence: 1.0,
                source: {
                    name: 'CPT',
                    version: '2024',
                    reliability: 0.95,
                    lastVerified: new Date()
                },
                lastUpdated: new Date(),
                aliases: [],
                metadata: {
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    version: 1,
                    tags: ['procedure', 'imaging'],
                    category: 'procedure',
                    priority: 'medium',
                    reviewStatus: 'approved'
                }
            });
        }
    }

    private async loadFindingOntology(): Promise<void> {
        // Sample finding nodes
        const findings = [
            {
                id: 'finding:consolidation',
                label: 'Pulmonary Consolidation',
                description: 'Area of lung tissue that has become solid due to fluid accumulation',
                properties: {
                    snomedCt: '196455008',
                    radlex: 'RID5350',
                    imaging_appearance: 'increased_opacity'
                }
            },
            {
                id: 'finding:pneumothorax',
                label: 'Pneumothorax',
                description: 'Presence of air in the pleural space',
                properties: {
                    snomedCt: '36118008',
                    radlex: 'RID5347',
                    emergency: true
                }
            }
        ];

        for (const finding of findings) {
            this.addNode({
                id: finding.id,
                type: 'finding',
                label: finding.label,
                description: finding.description,
                properties: finding.properties,
                confidence: 1.0,
                source: {
                    name: 'RadLex',
                    version: '4.1',
                    reliability: 0.92,
                    lastVerified: new Date()
                },
                lastUpdated: new Date(),
                aliases: [],
                metadata: {
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    version: 1,
                    tags: ['finding', 'imaging'],
                    category: 'radiology',
                    priority: 'high',
                    reviewStatus: 'approved'
                }
            });
        }

        // Add relationships between concepts
        this.addRelationships();
    }

    private addRelationships(): void {
        // Disease-anatomy relationships
        this.addEdge({
            id: 'rel:pneumonia_affects_lung',
            sourceId: 'disease:pneumonia',
            targetId: 'anatomy:lung',
            relationship: 'affects',
            weight: 1.0,
            confidence: 0.95,
            evidence: [{
                type: 'clinical_trial',
                level: 'I',
                strength: 'strong',
                source: 'Medical literature',
                confidence: 0.95
            }],
            properties: { severity: 'variable' },
            bidirectional: false,
            temporal: [],
            context: []
        });

        // Drug-disease relationships
        this.addEdge({
            id: 'rel:amoxicillin_treats_pneumonia',
            sourceId: 'drug:amoxicillin',
            targetId: 'disease:pneumonia',
            relationship: 'treats',
            weight: 0.8,
            confidence: 0.9,
            evidence: [{
                type: 'meta_analysis',
                level: 'I',
                strength: 'strong',
                source: 'Cochrane Review',
                confidence: 0.9
            }],
            properties: { effectiveness: 'high' },
            bidirectional: false,
            temporal: [],
            context: []
        });

        // Finding-disease relationships
        this.addEdge({
            id: 'rel:consolidation_indicates_pneumonia',
            sourceId: 'finding:consolidation',
            targetId: 'disease:pneumonia',
            relationship: 'indicates',
            weight: 0.7,
            confidence: 0.85,
            evidence: [{
                type: 'clinical_trial',
                level: 'II',
                strength: 'moderate',
                source: 'Radiology studies',
                confidence: 0.85
            }],
            properties: { specificity: 'moderate' },
            bidirectional: false,
            temporal: [],
            context: []
        });

        // Procedure-finding relationships
        this.addEdge({
            id: 'rel:chest_xray_detects_consolidation',
            sourceId: 'procedure:chest_xray',
            targetId: 'finding:consolidation',
            relationship: 'detects',
            weight: 0.9,
            confidence: 0.88,
            evidence: [{
                type: 'clinical_trial',
                level: 'II',
                strength: 'strong',
                source: 'Imaging studies',
                confidence: 0.88
            }],
            properties: { sensitivity: 'high' },
            bidirectional: false,
            temporal: [],
            context: []
        });
    }

    private async loadClinicalRules(): Promise<void> {
        // Sample clinical rules
        const rules = [
            {
                id: 'rule:pneumonia_antibiotic',
                name: 'Pneumonia Antibiotic Treatment',
                description: 'Recommend antibiotic treatment for bacterial pneumonia',
                conditions: [{
                    type: 'node_exists' as const,
                    nodeType: 'disease' as const,
                    property: 'label',
                    value: 'Pneumonia',
                    operator: 'equals' as const,
                    confidence: 0.8
                }],
                actions: [{
                    type: 'recommend' as const,
                    target: 'drug:amoxicillin',
                    confidence: 0.9,
                    message: 'Consider antibiotic treatment for bacterial pneumonia',
                    severity: 'warning' as const
                }],
                priority: 1,
                enabled: true,
                evidence: [{
                    type: 'guideline' as const,
                    level: 'I' as const,
                    strength: 'strong' as const,
                    source: 'IDSA Guidelines',
                    confidence: 0.95
                }],
                lastValidated: new Date()
            }
        ];

        for (const rule of rules) {
            this.clinicalRules.set(rule.id, rule);
        }
    }

    private async loadDrugInteractions(): Promise<void> {
        // Sample drug interactions
        const interactions = [
            {
                id: 'interaction:warfarin_amoxicillin',
                drug1: 'warfarin',
                drug2: 'amoxicillin',
                interactionType: 'moderate' as const,
                mechanism: 'Antibiotic may alter gut flora affecting vitamin K synthesis',
                effect: 'Increased anticoagulation effect',
                clinicalSignificance: 'Monitor INR more frequently',
                management: 'Monitor coagulation parameters closely',
                evidence: [{
                    type: 'case_study' as const,
                    level: 'IV' as const,
                    strength: 'moderate' as const,
                    source: 'Drug interaction database',
                    confidence: 0.75
                }],
                frequency: 'uncommon' as const
            }
        ];

        for (const interaction of interactions) {
            this.drugInteractions.set(interaction.id, interaction);
        }
    }

    private buildIndices(): void {
        // Build node type index
        for (const [nodeId, node] of this.nodes) {
            if (!this.nodeIndex.has(node.type)) {
                this.nodeIndex.set(node.type, new Set());
            }
            this.nodeIndex.get(node.type)!.add(nodeId);
        }

        // Build edge relationship index
        for (const [edgeId, edge] of this.edges) {
            if (!this.edgeIndex.has(edge.relationship)) {
                this.edgeIndex.set(edge.relationship, new Set());
            }
            this.edgeIndex.get(edge.relationship)!.add(edgeId);
        }
    }

    addNode(node: G3DKnowledgeNode): void {
        this.nodes.set(node.id, node);

        // Update index
        if (!this.nodeIndex.has(node.type)) {
            this.nodeIndex.set(node.type, new Set());
        }
        this.nodeIndex.get(node.type)!.add(node.id);
    }

    addEdge(edge: G3DKnowledgeEdge): void {
        this.edges.set(edge.id, edge);

        // Update index
        if (!this.edgeIndex.has(edge.relationship)) {
            this.edgeIndex.set(edge.relationship, new Set());
        }
        this.edgeIndex.get(edge.relationship)!.add(edge.id);
    }

    async query(query: G3DSemanticQuery): Promise<G3DSemanticResult> {
        if (!this.isInitialized) {
            throw new Error('Knowledge graph not initialized');
        }

        const startTime = performance.now();
        let results: G3DKnowledgeMatch[] = [];

        switch (query.queryType) {
            case 'concept':
                results = await this.queryConcepts(query);
                break;
            case 'relationship':
                results = await this.queryRelationships(query);
                break;
            case 'path':
                results = await this.queryPaths(query);
                break;
            case 'inference':
                results = await this.performInference(query);
                break;
            case 'similarity':
                results = await this.querySimilarity(query);
                break;
        }

        const executionTime = performance.now() - startTime;
        const confidence = results.length > 0
            ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length
            : 0;

        const result: G3DSemanticResult = {
            queryId: query.id,
            timestamp: new Date(),
            results: results.slice(0, query.maxResults),
            totalCount: results.length,
            executionTime,
            confidence
        };

        // Cache result if enabled
        if (this.inferenceCache.size < this.config.cacheSize) {
            this.inferenceCache.set(query.id, result);
        }

        return result;
    }

    private async queryConcepts(query: G3DSemanticQuery): Promise<G3DKnowledgeMatch[]> {
        const matches: G3DKnowledgeMatch[] = [];
        const searchTerm = query.query.toLowerCase();

        for (const [nodeId, node] of this.nodes) {
            const labelMatch = node.label.toLowerCase().includes(searchTerm);
            const descriptionMatch = node.description.toLowerCase().includes(searchTerm);
            const aliasMatch = node.aliases.some(alias => alias.toLowerCase().includes(searchTerm));

            if (labelMatch || descriptionMatch || aliasMatch) {
                let score = 0;
                if (labelMatch) score += 1.0;
                if (descriptionMatch) score += 0.5;
                if (aliasMatch) score += 0.3;

                if (node.confidence >= query.confidenceThreshold) {
                    matches.push({
                        node,
                        score,
                        confidence: node.confidence,
                        relevance: score * node.confidence,
                        explanation: `Concept match: ${node.label}`
                    });
                }
            }
        }

        return matches.sort((a, b) => b.relevance - a.relevance);
    }

    private async queryRelationships(query: G3DSemanticQuery): Promise<G3DKnowledgeMatch[]> {
        const matches: G3DKnowledgeMatch[] = [];
        const relationshipType = query.parameters.relationship as G3DRelationshipType;

        if (relationshipType && this.edgeIndex.has(relationshipType)) {
            const edgeIds = this.edgeIndex.get(relationshipType)!;

            for (const edgeId of edgeIds) {
                const edge = this.edges.get(edgeId)!;

                if (edge.confidence >= query.confidenceThreshold) {
                    matches.push({
                        edge,
                        score: edge.weight,
                        confidence: edge.confidence,
                        relevance: edge.weight * edge.confidence,
                        explanation: `Relationship: ${edge.relationship}`
                    });
                }
            }
        }

        return matches.sort((a, b) => b.relevance - a.relevance);
    }

    private async queryPaths(query: G3DSemanticQuery): Promise<G3DKnowledgeMatch[]> {
        const matches: G3DKnowledgeMatch[] = [];
        const sourceId = query.parameters.source as string;
        const targetId = query.parameters.target as string;
        const maxDepth = query.parameters.maxDepth || this.config.maxInferenceDepth;

        if (sourceId && targetId) {
            const paths = this.findPaths(sourceId, targetId, maxDepth);

            for (const path of paths) {
                if (path.confidence >= query.confidenceThreshold) {
                    matches.push({
                        path,
                        score: path.totalWeight,
                        confidence: path.confidence,
                        relevance: path.totalWeight * path.confidence,
                        explanation: `Path from ${path.nodes[0].label} to ${path.nodes[path.nodes.length - 1].label}`
                    });
                }
            }
        }

        return matches.sort((a, b) => b.relevance - a.relevance);
    }

    private async performInference(query: G3DSemanticQuery): Promise<G3DKnowledgeMatch[]> {
        const matches: G3DKnowledgeMatch[] = [];

        if (this.config.enableSemanticReasoning) {
            // Apply clinical rules
            for (const [ruleId, rule] of this.clinicalRules) {
                if (rule.enabled && this.evaluateRuleConditions(rule, query)) {
                    const inferredResults = this.applyRuleActions(rule, query);
                    matches.push(...inferredResults);
                }
            }
        }

        return matches.sort((a, b) => b.relevance - a.relevance);
    }

    private async querySimilarity(query: G3DSemanticQuery): Promise<G3DKnowledgeMatch[]> {
        const matches: G3DKnowledgeMatch[] = [];
        const targetNodeId = query.parameters.nodeId as string;
        const targetNode = this.nodes.get(targetNodeId);

        if (targetNode) {
            for (const [nodeId, node] of this.nodes) {
                if (nodeId !== targetNodeId && node.type === targetNode.type) {
                    const similarity = this.calculateSimilarity(targetNode, node);

                    if (similarity >= query.confidenceThreshold) {
                        matches.push({
                            node,
                            score: similarity,
                            confidence: node.confidence,
                            relevance: similarity * node.confidence,
                            explanation: `Similar to ${targetNode.label} (${(similarity * 100).toFixed(1)}% similarity)`
                        });
                    }
                }
            }
        }

        return matches.sort((a, b) => b.relevance - a.relevance);
    }

    private findPaths(sourceId: string, targetId: string, maxDepth: number): G3DKnowledgePath[] {
        const paths: G3DKnowledgePath[] = [];
        const visited = new Set<string>();

        const dfs = (currentId: string, path: G3DKnowledgeNode[], edges: G3DKnowledgeEdge[], depth: number) => {
            if (depth > maxDepth || visited.has(currentId)) return;

            const currentNode = this.nodes.get(currentId);
            if (!currentNode) return;

            const newPath = [...path, currentNode];
            visited.add(currentId);

            if (currentId === targetId) {
                const totalWeight = edges.reduce((sum, edge) => sum + edge.weight, 0);
                const confidence = edges.length > 0
                    ? edges.reduce((sum, edge) => sum + edge.confidence, 0) / edges.length
                    : 1.0;

                paths.push({
                    nodes: newPath,
                    edges: [...edges],
                    length: newPath.length - 1,
                    totalWeight,
                    confidence,
                    semanticMeaning: this.generatePathMeaning(newPath, edges)
                });
                visited.delete(currentId);
                return;
            }

            // Find outgoing edges
            for (const [edgeId, edge] of this.edges) {
                if (edge.sourceId === currentId) {
                    const newEdges = [...edges, edge];
                    dfs(edge.targetId, newPath, newEdges, depth + 1);
                }
            }

            visited.delete(currentId);
        };

        dfs(sourceId, [], [], 0);
        return paths.slice(0, 10); // Limit results
    }

    private calculateSimilarity(node1: G3DKnowledgeNode, node2: G3DKnowledgeNode): number {
        let similarity = 0;

        // Type similarity
        if (node1.type === node2.type) similarity += 0.3;

        // Label similarity (simple string comparison)
        const labelSim = this.calculateStringSimilarity(node1.label, node2.label);
        similarity += labelSim * 0.4;

        // Description similarity
        const descSim = this.calculateStringSimilarity(node1.description, node2.description);
        similarity += descSim * 0.3;

        return Math.min(similarity, 1.0);
    }

    private calculateStringSimilarity(str1: string, str2: string): number {
        // Simple Jaccard similarity
        const words1 = new Set(str1.toLowerCase().split(/\s+/));
        const words2 = new Set(str2.toLowerCase().split(/\s+/));

        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);

        return union.size > 0 ? intersection.size / union.size : 0;
    }

    private evaluateRuleConditions(rule: G3DClinicalRule, query: G3DSemanticQuery): boolean {
        // Simplified rule evaluation
        return rule.conditions.every(condition => {
            switch (condition.type) {
                case 'node_exists':
                    return this.nodeIndex.has(condition.nodeType!) &&
                        this.nodeIndex.get(condition.nodeType!)!.size > 0;
                case 'relationship_exists':
                    return this.edgeIndex.has(condition.relationship!) &&
                        this.edgeIndex.get(condition.relationship!)!.size > 0;
                default:
                    return true;
            }
        });
    }

    private applyRuleActions(rule: G3DClinicalRule, query: G3DSemanticQuery): G3DKnowledgeMatch[] {
        const matches: G3DKnowledgeMatch[] = [];

        for (const action of rule.actions) {
            if (action.type === 'recommend' && action.target) {
                const targetNode = this.nodes.get(action.target);
                if (targetNode) {
                    matches.push({
                        node: targetNode,
                        score: 1.0,
                        confidence: action.confidence,
                        relevance: action.confidence,
                        explanation: `Rule recommendation: ${action.message}`
                    });
                }
            }
        }

        return matches;
    }

    private generatePathMeaning(nodes: G3DKnowledgeNode[], edges: G3DKnowledgeEdge[]): string {
        if (nodes.length < 2) return '';

        let meaning = nodes[0].label;
        for (let i = 0; i < edges.length; i++) {
            meaning += ` ${edges[i].relationship} ${nodes[i + 1].label}`;
        }

        return meaning;
    }

    getNode(nodeId: string): G3DKnowledgeNode | undefined {
        return this.nodes.get(nodeId);
    }

    getEdge(edgeId: string): G3DKnowledgeEdge | undefined {
        return this.edges.get(edgeId);
    }

    getNodesByType(type: G3DNodeType): G3DKnowledgeNode[] {
        const nodeIds = this.nodeIndex.get(type) || new Set();
        return Array.from(nodeIds).map(id => this.nodes.get(id)!).filter(Boolean);
    }

    getEdgesByRelationship(relationship: G3DRelationshipType): G3DKnowledgeEdge[] {
        const edgeIds = this.edgeIndex.get(relationship) || new Set();
        return Array.from(edgeIds).map(id => this.edges.get(id)!).filter(Boolean);
    }

    getDrugInteractions(drugId: string): G3DDrugInteraction[] {
        return Array.from(this.drugInteractions.values())
            .filter(interaction => interaction.drug1 === drugId || interaction.drug2 === drugId);
    }

    getClinicalRules(): G3DClinicalRule[] {
        return Array.from(this.clinicalRules.values()).filter(rule => rule.enabled);
    }

    getStatistics(): {
        nodes: number;
        edges: number;
        nodeTypes: number;
        relationshipTypes: number;
        clinicalRules: number;
        drugInteractions: number;
    } {
        return {
            nodes: this.nodes.size,
            edges: this.edges.size,
            nodeTypes: this.nodeIndex.size,
            relationshipTypes: this.edgeIndex.size,
            clinicalRules: this.clinicalRules.size,
            drugInteractions: this.drugInteractions.size
        };
    }

    dispose(): void {
        this.nodes.clear();
        this.edges.clear();
        this.nodeIndex.clear();
        this.edgeIndex.clear();
        this.clinicalRules.clear();
        this.drugInteractions.clear();
        this.ontologyMappings.clear();
        this.inferenceCache.clear();
        this.isInitialized = false;

        console.log('G3D Knowledge Graph System disposed');
    }
}

export default G3DKnowledgeGraph;