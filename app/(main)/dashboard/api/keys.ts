export const dashboardKeys = {
  all: ['dashboard'] as const,
  kpi: () => [...dashboardKeys.all, 'kpi'] as const,
  topProducts: () => [...dashboardKeys.all, 'topProducts'] as const,
  dealStages: () => [...dashboardKeys.all, 'dealStages'] as const,
}
