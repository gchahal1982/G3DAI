import { ModelMesh } from '../../../src/lib/models/ModelMesh';

// Mock the individual model services
const mockLocalInference = {
  isModelLoaded: jest.fn(),
  loadModel: jest.fn(),
  unloadModel: jest.fn(),
  generateCompletion: jest.fn(),
  getModelStatus: jest.fn(),
};

const mockCloudBurst = {
  generateCompletion: jest.fn(),
  getAvailableModels: jest.fn(),
  getModelLatency: jest.fn(),
};

const mockModelRouter = {
  selectBestModel: jest.fn(),
  fallbackModel: jest.fn(),
  getModelCapabilities: jest.fn(),
};

const mockTelemetry = {
  trackLatency: jest.fn(),
  trackEvent: jest.fn(),
  trackError: jest.fn(),
};

// Mock dependencies
jest.mock('../../../src/lib/inference/LocalInference', () => ({
  LocalInference: {
    getInstance: () => mockLocalInference,
  },
}));

jest.mock('../../../src/lib/inference/CloudBurst', () => ({
  CloudBurst: {
    getInstance: () => mockCloudBurst,
  },
}));

jest.mock('../../../src/lib/models/ModelRouter', () => ({
  ModelRouter: {
    getInstance: () => mockModelRouter,
  },
}));

jest.mock('../../../src/lib/telemetry/TelemetryClient', () => ({
  TelemetryClient: {
    getInstance: () => mockTelemetry,
  },
}));

