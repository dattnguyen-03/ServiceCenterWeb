import React, { useState } from "react";
import { Typography, Card, Tag, Button, List, Space, Modal } from "antd";

const { Title, Paragraph, Text } = Typography;

interface Service {
  id: number;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: "active" | "expiring" | "expired";
  remaining: number;
}

const statusColors = {
  active: "green",
  expiring: "orange",
  expired: "red",
};

const MyServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([
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
    Modal.info({
      title: `Gia hạn dịch vụ`,
      content: `Bạn muốn gia hạn gói: ${service.name}?`,
    });
  };

  const handleUpgrade = (service: Service) => {
    Modal.info({
      title: `Nâng cấp dịch vụ`,
      content: `Bạn muốn nâng cấp gói: ${service.name}?`,
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Dịch vụ của tôi</Title>
      <Paragraph>Quản lý các gói dịch vụ và tiện ích đã đăng ký.</Paragraph>

      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={services}
        renderItem={(service) => (
          <List.Item>
            <Card
              title={
                <Space>
                  {service.name}
                  <Tag color={statusColors[service.status]}>
                    {service.status === "active"
                      ? "Đang hoạt động"
                      : service.status === "expiring"
                      ? "Sắp hết hạn"
                      : "Hết hạn"}
                  </Tag>
                </Space>
              }
              bordered
              actions={[
                service.status !== "expired" && (
                  <Button type="link" onClick={() => handleRenew(service)}>
                    Gia hạn
                  </Button>
                ),
                service.status === "expiring" && (
                  <Button type="link" onClick={() => handleUpgrade(service)}>
                    Nâng cấp
                  </Button>
                ),
              ]}
            >
              <Paragraph>
                <Text strong>Loại dịch vụ: </Text> {service.type}
              </Paragraph>
              <Paragraph>
                <Text strong>Ngày bắt đầu: </Text> {service.startDate}
              </Paragraph>
              <Paragraph>
                <Text strong>Ngày hết hạn: </Text> {service.endDate}
              </Paragraph>
              <Paragraph>
                <Text strong>Số lần sử dụng còn lại: </Text>{" "}
                {service.remaining > 0 ? service.remaining : "Hết lượt"}
              </Paragraph>
              <Button
                type="primary"
                onClick={() => setSelectedService(service)}
              >
                Xem chi tiết
              </Button>
            </Card>
          </List.Item>
        )}
      />

      {/* Modal chi tiết dịch vụ */}
      <Modal
        open={!!selectedService}
        title={`Chi tiết dịch vụ`}
        onCancel={() => setSelectedService(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedService(null)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedService && (
          <>
            <Paragraph>
              <Text strong>Tên gói: </Text> {selectedService.name}
            </Paragraph>
            <Paragraph>
              <Text strong>Loại dịch vụ: </Text> {selectedService.type}
            </Paragraph>
            <Paragraph>
              <Text strong>Ngày bắt đầu: </Text> {selectedService.startDate}
            </Paragraph>
            <Paragraph>
              <Text strong>Ngày hết hạn: </Text> {selectedService.endDate}
            </Paragraph>
            <Paragraph>
              <Text strong>Số lần sử dụng còn lại: </Text>{" "}
              {selectedService.remaining}
            </Paragraph>
            <Paragraph>
              <Text strong>Quyền lợi: </Text> Ưu tiên đặt lịch, giảm giá 10% cho
              dịch vụ bổ sung, hỗ trợ trực tuyến 24/7.
            </Paragraph>
          </>
        )}
      </Modal>
    </div>
  );
};

export default MyServices;
