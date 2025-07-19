import { TelemetryClient } from '../../../src/lib/telemetry/TelemetryClient';

// Mock storage and network dependencies
const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

const mockFetch = jest.fn();

// Mock DuckDB for analytics storage
const mockDuckDB = {
  connect: jest.fn(),
  query: jest.fn(),
  close: jest.fn(),
  insert: jest.fn(),
};

// Setup global mocks
Object.defineProperty(window, 'localStorage', {
  value: mockStorage,
});

global.fetch = mockFetch;

jest.mock('../../../src/lib/storage/DuckDBClient', () => ({
  DuckDBClient: {
    getInstance: () => mockDuckDB,
  },
}));

// Mock crypto for event IDs
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-event-id'),
  },
});

describe('TelemetryClient', () => {
  let telemetryClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton for each test
    (TelemetryClient as any)._instance = null;
    telemetryClient = TelemetryClient.getInstance();
    
    // Setup default storage responses
    mockStorage.getItem.mockImplementation((key) => {
      if (key === 'telemetry_enabled') return 'true';
      if (key === 'user_id') return 'test-user-123';
      if (key === 'session_id') return 'test-session-456';
      return null;
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    mockDuckDB.query.mockResolvedValue([]);
    mockDuckDB.insert.mockResolvedValue(true);
  });

  describe('Initialization', () => {
    it('creates singleton instance', () => {
      const instance1 = TelemetryClient.getInstance();
      const instance2 = TelemetryClient.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('initializes with default settings', () => {
      expect(telemetryClient.isEnabled()).toBe(true);
      expect(telemetryClient.getUserId()).toBe('test-user-123');
    });

    it('respects opt-out preference', () => {
      mockStorage.getItem.mockImplementation((key) => {
        if (key === 'telemetry_enabled') return 'false';
        return null;
      });

      const client = TelemetryClient.getInstance();
      expect(client.isEnabled()).toBe(false);
    });

    it('generates unique session ID', () => {
      mockStorage.getItem.mockImplementation((key) => {
        if (key === 'session_id') return null; // No existing session
        return null;
      });

      const client = TelemetryClient.getInstance();
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'session_id',
        expect.any(String)
      );
    });
  });

  describe('Event Tracking', () => {
    it('tracks basic events', () => {
      telemetryClient.trackEvent('user_action', {
        action: 'button_click',
        component: 'editor_toolbar',
      });

      expect(mockDuckDB.insert).toHaveBeenCalledWith(
        'events',
        expect.objectContaining({
          id: 'test-event-id',
          type: 'user_action',
          data: {
            action: 'button_click',
            component: 'editor_toolbar',
          },
          timestamp: expect.any(Number),
          userId: 'test-user-123',
          sessionId: 'test-session-456',
        })
      );
    });

    it('tracks performance events', () => {
      telemetryClient.trackLatency('ai_completion', 45.7);

      expect(mockDuckDB.insert).toHaveBeenCalledWith(
        'performance',
        expect.objectContaining({
          metric: 'ai_completion',
          value: 45.7,
          timestamp: expect.any(Number),
        })
      );
    });

    it('tracks errors with stack traces', () => {
      const error = new Error('Test error');
      telemetryClient.trackError('completion_failed', error);

      expect(mockDuckDB.insert).toHaveBeenCalledWith(
        'errors',
        expect.objectContaining({
          type: 'completion_failed',
          message: 'Test error',
          stack: expect.any(String),
          timestamp: expect.any(Number),
        })
      );
    });

    it('validates event data', () => {
      expect(() => {
        telemetryClient.trackEvent('', {}); // Empty event type
      }).toThrow('Invalid event type');

      expect(() => {
        telemetryClient.trackEvent('valid_event', null); // Null data
      }).toThrow('Invalid event data');
    });

    it('respects opt-out setting', () => {
      mockStorage.getItem.mockImplementation((key) => {
        if (key === 'telemetry_enabled') return 'false';
        return null;
      });

      const client = TelemetryClient.getInstance();
      client.trackEvent('user_action', { test: true });

      expect(mockDuckDB.insert).not.toHaveBeenCalled();
    });
  });

  describe('Privacy and Anonymization', () => {
    it('anonymizes sensitive data', () => {
      telemetryClient.trackEvent('file_opened', {
        filePath: '/Users/john/secret-project/password.txt',
        fileName: 'password.txt',
        fileSize: 1024,
      });

      const insertCall = mockDuckDB.insert.mock.calls[0];
      const eventData = insertCall[1].data;

      // File path should be anonymized
      expect(eventData.filePath).not.toContain('/Users/john');
      expect(eventData.filePath).toContain('***');
      expect(eventData.fileName).toBe('password.txt'); // Filename OK
      expect(eventData.fileSize).toBe(1024); // Size OK
    });

    it('removes PII from error messages', () => {
      const error = new Error('Failed to access /Users/john@company.com/project');
      telemetryClient.trackError('file_access_error', error);

      const insertCall = mockDuckDB.insert.mock.calls[0];
      const errorData = insertCall[1];

      expect(errorData.message).not.toContain('john@company.com');
      expect(errorData.message).toContain('***@***.***');
    });

    it('applies differential privacy to numerical data', () => {
      telemetryClient.trackLatency('completion_time', 42.5);

      const insertCall = mockDuckDB.insert.mock.calls[0];
      const value = insertCall[1].value;

      // Value should be slightly perturbed for privacy
      expect(value).not.toBe(42.5);
      expect(Math.abs(value - 42.5)).toBeLessThan(5); // Within noise range
    });

    it('generates anonymous user IDs', () => {
      mockStorage.getItem.mockImplementation((key) => {
        if (key === 'user_id') return null; // No existing user ID
        return null;
      });

      const client = TelemetryClient.getInstance();
      const userId = client.getUserId();

      // Should be anonymous UUID, not identifiable
      expect(userId).toMatch(/^[0-9a-f-]{36}$/);
      expect(userId).not.toContain('user');
      expect(userId).not.toContain('email');
    });
  });

  describe('Data Storage and Batching', () => {
    it('batches events for efficient storage', async () => {
      // Track multiple events quickly
      for (let i = 0; i < 5; i++) {
        telemetryClient.trackEvent('rapid_event', { index: i });
      }

      // Should batch the inserts
      await (global as any).testUtils.waitFor(100);

      expect(mockDuckDB.insert).toHaveBeenCalledTimes(1);
      expect(mockDuckDB.insert).toHaveBeenCalledWith(
        'events',
        expect.arrayContaining([
          expect.objectContaining({ data: { index: 0 } }),
          expect.objectContaining({ data: { index: 4 } }),
        ])
      );
    });

    it('flushes batch on app shutdown', async () => {
      telemetryClient.trackEvent('app_event', { test: true });
      
      await telemetryClient.flush();

      expect(mockDuckDB.insert).toHaveBeenCalled();
    });

    it('handles storage quota exceeded', async () => {
      mockDuckDB.insert.mockRejectedValue(new Error('Storage quota exceeded'));

      telemetryClient.trackEvent('storage_test', { data: 'large'.repeat(1000) });

      await (global as any).testUtils.waitFor(100);

      // Should clean up old data and retry
      expect(mockDuckDB.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM events WHERE timestamp <')
      );
    });

    it('implements retention policy', async () => {
      await telemetryClient.cleanup();

      expect(mockDuckDB.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM events WHERE timestamp < ?'),
        [expect.any(Number)]
      );
    });
  });

  describe('Analytics Queries', () => {
    it('gets performance metrics', async () => {
      mockDuckDB.query.mockResolvedValue([
        { metric: 'completion_latency', avg: 52.3, p95: 89.1, count: 150 },
        { metric: 'render_time', avg: 16.7, p95: 28.4, count: 500 },
      ]);

      const metrics = await telemetryClient.getPerformanceMetrics();

      expect(metrics).toHaveValidStructure({
        completion_latency: {
          average: 'number',
          p95: 'number',
          count: 'number',
        },
        render_time: {
          average: 'number',
          p95: 'number', 
          count: 'number',
        },
      });
    });

    it('gets user behavior analytics', async () => {
      mockDuckDB.query.mockResolvedValue([
        { event: 'model_switch', count: 25 },
        { event: 'completion_accept', count: 180 },
        { event: 'completion_reject', count: 20 },
      ]);

      const analytics = await telemetryClient.getUserBehaviorAnalytics();

      expect(analytics.completion_acceptance_rate).toBeCloseTo(0.9, 2);
      expect(analytics.model_switches).toBe(25);
    });

    it('generates usage reports', async () => {
      mockDuckDB.query
        .mockResolvedValueOnce([{ sessions: 15, users: 12 }]) // Session data
        .mockResolvedValueOnce([{ events: 1250 }]) // Event count
        .mockResolvedValueOnce([{ avg_latency: 48.5 }]); // Performance data

      const report = await telemetryClient.generateUsageReport('weekly');

      expect(report).toHaveValidStructure({
        period: 'string',
        sessions: 'number',
        uniqueUsers: 'number',
        totalEvents: 'number',
        averageLatency: 'number',
      });
    });
  });

  describe('Real-time Monitoring', () => {
    it('streams performance data', () => {
      const mockCallback = jest.fn();
      telemetryClient.onPerformanceUpdate(mockCallback);

      telemetryClient.trackLatency('test_metric', 42);

      expect(mockCallback).toHaveBeenCalledWith({
        metric: 'test_metric',
        value: expect.any(Number),
        timestamp: expect.any(Number),
      });
    });

    it('alerts on performance regressions', () => {
      const mockAlertCallback = jest.fn();
      telemetryClient.onPerformanceAlert(mockAlertCallback);

      // Track a very slow completion
      telemetryClient.trackLatency('completion_latency', 500);

      expect(mockAlertCallback).toHaveBeenCalledWith({
        type: 'latency_spike',
        metric: 'completion_latency',
        value: expect.any(Number),
        threshold: expect.any(Number),
      });
    });

    it('monitors error rates', async () => {
      // Track multiple errors
      for (let i = 0; i < 10; i++) {
        telemetryClient.trackError('test_error', new Error('Test'));
      }

      const errorRate = await telemetryClient.getErrorRate('1h');
      expect(errorRate).toBeGreaterThan(0);
    });
  });

  describe('Configuration and Settings', () => {
    it('updates telemetry preferences', () => {
      telemetryClient.setEnabled(false);

      expect(mockStorage.setItem).toHaveBeenCalledWith('telemetry_enabled', 'false');
      expect(telemetryClient.isEnabled()).toBe(false);
    });

    it('configures data retention period', () => {
      telemetryClient.setRetentionPeriod(30); // 30 days

      expect(mockStorage.setItem).toHaveBeenCalledWith('retention_days', '30');
    });

    it('exports user data for GDPR compliance', async () => {
      mockDuckDB.query.mockResolvedValue([
        { id: '1', type: 'user_action', data: { action: 'click' } },
        { id: '2', type: 'performance', value: 45.2 },
      ]);

      const exportData = await telemetryClient.exportUserData('test-user-123');

      expect(exportData).toHaveValidStructure({
        userId: 'string',
        events: ['object'],
        exportDate: 'string',
      });
    });

    it('deletes user data on request', async () => {
      await telemetryClient.deleteUserData('test-user-123');

      expect(mockDuckDB.query).toHaveBeenCalledWith(
        'DELETE FROM events WHERE userId = ?',
        ['test-user-123']
      );
    });
  });

  describe('Error Handling and Resilience', () => {
    it('handles database connection failures', () => {
      mockDuckDB.insert.mockRejectedValue(new Error('Database unavailable'));

      // Should not crash the app
      expect(() => {
        telemetryClient.trackEvent('test_event', { data: 'test' });
      }).not.toThrow();
    });

    it('falls back to local storage when database fails', () => {
      mockDuckDB.insert.mockRejectedValue(new Error('DB Error'));

      telemetryClient.trackEvent('fallback_test', { data: 'test' });

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('telemetry_buffer'),
        expect.any(String)
      );
    });

    it('recovers buffered events on reconnection', async () => {
      mockStorage.getItem.mockImplementation((key) => {
        if (key.includes('telemetry_buffer')) {
          return JSON.stringify([
            { type: 'buffered_event', data: { recovered: true } },
          ]);
        }
        return null;
      });

      mockDuckDB.insert.mockResolvedValue(true);

      await telemetryClient.recoverBufferedEvents();

      expect(mockDuckDB.insert).toHaveBeenCalledWith(
        'events',
        expect.arrayContaining([
          expect.objectContaining({ data: { recovered: true } }),
        ])
      );
    });

    it('limits memory usage with circuit breaker', () => {
      // Track many events to trigger circuit breaker
      for (let i = 0; i < 1000; i++) {
        telemetryClient.trackEvent('memory_test', { index: i });
      }

      // Should implement circuit breaker pattern
      expect(telemetryClient.getStatus()).toHaveValidStructure({
        enabled: 'boolean',
        circuitBreaker: 'string',
        bufferSize: 'number',
      });
    });
  });
}); 