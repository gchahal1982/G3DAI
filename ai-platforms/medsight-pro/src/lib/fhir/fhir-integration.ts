'use client';

/**
 * HL7 FHIR R4 Integration System
 * 
 * Implements HL7 FHIR (Fast Healthcare Interoperability Resources) R4 standard
 * for healthcare data exchange and interoperability
 * 
 * Key Components:
 * - FHIR R4 Resource Management (Patient, Observation, DiagnosticReport, ImagingStudy)
 * - SMART on FHIR Authentication
 * - RESTful API Implementation
 * - FHIR Search Parameters
 * - Bundle Operations
 * - FHIR Validation
 * - OAuth 2.0 + OpenID Connect
 * - Medical Data Exchange
 * - Healthcare Integration Standards
 */

interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: FHIRMeta;
  implicitRules?: string;
  language?: string;
  text?: FHIRNarrative;
  contained?: FHIRResource[];
  extension?: FHIRExtension[];
  modifierExtension?: FHIRExtension[];
}

interface FHIRMeta {
  versionId?: string;
  lastUpdated?: string;
  source?: string;
  profile?: string[];
  security?: FHIRCoding[];
  tag?: FHIRCoding[];
}

interface FHIRNarrative {
  status: 'generated' | 'extensions' | 'additional' | 'empty';
  div: string;
}

interface FHIRExtension {
  url: string;
  valueString?: string;
  valueInteger?: number;
  valueDecimal?: number;
  valueBoolean?: boolean;
  valueDate?: string;
  valueDateTime?: string;
  valueTime?: string;
  valueCode?: string;
  valueCoding?: FHIRCoding;
  valueCodeableConcept?: FHIRCodeableConcept;
  valueQuantity?: FHIRQuantity;
  valueReference?: FHIRReference;
  extension?: FHIRExtension[];
}

interface FHIRCoding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

interface FHIRCodeableConcept {
  coding?: FHIRCoding[];
  text?: string;
}

interface FHIRQuantity {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>';
  unit?: string;
  system?: string;
  code?: string;
}

interface FHIRReference {
  reference?: string;
  type?: string;
  identifier?: FHIRIdentifier;
  display?: string;
}

interface FHIRIdentifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
  type?: FHIRCodeableConcept;
  system?: string;
  value?: string;
  period?: FHIRPeriod;
  assigner?: FHIRReference;
}

interface FHIRPeriod {
  start?: string;
  end?: string;
}

interface FHIRAddress {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  type?: 'postal' | 'physical' | 'both';
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  period?: FHIRPeriod;
}

interface FHIRContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  rank?: number;
  period?: FHIRPeriod;
}

interface FHIRHumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  period?: FHIRPeriod;
}

// Patient Resource (FHIR R4)
interface FHIRPatient extends FHIRResource {
  resourceType: 'Patient';
  identifier?: FHIRIdentifier[];
  active?: boolean;
  name?: FHIRHumanName[];
  telecom?: FHIRContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  deceasedBoolean?: boolean;
  deceasedDateTime?: string;
  address?: FHIRAddress[];
  maritalStatus?: FHIRCodeableConcept;
  multipleBirthBoolean?: boolean;
  multipleBirthInteger?: number;
  photo?: FHIRAttachment[];
  contact?: FHIRPatientContact[];
  communication?: FHIRPatientCommunication[];
  generalPractitioner?: FHIRReference[];
  managingOrganization?: FHIRReference;
  link?: FHIRPatientLink[];
}

interface FHIRAttachment {
  contentType?: string;
  language?: string;
  data?: string;
  url?: string;
  size?: number;
  hash?: string;
  title?: string;
  creation?: string;
}

interface FHIRPatientContact {
  relationship?: FHIRCodeableConcept[];
  name?: FHIRHumanName;
  telecom?: FHIRContactPoint[];
  address?: FHIRAddress;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  organization?: FHIRReference;
  period?: FHIRPeriod;
}

interface FHIRPatientCommunication {
  language: FHIRCodeableConcept;
  preferred?: boolean;
}

interface FHIRPatientLink {
  other: FHIRReference;
  type: 'replaced-by' | 'replaces' | 'refer' | 'seealso';
}

