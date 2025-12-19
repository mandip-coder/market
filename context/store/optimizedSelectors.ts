// Optimized selector hooks for Zustand stores
// Use these instead of direct store access to prevent unnecessary re-renders

import { useCompanyStore } from './companyStore';
import { useDealStore } from './dealsStore';
import { useDropdownsStore } from './dropdownsStore';
import { useLeadStore } from './leadsStore';
import { useShallow } from 'zustand/react/shallow';

/**
 * Optimized selectors for deal store
 * These use shallow comparison to prevent re-renders when unrelated state changes
 */

// Select only view-related state
export const useDealViewState = () =>
  useDealStore(
    useShallow((state) => ({
      viewMode: state.viewMode,
      page: state.page,
      pageSize: state.pageSize,
      setPage: state.setPage,
      setPageSize: state.setPageSize,
      setHcoList: state.setHcoList,
      hcoList: state.hcoList,
    }))
  );
export const useCompanyModalStore = () =>
  useCompanyStore(
    useShallow((state) => ({
      addCompanyDrawer: state.addCompanyDrawer,
      toggleCompanyDrawer: state.toggleCompanyDrawer,
      editCompany: state.editCompany,
      setTableDataState: state.setTableDataState,
      setEditCompany: state.setEditCompany,
      rolesData: state.rolesData,
      productsData: state.productsData,
      setRolesData: state.setRolesData,
      setProductsData: state.setProductsData,
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

// Select only product-related state
export const useDealProducts = () =>
  useDealStore(
    useShallow((state) => ({
      selectedProducts: state.selectedProducts,
      productList: state.productList,
      addProduct: state.addProduct,
      removeProduct: state.removeProduct,
    }))
  );

// Select only timeline state
export const useDealTimeline = () =>
  useDealStore(
    useShallow((state) => ({
      timelineEvents: state.timelineEvents,
      addTimelineEvent: state.addTimelineEvent,
    }))
  );

// Select only HCO details
export const useDealHCO = () =>
  useDealStore(
    useShallow((state) => ({
      hcoDetails: state.hcoDetails,
      hcoList: state.hcoList,
      setHcoDetails: state.setHcoDetails,
    }))
  );

/**
 * Optimized selectors for lead store
 */

// Select only modal state
export const useLeadModal = () =>
  useLeadStore(
    useShallow((state) => ({
      leadModal: state.leadModal,
      toggleLeadDrawer: state.toggleLeadDrawer,
      suggestionId: state.suggestionId,
      preFilledData: state.preFilledData,
    }))
  );

export const useLeadDetailsTabs = () =>
  useLeadStore(
    useShallow((state) => ({
      calls: state.calls,
      emails: state.emails,
      attachments: state.attachments,
      followUps: state.followUps,
      setHcoUUID: state.setHcoUUID,
      setHcoName: state.setHcoName,
      setLeadUUID: state.setLeadUUID,
    }))
  );
export const useLeadFollowUps = () =>
  useLeadStore(
    useShallow((state) => ({
      followUps: state.followUps,
      addFollowUp: state.addFollowUp,
      updateFollowUp: state.updateFollowUp,
      completeFollowUp: state.completeFollowUp,
      cancelFollowUp: state.cancelFollowUp,
      rescheduleFollowUp: state.rescheduleFollowUp,
      deleteFollowUp: state.deleteFollowUp,
      contactPersons: state.contactPersons,
      setContactPersons: state.setContactPersons,
      leadUUID: state.leadUUID,
      hcoUUID: state.hcoUUID,
      hcoName: state.hcoName,
      setFollowUps: state.setFollowUps,
    
    }))
  );
export const useDealFollowUps=()=>useDealStore(
  useShallow((state)=>({
    followUps: state.followUps,
    addFollowUp: state.addFollowUp,
    updateFollowUp: state.updateFollowUp,
    completeFollowUp: state.completeFollowUp,
    cancelFollowUp: state.cancelFollowUp,
    rescheduleFollowUp: state.rescheduleFollowUp,
    deleteFollowUp: state.deleteFollowUp,
    contactPersons: state.contactPersons,
    setContactPersons: state.setContactPersons,
    dealUUID: state.dealUUID,
    hcoDetails: state.hcoDetails,
    setHcoDetails: state.setHcoDetails,
    setFollowUps: state.setFollowUps,
  }))
)

export const useLeadProducts = () =>
  useLeadStore(
    useShallow((state) => ({
      selectedProducts: state.selectedProducts,
      productList: state.productList,
      addProduct: state.addProduct,
      removeProduct: state.removeProduct,
    }))
  );
export const useDropDowns = () => useDropdownsStore(
  useShallow((state) => ({
    hcoList: state.hcoList,
    leadSources: state.leadSources,
    usersList: state.usersList,
    products: state.products,
    outcomes: state.outcomes,
    personalityTraits: state.personalityTraits,
  }))
)
export const useDropDownsSetters = () => useDropdownsStore(
  useShallow((state) => ({
    setHCOList: state.setHCOList,
    setLeadSources: state.setLeadSources,
    setUsersList: state.setUsersList,
    setProducts: state.setProducts,
    setOutcomes: state.setOutcomes,
    setPersonalityTraits: state.setPersonalityTraits,
  }))
)
export const useDealCallModalStore=()=>useDealStore(
  useShallow((state)=>({
    calls: state.calls,
    logCall: state.logCall,
    updateCall: state.updateCall,
    deleteCall: state.deleteCall,
    setCalls: state.setCalls,
    dealUUID: state.dealUUID,
  }))
)