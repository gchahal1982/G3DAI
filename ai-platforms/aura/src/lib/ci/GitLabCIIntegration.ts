import { EventEmitter } from 'events';
// @ts-ignore - External package without types
import yaml from 'js-yaml';

export interface GitLabPipeline {
  id: number;
  sha: string;
  ref: string;
  status: 'created' | 'waiting_for_resource' | 'preparing' | 'pending' | 'running' | 'success' | 'failed' | 'canceled' | 'skipped';
  created_at: string;
  updated_at: string;
  web_url: string;
}

export interface GitLabJob {
  id: number;
  name: string;
  stage: string;
  status: string;
  created_at: string;
  started_at?: string;
  finished_at?: string;
  duration?: number;
  web_url: string;
  pipeline: { id: number };
}

export interface GitLabTemplate {
  stages: string[];
  variables?: Record<string, string>;
  before_script?: string[];
  after_script?: string[];
  image?: string;
  services?: string[];
  cache?: CacheConfig;
  [jobName: string]: any;
}

export interface CacheConfig {
  key: string;
  paths: string[];
  policy?: 'pull' | 'push' | 'pull-push';
  when?: 'on_success' | 'on_failure' | 'always';
}

export interface VariableConfig {
  key: string;
  value: string;
  variable_type: 'env_var' | 'file';
  protected: boolean;
  masked: boolean;
  environment_scope: string;
}

export interface ArtifactConfig {
  name?: string;
  paths: string[];
  expire_in?: string;
  when?: 'on_success' | 'on_failure' | 'always';
  reports?: {
    junit?: string[];
    coverage_report?: {
      coverage_format: 'cobertura' | 'jacoco';
      path: string;
    };
  };
}

export interface DeploymentEnvironment {
  name: string;
  url?: string;
  on_stop?: string;
  auto_stop_in?: string;
  kubernetes?: {
    namespace: string;
  };
}

export class GitLabCIIntegration extends EventEmitter {
  private apiUrl: string;
  private token: string;
  private projectId: string;
  private templates: Map<string, GitLabTemplate> = new Map();
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor(
    apiUrl: string,
    token: string,
    projectId: string
  ) {
    super();
    this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.token = token;
    this.projectId = projectId;
  }

