import { useShallow } from 'zustand/react/shallow';
import { useCompanyStore } from './companyStore';
import { useDealStore } from './dealsStore';
import { useLeadStore } from './leadsStore';

export const useDealViewState = () =>
  useDealStore(
    useShallow((state) => ({
      viewMode: state.viewMode,
      page: state.page,
      pageSize: state.pageSize,
      setPage: state.setPage,
      setPageSize: state.setPageSize,
    }))
  );
export const useCompanyModalStore = () =>
  useCompanyStore(
    useShallow((state) => ({
      addCompanyDrawer: state.addCompanyDrawer,
      toggleCompanyDrawer: state.toggleCompanyDrawer,
      editCompany: state.editCompany,
      setEditCompany: state.setEditCompany,
    }))
  )


export const useLeadViewState = () =>
  useLeadStore(
    useShallow((state) => ({
      page: state.page,
      pageSize: state.pageSize,
      setPage: state.setPage,
      setPageSize: state.setPageSize,
    }))
  );

export const useLeadModal = () =>
  useLeadStore(
    useShallow((state) => ({
      leadModal: state.leadModal,
      toggleLeadDrawer: state.toggleLeadDrawer,
      preFilledData: state.preFilledData,
      recommendationUUID: state.recommendationUUID,
      setRecommendationUUID: state.setRecommendationUUID,
      clearRecommendationUUID: state.clearRecommendationUUID,
    }))
  );


