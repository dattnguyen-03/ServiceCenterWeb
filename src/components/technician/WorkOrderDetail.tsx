import React from 'react';
import { Card, Row, Col, Tag, Progress, Timeline, Button, Descriptions } from 'antd';
import { FileTextOutlined, ToolOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ServiceTicket } from '../../types';

const ServiceDetails: React.FC<{ ticket: ServiceTicket }> = ({ ticket }) => {
  return (
    <Card title="Chi tiết công việc" className="mb-4">
      <Descriptions bordered size="small">
        <Descriptions.Item label="Trạng thái">
          <Tag color={ticket.status === 'working' ? 'processing' : 'success'}>
            {ticket.status === 'working' ? 'Đang thực hiện' : 'Hoàn thành'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian bắt đầu">{ticket.startTime}</Descriptions.Item>
        <Descriptions.Item label="Thời gian dự kiến">2 giờ</Descriptions.Item>
      </Descriptions>

      <Timeline className="mt-4">
        {ticket.checklist.map(item => (
          <Timeline.Item 
            key={item.id}
            dot={item.completed ? <CheckCircleOutlined className="text-green-500" /> : <ToolOutlined className="text-gray-400" />}
            color={item.completed ? 'green' : 'gray'}
          >
            <div className="flex justify-between items-center">
              <span className={item.completed ? 'line-through text-gray-500' : ''}>
                {item.task}
              </span>
              {!item.completed && (
                <Button size="small" type="primary">
                  Hoàn thành
                </Button>
              )}
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  );
};

const WorkOrderDetail: React.FC = () => {
  // Mock data - thay thế bằng data thật từ API
  const serviceTicket: ServiceTicket = {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Chi tiết công việc #{serviceTicket.id}</h2>
          <p className="text-gray-600">Cập nhật tiến độ và ghi nhận tình trạng xe</p>
        </div>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            {/* Thông tin cơ bản */}
            <Card title="Thông tin dịch vụ" className="mb-4">
              <Row gutter={16}>
                <Col span={8}>
                  <div className="text-gray-500">Dịch vụ</div>
                  <div className="font-semibold mt-1">
                    {serviceTicket.services.join(', ')}
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-gray-500">Kỹ thuật viên</div>
                  <div className="font-semibold mt-1">{serviceTicket.technician}</div>
                </Col>
                <Col span={8}>
                  <div className="text-gray-500">Chi phí dự kiến</div>
                  <div className="font-semibold mt-1">
                    {serviceTicket.cost.toLocaleString()} đ
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Tiến độ công việc */}
            <Card title="Tiến độ công việc" className="mb-4">
              <div className="mb-4">
                <Progress percent={50} status="active" />
              </div>
              <Row gutter={16}>
                <Col span={8}>
                  <Card className="text-center">
                    <FileTextOutlined className="text-2xl text-blue-600 mb-2" />
                    <div className="font-semibold">Tiếp nhận</div>
                    <div className="text-gray-500">Hoàn thành</div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card className="text-center">
                    <ToolOutlined className="text-2xl text-blue-600 mb-2" />
                    <div className="font-semibold">Đang thực hiện</div>
                    <div className="text-orange-500">Đang xử lý</div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card className="text-center">
                    <CheckCircleOutlined className="text-2xl text-gray-400 mb-2" />
                    <div className="font-semibold">Hoàn thành</div>
                    <div className="text-gray-500">Chưa bắt đầu</div>
                  </Card>
                </Col>
              </Row>
            </Card>

            {/* Chi tiết công việc */}
            <ServiceDetails ticket={serviceTicket} />

            {/* Ghi chú & Khuyến nghị */}
            <Card title="Ghi chú & Khuyến nghị">
              <textarea
                className="w-full p-2 border rounded"
                rows={4}
                placeholder="Nhập ghi chú và khuyến nghị cho khách hàng..."
              />
              <div className="mt-4 flex justify-end space-x-4">
                <Button type="default">Lưu nháp</Button>
                <Button type="primary">Hoàn thành công việc</Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default WorkOrderDetail;