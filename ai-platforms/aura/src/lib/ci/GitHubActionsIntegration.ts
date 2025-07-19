// @ts-ignore - External package without types
import { Octokit } from '@octokit/rest';
// @ts-ignore - External package without types
import yaml from 'js-yaml';
import { EventEmitter } from 'events';

export interface WorkflowTemplate {
  name: string;
  on: Record<string, any>;
  jobs: Record<string, any>;
  env?: Record<string, string>;
}

export interface BuildMatrix {
  os: string[];
  nodeVersion: string[];
  pythonVersion?: string[] | undefined;
  include?: Array<{ os: string; experimental?: boolean }>;
  exclude?: Array<{ os: string; nodeVersion: string }>;
}

export interface CacheStrategy {
  key: string;
  paths: string[];
  restoreKeys?: string[];
  enabled: boolean;
}

export interface SecretConfig {
  name: string;
  required: boolean;
  description: string;
  scope: 'repository' | 'environment' | 'organization';
}

export interface ArtifactConfig {
  name: string;
  path: string;
  retentionDays: number;
  ifNoFilesFound?: 'warn' | 'error' | 'ignore';
}

export interface WorkflowStatus {
  id: number;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion?: 'success' | 'failure' | 'neutral' | 'cancelled' | 'timed_out';
  startedAt?: string;
  completedAt?: string;
  url: string;
}

export interface DeploymentTrigger {
  branch: string;
  environment: string;
  requiresApproval: boolean;
  autoMerge: boolean;
  conditions: string[];
}

export class GitHubActionsIntegration extends EventEmitter {
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private workflows: Map<string, WorkflowTemplate> = new Map();
  private statusPollingInterval: NodeJS.Timeout | null = null;

  constructor(
    token: string,
    owner: string,
    repo: string
  ) {
    super();
    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * Create GitHub Actions workflow templates
   */
  createWorkflowTemplates(): Map<string, WorkflowTemplate> {
    const templates = new Map<string, WorkflowTemplate>();

    // Aura CI/CD Template
    templates.set('aura-ci', {
      name: 'Aura CI/CD',
      on: {
        push: { branches: ['main', 'develop'] },
        pull_request: { branches: ['main'] },
        workflow_dispatch: {}
      },
      jobs: {
        test: {
          'runs-on': '${{ matrix.os }}',
          strategy: {
            matrix: {
              os: ['ubuntu-latest', 'windows-latest', 'macos-latest'],
              'node-version': ['18', '20'],
              include: [
                { os: 'ubuntu-latest', experimental: true }
              ]
            }
          },
          steps: [
            { uses: 'actions/checkout@v4' },
            {
              name: 'Setup Node.js',
              uses: 'actions/setup-node@v4',
              with: { 'node-version': '${{ matrix.node-version }}' }
            },
            {
              name: 'Cache dependencies',
              uses: 'actions/cache@v3',
              with: {
                path: 'node_modules',
                key: '${{ runner.os }}-node-${{ hashFiles(\'package-lock.json\') }}',
                'restore-keys': '${{ runner.os }}-node-'
              }
            },
            { run: 'npm ci' },
            { run: 'npm run build' },
            { run: 'npm test' },
            { run: 'npm run test:e2e' }
          ]
        },
        security: {
          'runs-on': 'ubuntu-latest',
          steps: [
            { uses: 'actions/checkout@v4' },
            {
              name: 'Run security audit',
              run: 'npm audit --audit-level=high'
            },
            {
              name: 'SAST scan',
              uses: 'github/super-linter@v4',
              env: {
                DEFAULT_BRANCH: 'main',
                GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}'
              }
            }
          ]
        },
        build: {
          needs: ['test', 'security'],
          'runs-on': 'ubuntu-latest',
          steps: [
            { uses: 'actions/checkout@v4' },
            {
              name: 'Build application',
              run: 'npm run build:production'
            },
            {
              name: 'Upload artifacts',
              uses: 'actions/upload-artifact@v3',
              with: {
                name: 'build-artifacts',
                path: 'dist/',
                'retention-days': 30
              }
            }
          ]
        }
      }
    });

    // Model Training Pipeline Template
    templates.set('model-training', {
      name: 'Model Training Pipeline',
      on: {
        schedule: [{ cron: '0 2 * * 0' }], // Weekly
        workflow_dispatch: {
          inputs: {
            model_name: {
              description: 'Model to train',
              required: true,
              default: 'qwen-coder'
            }
          }
        }
      },
      jobs: {
        train: {
          'runs-on': 'self-hosted',
          'timeout-minutes': 480,
          steps: [
            { uses: 'actions/checkout@v4' },
            {
              name: 'Setup Python',
              uses: 'actions/setup-python@v4',
              with: { 'python-version': '3.11' }
            },
            {
              name: 'Install dependencies',
              run: 'pip install -r requirements-training.txt'
            },
            {
              name: 'Train model',
              run: 'python scripts/train_model.py --model ${{ github.event.inputs.model_name }}',
              env: {
                CUDA_VISIBLE_DEVICES: '0,1,2,3'
              }
            },
            {
              name: 'Upload model artifacts',
              uses: 'actions/upload-artifact@v3',
              with: {
                name: 'trained-model-${{ github.event.inputs.model_name }}',
                path: 'models/output/',
                'retention-days': 90
              }
            }
          ]
        }
      }
    });

    // Deployment Template
    templates.set('deploy-production', {
      name: 'Deploy to Production',
      on: {
        release: { types: ['published'] },
        workflow_dispatch: {}
      },
      jobs: {
        deploy: {
          'runs-on': 'ubuntu-latest',
          environment: 'production',
          steps: [
            { uses: 'actions/checkout@v4' },
            {
              name: 'Deploy to Kubernetes',
              run: 'kubectl apply -f k8s/production/',
              env: {
                KUBE_CONFIG_DATA: '${{ secrets.KUBE_CONFIG }}'
              }
            },
            {
              name: 'Health check',
              run: 'scripts/health-check.sh',
              'timeout-minutes': 10
            }
          ]
        }
      }
    });

    this.workflows = templates;
    return templates;
  }

