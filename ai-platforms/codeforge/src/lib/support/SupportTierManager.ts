/**
 * Support Tier Management System
 * 
 * Manages support tiers with SLA enforcement:
 * - Developer: 48h response, 5 business days resolution, 9x5, Email/Community
 * - Team: 24h response, 3 business days resolution, 9x5, Email/Chat
 * - Enterprise: 4h response, 1 business day resolution, 24x7, Email/Chat/Phone
 * - G3D Enterprise: 1h response, 4h resolution, 24x7, Dedicated support team
 */

import { EventEmitter } from 'events';
import { SubscriptionTier } from '../billing/TokenManager';

export interface SupportTierConfig {
  tier: SubscriptionTier;
  name: string;
  responseTimeSLA: number; // hours
  resolutionTimeSLA: number; // hours
  availability: '9x5' | '24x7';
  channels: SupportChannel[];
  escalationEnabled: boolean;
  dedicatedSupport: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export enum SupportChannel {
  COMMUNITY = 'community',
  EMAIL = 'email',
  CHAT = 'chat',
  PHONE = 'phone',
  DEDICATED = 'dedicated'
}

export interface SupportTicket {
  id: string;
  userId: string;
  organizationId?: string;
  tier: SubscriptionTier;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  channel: SupportChannel;
  assignedAgent?: string;
  createdAt: Date;
  firstResponseAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  escalationLevel: number;
  slaBreached: boolean;
  tags: string[];
}

export interface SLAMetrics {
  responseTimeSLA: number;
  resolutionTimeSLA: number;
  actualResponseTime?: number;
  actualResolutionTime?: number;
  responseTimeRemaining?: number;
  resolutionTimeRemaining?: number;
  isResponseOverdue: boolean;
  isResolutionOverdue: boolean;
}

export interface SupportAgent {
  id: string;
  name: string;
  email: string;
  specializations: string[];
  availableChannels: SupportChannel[];
  maxConcurrentTickets: number;
  currentTickets: number;
  isAvailable: boolean;
  tier: 'standard' | 'senior' | 'lead' | 'dedicated';
}

export interface EscalationRule {
  fromTier: SubscriptionTier;
  triggerConditions: {
    responseTimeOverdue?: boolean;
    resolutionTimeOverdue?: boolean;
    customerRequested?: boolean;
    severityLevel?: 'high' | 'critical';
  };
  escalateTo: {
    tier?: 'senior' | 'lead' | 'dedicated';
    channel?: SupportChannel;
    notifyManagement?: boolean;
  };
  delayMinutes: number;
}

export interface SLAReport {
  tier: SubscriptionTier;
  period: string;
  totalTickets: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  slaComplianceRate: number;
  responseTimeCompliance: number;
  resolutionTimeCompliance: number;
  escalationRate: number;
  customerSatisfaction?: number;
}

export class SupportTierManager extends EventEmitter {
  private static instance: SupportTierManager;
  private tierConfigs: Map<SubscriptionTier, SupportTierConfig> = new Map();
  private tickets: Map<string, SupportTicket> = new Map();
  private agents: Map<string, SupportAgent> = new Map();
  private escalationRules: EscalationRule[] = [];

  public static getInstance(): SupportTierManager {
    if (!SupportTierManager.instance) {
      SupportTierManager.instance = new SupportTierManager();
    }
    return SupportTierManager.instance;
  }

  private constructor() {
    super();
    this.initializeTierConfigs();
    this.initializeEscalationRules();
    this.startSLAMonitoring();
  }

