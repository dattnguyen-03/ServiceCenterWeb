// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5109/api',
  TIMEOUT: 30000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/LoginAPI',
  REGISTER: '/RegisterAPI',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      VERIFY_EMAIL: '/auth/verify-email',
    },
    CUSTOMER: {
      PROFILE: '/customer/profile',
      APPOINTMENTS: '/customer/appointments',
      VEHICLES: '/customer/vehicles',
      SERVICE_HISTORY: '/customer/service-history',
      PAYMENTS: '/customer/payments',
    },
    ADMIN: {
      DASHBOARD: '/admin/dashboard',
      CUSTOMERS: '/admin/customers',
      STAFF: '/admin/staff',
      APPOINTMENTS: '/admin/appointments',
      PARTS: '/admin/parts',
      FINANCE: '/admin/finance',
      REPORTS: '/admin/reports',
    },
    STAFF: {
      DASHBOARD: '/staff/dashboard',
      STATS: '/staff/dashboard/stats',
      ORDERS: '/staff/orders',
      APPOINTMENTS: '/staff/appointments',
      CUSTOMERS: '/staff/customers',
      SERVICE_REQUESTS: '/staff/service-requests',
      WORK_REPORTS: '/staff/work-reports',
      TECHNICIANS: '/staff/technicians',
      NOTIFICATIONS: '/staff/notifications',
    },
    TECHNICIAN: {
      DASHBOARD: '/technician/dashboard',
      STATS: '/technician/dashboard/stats',
      TASKS: '/technician/tasks',
      WORK_REPORTS: '/technician/work-reports',
      PART_REQUESTS: '/technician/part-requests',
      PARTS: '/technician/parts',
      ORDERS: '/technician/orders',
      APPOINTMENTS: '/technician/appointments',
      SERVICE_REQUESTS: '/technician/service-requests',
      TIME: '/technician/time',
      SCHEDULE: '/technician/schedule',
      AVAILABILITY: '/technician/availability',
      NOTIFICATIONS: '/technician/notifications',
    },
    COMMON: {
      SERVICES: '/services',
      APPOINTMENTS: '/appointments',
      PARTS: '/parts',
      VEHICLES: '/vehicles',
    },
    VEHICLE: {
      CREATE: '/CreateVehicleAPI',
      EDIT: '/EditVehicleAPI',
      GET: '/GetVehicleAPI',
      VIEW: '/ViewVehicleAPI',
      DELETE: '/DeleteVehicleAPI',
    },
    SERVICE_PACKAGE: {
      GET: '/GetServicePackageAPI',
    }
  }
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;