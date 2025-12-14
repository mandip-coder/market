import { 
  AlertTriangle, 
  FileWarning, 
  Activity, 
  RefreshCw, 
  Send, 
  ShieldAlert, 
  Clock, 
  Database, 
  Search, 
  UserCheck, 
  Edit, 
  Download, 
  Upload, 
  MailWarning, 
  Ban, 
  Info, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Bell 
} from 'lucide-react';

export const dataSource = [
  {
    id: 1,
    icon: AlertTriangle,
    type: "warning",
    title: "Expedited Case Submission Due",
    message: "Case #AE-2025-0143 must be submitted to EMA within 3 days.Case #AE-2025-0143 must be submitted to EMA within 3 days.Case #AE-2025-0143 must be submitted to EMA within 3 days.Case #AE-2025-0143 must be submitted to EMA within 3 days.Case #AE-2025-0143 must be submitted to EMA within 3 days.",
    date: "2025-09-16T09:15:00Z",
    isRead: false,
    isPriority: true,
    category: "regulatory",
    actions: [
      { label: "View Case", type: "primary", onClick: () => console.log("View Case") },
      { label: "Mark as Submitted", type: "default", onClick: () => console.log("Mark as Submitted") }
    ]
  },
  {
    id: 2,
    icon: FileWarning,
    type: "warning",
    title: "Incomplete Mandatory Fields",
    message: "Case #AE-2025-0127 has missing narrative and suspect drug details.",
    date: "2025-09-15T08:42:00Z",
    isRead: false,
    isPriority: true,
    category: "case",
    actions: [
      { label: "Edit Case", type: "primary", onClick: () => console.log("Edit Case") }
    ]
  },
  {
    id: 3,
    icon: Activity,
    type: "info",
    title: "New Safety Signal Detected",
    message: "Higher-than-expected reports of headache for Product X.",
    date: "2025-09-14T18:20:00Z",
    isRead: false,
    isPriority: false,
    category: "signal",
    actions: [
      { label: "View Signal", type: "primary", onClick: () => console.log("View Signal") },
      { label: "Acknowledge", type: "default", onClick: () => console.log("Acknowledge") }
    ]
  },
  {
    id: 4,
    icon: RefreshCw,
    type: "info",
    title: "Follow-up Report Required",
    message: "Follow-up information needed for Case #AE-2025-0098.",
    date: "2025-08-10T12:05:00Z",
    isRead: true,
    isPriority: false,
    category: "case",
    actions: [
      { label: "Request Follow-up", type: "primary", onClick: () => console.log("Request Follow-up") }
    ]
  },
  {
    id: 5,
    icon: Send,
    type: "success",
    title: "E2B Transmission Successful",
    message: "Case #AE-2025-0115 sent to FDA on 2025-08-10.",
    date: "2025-08-10T10:30:00Z",
    isRead: true,
    isPriority: false,
    category: "regulatory",
    actions: []
  },
  {
    id: 6,
    icon: ShieldAlert,
    type: "error",
    title: "Serious Adverse Event Alert",
    message: "Fatal reaction reported for Product Y in Case #AE-2025-0151.",
    date: "2025-08-09T22:47:00Z",
    isRead: false,
    isPriority: true,
    category: "case",
    actions: [
      { label: "Escalate", type: "primary", danger: true, onClick: () => console.log("Escalate") },
      { label: "View Details", type: "default", onClick: () => console.log("View Details") }
    ]
  },
  {
    id: 7,
    icon: Clock,
    type: "info",
    title: "PSUR Submission Reminder",
    message: "Periodic Safety Update Report due by 2025-08-15.",
    date: "2025-08-09T14:22:00Z",
    isRead: false,
    isPriority: true,
    category: "regulatory",
    actions: [
      { label: "Prepare Report", type: "primary", onClick: () => console.log("Prepare Report") }
    ]
  },
  {
    id: 8,
    icon: Database,
    type: "error",
    title: "Case Data Sync Failure",
    message: "System failed to sync with E2B gateway. Retry needed.",
    date: "2025-08-09T11:03:00Z",
    isRead: false,
    isPriority: false,
    category: "system",
    actions: [
      { label: "Retry Sync", type: "primary", onClick: () => console.log("Retry Sync") }
    ]
  },
  {
    id: 9,
    icon: Search,
    type: "info",
    title: "Signal Assessment Pending",
    message: "Pending medical review for suspected cardiac events.",
    date: "2025-08-08T21:10:00Z",
    isRead: true,
    isPriority: false,
    category: "signal",
    actions: [
      { label: "Review Signal", type: "primary", onClick: () => console.log("Review Signal") }
    ]
  },
  {
    id: 10,
    icon: UserCheck,
    type: "info",
    title: "Case Reassignment",
    message: "Case #AE-2025-0149 reassigned to Dr. Chen.",
    date: "2025-08-08T17:40:00Z",
    isRead: true,
    isPriority: false,
    category: "case",
    actions: []
  },
  {
    id: 11,
    icon: Edit,
    type: "warning",
    title: "Narrative Update Required",
    message: "Case #AE-2025-0102 needs additional narrative details.",
    date: "2025-08-08T15:15:00Z",
    isRead: false,
    isPriority: false,
    category: "case",
    actions: [
      { label: "Update Narrative", type: "primary", onClick: () => console.log("Update Narrative") }
    ]
  },
  {
    id: 12,
    icon: Download,
    type: "info",
    title: "Regulatory Query Received",
    message: "FDA requested additional info for Case #AE-2025-0087.",
    date: "2025-08-07T19:32:00Z",
    isRead: false,
    isPriority: true,
    category: "regulatory",
    actions: [
      { label: "View Query", type: "primary", onClick: () => console.log("View Query") },
      { label: "Prepare Response", type: "default", onClick: () => console.log("Prepare Response") }
    ]
  },
  {
    id: 13,
    icon: Upload,
    type: "success",
    title: "Aggregate Report Uploaded",
    message: "PSUR for Product Z successfully uploaded.",
    date: "2025-08-07T16:48:00Z",
    isRead: true,
    isPriority: false,
    category: "regulatory",
    actions: []
  },
  {
    id: 14,
    icon: MailWarning,
    type: "error",
    title: "Partner Case Exchange Failure",
    message: "Case #AE-2025-0134 not delivered to affiliate partner.",
    date: "2025-08-07T12:29:00Z",
    isRead: false,
    isPriority: false,
    category: "system",
    actions: [
      { label: "Resend Case", type: "primary", onClick: () => console.log("Resend Case") }
    ]
  },
  {
    id: 15,
    icon: Ban,
    type: "error",
    title: "Product Recall Alert",
    message: "Recall initiated for Product X due to contamination risk.",
    date: "2025-08-06T23:59:00Z",
    isRead: false,
    isPriority: true,
    category: "regulatory",
    actions: [
      { label: "View Recall Notice", type: "primary", onClick: () => console.log("View Recall Notice") },
      { label: "Notify Teams", type: "default", onClick: () => console.log("Notify Teams") }
    ]
  },
  {
    id: 16,
    icon: Info,
    type: "info",
    title: "New Risk Management Plan Available",
    message: "RMP for Product Y updated with new safety measures.",
    date: "2025-08-06T19:10:00Z",
    isRead: true,
    isPriority: false,
    category: "regulatory",
    actions: [
      { label: "Review RMP", type: "primary", onClick: () => console.log("Review RMP") }
    ]
  },
  {
    id: 17,
    icon: Calendar,
    type: "info",
    title: "Training Session Reminder",
    message: "Pharmacovigilance refresher training on 2025-08-20.",
    date: "2025-08-06T08:05:00Z",
    isRead: true,
    isPriority: false,
    category: "signal",
    actions: [
      { label: "Add to Calendar", type: "default", onClick: () => console.log("Add to Calendar") }
    ]
  },
  {
    id: 18,
    icon: CheckCircle2,
    type: "success",
    title: "Case Closure Confirmation",
    message: "Case #AE-2025-0122 closed successfully.",
    date: "2025-08-05T20:44:00Z",
    isRead: true,
    isPriority: false,
    category: "case",
    actions: []
  },
  {
    id: 19,
    icon: AlertCircle,
    type: "warning",
    title: "Deviation Recorded",
    message: "Deviation in expedited reporting process detected.",
    date: "2025-08-05T14:55:00Z",
    isRead: false,
    isPriority: false,
    category: "system",
    actions: [
      { label: "Review Deviation", type: "primary", onClick: () => console.log("Review Deviation") }
    ]
  },
  {
    id: 20,
    icon: Bell,
    type: "system",
    title: "System Maintenance Scheduled",
    message: "System will be down for maintenance on 2025-08-15 from 02:00-04:00 UTC.",
    date: "2025-08-05T09:25:00Z",
    isRead: true,
    isPriority: false,
    category: "system",
    actions: []
  }
];