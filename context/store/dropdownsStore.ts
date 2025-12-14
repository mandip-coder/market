import { Healthcare } from "@/app/(main)/healthcares/lib/types";
import { User } from "@/app/(main)/master/user-management/components/UserDataTable";
import { create } from "zustand";
import { Product } from "./productStore";

// Type definitions for dropdown items
export interface PersonalityTrait {
  personalityTraitsName: string;
  personalityTraitsUUID: string;
}

export interface LeadSource {
  leadSourceName: string;
  leadSourceUUID: string;
}

export interface Venue {
  venueName: string;
  venueUUID: string;
}


// Store interface
interface DropdownsStore {
  // Personality Traits
  personalityTraits: PersonalityTrait[];
  setPersonalityTraits: (traits: PersonalityTrait[]) => void;

  // Lead Sources
  leadSources: LeadSource[];
  setLeadSources: (sources: LeadSource[]) => void;

  // Venues
  venues: Venue[];
  setVenues: (venues: Venue[]) => void;

  // HCO Modules
  hcoList: Healthcare[];
  setHCOList: (modules: Healthcare[]) => void;

  usersList: User[];
  setUsersList: (usersList: User[]) => void;

  products: Product[];
  setProducts: (products: Product[]) => void;
}

// Create the store
export const useDropdownsStore = create<DropdownsStore>((set, get) => ({
  // Personality Traits state
  personalityTraits: [],
  setPersonalityTraits: (traits: PersonalityTrait[]) =>
    set({ personalityTraits: traits }),

  // Lead Sources state
  leadSources: [],
  setLeadSources: (sources: LeadSource[]) => set({ leadSources: sources }),

  // Venues state
  venues: [],
  setVenues: (venues: Venue[]) => set({ venues: venues }),

  // HCO Modules state
  hcoList: [],
  setHCOList: (hcoList: Healthcare[]) => set({ hcoList: hcoList }),

  usersList: [],
  setUsersList: (usersList: User[]) => set({ usersList: usersList }),

  products: [],
  setProducts: (products: Product[]) => set({ products: products }),
}));