describe('ModelMesh', () => {
  let modelMesh: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset ModelMesh singleton for each test
    (ModelMesh as any)._instance = null;
    modelMesh = ModelMesh.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('returns the same instance', () => {
      const instance1 = ModelMesh.getInstance();
      const instance2 = ModelMesh.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('initializes only once', () => {
      const instance1 = ModelMesh.getInstance();
      const instance2 = ModelMesh.getInstance();
      
      // Should be the same object reference
      expect(instance1).toStrictEqual(instance2);
    });
  });

  describe('Model Management', () => {
    it('gets available local models', async () => {
      mockLocalInference.getModelStatus.mockResolvedValue({
        'qwen3-coder-4b': { status: 'ready', latency: 42 },
        'phi-4-mini': { status: 'ready', latency: 38 },
        'codestral-22b': { status: 'loading', latency: null },
      });

      const models = await modelMesh.getAvailableModels();
      
      expect(models.local).toHaveLength(2); // Only ready models
      expect(models.local).toContain('qwen3-coder-4b');
      expect(models.local).toContain('phi-4-mini');
    });

    it('gets available cloud models', async () => {
      mockCloudBurst.getAvailableModels.mockResolvedValue([
        'kimi-k2',
        'deepseek-r1',
      ]);

      const models = await modelMesh.getAvailableModels();
      
      expect(models.cloud).toHaveLength(2);
      expect(models.cloud).toContain('kimi-k2');
      expect(models.cloud).toContain('deepseek-r1');
    });

    it('loads local model on demand', async () => {
      mockLocalInference.isModelLoaded.mockReturnValue(false);
      mockLocalInference.loadModel.mockResolvedValue(true);

      await modelMesh.ensureModelLoaded('qwen3-coder-4b');

      expect(mockLocalInference.loadModel).toHaveBeenCalledWith('qwen3-coder-4b');
    });

    it('skips loading if model already loaded', async () => {
      mockLocalInference.isModelLoaded.mockReturnValue(true);

      await modelMesh.ensureModelLoaded('qwen3-coder-4b');

      expect(mockLocalInference.loadModel).not.toHaveBeenCalled();
    });
  });

  describe('Completion Generation', () => {
    const mockRequest = {
      prompt: 'const name = ',
      language: 'typescript',
      context: 'file context here',
      maxTokens: 100,
    };

    it('generates completion with local model', async () => {
      mockModelRouter.selectBestModel.mockReturnValue({
        model: 'qwen3-coder-4b',
        type: 'local',
        confidence: 0.9,
      });

      mockLocalInference.generateCompletion.mockResolvedValue({
        content: 'getUserName();',
        tokens: 3,
        latency: 45,
        model: 'qwen3-coder-4b',
      });

      const result = await modelMesh.generateCompletion(mockRequest);

      expect(result.content).toBe('getUserName();');
      expect(result.model).toBe('qwen3-coder-4b');
      expect(result.latency).toBeWithinLatency(45, 5);
      expect(mockTelemetry.trackLatency).toHaveBeenCalledWith('completion_latency', 45);
    });

    it('generates completion with cloud model', async () => {
      mockModelRouter.selectBestModel.mockReturnValue({
        model: 'kimi-k2',
        type: 'cloud',
        confidence: 0.85,
      });

      mockCloudBurst.generateCompletion.mockResolvedValue({
        content: 'complex completion',
        tokens: 15,
        latency: 120,
        model: 'kimi-k2',
      });

      const result = await modelMesh.generateCompletion(mockRequest);

      expect(result.content).toBe('complex completion');
      expect(result.model).toBe('kimi-k2');
      expect(result.latency).toBeWithinLatency(120, 10);
    });

    it('handles model routing fallback', async () => {
      mockModelRouter.selectBestModel
        .mockReturnValueOnce({
          model: 'unavailable-model',
          type: 'local',
          confidence: 0.9,
        });

      mockLocalInference.generateCompletion
        .mockRejectedValueOnce(new Error('Model not available'));

      mockModelRouter.fallbackModel.mockReturnValue({
        model: 'phi-4-mini',
        type: 'local',
        confidence: 0.7,
      });

      mockLocalInference.generateCompletion.mockResolvedValue({
        content: 'fallback completion',
        tokens: 5,
        latency: 60,
        model: 'phi-4-mini',
      });

      const result = await modelMesh.generateCompletion(mockRequest);

      expect(result.content).toBe('fallback completion');
      expect(result.model).toBe('phi-4-mini');
      expect(mockTelemetry.trackEvent).toHaveBeenCalledWith('model_fallback', {
        originalModel: 'unavailable-model',
        fallbackModel: 'phi-4-mini',
      });
    });

    it('validates completion request', async () => {
      const invalidRequest = {
        prompt: '', // Empty prompt
        language: 'typescript',
      };

      await expect(modelMesh.generateCompletion(invalidRequest)).rejects.toThrow(
        'Invalid completion request'
      );
    });

    it('handles timeout gracefully', async () => {
      mockModelRouter.selectBestModel.mockReturnValue({
        model: 'slow-model',
        type: 'local',
        confidence: 0.9,
      });

      // Mock slow response
      mockLocalInference.generateCompletion.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 5000))
      );

      const requestWithTimeout = { ...mockRequest, timeout: 100 };

      await expect(modelMesh.generateCompletion(requestWithTimeout))
        .rejects.toThrow('Completion timeout');

      expect(mockTelemetry.trackEvent).toHaveBeenCalledWith('completion_timeout', {
        model: 'slow-model',
        timeout: 100,
      });
    });
  });

  describe('Performance Optimization', () => {
    it('caches model capabilities', async () => {
      mockModelRouter.getModelCapabilities
        .mockResolvedValueOnce({ maxTokens: 8192, languages: ['typescript'] })
        .mockResolvedValueOnce({ maxTokens: 8192, languages: ['typescript'] });

      await modelMesh.getModelCapabilities('qwen3-coder-4b');
      await modelMesh.getModelCapabilities('qwen3-coder-4b');

      expect(mockModelRouter.getModelCapabilities).toHaveBeenCalledTimes(1);
    });

    it('implements request debouncing', async () => {
      const requests = [
        modelMesh.generateCompletion({ ...mockRequest, prompt: 'const a' }),
        modelMesh.generateCompletion({ ...mockRequest, prompt: 'const a' }),
        modelMesh.generateCompletion({ ...mockRequest, prompt: 'const a' }),
      ];

      mockModelRouter.selectBestModel.mockReturnValue({
        model: 'qwen3-coder-4b',
        type: 'local',
        confidence: 0.9,
      });

      mockLocalInference.generateCompletion.mockResolvedValue({
        content: 'completion',
        tokens: 5,
        latency: 45,
        model: 'qwen3-coder-4b',
      });

      await Promise.all(requests);

      // Should only call the service once due to debouncing
      expect(mockLocalInference.generateCompletion).toHaveBeenCalledTimes(1);
    });

    it('tracks performance metrics', async () => {
      mockModelRouter.selectBestModel.mockReturnValue({
        model: 'qwen3-coder-4b',
        type: 'local',
        confidence: 0.9,
      });

      mockLocalInference.generateCompletion.mockResolvedValue({
        content: 'completion',
        tokens: 5,
        latency: 45,
        model: 'qwen3-coder-4b',
      });

      await modelMesh.generateCompletion(mockRequest);

      expect(mockTelemetry.trackEvent).toHaveBeenCalledWith('model_performance', {
        model: 'qwen3-coder-4b',
        latency: 45,
        tokens: 5,
        type: 'local',
      });
    });
  });

  describe('Error Handling', () => {
    it('handles local inference errors', async () => {
      mockModelRouter.selectBestModel.mockReturnValue({
        model: 'qwen3-coder-4b',
        type: 'local',
        confidence: 0.9,
      });

      mockLocalInference.generateCompletion.mockRejectedValue(
        new Error('Local inference failed')
      );

      mockModelRouter.fallbackModel.mockReturnValue(null);

      await expect(modelMesh.generateCompletion(mockRequest))
        .rejects.toThrow('Local inference failed');

      expect(mockTelemetry.trackError).toHaveBeenCalledWith(
        'completion_error',
        expect.objectContaining({ message: 'Local inference failed' })
      );
    });

    it('handles cloud service errors', async () => {
      mockModelRouter.selectBestModel.mockReturnValue({
        model: 'kimi-k2',
        type: 'cloud',
        confidence: 0.9,
      });

      mockCloudBurst.generateCompletion.mockRejectedValue(
        new Error('Cloud service unavailable')
      );

      await expect(modelMesh.generateCompletion(mockRequest))
        .rejects.toThrow('Cloud service unavailable');

      expect(mockTelemetry.trackError).toHaveBeenCalledWith(
        'completion_error',
        expect.objectContaining({ message: 'Cloud service unavailable' })
      );
    });

    it('handles network interruptions gracefully', async () => {
      mockModelRouter.selectBestModel.mockReturnValue({
        model: 'kimi-k2',
        type: 'cloud',
        confidence: 0.9,
      });

      mockCloudBurst.generateCompletion.mockRejectedValue(
        new Error('Network error')
      );

      mockModelRouter.fallbackModel.mockReturnValue({
        model: 'qwen3-coder-4b',
        type: 'local',
        confidence: 0.8,
      });

      mockLocalInference.generateCompletion.mockResolvedValue({
        content: 'local fallback',
        tokens: 3,
        latency: 50,
        model: 'qwen3-coder-4b',
      });

      const result = await modelMesh.generateCompletion(mockRequest);

      expect(result.content).toBe('local fallback');
      expect(result.model).toBe('qwen3-coder-4b');
      expect(mockTelemetry.trackEvent).toHaveBeenCalledWith('network_fallback', {
        failedModel: 'kimi-k2',
        fallbackModel: 'qwen3-coder-4b',
      });
    });
  });

  describe('Model Health Monitoring', () => {
    it('monitors model health status', async () => {
      mockLocalInference.getModelStatus.mockResolvedValue({
        'qwen3-coder-4b': { status: 'ready', latency: 42, memory: '4GB' },
        'phi-4-mini': { status: 'ready', latency: 38, memory: '2GB' },
      });

      mockCloudBurst.getModelLatency.mockResolvedValue({
        'kimi-k2': 120,
        'deepseek-r1': 150,
      });

      const health = await modelMesh.getModelHealth();

      expect(health.local['qwen3-coder-4b'].status).toBe('ready');
      expect(health.local['qwen3-coder-4b'].latency).toBe(42);
      expect(health.cloud['kimi-k2']).toBe(120);
    });

    it('detects unhealthy models', async () => {
      mockLocalInference.getModelStatus.mockResolvedValue({
        'qwen3-coder-4b': { status: 'error', latency: null, error: 'OOM' },
      });

      const health = await modelMesh.getModelHealth();

      expect(health.local['qwen3-coder-4b'].status).toBe('error');
      expect(mockTelemetry.trackEvent).toHaveBeenCalledWith('model_health_check', {
        unhealthyModels: ['qwen3-coder-4b'],
      });
    });
  });

  describe('Configuration Management', () => {
    it('updates model preferences', () => {
      const preferences = {
        preferLocal: true,
        maxLatency: 100,
        fallbackEnabled: true,
      };

      modelMesh.updatePreferences(preferences);

      expect(mockModelRouter.selectBestModel).toBeDefined();
    });

    it('validates configuration changes', () => {
      const invalidConfig = {
        maxLatency: -1, // Invalid negative latency
      };

      expect(() => modelMesh.updatePreferences(invalidConfig))
        .toThrow('Invalid preference value');
    });
  });

  describe('Resource Management', () => {
    it('cleans up resources on shutdown', async () => {
      await modelMesh.shutdown();

      expect(mockLocalInference.unloadModel).toHaveBeenCalled();
      expect(mockTelemetry.trackEvent).toHaveBeenCalledWith('mesh_shutdown', {
        uptime: expect.any(Number),
      });
    });

    it('manages memory usage', async () => {
      const memoryInfo = await modelMesh.getMemoryUsage();

      expect(memoryInfo).toHaveValidStructure({
        total: 'number',
        used: 'number',
        available: 'number',
        models: 'object',
      });
    });
  });
}); 