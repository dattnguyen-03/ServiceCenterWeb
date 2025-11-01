export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'staff' | 'technician' | 'admin';
  avatar?: string;
  centerID?: number | null; // ✅ Staff và Technician thuộc về một ServiceCenter
}

export interface Vehicle {
  id: string;
  customerId: string;
  model: string;
  vin: string;
  year: number;
  batteryCapacity: string;
  lastService: string;
  nextServiceDue: string;
  mileage: number;
  status?: 'pending' | 'in-service' | 'completed';
  diagnostics?: DiagnosticReport;
}

export interface ServiceAppointment {
  id: string;
  customerId: string;
  vehicleId: string;
  serviceCenter: string;
  services: string[];
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  technician?: string;
  cost?: number;
}

export interface ServiceTicket {
  id: string;
  appointmentId: string;
  vehicleId: string;
  customerId: string;
  services: string[];
  checklist: ChecklistItem[];
  technician: string;
  status: 'waiting' | 'working' | 'completed';
  startTime?: string;
  endTime?: string;
  notes?: string;
  cost: number;
  partsUsed?: Part[];
}

export interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  notes?: string;
}

export interface Part {
  id: string;
  name: string;
  category: string;
  stock: number;
  minThreshold: number;
  price: number;
  supplier: string;
  quantity?: number; // Added for parts usage tracking
}

export interface Staff {
  id: string;
  name: string;
  role: 'staff' | 'technician' | 'admin';
  email: string;
  phone: string;
  certifications: string[];
  shift: string;
  avatar?: string;
}

export interface FinancialData {
  revenue: number;
  expenses: number;
  profit: number;
  period: string;
  serviceBreakdown: {
    service: string;
    count: number;
    revenue: number;
  }[];
}

export interface MaintenanceReminder {
  id: string;
  vehicleId: string;
  type: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
}

export interface DiagnosticReport {
  id: string;
  vehicleId: string;
  timestamp: string;
  systemsCheck: SystemCheckItem[];
  recommendations: string[];
  technician: string;
  notes?: string;
}

export interface SystemCheckItem {
  name: string;
  status: 'good' | 'warning' | 'error';
  value?: string;
  details?: string;
}

export interface TechnicalIssue {
  id: string;
  title: string;
  description: string;
  vehicleModel: string;
  tags: string[];
  solution: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  attachments?: string[];
}

export interface PartsUsageReport {
  id: string;
  ticketId: string;
  parts: {
    partId: string;
    quantity: number;
    price: number;
    notes?: string;
  }[];
  totalCost: number;
  technician: string;
  timestamp: string;
}