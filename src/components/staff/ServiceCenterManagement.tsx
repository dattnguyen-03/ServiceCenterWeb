import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Modal, message, Spin, Statistic, Tag } from 'antd';
import { SearchOutlined, BankOutlined, EyeOutlined, PhoneOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { getAllServiceCenters, ServiceCenter } from '../../services/serviceCenterManagementService';

interface ServiceCenterDetail extends ServiceCenter {
  managerID?: number;
  managerName?: string;
}

const ServiceCenterManagement: React.FC = () => {
  const [serviceCenters, setServiceCenters] = useState<ServiceCenterDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<ServiceCenterDetail | null>(null);

  // Fetch service centers from API
  const fetchServiceCenters = async () => {
    try {
      setLoading(true);
      console.log('Fetching service centers...');
      const data = await getAllServiceCenters();
      console.log('Service centers received:', data);
      setServiceCenters(data);
    } catch (error: any) {
      console.error('Error fetching service centers:', error);
      message.error(`Không thể tải danh sách trung tâm dịch vụ: ${error?.message || 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceCenters();
  }, []);

  // Handle view detail
  const handleViewDetail = (center: ServiceCenterDetail) => {
    setSelectedCenter(center);
    setIsDetailModalVisible(true);
  };

  // Filter service centers based on search text
  const filteredCenters = serviceCenters.filter(center =>
    center.name.toLowerCase().includes(searchText.toLowerCase()) ||
    center.address.toLowerCase().includes(searchText.toLowerCase()) ||
    center.phone.includes(searchText)
  );

  const columns = [
    {
      title: 'Tên trung tâm',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: ServiceCenterDetail, b: ServiceCenterDetail) => a.name.localeCompare(b.name),
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Quản lý',
      dataIndex: 'managerName',
      key: 'managerName',
      render: (name: string) => name || <span className="text-gray-400">Chưa có</span>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: ServiceCenterDetail) => (
        <button
          type="button"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          onClick={() => handleViewDetail(record)}
        >
          <EyeOutlined className="mr-1.5" />
          Chi tiết
        </button>
      ),
    },
  ];

  return (
    <div className="p-0">
      {/* Header Section - Matching Admin Style */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <BankOutlined className="text-white text-3xl" />
              </div>
              <div>
                <h2 className="!mb-1 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Danh Sách Trung Tâm Dịch Vụ
                </h2>
                <p className="text-gray-600 text-base">
                  Xem thông tin chi tiết các trung tâm dịch vụ trong hệ thống
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Hệ thống hoạt động bình thường</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Tổng: {serviceCenters.length} trung tâm
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Card */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <Statistic
            title={<span className="text-gray-600">Tổng số trung tâm</span>}
            value={serviceCenters.length}
            prefix={<BankOutlined className="text-indigo-500" />}
            valueStyle={{ color: '#6366f1' }}
          />
        </Card>
      </div>

      {/* Table Section */}
      <Card className="rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <Input
            placeholder="Tìm kiếm theo tên, địa chỉ, số điện thoại..."
            prefix={<SearchOutlined />}
            size="large"
            className="w-full max-w-md"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredCenters}
            rowKey="centerID"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>

      {/* Service Center Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <BankOutlined className="text-indigo-500" />
            <span>Chi tiết trung tâm: <strong>{selectedCenter?.name}</strong></span>
          </div>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
        className="custom-modal"
      >
        {selectedCenter && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-indigo-50 to-blue-100 border-indigo-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BankOutlined className="text-indigo-500" />
                Thông tin trung tâm
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-gray-600 flex items-center gap-2">
                    <span>Tên trung tâm:</span>
                  </div>
                  <div className="font-medium text-gray-800">{selectedCenter.name}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-gray-600 flex items-center gap-2">
                    <span>Số điện thoại:</span>
                  </div>
                  <div className="font-medium text-gray-800 flex items-center gap-2">
                    <PhoneOutlined />
                    {selectedCenter.phone}
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="text-gray-600 flex items-center gap-2">
                    <EnvironmentOutlined />
                    <span>Địa chỉ:</span>
                  </div>
                  <div className="font-medium text-gray-800">{selectedCenter.address}</div>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="text-gray-600 flex items-center gap-2">
                    <UserOutlined />
                    <span>Quản lý:</span>
                  </div>
                  <div className="font-medium text-gray-800">
                    {selectedCenter.managerName || <span className="text-gray-400">Chưa có quản lý</span>}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>Thông tin bổ sung</span>
              </h3>
              <div className="text-center py-8 text-gray-500">
                <BankOutlined className="text-4xl text-gray-300 mb-3" />
                <p className="text-base">Chi tiết về trung tâm dịch vụ</p>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ServiceCenterManagement;

