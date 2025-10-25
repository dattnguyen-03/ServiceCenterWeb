import React, { useState } from "react";
import { Tag, Button, Modal, Row, Col } from "antd";
import { GiftOutlined } from "@ant-design/icons";

interface Service {
  id: number;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: "active" | "expiring" | "expired";
  remaining: number;
}

const statusEmoji = {
  active: "✨ Đang hoạt động",
  expiring: "⏰ Sắp hết hạn",
  expired: "❌ Hết hạn",
};

const MyServices: React.FC = () => {
  const [services] = useState<Service[]>([
    {
      id: 1,
      name: "Gói bảo dưỡng định kỳ 6 tháng",
      type: "Bảo dưỡng",
      startDate: "2025-03-01",
      endDate: "2025-09-01",
      status: "active",
      remaining: 2,
    },
    {
      id: 2,
      name: "Kiểm tra pin nâng cao",
      type: "Kiểm tra pin",
      startDate: "2025-06-01",
      endDate: "2025-09-15",
      status: "expiring",
      remaining: 1,
    },
    {
      id: 3,
      name: "Dịch vụ sửa chữa ưu tiên",
      type: "Sửa chữa",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      status: "expired",
      remaining: 0,
    },
  ]);

  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleRenew = (service: Service) => {
    Modal.success({
      title: "Gia hạn dịch vụ",
      content: `Bạn muốn gia hạn gói: ${service.name}?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
    });
  };

  const handleUpgrade = (service: Service) => {
    Modal.info({
      title: "Nâng cấp dịch vụ",
      content: `Bạn muốn nâng cấp gói: ${service.name}?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
    });
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f9fafb 100%)' }}>
      {/* Gradient Header */}
      <div className="p-8 bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-b-3xl shadow-lg mb-8">
        <div className="flex items-center mb-3">
          <GiftOutlined style={{ fontSize: 32, marginRight: 12 }} />
          <h1 className="text-4xl font-bold">Dịch vụ của tôi</h1>
        </div>
        <p className="text-indigo-100 text-lg">Quản lý các gói dịch vụ và tiện ích đã đăng ký</p>
      </div>

      <div className="px-6 pb-6">
        <Row gutter={[24, 24]}>
          {services.map((service) => {
            const statusIcon = {
              active: '✨',
              expiring: '⏰',
              expired: '❌'
            }[service.status];

            const statusBg = {
              active: { bg: '#f0fdf4', border: '#86efac', color: '#16a34a' },
              expiring: { bg: '#fefce8', border: '#fcd34d', color: '#b45309' },
              expired: { bg: '#fee2e2', border: '#fca5a5', color: '#dc2626' }
            }[service.status];

            return (
              <Col key={service.id} xs={24} md={12} lg={8}>
                <div
                  className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  style={{
                    background: '#fff',
                    borderRadius: 20,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden'
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${
                        service.status === 'active'
                          ? '#f0fdf4'
                          : service.status === 'expiring'
                          ? '#fefce8'
                          : '#fee2e2'
                      } 0%, #f9fafb 100%)`,
                      padding: 24,
                      borderBottom: `3px solid ${statusBg.border}`,
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                      <div style={{ fontSize: 32 }}>{statusIcon}</div>
                      <Tag
                        style={{
                          borderRadius: 20,
                          background: statusBg.bg,
                          border: `2px solid ${statusBg.border}`,
                          color: statusBg.color,
                          fontWeight: 700,
                          padding: '6px 14px',
                          fontSize: 12
                        }}
                      >
                        {statusEmoji[service.status]}
                      </Tag>
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1f2937', margin: 0, marginBottom: 6 }}>
                      {service.name}
                    </h3>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                      📦 <span style={{ fontWeight: 600 }}>{service.type}</span>
                    </p>
                  </div>

                  {/* Content */}
                  <div style={{ padding: 24 }}>
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>📅 Ngày bắt đầu</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937' }}>{service.startDate}</div>
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>⏳ Hết hạn</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937' }}>{service.endDate}</div>
                    </div>

                    <div style={{
                      background: 'linear-gradient(135deg, #f0f9ff 0%, #f9fafb 100%)',
                      padding: 14,
                      borderRadius: 12,
                      marginBottom: 18,
                      border: '2px solid #bfdbfe'
                    }}>
                      <div style={{ fontSize: 11, color: '#0c4a6e', marginBottom: 6, fontWeight: 600 }}>📊 Lượt sử dụng còn lại</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#0284c7' }}>
                        {service.remaining > 0 ? service.remaining : '0'}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <Button
                        type="primary"
                        size="large"
                        onClick={() => setSelectedService(service)}
                        style={{
                          borderRadius: 10,
                          background: 'linear-gradient(90deg, #a78bfa 0%, #9333ea 100%)',
                          border: 'none',
                          fontWeight: 700,
                          height: 40
                        }}
                      >
                        Chi tiết
                      </Button>
                      {service.status !== 'expired' && (
                        <Button
                          size="large"
                          onClick={() => handleRenew(service)}
                          style={{
                            borderRadius: 10,
                            borderColor: '#d8b4fe',
                            color: '#7c3aed',
                            fontWeight: 700,
                            height: 40,
                            background: '#f9f5ff'
                          }}
                        >
                          Gia hạn
                        </Button>
                      )}
                      {service.status === 'expiring' && (
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => handleUpgrade(service)}
                          style={{
                            borderRadius: 10,
                            background: '#f59e0b',
                            border: 'none',
                            fontWeight: 700,
                            height: 40
                          }}
                        >
                          Nâng cấp
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* Modal chi tiết dịch vụ */}
      <Modal
        open={!!selectedService}
        title={
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>
            Chi tiết dịch vụ
          </div>
        }
        onCancel={() => setSelectedService(null)}
        footer={[
          <Button
            key="close"
            onClick={() => setSelectedService(null)}
            style={{
              borderRadius: 10,
              fontWeight: 600,
              height: 40
            }}
          >
            Đóng
          </Button>,
        ]}
        centered
        bodyStyle={{ borderRadius: 16 }}
      >
        {selectedService && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #f9fafb 100%)',
              padding: 16,
              borderRadius: 12,
              border: '2px solid #86efac'
            }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Tên gói</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#16a34a' }}>
                {selectedService.name}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{
                background: '#f9fafb',
                padding: 12,
                borderRadius: 10,
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Loại dịch vụ</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>
                  {selectedService.type}
                </div>
              </div>

              <div style={{
                background: '#f9fafb',
                padding: 12,
                borderRadius: 10,
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Lượt còn lại</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>
                  {selectedService.remaining} lần
                </div>
              </div>

              <div style={{
                background: '#f9fafb',
                padding: 12,
                borderRadius: 10,
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Ngày bắt đầu</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>
                  {selectedService.startDate}
                </div>
              </div>

              <div style={{
                background: '#f9fafb',
                padding: 12,
                borderRadius: 10,
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Ngày hết hạn</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>
                  {selectedService.endDate}
                </div>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%)',
              padding: 16,
              borderRadius: 12,
              border: '2px solid #fcd34d'
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#b45309', marginBottom: 8 }}>🎁 Quyền lợi bao gồm:</div>
              <ul style={{ margin: 0, paddingLeft: 20, color: '#9a3412' }}>
                <li style={{ fontSize: 13, marginBottom: 4 }}>Ưu tiên đặt lịch</li>
                <li style={{ fontSize: 13, marginBottom: 4 }}>Giảm giá 10% cho dịch vụ bổ sung</li>
                <li style={{ fontSize: 13 }}>Hỗ trợ trực tuyến 24/7</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyServices;
