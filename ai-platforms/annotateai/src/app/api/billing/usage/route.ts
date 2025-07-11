import { NextRequest, NextResponse } from 'next/server';
import { getBillingInfo, PRICING_PLANS } from '@/lib/billing/stripe';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    
    // TODO: Get user from session/auth
    const userId = 'user_123';
    const customerId = 'cus_123';
    
    // Mock current usage - replace with actual usage tracking
    const currentUsage = {
      annotations: 5432,
      aiInference: 234,
      storage: 2.5 * 1024 * 1024 * 1024, // 2.5GB in bytes
      projects: 7,
      teamMembers: 2,
    };

    // Get billing information to determine plan limits
    const billingInfo = await getBillingInfo(customerId, currentUsage);
    
    // Generate mock daily usage data based on period
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const dailyUsage = Array.from({ length: days }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - index - 1));
      
      // Generate realistic usage patterns with some randomness
      const baseAnnotations = currentUsage.annotations / days;
      const baseAI = currentUsage.aiInference / days;
      const baseStorage = currentUsage.storage / (1024 * 1024 * 1024) / days;
      
      return {
        date: date.toISOString(),
        annotations: Math.floor(baseAnnotations * (0.7 + Math.random() * 0.6)),
        aiInference: Math.floor(baseAI * (0.7 + Math.random() * 0.6)),
        storage: baseStorage * (0.8 + Math.random() * 0.4),
      };
    });

    // Calculate trends (percentage change from previous period)
    const previousPeriodUsage = {
      annotations: currentUsage.annotations * (0.85 + Math.random() * 0.3),
      aiInference: currentUsage.aiInference * (0.85 + Math.random() * 0.3),
      storage: currentUsage.storage * (0.85 + Math.random() * 0.3),
      projects: currentUsage.projects,
    };

    const calculateTrend = (current: number, previous: number) => {
      return ((current - previous) / previous) * 100;
    };

    // Create usage metrics with plan limits
    const metrics = [
      {
        name: 'Annotations',
        current: currentUsage.annotations,
        limit: typeof (billingInfo.plan.features as any).annotations === 'string' && (billingInfo.plan.features as any).annotations === 'Unlimited' ? -1 : (billingInfo.plan.features as any).annotations,
        unit: 'count',
        trend: calculateTrend(currentUsage.annotations, previousPeriodUsage.annotations),
        icon: 'annotations',
        color: 'cyan',
      },
      {
        name: 'AI Inference',
        current: currentUsage.aiInference,
        limit: typeof (billingInfo.plan.features as any).aiInference === 'string' && (billingInfo.plan.features as any).aiInference === 'Unlimited' ? -1 : (billingInfo.plan.features as any).aiInference,
        unit: 'calls',
        trend: calculateTrend(currentUsage.aiInference, previousPeriodUsage.aiInference),
        icon: 'ai',
        color: 'purple',
      },
      {
        name: 'Storage',
        current: currentUsage.storage / (1024 * 1024 * 1024), // Convert to GB
        limit: (() => {
          const storageStr = (billingInfo.plan.features as any).storage as string;
          if (storageStr === 'Unlimited') return -1;
          const match = storageStr.match(/(\d+)(\w+)/);
          if (!match) return 0;
          const [, num, unit] = match;
          const multiplier = unit === 'TB' ? 1000 : unit === 'GB' ? 1 : 0.001;
          return parseInt(num) * multiplier;
        })(),
        unit: 'GB',
        trend: calculateTrend(currentUsage.storage, previousPeriodUsage.storage),
        icon: 'storage',
        color: 'indigo',
      },
      {
        name: 'Projects',
        current: currentUsage.projects,
        limit: typeof (billingInfo.plan.features as any).projects === 'string' && (billingInfo.plan.features as any).projects === 'Unlimited' ? -1 : (billingInfo.plan.features as any).projects,
        unit: 'count',
        trend: calculateTrend(currentUsage.projects, previousPeriodUsage.projects),
        icon: 'projects',
        color: 'emerald',
      },
    ];

    // Calculate predictions for the rest of the month
    const daysInMonth = new Date().getDate();
    const totalDaysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const remainingDays = totalDaysInMonth - daysInMonth;
    
    const avgDailyAnnotations = dailyUsage.slice(-7).reduce((sum, day) => sum + day.annotations, 0) / 7;
    const avgDailyAI = dailyUsage.slice(-7).reduce((sum, day) => sum + day.aiInference, 0) / 7;
    const avgDailyStorage = dailyUsage.slice(-7).reduce((sum, day) => sum + day.storage, 0) / 7;

    const predictions = {
      annotationsThisMonth: currentUsage.annotations + (avgDailyAnnotations * remainingDays),
      aiInferenceThisMonth: currentUsage.aiInference + (avgDailyAI * remainingDays),
      storageThisMonth: (currentUsage.storage / (1024 * 1024 * 1024)) + (avgDailyStorage * remainingDays),
      estimatedOverage: 0, // Calculate based on plan limits and predicted usage
    };

    // Calculate estimated overage costs
    const annotationLimit = metrics[0].limit;
    const aiLimit = metrics[1].limit;
    const storageLimit = metrics[2].limit;

    let overage = 0;
    if (annotationLimit !== -1 && predictions.annotationsThisMonth > annotationLimit) {
      overage += (predictions.annotationsThisMonth - annotationLimit) * 0.001; // $0.001 per extra annotation
    }
    if (aiLimit !== -1 && predictions.aiInferenceThisMonth > aiLimit) {
      overage += (predictions.aiInferenceThisMonth - aiLimit) * 0.01; // $0.01 per extra AI call
    }
    if (storageLimit !== -1 && predictions.storageThisMonth > storageLimit) {
      overage += (predictions.storageThisMonth - storageLimit) * 0.10; // $0.10 per extra GB
    }

    predictions.estimatedOverage = overage;

    const usageData = {
      period,
      metrics,
      dailyUsage,
      predictions,
    };

    return NextResponse.json(usageData);
  } catch (error) {
    console.error('Error fetching usage data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, metric, value } = await request.json();
    
    // TODO: Get user from session/auth
    const userId = 'user_123';
    
    switch (action) {
      case 'track_usage':
        return await handleTrackUsage(userId, metric, value);
      case 'reset_usage':
        return await handleResetUsage(userId, metric);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing usage action:', error);
    return NextResponse.json(
      { error: 'Failed to process usage action' },
      { status: 500 }
    );
  }
}

async function handleTrackUsage(userId: string, metric: string, value: number) {
  try {
    // TODO: Implement actual usage tracking
    // This would typically involve:
    // 1. Validate the metric and value
    // 2. Store usage data in database
    // 3. Update aggregated usage counters
    // 4. Check for quota limits
    // 5. Trigger alerts if necessary
    
    return NextResponse.json({
      success: true,
      message: 'Usage tracked successfully',
      usage: {
        metric,
        value,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error tracking usage:', error);
    throw error;
  }
}

async function handleResetUsage(userId: string, metric: string) {
  try {
    // TODO: Implement usage reset (for new billing periods)
    // This would typically involve:
    // 1. Archive current usage data
    // 2. Reset counters for the new period
    // 3. Update billing cycle information
    
    return NextResponse.json({
      success: true,
      message: 'Usage reset successfully',
      resetMetric: metric,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error resetting usage:', error);
    throw error;
  }
} 