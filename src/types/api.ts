// Base API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// User Types
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  role: 'admin' | 'staff' | 'technician' | 'customer';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
  centerID?: number | null; // ✅ Staff và Technician thuộc về một ServiceCenter
}

// Customer Types
export interface Customer extends User {
  vehicles: Vehicle[];
  appointments: Appointment[];
  serviceHistory: ServiceRecord[];
}

export interface Vehicle {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  mileage: number;
  vin?: string;
  engineType: string;
  createdAt: string;
  updatedAt: string;
}

// Vehicle API Types (matching backend API)
export interface CreateVehicleRequest {
  model: string;
  vin: string;
  licensePlate: string;
  year: number;
  notes?: string;
  lastServiceDate?: string;
}

export interface EditVehicleRequest {
  vehicleID: number;
  model: string;
  vin: string;
  licensePlate: string;
  year: number;
  notes?: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
}

export interface VehicleResponse {
  vehicleID: number;
  model: string;
  vin: string;
  licensePlate: string;
  year: number;
  notes?: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  customerId?: string;
  batteryCapacity?: string;
  mileage?: number;
  status?: string;
}

export interface GetVehicleRequest {
  vehicleId: number;
}

// Appointment Types
export interface Appointment {
  id: string;
  customerId: string;
  vehicleId: string;
  serviceType: string;
  scheduledDate: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  assignedTechnician?: string;
  estimatedDuration: number;
  estimatedCost: number;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  vehicle?: Vehicle;
  technician?: User;
}

export interface CreateAppointmentRequest {
  vehicleId: string;
  serviceType: string;
  scheduledDate: string;
  timeSlot: string;
  notes?: string;
}

// Lightweight view model returned by ViewAppointmentAPI (BE contract)
export interface AppointmentSummary {
  appointmentID: number;
  vehicleModel: string;
  serviceType: string;
  centerName: string;
  requestedDate: string; // ISO string
  status: string; // Pending | Confirmed | Completed | Cancelled
}

// Service Types
export interface ServiceRecord {
  id: string;
  appointmentId: string;
  customerId: string;
  vehicleId: string;
  serviceType: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  startDate: string;
  completedDate?: string;
  totalCost: number;
  parts: PartUsage[];
  laborCost: number;
  notes?: string;
  assignedTechnician: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  serviceRecordId: string;
  technicianId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'assigned' | 'in-progress' | 'completed' | 'on-hold';
  estimatedHours: number;
  actualHours?: number;
  startTime?: string;
  endTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Parts Types
export interface Part {
  partID: number;
  name: string;
  description: string;
  minStock: number | null;
  price: number;
}

export interface PartUsage {
  id: string;
  serviceRecordId: string;
  partId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  part?: Part;
}

// Service Center Types
export interface ServiceCenter {
  centerID: number;
  name: string;
  address: string;
  phone: string;
  managerName: string;
}

// Staff Types
export interface Staff extends User {
  employeeId: string;
  department: string;
  position: string;
  hireDate: string;
  salary?: number;
  permissions: string[];
}

// Dashboard Types
export interface DashboardStats {
  totalCustomers: number;
  totalAppointments: number;
  todayAppointments: number;
  completedServices: number;
  revenue: number;
  pendingServices: number;
}

// Payment Types
export interface Payment {
  id: string;
  serviceRecordId: string;
  customerId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'online';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paymentDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  serviceRecordId: string;
  amount: number;
  paymentMethod: Payment['paymentMethod'];
  notes?: string;
}

// Filter Types
export interface AppointmentFilters extends PaginationParams {
  status?: Appointment['status'];
  serviceType?: string;
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  technicianId?: string;
}

export interface CustomerFilters extends PaginationParams {
  search?: string;
  status?: User['status'];
}

export interface ServiceFilters extends PaginationParams {
  status?: ServiceRecord['status'];
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  technicianId?: string;
}

// Report Types
export interface RevenueReport {
  period: string;
  totalRevenue: number;
  serviceRevenue: number;
  partsRevenue: number;
  appointments: number;
  completedServices: number;
}

export interface ServiceReport {
  serviceType: string;
  count: number;
  revenue: number;
  averageTime: number;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Order Types
export interface Order {
  id: string;
  customerId: string;
  vehicleId: string;
  serviceType: string;
  description: string;
  status: OrderStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTechnician?: string;
  estimatedCost: number;
  actualCost?: number;
  estimatedCompletionDate: string;
  actualCompletionDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  vehicle?: Vehicle;
  technician?: User;
}

export type OrderStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
  estimatedCompletionDate?: string;
}

// Enhanced Appointment Types
export type AppointmentStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus;
  notes?: string;
  assignedTechnician?: string;
}

// Work Report Types
export interface WorkReport {
  id: string;
  technicianId: string;
  orderId?: string;
  appointmentId?: string;
  title: string;
  description: string;
  workDate: string;
  hoursWorked: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  technician?: User;
  order?: Order;
  appointment?: Appointment;
}