  private initializeTierConfigs(): void {
    // Developer Tier
    this.tierConfigs.set(SubscriptionTier.DEVELOPER, {
      tier: SubscriptionTier.DEVELOPER,
      name: 'Developer Support',
      responseTimeSLA: 48, // 48 hours
      resolutionTimeSLA: 120, // 5 business days (5 * 24 hours)
      availability: '9x5',
      channels: [SupportChannel.COMMUNITY, SupportChannel.EMAIL],
      escalationEnabled: false,
      dedicatedSupport: false,
      priority: 'low'
    });

    // Team Tier
    this.tierConfigs.set(SubscriptionTier.TEAM, {
      tier: SubscriptionTier.TEAM,
      name: 'Team Support',
      responseTimeSLA: 24, // 24 hours
      resolutionTimeSLA: 72, // 3 business days
      availability: '9x5',
      channels: [SupportChannel.EMAIL, SupportChannel.CHAT],
      escalationEnabled: true,
      dedicatedSupport: false,
      priority: 'medium'
    });

    // Enterprise Tier
    this.tierConfigs.set(SubscriptionTier.ENTERPRISE, {
      tier: SubscriptionTier.ENTERPRISE,
      name: 'Enterprise Support',
      responseTimeSLA: 4, // 4 hours
      resolutionTimeSLA: 24, // 1 business day
      availability: '24x7',
      channels: [SupportChannel.EMAIL, SupportChannel.CHAT, SupportChannel.PHONE],
      escalationEnabled: true,
      dedicatedSupport: false,
      priority: 'high'
    });

    // G3D Enterprise Tier
    this.tierConfigs.set(SubscriptionTier.G3D_ENTERPRISE, {
      tier: SubscriptionTier.G3D_ENTERPRISE,
      name: 'G3D Enterprise Support',
      responseTimeSLA: 1, // 1 hour
      resolutionTimeSLA: 4, // 4 hours
      availability: '24x7',
      channels: [SupportChannel.DEDICATED, SupportChannel.PHONE, SupportChannel.EMAIL, SupportChannel.CHAT],
      escalationEnabled: true,
      dedicatedSupport: true,
      priority: 'critical'
    });
  }

  private initializeEscalationRules(): void {
    this.escalationRules = [
      // Team tier escalation
      {
        fromTier: SubscriptionTier.TEAM,
        triggerConditions: {
          responseTimeOverdue: true
        },
        escalateTo: {
          tier: 'senior',
          notifyManagement: false
        },
        delayMinutes: 60
      },
      // Enterprise tier escalation
      {
        fromTier: SubscriptionTier.ENTERPRISE,
        triggerConditions: {
          responseTimeOverdue: true
        },
        escalateTo: {
          tier: 'senior',
          notifyManagement: true
        },
        delayMinutes: 30
      },
      // G3D Enterprise immediate escalation
      {
        fromTier: SubscriptionTier.G3D_ENTERPRISE,
        triggerConditions: {
          responseTimeOverdue: true
        },
        escalateTo: {
          tier: 'dedicated',
          notifyManagement: true
        },
        delayMinutes: 15
      },
      // Critical severity escalation
      {
        fromTier: SubscriptionTier.ENTERPRISE,
        triggerConditions: {
          severityLevel: 'critical'
        },
        escalateTo: {
          tier: 'lead',
          notifyManagement: true
        },
        delayMinutes: 0
      }
    ];
  }

  /**
   * Create a new support ticket
   */
  public async createTicket(
    userId: string,
    title: string,
    description: string,
    tier: SubscriptionTier,
    channel: SupportChannel,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    organizationId?: string
  ): Promise<SupportTicket> {
    const ticketId = this.generateTicketId();
    const tierConfig = this.tierConfigs.get(tier);

    if (!tierConfig) {
      throw new Error(`Invalid support tier: ${tier}`);
    }

    // Validate channel availability for tier
    if (!tierConfig.channels.includes(channel)) {
      throw new Error(`Channel ${channel} not available for ${tierConfig.name}`);
    }

    const ticket: SupportTicket = {
      id: ticketId,
      userId,
      ...(organizationId && { organizationId }),
      tier,
      title,
      description,
      priority,
      status: 'open',
      channel,
      createdAt: new Date(),
      escalationLevel: 0,
      slaBreached: false,
      tags: []
    };

    this.tickets.set(ticketId, ticket);

    // Auto-assign based on tier and channel
    await this.autoAssignTicket(ticket);

    // Start SLA tracking
    this.startSLATracking(ticket);

    this.emit('ticketCreated', ticket);
    return ticket;
  }

  /**
   * Update ticket status
   */
  public async updateTicketStatus(
    ticketId: string,
    status: 'open' | 'pending' | 'resolved' | 'closed',
    agentId?: string
  ): Promise<void> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    const oldStatus = ticket.status;
    ticket.status = status;

    // Track timestamps
    if (status === 'pending' && !ticket.firstResponseAt) {
      ticket.firstResponseAt = new Date();
    }

    if (status === 'resolved' && !ticket.resolvedAt) {
      ticket.resolvedAt = new Date();
    }

    if (status === 'closed' && !ticket.closedAt) {
      ticket.closedAt = new Date();
    }

