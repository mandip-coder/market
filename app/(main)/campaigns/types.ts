export interface CampaignFilters {
    regionsUUID?: string[];
    ICBsUUID?: string[];
    HCOsUUID?: string[];
}

export interface CampaignDocument {
    filename: string;
    url: string;
    filePath: string;
    size: number;
    mimeType: string;
}

export interface CampaignProduct {
    productUUID: string;
    productName: string;
}

export interface CampaignContactPerson {
    contactPersonUUID:  string;
    contactPersonName: string;
    email:string;
}

export interface CampaignUser {
    userUUID: string;
   userName: string;
   email: string;
}

export interface CreateCampaignsPayload {
    title: string;
    fromMail: string;
    subject: string;
    contactPersonIds: string[];
    cc: string[];
    bcc: string[];
    body: string;
    isSend: boolean;
    followupReason: string;
    parentUUID: string | null;
    filters: CampaignFilters;
    document: CampaignDocument[];
    productsUUID: string[];
}

export interface Campaign {
    massmailUUID: string;
    fromMail: string;
    subject: string;
    body: string;
    isSend: boolean;
    title: string;
    parentUUID: string | null;
    status: string;
    filters: CampaignFilters;
    document: CampaignDocument[];
    products: CampaignProduct[];
    contactPersons: CampaignContactPerson[];
    ccUsers: CampaignUser[];
    bccUsers: CampaignUser[];
    createdOn: string;
    createdBy: string;
    createdByUUID: string;
    updatedOn: string;
    updatedBy: string;
    updatedByUUID: string;
}

export interface CampaignResponse<T> {
    success: boolean;
    message: string;
    data: T;
}


export interface ColumnItems {
    label: string;
    value: string;
    hcoTypeUUID?: string;
}

export interface ContactPerson {
    hcoContactUUID: string;
    fullName: string;
    role: string;
    email: string;
    phone: string;
    unsubscribe: boolean;
}