// Observation Resource (FHIR R4)
interface FHIRObservation extends FHIRResource {
  resourceType: 'Observation';
  identifier?: FHIRIdentifier[];
  basedOn?: FHIRReference[];
  partOf?: FHIRReference[];
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject?: FHIRReference;
  focus?: FHIRReference[];
  encounter?: FHIRReference;
  effectiveDateTime?: string;
  effectivePeriod?: FHIRPeriod;
  effectiveTiming?: any;
  effectiveInstant?: string;
  issued?: string;
  performer?: FHIRReference[];
  valueQuantity?: FHIRQuantity;
  valueCodeableConcept?: FHIRCodeableConcept;
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueRange?: FHIRRange;
  valueRatio?: FHIRRatio;
  valueSampledData?: FHIRSampledData;
  valueTime?: string;
  valueDateTime?: string;
  valuePeriod?: FHIRPeriod;
  dataAbsentReason?: FHIRCodeableConcept;
  interpretation?: FHIRCodeableConcept[];
  note?: FHIRAnnotation[];
  bodySite?: FHIRCodeableConcept;
  method?: FHIRCodeableConcept;
  specimen?: FHIRReference;
  device?: FHIRReference;
  referenceRange?: FHIRObservationReferenceRange[];
  hasMember?: FHIRReference[];
  derivedFrom?: FHIRReference[];
  component?: FHIRObservationComponent[];
}

interface FHIRRange {
  low?: FHIRQuantity;
  high?: FHIRQuantity;
}

interface FHIRRatio {
  numerator?: FHIRQuantity;
  denominator?: FHIRQuantity;
}

interface FHIRSampledData {
  origin: FHIRQuantity;
  period: number;
  factor?: number;
  lowerLimit?: number;
  upperLimit?: number;
  dimensions: number;
  data?: string;
}

interface FHIRAnnotation {
  authorReference?: FHIRReference;
  authorString?: string;
  time?: string;
  text: string;
}

interface FHIRObservationReferenceRange {
  low?: FHIRQuantity;
  high?: FHIRQuantity;
  type?: FHIRCodeableConcept;
  appliesTo?: FHIRCodeableConcept[];
  age?: FHIRRange;
  text?: string;
}

interface FHIRObservationComponent {
  code: FHIRCodeableConcept;
  valueQuantity?: FHIRQuantity;
  valueCodeableConcept?: FHIRCodeableConcept;
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueRange?: FHIRRange;
  valueRatio?: FHIRRatio;
  valueSampledData?: FHIRSampledData;
  valueTime?: string;
  valueDateTime?: string;
  valuePeriod?: FHIRPeriod;
  dataAbsentReason?: FHIRCodeableConcept;
  interpretation?: FHIRCodeableConcept[];
  referenceRange?: FHIRObservationReferenceRange[];
}

// DiagnosticReport Resource (FHIR R4)
interface FHIRDiagnosticReport extends FHIRResource {
  resourceType: 'DiagnosticReport';
  identifier?: FHIRIdentifier[];
  basedOn?: FHIRReference[];
  status: 'registered' | 'partial' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'appended' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject?: FHIRReference;
  encounter?: FHIRReference;
  effectiveDateTime?: string;
  effectivePeriod?: FHIRPeriod;
  issued?: string;
  performer?: FHIRReference[];
  resultsInterpreter?: FHIRReference[];
  specimen?: FHIRReference[];
  result?: FHIRReference[];
  imagingStudy?: FHIRReference[];
  media?: FHIRDiagnosticReportMedia[];
  conclusion?: string;
  conclusionCode?: FHIRCodeableConcept[];
  presentedForm?: FHIRAttachment[];
}

interface FHIRDiagnosticReportMedia {
  comment?: string;
  link: FHIRReference;
}

