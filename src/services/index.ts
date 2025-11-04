// Export all services for easy importing
export { authService } from './authService';
export { adminService } from './adminService';
export { customerService } from './customerService';
export { customerManagementService } from './customerManagementService';
export { userManagementService } from './userManagementService';
export { staffService } from './staffService';
export { technicianService } from './technicianService';
export { vehicleService } from './vehicleService';
export { appointmentService } from './appointmentService';
export { serviceCenterService } from './serviceCenterService';
export { serviceOrderService } from './serviceOrderService';
export { technicianListService } from './technicianListService';
export { technicianCertificationService } from './technicianCertificationService';
export { partService } from './partService';
export { inventoryService } from './inventoryService';
export { partUsageService } from './partUsageService';
export { chatMessageService } from './chatMessageService';
export { httpClient } from './httpClient';

// Re-export commonly used types
export type { ApiResponse, PaginationParams, PaginatedResponse } from '../types/api';