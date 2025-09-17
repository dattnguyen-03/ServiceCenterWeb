import { User, Vehicle, ServiceAppointment, ServiceTicket, Part, Staff, FinancialData, MaintenanceReminder } from '../types';

export const mockUsers: User[] = [
  { id: '1', name: 'Nguyễn Văn Nam', email: 'nam@email.com', role: 'customer', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1' },
  { id: '2', name: 'Trần Minh Staff', email: 'staff@center.com', role: 'staff', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1' },
  { id: '3', name: 'Phạm Kỹ Thuật', email: 'tech@center.com', role: 'technician', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1' },
  { id: '4', name: 'Admin Hệ Thống', email: 'admin@system.com', role: 'admin', avatar: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1' }
];

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    customerId: '1',
    model: 'VinFast VF8',
    vin: 'VF8ABC123456789',
    year: 2023,
    batteryCapacity: '87.7 kWh',
    lastService: '2024-01-15',
    nextServiceDue: '2024-04-15',
    mileage: 15420
  },
  {
    id: '2',
    customerId: '1',
    model: 'Tesla Model Y',
    vin: 'TSMY456789123',
    year: 2022,
    batteryCapacity: '75 kWh',
    lastService: '2024-02-01',
    nextServiceDue: '2024-05-01',
    mileage: 28900
  }
];

export const mockAppointments: ServiceAppointment[] = [
  {
    id: '1',
    customerId: '1',
    vehicleId: '1',
    serviceCenter: 'Trung tâm Hà Nội',
    services: ['Bảo dưỡng định kỳ', 'Kiểm tra pin'],
    date: '2024-01-20',
    time: '09:00',
    status: 'confirmed',
    technician: 'Phạm Kỹ Thuật',
    cost: 2500000
  },
  {
    id: '2',
    customerId: '1',
    vehicleId: '2',
    serviceCenter: 'Trung tâm TP.HCM',
    services: ['Thay lốp', 'Kiểm tra hệ thống điện'],
    date: '2024-01-25',
    time: '14:30',
    status: 'in-progress'
  }
];

export const mockServiceTickets: ServiceTicket[] = [
  {
    id: '1',
    appointmentId: '1',
    vehicleId: '1',
    customerId: '1',
    services: ['Bảo dưỡng định kỳ', 'Kiểm tra pin'],
    checklist: [
      { id: '1', task: 'Kiểm tra áp suất lốp', completed: true },
      { id: '2', task: 'Kiểm tra dung lượng pin', completed: true },
      { id: '3', task: 'Kiểm tra hệ thống phanh', completed: false },
      { id: '4', task: 'Vệ sinh nội thất', completed: false }
    ],
    technician: 'Phạm Kỹ Thuật',
    status: 'working',
    startTime: '09:00',
    cost: 2500000
  }
];

export const mockParts: Part[] = [
  {
    id: '1',
    name: 'Pin Lithium-ion 87.7kWh',
    category: 'Pin & Năng lượng',
    stock: 5,
    minThreshold: 2,
    price: 150000000,
    supplier: 'CATL'
  },
  {
    id: '2',
    name: 'Lốp xe EV 235/55R19',
    category: 'Lốp & Vành',
    stock: 1,
    minThreshold: 4,
    price: 3500000,
    supplier: 'Michelin'
  },
  {
    id: '3',
    name: 'Bộ sạc AC 11kW',
    category: 'Sạc & Điện',
    stock: 8,
    minThreshold: 3,
    price: 25000000,
    supplier: 'ABB'
  }
];

export const mockStaff: Staff[] = [
  {
    id: '2',
    name: 'Trần Minh Staff',
    role: 'staff',
    email: 'staff@center.com',
    phone: '0901234567',
    certifications: ['Chứng chỉ EV Service Level 2'],
    shift: 'Ca sáng 8:00-16:00'
  },
  {
    id: '3',
    name: 'Phạm Kỹ Thuật',
    role: 'technician',
    email: 'tech@center.com',
    phone: '0901234568',
    certifications: ['Chứng chỉ Tesla Certified', 'Chứng chỉ VinFast Technical'],
    shift: 'Ca chiều 14:00-22:00'
  }
];

export const mockFinancialData: FinancialData = {
  revenue: 125000000,
  expenses: 85000000,
  profit: 40000000,
  period: 'Tháng 1/2024',
  serviceBreakdown: [
    { service: 'Bảo dưỡng định kỳ', count: 45, revenue: 67500000 },
    { service: 'Kiểm tra pin', count: 32, revenue: 32000000 },
    { service: 'Thay lốp', count: 18, revenue: 18000000 },
    { service: 'Sửa chữa điện', count: 12, revenue: 7500000 }
  ]
};

export const mockReminders: MaintenanceReminder[] = [
  {
    id: '1',
    vehicleId: '1',
    type: 'Bảo dưỡng định kỳ',
    dueDate: '2024-04-15',
    priority: 'high',
    description: 'Bảo dưỡng 20,000km cho VinFast VF8'
  },
  {
    id: '2',
    vehicleId: '2',
    type: 'Kiểm tra pin',
    dueDate: '2024-03-01',
    priority: 'medium',
    description: 'Kiểm tra sức khỏe pin Tesla Model Y'
  }
];