  /**
   * Create GitLab CI templates
   */
  createCITemplates(): Map<string, GitLabTemplate> {
    const templates = new Map<string, GitLabTemplate>();

    // Aura CI/CD Template
    templates.set('aura-ci', {
      stages: ['test', 'security', 'build', 'deploy'],
      variables: {
        NODE_VERSION: '20',
        DOCKER_DRIVER: 'overlay2',
        GIT_STRATEGY: 'clone'
      },
      image: 'node:20-alpine',
      services: ['docker:dind'],
      cache: {
        key: '$CI_COMMIT_REF_SLUG',
        paths: ['node_modules/', '.npm/'],
        policy: 'pull-push'
      },
      before_script: [
        'apk add --no-cache git',
        'npm ci --cache .npm --prefer-offline'
      ],
      'test:unit': {
        stage: 'test',
        script: [
          'npm run test:unit',
          'npm run test:coverage'
        ],
        coverage: '/Lines\\s*:\\s*(\\d+\\.?\\d*)%/',
        artifacts: {
          reports: {
            junit: 'junit.xml',
            coverage_report: {
              coverage_format: 'cobertura',
              path: 'coverage/cobertura-coverage.xml'
            }
          },
          paths: ['coverage/'],
          expire_in: '1 week'
        },
        rules: [
          { if: '$CI_MERGE_REQUEST_ID' },
          { if: '$CI_COMMIT_BRANCH == "main"' }
        ]
      },
      'test:e2e': {
        stage: 'test',
        image: 'mcr.microsoft.com/playwright:latest',
        script: [
          'npm run test:e2e'
        ],
        artifacts: {
          when: 'on_failure',
          paths: ['test-results/'],
          expire_in: '1 week'
        },
        allow_failure: false,
        parallel: {
          matrix: [
            { BROWSER: 'chromium' },
            { BROWSER: 'firefox' },
            { BROWSER: 'webkit' }
          ]
        }
      },
      'security:sast': {
        stage: 'security',
        image: 'registry.gitlab.com/gitlab-org/security-products/semgrep:latest',
        script: [
          'semgrep --config=auto --json --output=gl-sast-report.json .'
        ],
        artifacts: {
          reports: {
            sast: 'gl-sast-report.json'
          },
          expire_in: '1 week'
        },
        rules: [
          { if: '$CI_MERGE_REQUEST_ID' },
          { if: '$CI_COMMIT_BRANCH == "main"' }
        ]
      },
      'security:dependency': {
        stage: 'security',
        script: [
          'npm audit --audit-level=high',
          'npm run security:scan'
        ],
        allow_failure: true,
        rules: [
          { if: '$CI_MERGE_REQUEST_ID' },
          { if: '$CI_COMMIT_BRANCH == "main"' }
        ]
      },
      'build:app': {
        stage: 'build',
        script: [
          'npm run build:production',
          'npm run build:electron'
        ],
        artifacts: {
          name: 'aura-${CI_COMMIT_REF_SLUG}-${CI_COMMIT_SHORT_SHA}',
          paths: ['dist/', 'release/'],
          expire_in: '1 month'
        },
        rules: [
          { if: '$CI_COMMIT_BRANCH == "main"' },
          { if: '$CI_COMMIT_TAG' }
        ]
      },
      'deploy:staging': {
        stage: 'deploy',
        image: 'bitnami/kubectl:latest',
        script: [
          'kubectl config use-context $KUBE_CONTEXT',
          'kubectl apply -f k8s/staging/',
          'kubectl rollout status deployment/aura-app -n staging'
        ],
        environment: {
          name: 'staging',
          url: 'https://staging.aura.dev',
          kubernetes: {
            namespace: 'staging'
          }
        },
        rules: [
          { if: '$CI_COMMIT_BRANCH == "develop"' }
        ]
      },
      'deploy:production': {
        stage: 'deploy',
        image: 'bitnami/kubectl:latest',
        script: [
          'kubectl config use-context $KUBE_CONTEXT',
          'kubectl apply -f k8s/production/',
          'kubectl rollout status deployment/aura-app -n production'
        ],
        environment: {
          name: 'production',
          url: 'https://aura.dev',
          kubernetes: {
            namespace: 'production'
          }
        },
        when: 'manual',
        rules: [
          { if: '$CI_COMMIT_BRANCH == "main"' },
          { if: '$CI_COMMIT_TAG' }
        ]
      }
    });

    // Model Training Pipeline Template
    templates.set('model-training', {
      stages: ['prepare', 'train', 'validate', 'deploy'],
      variables: {
        PYTHON_VERSION: '3.11',
        CUDA_VERSION: '12.1',
        MODEL_REGISTRY: '$CI_REGISTRY_IMAGE/models'
      },
      'prepare:data': {
        stage: 'prepare',
        image: 'python:3.11-slim',
        script: [
          'pip install -r requirements-training.txt',
          'python scripts/prepare_data.py',
          'python scripts/validate_data.py'
        ],
        artifacts: {
          paths: ['data/processed/'],
          expire_in: '1 week'
        },
        rules: [
          { if: '$CI_PIPELINE_SOURCE == "schedule"' },
          { if: '$CI_COMMIT_MESSAGE =~ /\[train\]/' }
        ]
      },
      'train:model': {
        stage: 'train',
        image: 'pytorch/pytorch:2.0.1-cuda11.7-cudnn8-devel',
        tags: ['gpu', 'cuda'],
        script: [
          'pip install -r requirements-training.txt',
          'python scripts/train_model.py --config configs/${MODEL_CONFIG}.yaml',
          'python scripts/evaluate_model.py'
        ],
        artifacts: {
          paths: ['models/checkpoints/', 'results/'],
          expire_in: '3 months'
        },
        timeout: '8 hours',
        variables: {
          MODEL_CONFIG: 'qwen-coder'
        },
        parallel: {
          matrix: [
            { MODEL_CONFIG: 'qwen-coder-4b' },
            { MODEL_CONFIG: 'qwen-coder-8b' },
            { MODEL_CONFIG: 'phi-4-mini' }
          ]
        }
      },
      'validate:benchmark': {
        stage: 'validate',
        image: 'python:3.11-slim',
        script: [
          'pip install -r requirements-eval.txt',
          'python scripts/run_humaneval.py',
          'python scripts/run_swe_bench.py'
        ],
        artifacts: {
          reports: {
            junit: 'benchmark-results.xml'
          },
          paths: ['benchmark-results/'],
          expire_in: '1 month'
        },
        needs: ['train:model']
      },
      'deploy:model': {
        stage: 'deploy',
        image: 'docker:latest',
        services: ['docker:dind'],
        script: [
          'docker build -t $MODEL_REGISTRY:$CI_COMMIT_SHA .',
          'docker push $MODEL_REGISTRY:$CI_COMMIT_SHA',
          'docker tag $MODEL_REGISTRY:$CI_COMMIT_SHA $MODEL_REGISTRY:latest',
          'docker push $MODEL_REGISTRY:latest'
        ],
        needs: ['validate:benchmark'],
        rules: [
          { if: '$CI_COMMIT_BRANCH == "main"' }
        ]
      }
    });

    this.templates = templates;
    return templates;
  }

