// Export all services for easy importing
export { authService } from './authService';
export { adminService } from './adminService';
export { customerService } from './customerService';
export { staffService } from './staffService';
export { technicianService } from './technicianService';
export { httpClient } from './httpClient';

// Re-export commonly used types
export type { ApiResponse, PaginationParams, PaginatedResponse } from '../types/api';