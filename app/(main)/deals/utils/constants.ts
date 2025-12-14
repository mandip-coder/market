import { Stage, stages } from "../../../../lib/types";

export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const stageOptions: { value: stages; label: string; defaultProbability: number }[] = [
  { value: Stage.DISCUSSION, label: 'Discussion', defaultProbability: 25 },
  { value: Stage.NEGOTIATION, label: 'Negotiation', defaultProbability: 60 },
  { value: Stage.CLOSED_WON, label: 'Closed Won', defaultProbability: 100 },
  { value: Stage.CLOSED_LOST, label: 'Closed Lost', defaultProbability: 0 }
];

export const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'].map((option) => ({ 
  value: option, 
  label: option 
}));

export const statusOptions = ['Overdue', 'Open', 'Closed', 'Waiting for Input'].map((status) => ({ 
  value: status, 
  label: status 
}));

export const outcomeOptions = [
  { value: "No Interest", label: "No Interest" },
  { value: "No Response (1 Month Chase)", label: "No Response (1 Month Chase)" },
  { value: "Require Further Information", label: "Require Further Information" },
  { value: "Another Supplier Contract", label: "Another Supplier Contract" },
  { value: "Non Formulary", label: "Non Formulary" },
  { value: "Switch Consideration", label: "Switch Consideration" },
  { value: "Approved Switch", label: "Approved Switch" }
];

export const reminderOptions = [
  { value: "Email", label: "Email" },
  { value: "Notification", label: "Notification" },
  { value: "None", label: "None" }
];