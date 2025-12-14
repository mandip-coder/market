import { Healthcare } from "@/app/(main)/healthcares/lib/types";
import { create } from "zustand";

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



}));