  /**
   * Generate pipeline YAML
   */
  async generatePipeline(templateName: string, customizations?: Partial<GitLabTemplate>): Promise<string> {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    const pipeline = { ...template, ...customizations };
    return yaml.dump(pipeline, { lineWidth: -1, noRefs: true });
  }

  /**
   * Create or update .gitlab-ci.yml file
   */
  async deployPipeline(templateName: string, customizations?: Partial<GitLabTemplate>): Promise<void> {
    const pipelineYaml = await this.generatePipeline(templateName, customizations);
    
    try {
      // Get current file (if exists)
      let existingFile;
      try {
        const response = await this.apiRequest('GET', `/projects/${this.projectId}/repository/files/.gitlab-ci.yml?ref=main`);
        existingFile = response;
      } catch (error: any) {
        if (error.status !== 404) throw error;
      }

      const action = existingFile ? 'update' : 'create';
      const payload: any = {
        branch: 'main',
        content: pipelineYaml,
        commit_message: `${action === 'create' ? 'Add' : 'Update'} ${templateName} pipeline`
      };

      if (existingFile) {
        payload.last_commit_id = existingFile.last_commit_id;
      }

      await this.apiRequest('POST', `/projects/${this.projectId}/repository/files/.gitlab-ci.yml`, payload);
      this.emit('pipelineDeployed', { templateName, action });
    } catch (error) {
      this.emit('deploymentError', { templateName, error });
      throw error;
    }
  }

  /**
   * Get pipeline status
   */
  async getPipelineStatus(pipelineId: number): Promise<GitLabPipeline> {
    return await this.apiRequest('GET', `/projects/${this.projectId}/pipelines/${pipelineId}`);
  }

  /**
   * List project pipelines
   */
  async listPipelines(ref?: string, status?: string): Promise<GitLabPipeline[]> {
    const params = new URLSearchParams();
    if (ref) params.append('ref', ref);
    if (status) params.append('status', status);
    
    const queryString = params.toString();
    const url = `/projects/${this.projectId}/pipelines${queryString ? '?' + queryString : ''}`;
    
    return await this.apiRequest('GET', url);
  }

  /**
   * Get job details
   */
  async getJob(jobId: number): Promise<GitLabJob> {
    return await this.apiRequest('GET', `/projects/${this.projectId}/jobs/${jobId}`);
  }

  /**
   * List pipeline jobs
   */
  async getPipelineJobs(pipelineId: number): Promise<GitLabJob[]> {
    return await this.apiRequest('GET', `/projects/${this.projectId}/pipelines/${pipelineId}/jobs`);
  }

