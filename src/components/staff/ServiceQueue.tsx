import React, { useState } from 'react';
import { Card, Table, Tag, Select, Button, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { ServiceTicket } from '../../types';

interface QueueItem {
  ticketId: string;
  customerName: string;
  vehicleInfo: string;
  serviceType: string;
  priority: 'high' | 'medium' | 'low';
  status: 'waiting' | 'in-progress' | 'completed';
  assignedTo?: string;
  estimatedTime: number; // in minutes
  startTime?: string;
}

const ServiceQueue: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // Mock data - replace with API calls
  const queueItems: QueueItem[] = [
    {
      ticketId: 'SV001',
      customerName: 'Nguyễn Văn A',
      vehicleInfo: 'VinFast VF8 - 30A-12345',
      serviceType: 'Bảo dưỡng định kỳ',
      priority: 'high',
      status: 'waiting',
      estimatedTime: 120,
    },
    // Add more mock items...
  ];

  const technicians = [
    { id: '1', name: 'Kỹ thuật viên 1', status: 'available' },
    { id: '2', name: 'Kỹ thuật viên 2', status: 'busy' },
    // Add more technicians...
  ];

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'ticketId',
      key: 'ticketId',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Thông tin xe',
      dataIndex: 'vehicleInfo',
      key: 'vehicleInfo',
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceType',
      key: 'serviceType',
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const colors = {
          high: 'red',
          medium: 'orange',
          low: 'green',
        };
        const texts = {
          high: 'Cao',
          medium: 'Trung bình',
          low: 'Thấp',
        };
        return (
          <Tag color={colors[priority as keyof typeof colors]}>
            {texts[priority as keyof typeof texts]}
          </Tag>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          waiting: 'orange',
          'in-progress': 'blue',
          completed: 'green',
        };
        const texts = {
          waiting: 'Đang chờ',
          'in-progress': 'Đang thực hiện',
          completed: 'Hoàn thành',
        };
        return (
          <Tag color={colors[status as keyof typeof colors]}>
            {texts[status as keyof typeof texts]}
          </Tag>
        );
      },
    },
    {
      title: 'Thời gian ước tính',
      dataIndex: 'estimatedTime',
      key: 'estimatedTime',
      render: (time: number) => `${time} phút`,
    },
    {
      title: 'Kỹ thuật viên',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (technicianId: string, record: QueueItem) => (
        <Select
          style={{ width: 200 }}
          placeholder="Chọn kỹ thuật viên"
          value={technicianId}
          onChange={(value) => handleAssignTechnician(record.ticketId, value)}
          options={technicians.map(tech => ({
            value: tech.id,
            label: tech.name,
            disabled: tech.status === 'busy',
          }))}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (text: string, record: QueueItem) => (
        <div className="space-x-2">
          {record.status === 'waiting' && (
            <Button
              type="primary"
              onClick={() => handleStartService(record.ticketId)}
              disabled={!record.assignedTo}
            >
              Bắt đầu
            </Button>
          )}
          {record.status === 'in-progress' && (
            <Button
              type="primary"
              onClick={() => handleCompleteService(record.ticketId)}
            >
              Hoàn thành
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleAssignTechnician = (ticketId: string, technicianId: string) => {
    // Call API to assign technician
    message.success('Đã phân công kỹ thuật viên');
  };

  const handleStartService = (ticketId: string) => {
    // Call API to start service
    message.success('Bắt đầu thực hiện dịch vụ');
  };

  const handleCompleteService = (ticketId: string) => {
    // Call API to complete service
    message.success('Đã hoàn thành dịch vụ');
  };

  const refreshQueue = () => {
    setLoading(true);
    // Call API to refresh queue
    setTimeout(() => {
      setLoading(false);
      message.success('Đã cập nhật danh sách');
    }, 1000);
  };

  return (
    <div className="p-6">
      <Card
        title="Quản lý hàng chờ dịch vụ"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={refreshQueue}
            loading={loading}
          >
            Làm mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={queueItems}
          rowKey="ticketId"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default ServiceQueue;