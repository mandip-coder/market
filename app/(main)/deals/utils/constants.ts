export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Removed stageOptions as it relied on static Stage enum and is now dynamic or unused.


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