  /**
   * Retry failed job
   */
  async retryJob(jobId: number): Promise<GitLabJob> {
    return await this.apiRequest('POST', `/projects/${this.projectId}/jobs/${jobId}/retry`);
  }

  /**
   * Cancel running job
   */
  async cancelJob(jobId: number): Promise<GitLabJob> {
    return await this.apiRequest('POST', `/projects/${this.projectId}/jobs/${jobId}/cancel`);
  }

  /**
   * Manage project variables
   */
  async createVariable(config: VariableConfig): Promise<void> {
    await this.apiRequest('POST', `/projects/${this.projectId}/variables`, config);
  }

  async updateVariable(key: string, config: Partial<VariableConfig>): Promise<void> {
    await this.apiRequest('PUT', `/projects/${this.projectId}/variables/${encodeURIComponent(key)}`, config);
  }

  async deleteVariable(key: string): Promise<void> {
    await this.apiRequest('DELETE', `/projects/${this.projectId}/variables/${encodeURIComponent(key)}`);
  }

  async listVariables(): Promise<VariableConfig[]> {
    return await this.apiRequest('GET', `/projects/${this.projectId}/variables`);
  }

  /**
   * Download job artifacts
   */
  async downloadArtifacts(jobId: number): Promise<ArrayBuffer> {
    const response = await fetch(`${this.apiUrl}/api/v4/projects/${this.projectId}/jobs/${jobId}/artifacts`, {
      headers: {
        'PRIVATE-TOKEN': this.token
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to download artifacts: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  }

  /**
   * Create deployment environment
   */
  async createEnvironment(name: string, config: DeploymentEnvironment): Promise<void> {
    const { name: _configName, ...configWithoutName } = config;
    await this.apiRequest('POST', `/projects/${this.projectId}/environments`, {
      name,
      external_url: config.url,
      ...configWithoutName
    });
  }

  /**
   * Handle parallel job support
   */
  createParallelConfig(matrix: Record<string, any>[]): any {
    return {
      parallel: {
        matrix
      }
    };
  }

  /**
   * Configure rollback automation
   */
  async rollbackDeployment(environmentName: string, deploymentId?: number): Promise<void> {
    if (deploymentId) {
      // Rollback to specific deployment
      await this.apiRequest('POST', `/projects/${this.projectId}/deployments/${deploymentId}/rollback`);
    } else {
      // Rollback to previous deployment
      const deployments = await this.apiRequest('GET', `/projects/${this.projectId}/deployments?environment=${environmentName}&status=success&per_page=2`);
      if (deployments.length >= 2) {
        const previousDeployment = deployments[1];
        await this.apiRequest('POST', `/projects/${this.projectId}/deployments/${previousDeployment.id}/rollback`);
      }
    }
  }

  /**
   * Start job monitoring
   */
  startJobMonitoring(pipelineId: number, intervalMs: number = 30000): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(async () => {
      try {
        const jobs = await this.getPipelineJobs(pipelineId);
        const runningJobs = jobs.filter(job => job.status === 'running');
        
        for (const job of runningJobs) {
          const jobDetails = await this.getJob(job.id);
          this.emit('jobUpdate', jobDetails);
        }

        const pipeline = await this.getPipelineStatus(pipelineId);
        this.emit('pipelineUpdate', pipeline);

        // Stop monitoring if pipeline is complete
        if (['success', 'failed', 'canceled', 'skipped'].includes(pipeline.status)) {
          this.stopJobMonitoring();
        }
      } catch (error) {
        this.emit('monitoringError', error);
      }
    }, intervalMs);
  }

  /**
   * Stop job monitoring
   */
  stopJobMonitoring(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Make API request to GitLab
   */
  private async apiRequest(method: string, endpoint: string, data?: any): Promise<any> {
    const url = `${this.apiUrl}/api/v4${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'PRIVATE-TOKEN': this.token,
        'Content-Type': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stopJobMonitoring();
    this.removeAllListeners();
  }
}

export default GitLabCIIntegration; 