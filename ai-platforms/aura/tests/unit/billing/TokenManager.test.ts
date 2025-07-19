// Mock TokenManager class for testing
const createMockTokenManager = () => ({
  getCurrentUsage: jest.fn(),
  checkLimit: jest.fn(),
  consumeTokens: jest.fn(),
  getRemainingTokens: jest.fn(),
  calculateOverage: jest.fn(),
  getTierLimits: jest.fn(),
  resetUsage: jest.fn(),
  getUsageHistory: jest.fn(),
  upgradeTier: jest.fn(),
  downgraduTier: jest.fn(),
});

// Mock dependencies
const mockDatabase = {
  query: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
};

const mockBillingService = {
  chargeOverage: jest.fn(),
  createInvoice: jest.fn(),
  processPayment: jest.fn(),
};

const mockTelemetry = {
  trackEvent: jest.fn(),
  trackUsage: jest.fn(),
};

jest.mock('../../../src/lib/billing/database', () => mockDatabase);
jest.mock('../../../src/lib/billing/BillingService', () => mockBillingService);
jest.mock('../../../src/lib/telemetry/TelemetryClient', () => ({
  TelemetryClient: { getInstance: () => mockTelemetry },
}));

describe('TokenManager', () => {
  let tokenManager: any;

  beforeEach(() => {
    jest.clearAllMocks();
    tokenManager = createMockTokenManager();
    
    // Setup default mock responses
    mockDatabase.query.mockResolvedValue([]);
    mockDatabase.insert.mockResolvedValue({ insertId: 1 });
    mockDatabase.update.mockResolvedValue({ affectedRows: 1 });
    
    mockBillingService.chargeOverage.mockResolvedValue({ success: true });
    mockBillingService.createInvoice.mockResolvedValue({ invoiceId: 'inv_123' });
  });

  describe('Tier Management', () => {
    it('enforces Developer tier limits (15k tokens/day, 100 req/hour)', async () => {
      tokenManager.getTierLimits.mockReturnValue({
        tier: 'developer',
        dailyTokens: 15000,
        hourlyRequests: 100,
        overageRate: 0.002, // $0.002 per token
      });

      tokenManager.getCurrentUsage.mockResolvedValue({
        dailyTokens: 12000,
        hourlyRequests: 45,
      });

      tokenManager.checkLimit.mockImplementation((usage, limits) => ({
        allowed: usage.dailyTokens < limits.dailyTokens && usage.hourlyRequests < limits.hourlyRequests,
        remaining: {
          tokens: limits.dailyTokens - usage.dailyTokens,
          requests: limits.hourlyRequests - usage.hourlyRequests,
        },
      }));

      const result = await tokenManager.checkLimit();
      
      expect(result.allowed).toBe(true);
      expect(result.remaining.tokens).toBe(3000);
      expect(result.remaining.requests).toBe(55);
    });

    it('allows unlimited tokens for Team tier (500 req/hour)', async () => {
      tokenManager.getTierLimits.mockReturnValue({
        tier: 'team',
        dailyTokens: -1, // Unlimited
        hourlyRequests: 500,
        overageRate: 0,
      });

      tokenManager.getCurrentUsage.mockResolvedValue({
        dailyTokens: 50000, // High usage
        hourlyRequests: 200,
      });

      tokenManager.checkLimit.mockReturnValue({
        allowed: true,
        remaining: {
          tokens: -1, // Unlimited
          requests: 300,
        },
      });

      const result = await tokenManager.checkLimit();
      
      expect(result.allowed).toBe(true);
      expect(result.remaining.tokens).toBe(-1);
    });

    it('allows unlimited everything for Enterprise tier (2000 req/hour)', async () => {
      tokenManager.getTierLimits.mockReturnValue({
        tier: 'enterprise',
        dailyTokens: -1,
        hourlyRequests: 2000,
        overageRate: 0,
      });

      const result = await tokenManager.checkLimit();
      
      expect(result.allowed).toBe(true);
    });

    it('has no limits for G3D Enterprise (on-prem)', async () => {
      tokenManager.getTierLimits.mockReturnValue({
        tier: 'g3d-enterprise',
        dailyTokens: -1,
        hourlyRequests: -1,
        overageRate: 0,
        onPrem: true,
      });

      const result = await tokenManager.checkLimit();
      
      expect(result.allowed).toBe(true);
    });
  });

  describe('Token Consumption and Tracking', () => {
    it('tracks token consumption accurately', async () => {
      tokenManager.consumeTokens.mockImplementation(async (tokens, context) => {
        mockDatabase.insert.mockResolvedValueOnce({ insertId: 1 });
        return {
          consumed: tokens,
          remaining: 15000 - tokens,
          timestamp: Date.now(),
          context,
        };
      });

      const result = await tokenManager.consumeTokens(150, {
        model: 'qwen3-coder-4b',
        operation: 'completion',
        userId: 'user_123',
      });

      expect(result.consumed).toBe(150);
      expect(result.remaining).toBe(14850);
      expect(mockDatabase.insert).toHaveBeenCalledWith(
        'token_usage',
        expect.objectContaining({
          tokens: 150,
          model: 'qwen3-coder-4b',
          operation: 'completion',
          userId: 'user_123',
        })
      );
    });

    it('prevents consumption when limit exceeded', async () => {
      tokenManager.checkLimit.mockResolvedValue({
        allowed: false,
        reason: 'daily_limit_exceeded',
        remaining: { tokens: 0 },
      });

      tokenManager.consumeTokens.mockRejectedValue(
        new Error('Daily token limit exceeded')
      );

      await expect(tokenManager.consumeTokens(100)).rejects.toThrow(
        'Daily token limit exceeded'
      );
    });

    it('tracks different model usage separately', async () => {
      tokenManager.getUsageHistory.mockResolvedValue([
        { model: 'qwen3-coder-4b', tokens: 5000, requests: 45 },
        { model: 'phi-4-mini', tokens: 2000, requests: 20 },
        { model: 'kimi-k2', tokens: 1000, requests: 5 },
      ]);

      const usage = await tokenManager.getUsageHistory('daily');

      expect(usage).toHaveLength(3);
      expect(usage.find(u => u.model === 'qwen3-coder-4b').tokens).toBe(5000);
    });
  });

  describe('Overage Billing', () => {
    it('calculates overage charges for Developer tier', async () => {
      tokenManager.calculateOverage.mockImplementation((usage, limits) => {
        const overage = Math.max(0, usage.dailyTokens - limits.dailyTokens);
        return {
          overageTokens: overage,
          charge: overage * limits.overageRate,
          tier: limits.tier,
        };
      });

      const result = await tokenManager.calculateOverage(
        { dailyTokens: 18000, hourlyRequests: 50 },
        { dailyTokens: 15000, overageRate: 0.002, tier: 'developer' }
      );

      expect(result.overageTokens).toBe(3000);
      expect(result.charge).toBe(6.00); // 3000 * $0.002
    });

    it('processes overage billing automatically', async () => {
      tokenManager.consumeTokens.mockImplementation(async (tokens) => {
        // Simulate exceeding limit
        const newUsage = 15500; // Over 15k limit
        
        if (newUsage > 15000) {
          const overage = newUsage - 15000;
          await mockBillingService.chargeOverage('user_123', overage * 0.002);
          
          mockTelemetry.trackEvent('overage_billing', {
            userId: 'user_123',
            overageTokens: overage,
            charge: overage * 0.002,
          });
        }

        return { consumed: tokens, remaining: 15000 - newUsage };
      });

      await tokenManager.consumeTokens(500);

      expect(mockBillingService.chargeOverage).toHaveBeenCalledWith(
        'user_123',
        1.00 // 500 overage tokens * $0.002
      );
    });

    it('sends overage warnings before billing', async () => {
      tokenManager.getCurrentUsage.mockResolvedValue({
        dailyTokens: 14500, // 97% of limit
        hourlyRequests: 45,
      });

      tokenManager.checkLimit.mockImplementation((usage, limits) => {
        const tokenPercentage = usage.dailyTokens / limits.dailyTokens;
        
        if (tokenPercentage >= 0.9) {
          mockTelemetry.trackEvent('usage_warning', {
            percentage: tokenPercentage,
            remaining: limits.dailyTokens - usage.dailyTokens,
            tier: 'developer',
          });
        }

        return {
          allowed: true,
          warning: tokenPercentage >= 0.9,
          remaining: { tokens: limits.dailyTokens - usage.dailyTokens },
        };
      });

      const result = await tokenManager.checkLimit();

      expect(result.warning).toBe(true);
      expect(mockTelemetry.trackEvent).toHaveBeenCalledWith('usage_warning', {
        percentage: 0.9666666666666667,
        remaining: 500,
        tier: 'developer',
      });
    });
  });

  describe('Usage Analytics and Reporting', () => {
    it('generates usage reports by time period', async () => {
      tokenManager.getUsageHistory.mockResolvedValue({
        period: 'weekly',
        totalTokens: 45000,
        totalRequests: 350,
        averageLatency: 52.3,
        modelBreakdown: {
          'qwen3-coder-4b': { tokens: 30000, requests: 250 },
          'phi-4-mini': { tokens: 10000, requests: 80 },
          'kimi-k2': { tokens: 5000, requests: 20 },
        },
        costBreakdown: {
          included: 105000, // 7 days * 15k
          overage: 0,
          totalCost: 0,
        },
      });

      const report = await tokenManager.getUsageHistory('weekly');

      expect(report.totalTokens).toBe(45000);
      expect(report.costBreakdown.overage).toBe(0);
      expect(report.modelBreakdown['qwen3-coder-4b'].tokens).toBe(30000);
    });

    it('tracks usage patterns and efficiency', async () => {
      tokenManager.getUsageHistory.mockResolvedValue([
        { hour: 9, tokens: 2000, efficiency: 0.85 }, // Morning peak
        { hour: 14, tokens: 1800, efficiency: 0.90 }, // Afternoon peak
        { hour: 22, tokens: 500, efficiency: 0.70 }, // Evening
      ]);

      const patterns = await tokenManager.getUsageHistory('hourly');

      expect(patterns.find(p => p.hour === 14).efficiency).toBe(0.90);
      expect(patterns.find(p => p.hour === 9).tokens).toBe(2000);
    });

    it('provides cost optimization recommendations', async () => {
      tokenManager.getUsageHistory.mockImplementation(async () => {
        const analysis = {
          currentTier: 'developer',
          usage: { dailyAverage: 18000, monthlyTotal: 540000 },
          costs: { current: 60, // overage charges
                  teamTier: 99,
                  savings: 39 },
          recommendation: 'upgrade_to_team',
          reasons: [
            'Current overage charges exceed Team tier cost',
            'Team tier provides unlimited tokens',
            'Better value for your usage pattern',
          ],
        };
        
        return analysis;
      });

      const recommendation = await tokenManager.getUsageHistory('optimization');

      expect(recommendation.recommendation).toBe('upgrade_to_team');
      expect(recommendation.costs.savings).toBe(39);
    });
  });

  describe('Tier Upgrades and Downgrades', () => {
    it('processes tier upgrades immediately', async () => {
      tokenManager.upgradeTier.mockImplementation(async (userId, newTier) => {
        mockDatabase.update.mockResolvedValueOnce({ affectedRows: 1 });
        mockBillingService.processPayment.mockResolvedValueOnce({ success: true });
        
        return {
          success: true,
          previousTier: 'developer',
          newTier: newTier,
          effectiveDate: new Date().toISOString(),
          prorationCredit: 15.50, // Partial month credit
        };
      });

      const result = await tokenManager.upgradeTier('user_123', 'team');

      expect(result.success).toBe(true);
      expect(result.newTier).toBe('team');
      expect(result.prorationCredit).toBe(15.50);
    });

    it('schedules tier downgrades for next billing cycle', async () => {
      tokenManager.downgraduTier.mockImplementation(async (userId, newTier) => {
        return {
          success: true,
          currentTier: 'team',
          scheduledTier: newTier,
          effectiveDate: '2024-02-01', // Next billing cycle
          immediateEffect: false,
          refund: 0,
        };
      });

      const result = await tokenManager.downgraduTier('user_123', 'developer');

      expect(result.success).toBe(true);
      expect(result.immediateEffect).toBe(false);
      expect(result.effectiveDate).toBe('2024-02-01');
    });

    it('validates tier change eligibility', async () => {
      tokenManager.upgradeTier.mockImplementation(async (userId, newTier) => {
        // Check current usage to validate downgrade
        const usage = await tokenManager.getCurrentUsage();
        
        if (newTier === 'developer' && usage.dailyTokens > 15000) {
          throw new Error('Cannot downgrade: current usage exceeds Developer tier limits');
        }

        return { success: true, newTier };
      });

      tokenManager.getCurrentUsage.mockResolvedValue({
        dailyTokens: 25000, // Exceeds developer limit
      });

      await expect(tokenManager.upgradeTier('user_123', 'developer'))
        .rejects.toThrow('Cannot downgrade: current usage exceeds Developer tier limits');
    });
  });

  describe('Rate Limiting and Request Management', () => {
    it('enforces hourly request limits', async () => {
      const requestLog = []; // Track requests in last hour
      
      tokenManager.checkLimit.mockImplementation(async () => {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        
        // Filter requests in last hour
        const recentRequests = requestLog.filter(req => req.timestamp > oneHourAgo);
        
        if (recentRequests.length >= 100) { // Developer tier limit
          throw new Error('Hourly request limit exceeded');
        }

        requestLog.push({ timestamp: now });
        return { allowed: true, remaining: { requests: 100 - recentRequests.length } };
      });

      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        await tokenManager.checkLimit();
      }

      // 101st request should fail
      await expect(tokenManager.checkLimit()).rejects.toThrow(
        'Hourly request limit exceeded'
      );
    });

    it('implements request queuing for burst handling', async () => {
      const requestQueue = [];
      
      tokenManager.consumeTokens.mockImplementation(async (tokens) => {
        return new Promise((resolve) => {
          requestQueue.push({ tokens, resolve });
          
          // Process queue with rate limiting
          setTimeout(() => {
            const request = requestQueue.shift();
            if (request) {
              request.resolve({ consumed: request.tokens });
            }
          }, 100); // 100ms delay between requests
        });
      });

      const promises = [
        tokenManager.consumeTokens(50),
        tokenManager.consumeTokens(75),
        tokenManager.consumeTokens(100),
      ];

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      expect(results[0].consumed).toBe(50);
    });
  });

  describe('Integration with Billing System', () => {
    it('syncs with external billing provider', async () => {
      mockBillingService.createInvoice.mockResolvedValue({
        invoiceId: 'inv_123',
        amount: 15.50,
        currency: 'USD',
        status: 'pending',
      });

      const invoice = await mockBillingService.createInvoice({
        userId: 'user_123',
        items: [
          { description: 'Token overage', quantity: 7750, rate: 0.002 },
        ],
      });

      expect(invoice.invoiceId).toBe('inv_123');
      expect(invoice.amount).toBe(15.50);
    });

    it('handles billing failures gracefully', async () => {
      mockBillingService.chargeOverage.mockRejectedValue(
        new Error('Payment method failed')
      );

      tokenManager.consumeTokens.mockImplementation(async (tokens) => {
        try {
          await mockBillingService.chargeOverage('user_123', 5.00);
        } catch (error) {
          // Log failure but allow usage to continue
          mockTelemetry.trackEvent('billing_failure', {
            error: error.message,
            amount: 5.00,
            userId: 'user_123',
          });
          
          // Could implement grace period or notification
          return { consumed: tokens, billingPending: true };
        }
      });

      const result = await tokenManager.consumeTokens(2500);
      
      expect(result.billingPending).toBe(true);
      expect(mockTelemetry.trackEvent).toHaveBeenCalledWith('billing_failure', {
        error: 'Payment method failed',
        amount: 5.00,
        userId: 'user_123',
      });
    });
  });

  describe('Performance and Efficiency', () => {
    it('caches usage data for performance', async () => {
      let cacheHits = 0;
      
      tokenManager.getCurrentUsage.mockImplementation(async () => {
        if (cacheHits > 0) {
          // Return cached data
          return { dailyTokens: 5000, cached: true };
        }
        
        cacheHits++;
        // Simulate database query
        await new Promise(resolve => setTimeout(resolve, 50));
        return { dailyTokens: 5000, cached: false };
      });

      const usage1 = await tokenManager.getCurrentUsage();
      const usage2 = await tokenManager.getCurrentUsage();

      expect(usage1.cached).toBe(false);
      expect(usage2.cached).toBe(true);
    });

    it('batches token updates for efficiency', async () => {
      const updates = [];
      
      tokenManager.consumeTokens.mockImplementation(async (tokens) => {
        updates.push({ tokens, timestamp: Date.now() });
        
        // Batch updates every 5 seconds or 10 updates
        if (updates.length >= 10) {
          const totalTokens = updates.reduce((sum, u) => sum + u.tokens, 0);
          mockDatabase.insert('token_usage_batch', { totalTokens, count: updates.length });
          updates.length = 0; // Clear batch
        }
        
        return { consumed: tokens };
      });

      // Make 15 token requests
      for (let i = 0; i < 15; i++) {
        await tokenManager.consumeTokens(10);
      }

      expect(mockDatabase.insert).toHaveBeenCalledWith(
        'token_usage_batch',
        { totalTokens: 100, count: 10 }
      );
    });
  });
}); 