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
      GET_ALL_CUSTOMERS: '/GetAllCustomersAPI',
      GET_CUSTOMER_DETAILS: '/GetCustomerDetailsAPI',
    },
    USER_MANAGEMENT: {
      GET_ALL_USERS: '/GetAllUserAPI',
      SEARCH_USERS: '/SearchUserAPI',
      CREATE_USER: '/CreateUserAPI',
      EDIT_USER: '/EditUserAPI',
      DELETE_USER: '/DeleteUserAPI',
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
      GET_ALL: '/GetTechnicianAPI', // For Staff/Admin to get technician list
    },
    SERVICE_ORDER: {
      CREATE: '/CreateServiceOrderAPI',
      VIEW: '/ViewServiceOrderAPI', // For Technician to view assigned orders
      UPDATE: '/UpdateServiceOrderAPI', // For Technician to update progress
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
    },
    SERVICE_CENTER: {
      GET: '/GetServiceCentersAPI',
    },
    APPOINTMENT: {
      BOOK: '/BookAppointmentAPI',
      VIEW: '/ViewAppointmentAPI',
      GET_ALL: '/GetAppointmentAPI', // For Staff/Admin to view all appointments
      CANCEL: '/CancelAppointmentAPI',
    },
    PAYMENT: {
      CREATE: '/CreatePaymentAPI',
      GET_HISTORY: '/GetPaymentHistoryAPI',
      GET_BY_ORDER: '/GetPaymentHistoryAPI', // GET /GetPaymentHistoryAPI/{orderId}
    },
    REVENUE: {
      TOTAL: '/RevenueAPI/total',
      TODAY: '/RevenueAPI/today',
      MONTH: '/RevenueAPI/month',
      BY_PERIOD: '/RevenueAPI/by-period',
      BY_SERVICE: '/RevenueAPI/by-service',
      BY_CENTER: '/RevenueAPI/by-center',
      REPORT: '/RevenueAPI/report',
      DASHBOARD: '/RevenueAPI/dashboard',
    },
    MESSAGE: {
      SEND: '/SendMessageAPI',
      SEND_TO_CENTER: '/SendMessageToCenterAPI',
      VIEW: '/ViewMessageAPI',
      GET_MESSAGE_BOXES: '/GetMessageBoxListAPI',
      EDIT: '/EditMessageAPI',
      DELETE_BOX: '/DeleteMessageBoxAPI',
    },
    SERVICE_HISTORY: {
      GET: '/ViewServiceHistoryAPI/GetServiceHistory',
    },
    REMINDER: {
      COUNT: '/CountReminderAPI',
      VIEW: '/ViewReminderAPI',
      GET_ALL: '/GetReminderAPI',
      CREATE: '/CreateReminderAPI',
      EDIT: '/EditReminderAPI',
      CLEAN: '/CleanReminderAPI',
    },
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