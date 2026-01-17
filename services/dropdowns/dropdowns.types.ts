
// Type definitions for dropdown items
export interface PersonalityTrait {
  personalityTraitsName: string;
  personalityTraitsUUID: string;
}

export interface LeadSource {
  leadSourceName: string;
  leadSourceUUID: string;
}

export interface Outcome {
  outcomeName: string;
  outcomeUUID: string;
}

export interface HCOType {
  hcoTypeName: string;
  hcoTypeUUID: string;
}

export interface Country {
  countryName: string;
  countryUUID: string;
}
export interface State {
  stateName: string;
  stateUUID: string;
}
export interface City {
  cityName: string;
  cityUUID: string;
}
export interface User{
  userUUID:string;
  fullName:string;
  email:string;
}
export interface Product {
  productUUID: string;
  productName: string;
}
export interface Healthcare {
  hcoUUID: string;
  hcoName: string;
  icbUUID: string;
}

export interface Company {
  companyUUID: string;
  displayName: string;
  roles: {
    roleUUID: string;
    roleName: string;
    description: string;
    roleCode: string;
    isSystemRole: boolean;
    status: "active" | "inactive";
  }[];
}

export interface Role {
  roleUUID: string;
  roleName: string;
}
export interface TherapeuticArea {
  therapeuticArea: string;
  therapeuticAreaUUID: string;
}
export interface RegionalOffice {
  regionalOfficeName: string;
  regionalOfficeCode: string;
}
export interface ICB {
  icbName: string;
  icbCode: string;
}
export interface ICBWithUUID extends ICB {
  icbUUID: string;
  regionUUID: string;
  hcoTypeUUID: string;
}
export interface LossReason {
  lossReasonName: string;
  lossReasonUUID: string;
}
export interface DealStage {
  dealStageName: string;
  dealStageUUID: string;
}
export interface ProductDocumentCategory {
  documentcategoryName: string;
  documentcategoryUUID: string;
}
export interface HCOService {
  hcoServiceName: string;
  hcoServiceUUID: string;
}
export interface Region {
  regionName: string;
  regionUUID: string;
}