  /**
   * Generate workflow YAML files
   */
  async generateWorkflow(templateName: string, customizations?: Partial<WorkflowTemplate>): Promise<string> {
    const template = this.workflows.get(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    const workflow = { ...template, ...customizations };
    return yaml.dump(workflow, { lineWidth: -1 });
  }

  /**
   * Create or update workflow file in repository
   */
  async deployWorkflow(templateName: string, customizations?: Partial<WorkflowTemplate>): Promise<void> {
    const workflowYaml = await this.generateWorkflow(templateName, customizations);
    const path = `.github/workflows/${templateName}.yml`;

    try {
      // Check if file exists
      const { data: existingFile } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path
      });

      // Update existing file
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path,
        message: `Update ${templateName} workflow`,
        content: Buffer.from(workflowYaml).toString('base64'),
        sha: Array.isArray(existingFile) ? existingFile[0].sha : existingFile.sha
      });
    } catch (error: any) {
      if (error.status === 404) {
        // Create new file
        await this.octokit.repos.createOrUpdateFileContents({
          owner: this.owner,
          repo: this.repo,
          path,
          message: `Add ${templateName} workflow`,
          content: Buffer.from(workflowYaml).toString('base64')
        });
      } else {
        throw error;
      }
    }

    this.emit('workflowDeployed', { templateName, path });
  }

  /**
   * Monitor workflow status
   */
  async getWorkflowStatus(workflowId: number): Promise<WorkflowStatus> {
    const { data: run } = await this.octokit.actions.getWorkflowRun({
      owner: this.owner,
      repo: this.repo,
      run_id: workflowId
    });

    return {
      id: run.id,
      status: run.status as any,
      conclusion: run.conclusion as any,
      startedAt: run.run_started_at,
      completedAt: run.updated_at,
      url: run.html_url
    };
  }

  /**
   * List all workflow runs
   */
  async listWorkflowRuns(workflowId?: number): Promise<WorkflowStatus[]> {
    const params: any = {
      owner: this.owner,
      repo: this.repo,
      per_page: 50
    };

    if (workflowId) {
      params.workflow_id = workflowId;
    }

    const { data } = await this.octokit.actions.listWorkflowRunsForRepo(params);
    
    return data.workflow_runs.map((run: any) => ({
      id: run.id,
      status: run.status as any,
      conclusion: run.conclusion as any,
      startedAt: run.run_started_at,
      completedAt: run.updated_at,
      url: run.html_url
    }));
  }

  /**
   * Manage build matrix configurations
   */
  createBuildMatrix(config: Partial<BuildMatrix>): BuildMatrix {
    return {
      os: config.os || ['ubuntu-latest', 'windows-latest', 'macos-latest'],
      nodeVersion: config.nodeVersion || ['18', '20'],
      pythonVersion: config.pythonVersion,
      include: config.include || [],
      exclude: config.exclude || []
    };
  }

  /**
   * Configure caching strategies
   */
  createCacheConfig(type: 'npm' | 'pip' | 'cargo' | 'maven'): CacheStrategy {
    const configs: Record<string, CacheStrategy> = {
      npm: {
        key: '${{ runner.os }}-node-${{ hashFiles(\'package-lock.json\') }}',
        paths: ['node_modules'],
        restoreKeys: ['${{ runner.os }}-node-'],
        enabled: true
      },
      pip: {
        key: '${{ runner.os }}-pip-${{ hashFiles(\'requirements.txt\') }}',
        paths: ['~/.cache/pip'],
        restoreKeys: ['${{ runner.os }}-pip-'],
        enabled: true
      },
      cargo: {
        key: '${{ runner.os }}-cargo-${{ hashFiles(\'Cargo.lock\') }}',
        paths: ['~/.cargo', 'target/'],
        restoreKeys: ['${{ runner.os }}-cargo-'],
        enabled: true
      },
      maven: {
        key: '${{ runner.os }}-maven-${{ hashFiles(\'pom.xml\') }}',
        paths: ['~/.m2'],
        restoreKeys: ['${{ runner.os }}-maven-'],
        enabled: true
      }
    };

    return configs[type];
  }

  /**
   * Handle secrets management
   */
  async createSecret(name: string, value: string, scope: 'repository' | 'environment' = 'repository'): Promise<void> {
    if (scope === 'repository') {
      await this.octokit.actions.createOrUpdateRepoSecret({
        owner: this.owner,
        repo: this.repo,
        secret_name: name,
        encrypted_value: await this.encryptSecret(value)
      });
    }
    // Environment secrets would require additional API calls
  }

  /**
   * Encrypt secret value using repository public key
   */
  private async encryptSecret(value: string): Promise<string> {
    const { data } = await this.octokit.actions.getRepoPublicKey({
      owner: this.owner,
      repo: this.repo
    });

    // This would typically use libsodium for encryption with data.key and data.key_id
    // For now, returning base64 encoded value as placeholder
    return Buffer.from(value).toString('base64');
  }

  /**
   * Manage artifacts
   */
  async downloadArtifact(artifactId: number, downloadPath: string): Promise<void> {
    const { data } = await this.octokit.actions.downloadArtifact({
      owner: this.owner,
      repo: this.repo,
      artifact_id: artifactId,
      archive_format: 'zip'
    });

    // Save artifact data to downloadPath
    // Implementation would involve file system operations
  }

  /**
   * Configure deployment triggers
   */
  createDeploymentTrigger(config: DeploymentTrigger): any {
    return {
      push: {
        branches: [config.branch]
      },
      workflow_dispatch: {},
      deployment: {
        environment: config.environment
      }
    };
  }

  /**
   * Start status monitoring
   */
  startStatusMonitoring(intervalMs: number = 30000): void {
    if (this.statusPollingInterval) {
      clearInterval(this.statusPollingInterval);
    }

    this.statusPollingInterval = setInterval(async () => {
      try {
        const runs = await this.listWorkflowRuns();
        const activeRuns = runs.filter(run => run.status === 'in_progress');
        
        for (const run of activeRuns) {
          const status = await this.getWorkflowStatus(run.id);
          this.emit('statusUpdate', status);
        }
      } catch (error) {
        this.emit('monitoringError', error);
      }
    }, intervalMs);
  }

  /**
   * Stop status monitoring
   */
  stopStatusMonitoring(): void {
    if (this.statusPollingInterval) {
      clearInterval(this.statusPollingInterval);
      this.statusPollingInterval = null;
    }
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stopStatusMonitoring();
    this.removeAllListeners();
  }
}

export default GitHubActionsIntegration; 