    this.emit('ticketStatusUpdated', {
      ticket,
      oldStatus,
      newStatus: status,
      agentId,
      timestamp: new Date()
    });
  }

  /**
   * Calculate SLA metrics for a ticket
   */
  public calculateSLAMetrics(ticketId: string): SLAMetrics {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    const tierConfig = this.tierConfigs.get(ticket.tier)!;
    const now = new Date();

    // Calculate response time metrics
    const responseDeadline = new Date(
      ticket.createdAt.getTime() + (tierConfig.responseTimeSLA * 60 * 60 * 1000)
    );

    const actualResponseTime = ticket.firstResponseAt
      ? (ticket.firstResponseAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60)
      : undefined;

    const responseTimeRemaining = ticket.firstResponseAt
      ? 0
      : Math.max(0, (responseDeadline.getTime() - now.getTime()) / (1000 * 60 * 60));

    const isResponseOverdue = !ticket.firstResponseAt && now > responseDeadline;

    // Calculate resolution time metrics
    const resolutionDeadline = new Date(
      ticket.createdAt.getTime() + (tierConfig.resolutionTimeSLA * 60 * 60 * 1000)
    );

    const actualResolutionTime = ticket.resolvedAt
      ? (ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60)
      : undefined;

    const resolutionTimeRemaining = ticket.resolvedAt
      ? 0
      : Math.max(0, (resolutionDeadline.getTime() - now.getTime()) / (1000 * 60 * 60));

    const isResolutionOverdue = !ticket.resolvedAt && now > resolutionDeadline;

    const metrics: SLAMetrics = {
      responseTimeSLA: tierConfig.responseTimeSLA,
      resolutionTimeSLA: tierConfig.resolutionTimeSLA,
      responseTimeRemaining,
      resolutionTimeRemaining,
      isResponseOverdue,
      isResolutionOverdue
    };

    if (actualResponseTime !== undefined) {
      metrics.actualResponseTime = actualResponseTime;
    }

    if (actualResolutionTime !== undefined) {
      metrics.actualResolutionTime = actualResolutionTime;
    }

    return metrics;
  }

  /**
   * Get support tier configuration
   */
  public getTierConfig(tier: SubscriptionTier): SupportTierConfig | undefined {
    return this.tierConfigs.get(tier);
  }

  /**
   * Get all available channels for a tier
   */
  public getAvailableChannels(tier: SubscriptionTier): SupportChannel[] {
    const config = this.tierConfigs.get(tier);
    return config ? config.channels : [];
  }

