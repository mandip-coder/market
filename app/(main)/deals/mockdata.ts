import { Product } from '@/context/store/productStore';
import { TimelineEvent } from './components/TimelineComponent';
import { HCOContactPerson } from '@/components/AddNewContactModal/AddNewContactModal';


export const mockProducts:Partial<Product>[] = [
  { productUUID: "1", productName: "APOZYL 10mg OD Tabs 28s", productCode: "APOZYL 10mg OD Tabs 28s", therapeuticArea: "Cardiology", },
  { productUUID: "2", productName: "APOZYL 5mg OD Tabs 28s", productCode: "APOZYL 5mg OD Tabs 28s", therapeuticArea: "Cardiology", },
  { productUUID: "3", productName: "Elozar 10mg OD Tabs 28s", productCode: "Elozar 10mg OD Tabs 28s", therapeuticArea: "Cardiology", },
  { productUUID: "4", productName: "Elozar 15mg OD Tabs 28s", productCode: "Elozar 15mg OD Tabs 28s", therapeuticArea: "Cardiology", },
  { productUUID: "5", productName: "Enalto 10mg OD Tabs 28s", productCode: "Enalto 10mg OD Tabs 28s", therapeuticArea: "Cardiology", },
  { productUUID: "6", productName: "Enalto 20mg OD Tabs 28s", productCode: "Enalto 20mg OD Tabs 28s", therapeuticArea: "Cardiology", },
  { productUUID: "7", productName: "Enalto 5mg OD Tabs 28s", productCode: "Enalto 5mg OD Tabs 28s", therapeuticArea: "Cardiology", },
  { productUUID: "8", productName: "Epzit 10 mg OD Tabs (Domperidone) 30s", productCode: "Epzit 10 mg OD Tabs (Domperidone) 30s", therapeuticArea: "Cardiology", },
  { productUUID: "9", productName: "Mentino 10 mg OD tabs 28s", productCode: "Mentino 10 mg OD tabs 28s", therapeuticArea: "Cardiology", },
  { productUUID: "10", productName: "Mentino 20 mg OD tabs 28s", productCode: "Mentino 20 mg OD tabs 28s", therapeuticArea: "Cardiology", },
  { productUUID: "11", productName: "Propranolol hyd 10mg OD Tab 28s", productCode: "Propranolol hyd 10mg OD Tab 28s", therapeuticArea: "Cardiology", }, 
  { productUUID: "12", productName: "Propranolol hyd 40mg OD Tab 28s", productCode: "Propranolol hyd 40mg OD Tab 28s", therapeuticArea: "Cardiology", },
  { productUUID: "13", productName: "ROSUVASTATIN 10MG OD Tabs 28s (Enebium)", productCode: "ROSUVASTATIN 10MG OD Tabs 28s (Enebium)", therapeuticArea: "Cardiology", },
  { productUUID: "14", productName: "ROSUVASTATIN 5MG OD Tabs 28s (Enebium)", productCode: "ROSUVASTATIN 5MG OD Tabs 28s (Enebium)", therapeuticArea: "Cardiology", },
  { productUUID: "15", productName: "Zalzo 10 mg Orodispersible Tablets", productCode: "Zalzo 10 mg Orodispersible Tablets", therapeuticArea: "Cardiology", },
  { productUUID: "16", productName: "Zalzo 5 mg Orodispersible Tablets 28s", productCode: "Zalzo 5 mg Orodispersible Tablets 28s", therapeuticArea: "Cardiology", },
];

export const mockContacts:Partial<HCOContactPerson>[] = [
  { hcoContactUUID: "1", fullName: "John Smith", email: "john.smith@techcorp.com", role: "CTO",rating: 4,remarks: "John is a very good person" },
  { hcoContactUUID: "2", fullName: "Mary Chen", email: "mary.chen@techcorp.com", role: "VP Engineering",rating: 3,remarks: "Mary is a very good person" },
  { hcoContactUUID: "3", fullName: "Robert Kumar", email: "robert.kumar@techcorp.com", role: "Director IT",rating: 5,remarks: "Robert is a very good person" },
];

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: 1,
    type: "Stage Change",
    title: "Stage changed to Discussion",
    description: "Deal stage updated from Initial Contact to Discussion",
    timestamp: "2024-10-15T16:45:00",
    user: "Sarah Johnson",
    color: "blue",
    details: {
      previousStage: "Initial Contact",
      newStage: "Discussion",
      probability: 75
    }
  },
  {
    id: 2,
    type: "Meeting",
    title: "Meeting scheduled",
    description: "Face-to-face meeting with TechCorp Solutions",
    timestamp: "2024-10-15T14:30:00",
    user: "Sarah Johnson",
    color: "purple"
  },
  {
    id: 3,
    type: "Note",
    title: "Added note about client requirements",
    description: "Client specifically needs cloud scalability and security features",
    timestamp: "2024-10-14T11:20:00",
    user: "Sarah Johnson",
    color: "gray"
  },
  {
    id: 4,
    type: "Email",
    title: "Sent proposal overview",
    description: "Email sent to John Smith with initial proposal overview",
    timestamp: "2024-10-12T09:15:00",
    user: "Sarah Johnson",
    color: "green"
  },
  {
    id: 5,
    type: "Call",
    title: "Initial discovery call",
    description: "30-minute call to understand client requirements",
    timestamp: "2024-10-10T14:00:00",
    user: "Sarah Johnson",
    color: "blue"
  }
];