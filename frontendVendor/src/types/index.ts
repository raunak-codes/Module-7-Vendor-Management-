export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  avatar?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  eventName: string;
  amount: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  date: string;
  icon: string;
}

export interface WorkOrder {
  id: string;
  woNumber: string;
  title: string;
  category: string;
  scheduledTime: string;
  status: 'New' | 'Pending' | 'Active' | 'Completed';
  assignees: string[];
  progress?: number;
}

export interface Payment {
  id: string;
  invoiceNumber: string;
  recipient: string;
  initials: string;
  dateIssued: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface Review {
  id: string;
  reviewer: string;
  role: string;
  rating: number;
  date: string;
  comment: string;
  vendorResponse?: string;
  helpfulCount: number;
  avatar?: string;
  initials?: string;
}

export interface Notification {
  id: string;
  type: 'order' | 'payment' | 'verification' | 'system';
  title: string;
  message: string;
  time: string;
  isUnread: boolean;
  action?: string;
}
