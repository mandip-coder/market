export const urls={
    USERPERFORMANCE:"analytics/user-performance",
    GLOBALSUMMARY:"analytics/global-summary",
    DEALSUMMARY:"analytics/deal-summary",
}

export interface User {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar?: string;
  leadsHandled: number;
  dealsClosed: number;
  performanceLevel: "High" | "Medium" | "Low";
  performanceScore: number;
  winRate: number;
  avgCloseTime: number;
  // Activity metrics
  callsMade: number;
  emailsSent: number;
  meetingsHeld: number;
  followUpsCompleted: number;
  samplesDistributed: number;
  presentationsGiven: number;
  // Product and customer metrics
  productsPromoted: string[];
  hospitalsCovered: number;
  doctorsReached: number;
  clinicsVisited: number;
  pharmaciesCovered: number;
  // Performance breakdown
  dealsByCategory: { category: string; count: number }[];
  dealsByClientType: { type: string; count: number }[];
  monthlyPerformance: {
    month: string;
    leads: number;
    deals: number;
    activities: number;
  }[];
  // Customer metrics
  customerSatisfaction: number;
  repeatCustomers: number;
  avgResponseTime: number; // in hours
  // Goals and targets
  monthlyLeadGoal: number;
  monthlyDealGoal: number;
  monthlyActivityGoal: number;
  goalProgress: number;
  pipeline: {
    stage: string;
    count: number;
  }[];
  activityTimeline: {
    type:
      | "lead_created"
      | "deal_assigned"
      | "deal_updated"
      | "deal_closed"
      | "meeting"
      | "call"
      | "email"
      | "followup"
      | "sample_distributed"
      | "presentation";
    description: string;
    date: string;
    relatedTo?: string; // Lead or Deal name
  }[];
  callLogs: {
    id: string;
    date: string;
    clientName: string;
    clientType: "Doctor" | "Hospital" | "Clinic" | "Pharmacy";
    duration: number; // in minutes
    purpose: string;
    outcome: string;
    nextAction?: string;
  }[];
  emailLogs: {
    id: string;
    date: string;
    recipient: string;
    subject: string;
    status: "Sent" | "Opened" | "Replied";
  }[];
  meetingLogs: {
    id: string;
    date: string;
    clientName: string;
    attendees: number;
    topic: string;
    productsDiscussed: string[];
    followUpRequired: boolean;
  }[];
  followUpTasks: {
    id: string;
    dueDate: string;
    clientName: string;
    task: string;
    status: "Pending" | "Completed" | "Overdue";
    priority: "High" | "Medium" | "Low";
  }[];
}

export interface AnalyticsKPI {
  totalLeads: number;
  totalDeals: number;
  winRate: number;
  avgDealCloseTime: number;
  activeUsers: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  category?: string;
}

export interface DealsByStage {
  stage: string;
  total: number;
}

export interface LeadsVsDealsData {
  date: string;
  leads: number;
  deals: number;
}

export interface AnalyticsCharts {
  leadsVsDeals: LeadsVsDealsData[];
  dealsByStage: DealsByStage[];
}

export interface UserPerformance {
  // User Information
  userUUID: string;
  fullName: string;
  initial: string;
  role: string;
  userProfileImage: string | null;
  winRate: number;
  status: "Good" | "Needs Attention";
  massEmails: number;
  leads: {
    total: number;
    callsMade: number;
    meetingsHeld: number;
    followUps: number;
  };

  deals: {
    total: number;
    productsPromoted: number;
    followUps: number;
    callsMade: number;
    meetingsHeld: number;
    wonDeals: number;
    lostDeals: number;
  };

  healthcare: number;
  icbs: number;
  totalPersonsApproached: number;
  
}