// ImagingStudy Resource (FHIR R4)
interface FHIRImagingStudy extends FHIRResource {
  resourceType: 'ImagingStudy';
  identifier?: FHIRIdentifier[];
  status: 'registered' | 'available' | 'cancelled' | 'entered-in-error' | 'unknown';
  modality?: FHIRCoding[];
  subject: FHIRReference;
  encounter?: FHIRReference;
  started?: string;
  basedOn?: FHIRReference[];
  referrer?: FHIRReference;
  interpreter?: FHIRReference[];
  endpoint?: FHIRReference[];
  numberOfSeries?: number;
  numberOfInstances?: number;
  procedureReference?: FHIRReference;
  procedureCode?: FHIRCodeableConcept[];
  location?: FHIRReference;
  reasonCode?: FHIRCodeableConcept[];
  reasonReference?: FHIRReference[];
  note?: FHIRAnnotation[];
  description?: string;
  series?: FHIRImagingStudySeries[];
}

interface FHIRImagingStudySeries {
  uid: string;
  number?: number;
  modality: FHIRCoding;
  description?: string;
  numberOfInstances?: number;
  endpoint?: FHIRReference[];
  bodySite?: FHIRCoding;
  laterality?: FHIRCoding;
  specimen?: FHIRReference[];
  started?: string;
  performer?: FHIRImagingStudySeriesPerformer[];
  instance?: FHIRImagingStudySeriesInstance[];
}

interface FHIRImagingStudySeriesPerformer {
  function?: FHIRCodeableConcept;
  actor: FHIRReference;
}

interface FHIRImagingStudySeriesInstance {
  uid: string;
  sopClass: FHIRCoding;
  number?: number;
  title?: string;
}

// Bundle Resource for batch operations
interface FHIRBundle extends FHIRResource {
  resourceType: 'Bundle';
  identifier?: FHIRIdentifier;
  type: 'document' | 'message' | 'transaction' | 'transaction-response' | 'batch' | 'batch-response' | 'history' | 'searchset' | 'collection';
  timestamp?: string;
  total?: number;
  link?: FHIRBundleLink[];
  entry?: FHIRBundleEntry[];
  signature?: any;
}

interface FHIRBundleLink {
  relation: string;
  url: string;
}

interface FHIRBundleEntry {
  link?: FHIRBundleLink[];
  fullUrl?: string;
  resource?: FHIRResource;
  search?: FHIRBundleEntrySearch;
  request?: FHIRBundleEntryRequest;
  response?: FHIRBundleEntryResponse;
}

interface FHIRBundleEntrySearch {
  mode?: 'match' | 'include' | 'outcome';
  score?: number;
}

interface FHIRBundleEntryRequest {
  method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  ifNoneMatch?: string;
  ifModifiedSince?: string;
  ifMatch?: string;
  ifNoneExist?: string;
}

interface FHIRBundleEntryResponse {
  status: string;
  location?: string;
  etag?: string;
  lastModified?: string;
  outcome?: FHIRResource;
}

// SMART on FHIR Authentication
interface SMARTOnFHIRConfig {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  registrationEndpoint?: string;
  revocationEndpoint?: string;
  introspectionEndpoint?: string;
  capabilities: string[];
  grantTypesSupported: string[];
  responseTypesSupported: string[];
  scopesSupported: string[];
  tokenEndpointAuthMethodsSupported: string[];
}

interface SMARTOnFHIRToken {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
  patient?: string;
  encounter?: string;
  location?: string;
  resource?: string;
  intent?: string;
  smartStyleUrl?: string;
}

interface FHIRSearchParameters {
  resourceType: string;
  parameters: { [key: string]: string | string[] };
  includes?: string[];
  revIncludes?: string[];
  sort?: string[];
  count?: number;
  offset?: number;
  summary?: 'true' | 'text' | 'data' | 'count' | 'false';
  elements?: string[];
  containedType?: 'contained' | 'referenced';
}

interface FHIRValidationResult {
  valid: boolean;
  issues: FHIRValidationIssue[];
  profile?: string;
  resourceType: string;
}

interface FHIRValidationIssue {
  severity: 'fatal' | 'error' | 'warning' | 'information';
  code: string;
  details?: FHIRCodeableConcept;
  diagnostics?: string;
  location?: string[];
  expression?: string[];
}

class HL7FHIRIntegration {
  private static instance: HL7FHIRIntegration;
  private baseUrl: string;
  private smartConfig: SMARTOnFHIRConfig | null = null;
  private currentToken: SMARTOnFHIRToken | null = null;

