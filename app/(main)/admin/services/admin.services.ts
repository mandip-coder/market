import {
  AnalyticsCharts,
  AnalyticsKPI,
  UserPerformance,
  User,
  urls,
  DealsByStage,
  LeadsVsDealsData,
} from "./types";
import { apiClient } from "@/lib/apiClient/apiClient";

export interface AnalyticsParams {
  startDate?: string;
  endDate?: string;
}

export const fetchAnalyticsOverview = async (
  params: AnalyticsParams
): Promise<AnalyticsKPI> => {
  // Build query string with fromDate and toDate
  const queryParams = new URLSearchParams();
  
  if (params.startDate) {
    queryParams.append('fromDate', params.startDate.split('T')[0]); // Extract date only (YYYY-MM-DD)
  }
  
  if (params.endDate) {
    queryParams.append('toDate', params.endDate.split('T')[0]); // Extract date only (YYYY-MM-DD)
  }
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `${urls.GLOBALSUMMARY}?${queryString}` : urls.GLOBALSUMMARY;
  
  const response = await apiClient.get<{ data: AnalyticsKPI }>(endpoint);
  return response.data;
};


export const fetchDealSummary = async (
  params: AnalyticsParams
): Promise<DealsByStage[]> => {
  // Build query string with fromDate and toDate
  const queryParams = new URLSearchParams();
  
  if (params.startDate) {
    queryParams.append('fromDate', params.startDate.split('T')[0]); // Extract date only (YYYY-MM-DD)
  }
  
  if (params.endDate) {
    queryParams.append('toDate', params.endDate.split('T')[0]); // Extract date only (YYYY-MM-DD)
  }
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `${urls.DEALSUMMARY}?${queryString}` : urls.DEALSUMMARY;
  
  const response = await apiClient.get<{ data: DealsByStage[] }>(endpoint);
  return response.data;
};

// TODO: Replace with actual API endpoint when available
export const fetchLeadsVsDeals = async (
  params: AnalyticsParams
): Promise<LeadsVsDealsData[]> => {
  // Mock data for now - replace with actual API call when endpoint is available
  return new Promise((resolve) => {
    setTimeout(() => {
      const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split("T")[0];
      });

      resolve(
        dates.map((date) => ({
          date,
          leads: Math.floor(Math.random() * 50) + 100,
          deals: Math.floor(Math.random() * 20) + 5,
        }))
      );
    }, 500);
  });
};

export const fetchUserPerformance = async (
  params: AnalyticsParams
): Promise<UserPerformance[]> => {
  // Build query string with fromDate and toDate
  const queryParams = new URLSearchParams();
  
  if (params.startDate) {
    queryParams.append('fromDate', params.startDate.split('T')[0]); // Extract date only (YYYY-MM-DD)
  }
  
  if (params.endDate) {
    queryParams.append('toDate', params.endDate.split('T')[0]); // Extract date only (YYYY-MM-DD)
  }
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `${urls.USERPERFORMANCE}?${queryString}` : urls.USERPERFORMANCE;
  
  const response = await apiClient.get<{ data: UserPerformance[] }>(endpoint);
  return response.data;
};

export const fetchUserDetail = async (userId: string): Promise<User> => {
  // This would likely fetch the full user object with the extra stats defined in User interface
  // return API.get(`${APIPATH.USERS.GET}/${userId}`);
  // Mocking a single user based on the User interface from types.ts
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: userId,
        name: "John Doe",
        role: "Sales Representative",
        email: "john.doe@example.com",
        phone: "+1 234 567 8900",
        leadsHandled: 150,
        dealsClosed: 45,
        performanceLevel: "High",
        performanceScore: 92,
        winRate: 30,
        avgCloseTime: 12,
        callsMade: 320,
        emailsSent: 450,
        meetingsHeld: 85,
        followUpsCompleted: 120,
        samplesDistributed: 50,
        presentationsGiven: 30,
        productsPromoted: ["CardioFix", "NeuroCalm"],
        hospitalsCovered: 12,
        doctorsReached: 45,
        clinicsVisited: 20,
        pharmaciesCovered: 15,
        dealsByCategory: [
          { category: "Cardiology", count: 20 },
          { category: "Neurology", count: 25 },
        ],
        dealsByClientType: [
          { type: "Hospital", count: 30 },
          { type: "Clinic", count: 15 },
        ],
        monthlyPerformance: [],
        customerSatisfaction: 4.8,
        repeatCustomers: 15,
        avgResponseTime: 2,
        monthlyLeadGoal: 50,
        monthlyDealGoal: 10,
        monthlyActivityGoal: 100,
        goalProgress: 85,
        pipeline: [{ stage: "Negotiation", count: 5 }],
        activityTimeline: [],
        callLogs: [],
        emailLogs: [],
        meetingLogs: [],
        followUpTasks: [],
      } as any); // Casting as any because the User interface is very large and I don't want to mock every single array field perfectly for the initial scaffold
    }, 300);
  });
};
