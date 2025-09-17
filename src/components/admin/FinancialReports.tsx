import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart, Download } from 'lucide-react';
import { mockFinancialData } from '../../data/mockData';

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ServiceRevenue {
  service: string;
  revenue: number;
  percentage: number;
  color: string;
}

interface Kpi {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

const FinancialReports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [serviceRevenueData, setServiceRevenueData] = useState<ServiceRevenue[]>([]);
  const [kpiData, setKpiData] = useState<Kpi[]>([]);

  useEffect(() => {
    // TODO: Replace with API call based on selectedPeriod and selectedYear
    const fetchData = async () => {
      setLoading(true);
      // const response = await api.getFinancialReports({ period: selectedPeriod, year: selectedYear });
      // setMonthlyData(response.data.monthly);
      // setServiceRevenueData(response.data.service);
      // setKpiData(response.data.kpi);

      // Using mock data for now
      setMonthlyData([
        { month: 'T1', revenue: 125000000, expenses: 85000000, profit: 40000000 },
        { month: 'T2', revenue: 135000000, expenses: 90000000, profit: 45000000 },
        { month: 'T3', revenue: 142000000, expenses: 88000000, profit: 54000000 },
        { month: 'T4', revenue: 138000000, expenses: 92000000, profit: 46000000 },
        { month: 'T5', revenue: 155000000, expenses: 95000000, profit: 60000000 },
        { month: 'T6', revenue: 148000000, expenses: 89000000, profit: 59000000 }
      ]);
      setServiceRevenueData([
        { service: 'Bảo dưỡng định kỳ', revenue: 450000000, percentage: 35, color: 'bg-blue-500' },
        { service: 'Kiểm tra pin', revenue: 320000000, percentage: 25, color: 'bg-green-500' },
        { service: 'Thay lốp', revenue: 256000000, percentage: 20, color: 'bg-yellow-500' },
        { service: 'Sửa chữa điện', revenue: 192000000, percentage: 15, color: 'bg-purple-500' },
        { service: 'Khác', revenue: 64000000, percentage: 5, color: 'bg-gray-500' }
      ]);
      setKpiData([
        { label: 'Doanh thu tháng', value: `${mockFinancialData.revenue.toLocaleString('vi-VN')} đ`, change: '+12.5%', trend: 'up' },
        { label: 'Chi phí vận hành', value: `${mockFinancialData.expenses.toLocaleString('vi-VN')} đ`, change: '+8.2%', trend: 'up' },
        { label: 'Lợi nhuận', value: `${mockFinancialData.profit.toLocaleString('vi-VN')} đ`, change: '+18.7%', trend: 'up' },
        { label: 'Biên lợi nhuận', value: '32%', change: '+2.1%', trend: 'up' }
      ]);
      setLoading(false);
    };

    fetchData();
  }, [selectedPeriod, selectedYear]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Báo cáo tài chính</h2>
          <p className="text-gray-600">Theo dõi doanh thu, chi phí và lợi nhuận</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="month">Theo tháng</option>
            <option value="quarter">Theo quý</option>
            <option value="year">Theo năm</option>
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
          <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${
                index === 0 ? 'from-green-500 to-green-600' :
                index === 1 ? 'from-red-500 to-red-600' :
                index === 2 ? 'from-blue-500 to-blue-600' :
                'from-purple-500 to-purple-600'
              } rounded-lg flex items-center justify-center`}>
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center space-x-1 text-sm font-medium ${
                kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpi.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{kpi.change}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</div>
            <div className="text-sm text-gray-600">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
              Biểu đồ doanh thu
            </h3>
            <div className="flex space-x-2 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Doanh thu</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Chi phí</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Lợi nhuận</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {monthlyData.map((data, index) => {
              const maxValue = Math.max(...monthlyData.map(d => d.revenue));
              const revenueWidth = (data.revenue / maxValue) * 100;
              const expenseWidth = (data.expenses / maxValue) * 100;
              const profitWidth = (data.profit / maxValue) * 100;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{data.month}</span>
                    <span className="text-gray-600">{data.revenue.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${revenueWidth}%` }}
                      ></div>
                    </div>
                    <div className="w-full bg-transparent rounded-full h-2 absolute top-0">
                      <div 
                        className="bg-red-500 h-2 rounded-full opacity-70"
                        style={{ width: `${expenseWidth}%` }}
                      ></div>
                    </div>
                    <div className="w-full bg-transparent rounded-full h-2 absolute top-0">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${profitWidth}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Service Revenue Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-green-500" />
            Doanh thu theo dịch vụ
          </h3>
          
          <div className="space-y-4">
            {serviceRevenueData.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`w-4 h-4 ${service.color} rounded-full`}></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{service.service}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`${service.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${service.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="font-semibold text-gray-900">
                    {service.revenue.toLocaleString('vi-VN')} đ
                  </div>
                  <div className="text-sm text-gray-600">{service.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Financial Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Chi tiết tài chính theo tháng</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Tháng</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Doanh thu</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Chi phí</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Lợi nhuận</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Biên LN</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Tăng trưởng</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((data, index) => {
                const profitMargin = ((data.profit / data.revenue) * 100).toFixed(1);
                const growth = index > 0 ? (((data.revenue - monthlyData[index - 1].revenue) / monthlyData[index - 1].revenue) * 100).toFixed(1) : '0';
                
                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-6 font-medium text-gray-900">{data.month}</td>
                    <td className="py-3 px-6 text-gray-900">{data.revenue.toLocaleString('vi-VN')} đ</td>
                    <td className="py-3 px-6 text-gray-900">{data.expenses.toLocaleString('vi-VN')} đ</td>
                    <td className="py-3 px-6 font-semibold text-green-600">{data.profit.toLocaleString('vi-VN')} đ</td>
                    <td className="py-3 px-6 text-gray-900">{profitMargin}%</td>
                    <td className="py-3 px-6">
                      <span className={`flex items-center space-x-1 ${
                        parseFloat(growth) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {parseFloat(growth) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>{growth}%</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;