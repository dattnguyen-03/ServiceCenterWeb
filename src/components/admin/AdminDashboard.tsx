import React, { useState, useEffect } from 'react';
import { Users, Package, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Activity, Calendar, Clock, BarChart3, PieChart, Building2, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import adminService from '../../services/adminService';
import { getAllUsers } from '../../services/userService';
import serviceCenterService from '../../services/serviceCenterService';
import { mockParts, mockServiceTickets } from '../../data/mockData';

interface RevenueData {
  totalRevenue: number;
  totalPayments: number;
  onlineRevenue: number;
  cashRevenue: number;
  onlinePayments: number;
  cashPayments: number;
}

interface RevenueByService {
  serviceType: string;
  revenue: number;
  count: number;
}

interface RevenueByPeriod {
  period: string;
  totalRevenue: number;
  totalPayments: number;
}

interface RevenueByCenter {
  centerID: number;
  centerName: string;
  revenue: number;
  count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AdminDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('month');
  const [loading, setLoading] = useState(true);
  
  // Stats
  const [monthRevenue, setMonthRevenue] = useState<RevenueData>({
    totalRevenue: 0,
    totalPayments: 0,
    onlineRevenue: 0,
    cashRevenue: 0,
    onlinePayments: 0,
    cashPayments: 0
  });
  const [todayRevenue, setTodayRevenue] = useState<RevenueData>({
    totalRevenue: 0,
    totalPayments: 0,
    onlineRevenue: 0,
    cashRevenue: 0,
    onlinePayments: 0,
    cashPayments: 0
  });
  const [revenueByService, setRevenueByService] = useState<RevenueByService[]>([]);
  const [revenueByPeriod, setRevenueByPeriod] = useState<RevenueByPeriod[]>([]);
  const [revenueByCenter, setRevenueByCenter] = useState<RevenueByCenter[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalCenters, setTotalCenters] = useState(0);

  // Realtime data
  const [realtimeData, setRealtimeData] = useState({
    onlineStaff: 12,
    activeServices: 8,
    queueLength: 5,
    avgWaitTime: '25 phút'
  });

  useEffect(() => {
    loadDashboardData();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Simulate real-time data updates
      setRealtimeData(prev => ({
        ...prev,
        onlineStaff: Math.floor(Math.random() * 5) + 10,
        activeServices: Math.floor(Math.random() * 3) + 6,
        queueLength: Math.floor(Math.random() * 3) + 3,
        avgWaitTime: `${Math.floor(Math.random() * 10) + 20} phút`
      }));
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadRevenueData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load revenue data
      await loadRevenueData();
      
      // Load customers count
      try {
        const users = await getAllUsers();
        const customers = users.filter(u => u.role === 'Customer' || u.role === 'customer');
        setTotalCustomers(customers.length);
      } catch (error) {
        console.error('Error loading customers:', error);
      }
      
      // Load centers count
      try {
        const centers = await serviceCenterService.getServiceCenters();
        setTotalCenters(centers.length);
      } catch (error) {
        console.error('Error loading centers:', error);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRevenueData = async () => {
    try {
      // Load month revenue
      try {
        const monthData = await adminService.getMonthRevenue();
        setMonthRevenue(monthData);
      } catch (error) {
        console.warn('Cannot load month revenue:', error);
        // Keep default values (0)
      }
      
      // Load today revenue
      try {
        const todayData = await adminService.getTodayRevenue();
        setTodayRevenue(todayData);
      } catch (error) {
        console.warn('Cannot load today revenue:', error);
        // Keep default values (0)
      }
      
      // Calculate date range based on selected period
      const now = new Date();
      let dateFrom: Date;
      let dateTo: Date = now;
      
      switch (selectedPeriod) {
        case 'today':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      
      // Load revenue by service
      try {
        const serviceData = await adminService.getRevenueByService(
          dateFrom.toISOString().split('T')[0],
          dateTo.toISOString().split('T')[0]
        );
        setRevenueByService(serviceData);
      } catch (error) {
        console.warn('Cannot load revenue by service:', error);
        setRevenueByService([]);
      }
      
      // Load revenue by period (for chart)
      try {
        const periodData = await adminService.getRevenueByPeriod(
          dateFrom.toISOString().split('T')[0],
          dateTo.toISOString().split('T')[0],
          selectedPeriod === 'month' ? 'day' : 'day'
        );
        setRevenueByPeriod(periodData);
      } catch (error) {
        console.warn('Cannot load revenue by period:', error);
        setRevenueByPeriod([]);
      }
      
      // Load revenue by center
      try {
        const centerData = await adminService.getRevenueByCenter(
          dateFrom.toISOString().split('T')[0],
          dateTo.toISOString().split('T')[0]
        );
        setRevenueByCenter(centerData);
      } catch (error) {
        console.warn('Cannot load revenue by center:', error);
        setRevenueByCenter([]);
      }
    } catch (error) {
      console.error('Error loading revenue data:', error);
    }
  };

  const stats = [
    { 
      label: 'Doanh thu tháng', 
      value: `${monthRevenue.totalRevenue.toLocaleString('vi-VN')} đ`, 
      icon: DollarSign, 
      color: 'from-green-500 to-green-600',
      change: `${monthRevenue.totalPayments} thanh toán`,
      trend: 'up'
    },
    { 
      label: 'Tổng khách hàng', 
      value: totalCustomers.toString(), 
      icon: Users, 
      color: 'from-blue-500 to-blue-600',
      change: 'Hoạt động',
      trend: 'up'
    },
    { 
      label: 'Trung tâm dịch vụ', 
      value: totalCenters.toString(), 
      icon: Building2, 
      color: 'from-purple-500 to-purple-600',
      change: 'Đang hoạt động',
      trend: 'up'
    },
    { 
      label: 'Doanh thu hôm nay', 
      value: `${todayRevenue.totalRevenue.toLocaleString('vi-VN')} đ`, 
      icon: TrendingUp, 
      color: 'from-orange-500 to-orange-600',
      change: `${todayRevenue.totalPayments} thanh toán`,
      trend: 'up'
    }
  ];

  const realtimeStats = [
    {
      label: 'Nhân viên online',
      value: realtimeData.onlineStaff.toString(),
      icon: Activity,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      label: 'Dịch vụ đang thực hiện',
      value: realtimeData.activeServices.toString(),
      icon: Clock,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Hàng chờ',
      value: realtimeData.queueLength.toString(),
      icon: Calendar,
      color: 'from-orange-500 to-orange-600'
    },
    {
      label: 'Thời gian chờ TB',
      value: realtimeData.avgWaitTime,
      icon: Clock,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  // Prepare chart data
  const chartData = revenueByPeriod.map(item => ({
    name: item.period,
    revenue: item.totalRevenue,
    payments: item.totalPayments
  }));

  const pieData = revenueByService.map(item => ({
    name: item.serviceType,
    value: item.revenue
  }));

  const centerChartData = revenueByCenter.map(item => ({
    name: item.centerName,
    revenue: item.revenue,
    count: item.count
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Quản trị</h2>
          <p className="text-gray-600">Tổng quan hoạt động kinh doanh và vận hành</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">Cập nhật lần cuối</div>
            <div className="text-lg font-semibold text-gray-900">
              {currentTime.toLocaleTimeString('vi-VN')}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">Hoạt động</span>
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Line Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
              Doanh thu theo thời gian
            </h3>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value as 'today' | 'week' | 'month')}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
            </select>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  shared={false}
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      const entry = payload[0];
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-semibold text-gray-900 mb-2">{label}</p>
                          <p style={{ color: entry.color }} className="text-sm">
                            <span className="inline-block w-3 h-3 rounded mr-2" style={{ backgroundColor: entry.color }}></span>
                            {entry.name}: {
                              entry.dataKey === 'revenue' 
                                ? `${Number(entry.value).toLocaleString('vi-VN')} đ`
                                : `${entry.value} thanh toán`
                            }
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0088FE" 
                  strokeWidth={2} 
                  name="Doanh thu" 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="payments" 
                  stroke="#00C49F" 
                  strokeWidth={2} 
                  name="Số thanh toán" 
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>Chưa có dữ liệu doanh thu</p>
            </div>
          )}
        </div>

        {/* Revenue by Service Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-purple-500" />
            Doanh thu theo dịch vụ
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toLocaleString('vi-VN')} đ`} />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>Chưa có dữ liệu dịch vụ</p>
            </div>
          )}
        </div>
      </div>

      {/* Revenue by Center and Service Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Center */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-green-500" />
            Doanh thu theo trung tâm
          </h3>
          {centerChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={centerChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  shared={false}
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      const entry = payload[0];
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-semibold text-gray-900 mb-2">{label}</p>
                          <p style={{ color: entry.color }} className="text-sm">
                            <span className="inline-block w-3 h-3 rounded mr-2" style={{ backgroundColor: entry.color }}></span>
                            {entry.name}: {
                              entry.dataKey === 'revenue' 
                                ? `${Number(entry.value).toLocaleString('vi-VN')} đ`
                                : `${entry.value} thanh toán`
                            }
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#00C49F" name="Doanh thu" />
                <Bar yAxisId="right" dataKey="count" fill="#FFBB28" name="Số thanh toán" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>Chưa có dữ liệu trung tâm</p>
            </div>
          )}
        </div>

        {/* Service Breakdown List */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            Chi tiết doanh thu dịch vụ
          </h3>
          <div className="space-y-4">
            {revenueByService.length > 0 ? (
              revenueByService.map((service, index) => {
                const maxRevenue = Math.max(...revenueByService.map(s => s.revenue));
                const percentage = maxRevenue > 0 ? (service.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="font-medium text-gray-900">{service.serviceType}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{service.revenue.toLocaleString('vi-VN')} đ</div>
                        <div className="text-sm text-gray-600">{service.count} lần</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Chưa có dữ liệu dịch vụ</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            Thống kê thời gian thực
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Cập nhật tự động</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {realtimeStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-500" />
            Phương thức thanh toán (Tháng này)
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Thanh toán online</div>
                <div className="text-sm text-gray-600">{monthRevenue.onlinePayments} giao dịch</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">{monthRevenue.onlineRevenue.toLocaleString('vi-VN')} đ</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Thanh toán tiền mặt</div>
                <div className="text-sm text-gray-600">{monthRevenue.cashPayments} giao dịch</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-600">{monthRevenue.cashRevenue.toLocaleString('vi-VN')} đ</div>
              </div>
            </div>
          </div>
        </div>

        {/* Parts Alert */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-red-500" />
            Phụ tùng cần bổ sung
          </h3>
          <div className="space-y-3">
            {mockParts.filter(p => p.stock < p.minThreshold).length > 0 ? (
              mockParts.filter(p => p.stock < p.minThreshold).map((part) => (
                <div key={part.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <div className="font-medium text-gray-900">{part.name}</div>
                    <div className="text-sm text-gray-600">{part.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-600 font-semibold">{part.stock}/{part.minThreshold}</div>
                    <div className="text-xs text-red-500">Thiếu {part.minThreshold - part.stock}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Tất cả phụ tùng đều đủ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;