export interface CreateWorkReportRequest {
  orderId?: string;
  appointmentId?: string;
  title: string;
  description: string;
  workDate: string;
  hoursWorked: number;
  notes?: string;
}

// Service Request Types
export interface ServiceRequest {
  id: string;
  customerId: string;
  vehicleId: string;
  requestType: 'maintenance' | 'repair' | 'inspection' | 'emergency';
  title: string;
  description: string;
  status: ServiceRequestStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTechnician?: string;
  estimatedCost?: number;
  requestedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  vehicle?: Vehicle;
  technician?: User;
}

export type ServiceRequestStatus = 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';

export interface UpdateServiceRequestRequest {
  status?: ServiceRequestStatus;
  assignedTechnician?: string;
  scheduledDate?: string;
  estimatedCost?: number;
  notes?: string;
}

// Enhanced Dashboard Stats
export interface StaffDashboardStats extends DashboardStats {
  assignedOrders: number;
  pendingAppointments: number;
  completedToday: number;
  averageServiceTime: number;
}

export interface TechnicianDashboardStats extends DashboardStats {
  assignedTasks: number;
  completedTasks: number;
  pendingTasks: number;
  averageTaskTime: number;
  currentWorkload: number;
}

// Technician Task Types
export interface TechnicianTask {
  id: string;
  technicianId: string;
  orderId?: string;
  appointmentId?: string;
  serviceRequestId?: string;
  title: string;
  description: string;
  taskType: 'diagnostic' | 'repair' | 'maintenance' | 'inspection' | 'test';
  status: 'assigned' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours: number;
  actualHours?: number;
  startTime?: string;
  endTime?: string;
  requiredParts?: string[];
  tools?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  order?: Order;
  appointment?: Appointment;
  serviceRequest?: ServiceRequest;
}

export interface CreateTechnicianTaskRequest {
  orderId?: string;
  appointmentId?: string;
  serviceRequestId?: string;
  title: string;
  description: string;
  taskType: TechnicianTask['taskType'];
  priority: TechnicianTask['priority'];
  estimatedHours: number;
  requiredParts?: string[];
  tools?: string[];
  notes?: string;
}

export interface UpdateTechnicianTaskRequest {
  status?: TechnicianTask['status'];
  actualHours?: number;
  startTime?: string;
  endTime?: string;
  notes?: string;
  progressNotes?: string;
}

// Parts Request Types
export interface PartRequest {
  id: string;
  technicianId: string;
  taskId?: string;
  orderId?: string;
  partId: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'fulfilled' | 'cancelled';
  reason: string;
  notes?: string;
  requestedDate: string;
  approvedDate?: string;
  fulfilledDate?: string;
  createdAt: string;
  updatedAt: string;
  technician?: User;
  part?: Part;
  task?: TechnicianTask;
}

export interface CreatePartRequestRequest {
  taskId?: string;
  orderId?: string;
  partId: string;
  quantity: number;
  urgency: PartRequest['urgency'];
  reason: string;
  notes?: string;
}

// Service Package Types
export interface ServicePackage {
  packageID: number;
  name: string;
  description: string;
  price: number;
  durationMonths: number;
}

export interface GetServicePackageResponse {
  success: boolean;
  data: ServicePackage[];
  message?: string;
}

// Chat Message Types
export interface ChatMessage {
  MessageID: number;
  SenderID: number;
  ReceiverID: number;
  Content: string;
  SentAt: string; // ISO string
  Status: 'Sent' | 'Seen';
  // Aliases for camelCase compatibility
  messageID?: number;
  senderID?: number;
  receiverID?: number;
  content?: string;
  sentAt?: string;
  status?: 'Sent' | 'Seen';
}

export interface SendMessageRequest {
  receiverID?: number | null; // null or 0 -> send to support
  content: string;
}

export interface SendMessageToCenterRequest {
  centerID?: number | null; // null -> auto get from latest appointment
  content: string;
}

export interface SendMessageToCenterResponse {
  success: boolean;
  message: string;
  receiverID?: number;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
}

export interface ViewMessageResponse {
  message?: string;
  Messages?: ChatMessage[]; // PascalCase (nếu có)
  messages?: ChatMessage[]; // camelCase (nếu có)
}

export interface MessageBox {
  TargetUserID: number;
  TargetName: string;
  LastMessage: string;
  LastMessageTime: string; // ISO string
  UnreadCount: number;
  // Aliases for camelCase compatibility
  targetUserID?: number;
  targetName?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface GetMessageBoxListResponse {
  success: boolean;
  message: string;
  data: MessageBox[];
}

export interface EditMessageRequest {
  messageID: number;
  newContent: string;
}

export interface EditMessageResponse {
  success: boolean;
  message: string;
}

export interface DeleteMessageBoxRequest {
  userID1?: number | null;
  userID2?: number | null;
}

export interface DeleteMessageBoxResponse {
  message: string;
}