  // FHIR Standard URLs and Codes
  private readonly FHIR_BASE_URL = 'http://hl7.org/fhir';
  private readonly LOINC_SYSTEM = 'http://loinc.org';
  private readonly SNOMED_SYSTEM = 'http://snomed.info/sct';
  private readonly ICD10_SYSTEM = 'http://hl7.org/fhir/sid/icd-10';
  private readonly UCUM_SYSTEM = 'http://unitsofmeasure.org';

  private constructor(baseUrl: string = 'https://api.medsight-pro.com/fhir/r4') {
    this.baseUrl = baseUrl;
  }

  public static getInstance(baseUrl?: string): HL7FHIRIntegration {
    if (!HL7FHIRIntegration.instance) {
      HL7FHIRIntegration.instance = new HL7FHIRIntegration(baseUrl);
    }
    return HL7FHIRIntegration.instance;
  }

  /**
   * Initialize SMART on FHIR Authentication
   */
  public async initializeSMART(serverUrl: string): Promise<SMARTOnFHIRConfig> {
    try {
      const response = await fetch(`${serverUrl}/.well-known/smart-configuration`);
      const config = await response.json();
      
      this.smartConfig = {
        authorizationEndpoint: config.authorization_endpoint,
        tokenEndpoint: config.token_endpoint,
        registrationEndpoint: config.registration_endpoint,
        revocationEndpoint: config.revocation_endpoint,
        introspectionEndpoint: config.introspection_endpoint,
        capabilities: config.capabilities || [],
        grantTypesSupported: config.grant_types_supported || ['authorization_code'],
        responseTypesSupported: config.response_types_supported || ['code'],
        scopesSupported: config.scopes_supported || ['patient/*.read', 'user/*.read'],
        tokenEndpointAuthMethodsSupported: config.token_endpoint_auth_methods_supported || ['client_secret_basic']
      };

      return this.smartConfig;
    } catch (error) {
      throw new Error(`Failed to initialize SMART on FHIR: ${error}`);
    }
  }