  /**
   * Generate SLA report for a tier
   */
  public generateSLAReport(
    tier: SubscriptionTier,
    startDate: Date,
    endDate: Date
  ): SLAReport {
    const tickets = Array.from(this.tickets.values())
      .filter(ticket => 
        ticket.tier === tier &&
        ticket.createdAt >= startDate &&
        ticket.createdAt <= endDate
      );

    if (tickets.length === 0) {
      return {
        tier,
        period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        totalTickets: 0,
        avgResponseTime: 0,
        avgResolutionTime: 0,
        slaComplianceRate: 100,
        responseTimeCompliance: 100,
        resolutionTimeCompliance: 100,
        escalationRate: 0
      };
    }

    const tierConfig = this.tierConfigs.get(tier)!;
    const respondedTickets = tickets.filter(t => t.firstResponseAt);
    const resolvedTickets = tickets.filter(t => t.resolvedAt);
    const escalatedTickets = tickets.filter(t => t.escalationLevel > 0);

    // Calculate average response time
    const avgResponseTime = respondedTickets.length > 0
      ? respondedTickets.reduce((sum, ticket) => {
          const responseTime = (ticket.firstResponseAt!.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
          return sum + responseTime;
        }, 0) / respondedTickets.length
      : 0;

    // Calculate average resolution time
    const avgResolutionTime = resolvedTickets.length > 0
      ? resolvedTickets.reduce((sum, ticket) => {
          const resolutionTime = (ticket.resolvedAt!.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
          return sum + resolutionTime;
        }, 0) / resolvedTickets.length
      : 0;

    // Calculate compliance rates
    const responseTimeCompliant = respondedTickets.filter(ticket => {
      const responseTime = (ticket.firstResponseAt!.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
      return responseTime <= tierConfig.responseTimeSLA;
    }).length;

    const resolutionTimeCompliant = resolvedTickets.filter(ticket => {
      const resolutionTime = (ticket.resolvedAt!.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
      return resolutionTime <= tierConfig.resolutionTimeSLA;
    }).length;

    const responseTimeCompliance = respondedTickets.length > 0
      ? (responseTimeCompliant / respondedTickets.length) * 100
      : 100;

    const resolutionTimeCompliance = resolvedTickets.length > 0
      ? (resolutionTimeCompliant / resolvedTickets.length) * 100
      : 100;

    const slaComplianceRate = (responseTimeCompliance + resolutionTimeCompliance) / 2;
    const escalationRate = (escalatedTickets.length / tickets.length) * 100;

    return {
      tier,
      period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      totalTickets: tickets.length,
      avgResponseTime,
      avgResolutionTime,
      slaComplianceRate,
      responseTimeCompliance,
      resolutionTimeCompliance,
      escalationRate
    };
  }

  private async autoAssignTicket(ticket: SupportTicket): Promise<void> {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => 
        agent.isAvailable &&
        agent.availableChannels.includes(ticket.channel) &&
        agent.currentTickets < agent.maxConcurrentTickets
      )
      .sort((a, b) => a.currentTickets - b.currentTickets);

    if (availableAgents.length > 0) {
      const assignedAgent = availableAgents[0];
      ticket.assignedAgent = assignedAgent.id;
      assignedAgent.currentTickets++;
      
      this.emit('ticketAssigned', {
        ticket,
        agent: assignedAgent,
        timestamp: new Date()
      });
    }
  }

  private startSLATracking(ticket: SupportTicket): void {
    const tierConfig = this.tierConfigs.get(ticket.tier)!;

    // Set response time alert
    setTimeout(() => {
      if (!ticket.firstResponseAt) {
        ticket.slaBreached = true;
        this.handleSLABreach(ticket, 'response');
      }
    }, tierConfig.responseTimeSLA * 60 * 60 * 1000);

    // Set resolution time alert
    setTimeout(() => {
      if (!ticket.resolvedAt) {
        ticket.slaBreached = true;
        this.handleSLABreach(ticket, 'resolution');
      }
    }, tierConfig.resolutionTimeSLA * 60 * 60 * 1000);
  }

  private handleSLABreach(ticket: SupportTicket, type: 'response' | 'resolution'): void {
    this.emit('slaBreached', {
      ticket,
      breachType: type,
      timestamp: new Date()
    });

    // Trigger escalation if enabled
    const tierConfig = this.tierConfigs.get(ticket.tier)!;
    if (tierConfig.escalationEnabled) {
      this.triggerEscalation(ticket, type);
    }
  }

  private triggerEscalation(ticket: SupportTicket, reason: 'response' | 'resolution'): void {
    const applicableRules = this.escalationRules.filter(rule => 
      rule.fromTier === ticket.tier &&
      ((reason === 'response' && rule.triggerConditions.responseTimeOverdue) ||
       (reason === 'resolution' && rule.triggerConditions.resolutionTimeOverdue))
    );

    for (const rule of applicableRules) {
      setTimeout(() => {
        ticket.escalationLevel++;
        
        this.emit('ticketEscalated', {
          ticket,
          rule,
          escalationLevel: ticket.escalationLevel,
          timestamp: new Date()
        });
      }, rule.delayMinutes * 60 * 1000);
    }
  }

  private startSLAMonitoring(): void {
    // Check for SLA breaches every 5 minutes
    setInterval(() => {
      this.checkSLAStatus();
    }, 5 * 60 * 1000);
  }

  private checkSLAStatus(): void {
    const activeTickets = Array.from(this.tickets.values())
      .filter(ticket => ticket.status === 'open' || ticket.status === 'pending');

    for (const ticket of activeTickets) {
      const metrics = this.calculateSLAMetrics(ticket.id);
      
      if (metrics.isResponseOverdue && !ticket.firstResponseAt && !ticket.slaBreached) {
        this.handleSLABreach(ticket, 'response');
      }
      
      if (metrics.isResolutionOverdue && !ticket.resolvedAt && !ticket.slaBreached) {
        this.handleSLABreach(ticket, 'resolution');
      }
    }
  }

  private generateTicketId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `CFG-${timestamp}-${random}`.toUpperCase();
  }
}

export default SupportTierManager; 