  /**
   * Authenticate using SMART on FHIR OAuth 2.0 + OpenID Connect
   */
  public async authenticateWithSMART(options: {
    clientId: string;
    redirectUri: string;
    scope: string;
    state?: string;
    aud?: string;
  }): Promise<{ authUrl: string; state: string }> {
    if (!this.smartConfig) {
      throw new Error('SMART on FHIR not initialized');
    }

    const state = options.state || this.generateRandomString(32);
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: options.clientId,
      redirect_uri: options.redirectUri,
      scope: options.scope,
      state: state,
      aud: options.aud || this.baseUrl
    });

    const authUrl = `${this.smartConfig.authorizationEndpoint}?${params.toString()}`;
    return { authUrl, state };
  }

  /**
   * Exchange authorization code for access token
   */
  public async exchangeCodeForToken(options: {
    code: string;
    clientId: string;
    clientSecret?: string;
    redirectUri: string;
  }): Promise<SMARTOnFHIRToken> {
    if (!this.smartConfig) {
      throw new Error('SMART on FHIR not initialized');
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: options.code,
      redirect_uri: options.redirectUri,
      client_id: options.clientId
    });

    if (options.clientSecret) {
      body.append('client_secret', options.clientSecret);
    }

    const response = await fetch(this.smartConfig.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: body.toString()
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const tokenData = await response.json();
    this.currentToken = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenType: tokenData.token_type || 'Bearer',
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope,
      patient: tokenData.patient,
      encounter: tokenData.encounter,
      location: tokenData.location,
      resource: tokenData.resource,
      intent: tokenData.intent,
      smartStyleUrl: tokenData.smart_style_url
    };

    return this.currentToken;
  }

  /**
   * Create Patient Resource
   */
  public async createPatient(patient: Omit<FHIRPatient, 'resourceType' | 'id'>): Promise<FHIRPatient> {
    const patientResource: FHIRPatient = {
      resourceType: 'Patient',
      ...patient
    };

    const validationResult = await this.validateResource(patientResource);
    if (!validationResult.valid) {
      throw new Error(`Patient validation failed: ${validationResult.issues.map(i => i.diagnostics).join(', ')}`);
    }

    return this.createResource(patientResource) as Promise<FHIRPatient>;
  }

  /**
   * Create Observation Resource
   */
  public async createObservation(observation: Omit<FHIRObservation, 'resourceType' | 'id'>): Promise<FHIRObservation> {
    const observationResource: FHIRObservation = {
      resourceType: 'Observation',
      ...observation
    };

    const validationResult = await this.validateResource(observationResource);
    if (!validationResult.valid) {
      throw new Error(`Observation validation failed: ${validationResult.issues.map(i => i.diagnostics).join(', ')}`);
    }

    return this.createResource(observationResource) as Promise<FHIRObservation>;
  }

  /**
   * Create DiagnosticReport Resource
   */
  public async createDiagnosticReport(report: Omit<FHIRDiagnosticReport, 'resourceType' | 'id'>): Promise<FHIRDiagnosticReport> {
    const reportResource: FHIRDiagnosticReport = {
      resourceType: 'DiagnosticReport',
      ...report
    };

    const validationResult = await this.validateResource(reportResource);
    if (!validationResult.valid) {
      throw new Error(`DiagnosticReport validation failed: ${validationResult.issues.map(i => i.diagnostics).join(', ')}`);
    }

    return this.createResource(reportResource) as Promise<FHIRDiagnosticReport>;
  }

  /**
   * Create ImagingStudy Resource
   */
  public async createImagingStudy(study: Omit<FHIRImagingStudy, 'resourceType' | 'id'>): Promise<FHIRImagingStudy> {
    const studyResource: FHIRImagingStudy = {
      resourceType: 'ImagingStudy',
      ...study
    };

    const validationResult = await this.validateResource(studyResource);
    if (!validationResult.valid) {
      throw new Error(`ImagingStudy validation failed: ${validationResult.issues.map(i => i.diagnostics).join(', ')}`);
    }

    return this.createResource(studyResource) as Promise<FHIRImagingStudy>;
  }

  /**
   * Search Resources with FHIR Search Parameters
   */
  public async searchResources(searchParams: FHIRSearchParameters): Promise<FHIRBundle> {
    const url = this.buildSearchUrl(searchParams);
    
    const response = await this.makeAuthenticatedRequest(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/fhir+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get Resource by ID
   */
  public async getResourceById<T extends FHIRResource>(resourceType: string, id: string): Promise<T> {
    const url = `${this.baseUrl}/${resourceType}/${id}`;
    
    const response = await this.makeAuthenticatedRequest(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/fhir+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Get resource failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update Resource
   */
  public async updateResource<T extends FHIRResource>(resource: T): Promise<T> {
    if (!resource.id) {
      throw new Error('Resource ID is required for update');
    }

    const validationResult = await this.validateResource(resource);
    if (!validationResult.valid) {
      throw new Error(`Resource validation failed: ${validationResult.issues.map(i => i.diagnostics).join(', ')}`);
    }

    const url = `${this.baseUrl}/${resource.resourceType}/${resource.id}`;
    
    const response = await this.makeAuthenticatedRequest(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      },
      body: JSON.stringify(resource)
    });

    if (!response.ok) {
      throw new Error(`Update resource failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete Resource
   */
  public async deleteResource(resourceType: string, id: string): Promise<void> {
    const url = `${this.baseUrl}/${resourceType}/${id}`;
    
    const response = await this.makeAuthenticatedRequest(url, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Delete resource failed: ${response.statusText}`);
    }
  }

  /**
   * Create Bundle Transaction
   */
  public async submitBundle(bundle: FHIRBundle): Promise<FHIRBundle> {
    const validationResult = await this.validateResource(bundle);
    if (!validationResult.valid) {
      throw new Error(`Bundle validation failed: ${validationResult.issues.map(i => i.diagnostics).join(', ')}`);
    }

    const url = `${this.baseUrl}`;
    
    const response = await this.makeAuthenticatedRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      },
      body: JSON.stringify(bundle)
    });

    if (!response.ok) {
      throw new Error(`Bundle submission failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Validate FHIR Resource
   */
  public async validateResource(resource: FHIRResource, profile?: string): Promise<FHIRValidationResult> {
    try {
      const issues: FHIRValidationIssue[] = [];

      // Basic validation
      if (!resource.resourceType) {
        issues.push({
          severity: 'error',
          code: 'required',
          diagnostics: 'Resource type is required',
          location: ['resourceType']
        });
      }

      // Resource-specific validation
      switch (resource.resourceType) {
        case 'Patient':
          this.validatePatientResource(resource as FHIRPatient, issues);
          break;
        case 'Observation':
          this.validateObservationResource(resource as FHIRObservation, issues);
          break;
        case 'DiagnosticReport':
          this.validateDiagnosticReportResource(resource as FHIRDiagnosticReport, issues);
          break;
        case 'ImagingStudy':
          this.validateImagingStudyResource(resource as FHIRImagingStudy, issues);
          break;
      }

      // Profile validation if specified
      if (profile) {
        await this.validateAgainstProfile(resource, profile, issues);
      }

      return {
        valid: issues.filter(issue => issue.severity === 'error' || issue.severity === 'fatal').length === 0,
        issues,
        profile,
        resourceType: resource.resourceType
      };
    } catch (error) {
      return {
        valid: false,
        issues: [{
          severity: 'error',
          code: 'exception',
          diagnostics: `Validation error: ${error}`,
          location: []
        }],
        resourceType: resource.resourceType
      };
    }
  }

  /**
   * Get Patient Context from SMART Launch
   */
  public getPatientContext(): string | null {
    return this.currentToken?.patient || null;
  }

  /**
   * Create Medical Observation Helper
   */
  public createMedicalObservation(params: {
    patientId: string;
    code: { system: string; code: string; display: string };
    valueQuantity?: { value: number; unit: string; system?: string; code?: string };
    valueString?: string;
    valueBoolean?: boolean;
    effectiveDateTime?: string;
    performer?: string;
    category?: { system: string; code: string; display: string };
  }): Omit<FHIRObservation, 'resourceType' | 'id'> {
    return {
      status: 'final',
      category: params.category ? [{
        coding: [params.category]
      }] : [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'vital-signs',
          display: 'Vital Signs'
        }]
      }],
      code: {
        coding: [params.code]
      },
      subject: {
        reference: `Patient/${params.patientId}`
      },
      effectiveDateTime: params.effectiveDateTime || new Date().toISOString(),
      valueQuantity: params.valueQuantity,
      valueString: params.valueString,
      valueBoolean: params.valueBoolean,
      performer: params.performer ? [{
        reference: `Practitioner/${params.performer}`
      }] : undefined
    };
  }

  /**
   * Create Medical DiagnosticReport Helper
   */
  public createMedicalDiagnosticReport(params: {
    patientId: string;
    code: { system: string; code: string; display: string };
    status: 'registered' | 'partial' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'appended' | 'cancelled' | 'entered-in-error' | 'unknown';
    effectiveDateTime?: string;
    performer?: string;
    conclusion?: string;
    result?: string[];
    imagingStudy?: string[];
  }): Omit<FHIRDiagnosticReport, 'resourceType' | 'id'> {
    return {
      status: params.status,
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
          code: 'RAD',
          display: 'Radiology'
        }]
      }],
      code: {
        coding: [params.code]
      },
      subject: {
        reference: `Patient/${params.patientId}`
      },
      effectiveDateTime: params.effectiveDateTime || new Date().toISOString(),
      issued: new Date().toISOString(),
      performer: params.performer ? [{
        reference: `Practitioner/${params.performer}`
      }] : undefined,
      conclusion: params.conclusion,
      result: params.result?.map(id => ({ reference: `Observation/${id}` })),
      imagingStudy: params.imagingStudy?.map(id => ({ reference: `ImagingStudy/${id}` }))
    };
  }

  // Private helper methods
  private async createResource<T extends FHIRResource>(resource: T): Promise<T> {
    const url = `${this.baseUrl}/${resource.resourceType}`;
    
    const response = await this.makeAuthenticatedRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      },
      body: JSON.stringify(resource)
    });

    if (!response.ok) {
      throw new Error(`Create resource failed: ${response.statusText}`);
    }

    return response.json();
  }

  private async makeAuthenticatedRequest(url: string, options: RequestInit): Promise<Response> {
    const headers = new Headers(options.headers);
    
    if (this.currentToken) {
      headers.set('Authorization', `${this.currentToken.tokenType} ${this.currentToken.accessToken}`);
    }

    return fetch(url, {
      ...options,
      headers
    });
  }

  private buildSearchUrl(searchParams: FHIRSearchParameters): string {
    const url = new URL(`${this.baseUrl}/${searchParams.resourceType}`);
    
    Object.entries(searchParams.parameters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, v));
      } else {
        url.searchParams.set(key, value);
      }
    });

    if (searchParams.includes) {
      searchParams.includes.forEach(include => {
        url.searchParams.append('_include', include);
      });
    }

    if (searchParams.revIncludes) {
      searchParams.revIncludes.forEach(revInclude => {
        url.searchParams.append('_revinclude', revInclude);
      });
    }

    if (searchParams.sort) {
      url.searchParams.set('_sort', searchParams.sort.join(','));
    }

    if (searchParams.count) {
      url.searchParams.set('_count', searchParams.count.toString());
    }

    if (searchParams.offset) {
      url.searchParams.set('_offset', searchParams.offset.toString());
    }

    if (searchParams.summary) {
      url.searchParams.set('_summary', searchParams.summary);
    }

    if (searchParams.elements) {
      url.searchParams.set('_elements', searchParams.elements.join(','));
    }

    return url.toString();
  }

  private validatePatientResource(patient: FHIRPatient, issues: FHIRValidationIssue[]): void {
    // Patient must have at least one identifier or name
    if (!patient.identifier?.length && !patient.name?.length) {
      issues.push({
        severity: 'error',
        code: 'required',
        diagnostics: 'Patient must have at least one identifier or name',
        location: ['Patient']
      });
    }
  }

  private validateObservationResource(observation: FHIRObservation, issues: FHIRValidationIssue[]): void {
    // Observation must have status and code
    if (!observation.status) {
      issues.push({
        severity: 'error',
        code: 'required',
        diagnostics: 'Observation.status is required',
        location: ['Observation.status']
      });
    }

    if (!observation.code) {
      issues.push({
        severity: 'error',
        code: 'required',
        diagnostics: 'Observation.code is required',
        location: ['Observation.code']
      });
    }
  }

  private validateDiagnosticReportResource(report: FHIRDiagnosticReport, issues: FHIRValidationIssue[]): void {
    // DiagnosticReport must have status and code
    if (!report.status) {
      issues.push({
        severity: 'error',
        code: 'required',
        diagnostics: 'DiagnosticReport.status is required',
        location: ['DiagnosticReport.status']
      });
    }

    if (!report.code) {
      issues.push({
        severity: 'error',
        code: 'required',
        diagnostics: 'DiagnosticReport.code is required',
        location: ['DiagnosticReport.code']
      });
    }
  }

  private validateImagingStudyResource(study: FHIRImagingStudy, issues: FHIRValidationIssue[]): void {
    // ImagingStudy must have status and subject
    if (!study.status) {
      issues.push({
        severity: 'error',
        code: 'required',
        diagnostics: 'ImagingStudy.status is required',
        location: ['ImagingStudy.status']
      });
    }

    if (!study.subject) {
      issues.push({
        severity: 'error',
        code: 'required',
        diagnostics: 'ImagingStudy.subject is required',
        location: ['ImagingStudy.subject']
      });
    }
  }

  private async validateAgainstProfile(resource: FHIRResource, profile: string, issues: FHIRValidationIssue[]): Promise<void> {
    // Implementation would validate against FHIR profile
    // This is a placeholder for profile validation
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export default HL7FHIRIntegration;
export type {
  FHIRResource,
  FHIRPatient,
  FHIRObservation,
  FHIRDiagnosticReport,
  FHIRImagingStudy,
  FHIRBundle,
  SMARTOnFHIRConfig,
  SMARTOnFHIRToken,
  FHIRSearchParameters,
  FHIRValidationResult
}; 