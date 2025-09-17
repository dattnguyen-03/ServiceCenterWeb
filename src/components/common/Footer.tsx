import React from 'react';
import { Layout, Row, Col, Typography, Space } from 'antd';
import { FacebookOutlined, TwitterOutlined, InstagramOutlined, LinkedinOutlined } from '@ant-design/icons';

const { Footer } = Layout;
const { Title, Link, Text } = Typography;

const AppFooter: React.FC = () => {
  return (
    <Footer style={{ backgroundColor: '#f0f2f5', padding: '40px 50px' }}>
      <Row gutter={[16, 48]} justify="space-between">
        <Col xs={24} sm={12} md={8}>
          <Title level={4}>GarageBox</Title>
          <Text type="secondary">Phần mềm quản lý garage hàng đầu Việt Nam.</Text>
          <div style={{ marginTop: '20px' }}>
            <Space size="middle">
              <Link href="https://facebook.com" target="_blank" style={{ fontSize: '24px' }}><FacebookOutlined /></Link>
              <Link href="https://twitter.com" target="_blank" style={{ fontSize: '24px' }}><TwitterOutlined /></Link>
              <Link href="https://instagram.com" target="_blank" style={{ fontSize: '24px' }}><InstagramOutlined /></Link>
              <Link href="https://linkedin.com" target="_blank" style={{ fontSize: '24px' }}><LinkedinOutlined /></Link>
            </Space>
          </div>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Title level={5}>Sản phẩm</Title>
          <div><Link href="#">Tính năng</Link></div>
          <div><Link href="#">Bảng giá</Link></div>
          <div><Link href="#">Demo</Link></div>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Title level={5}>Công ty</Title>
          <div><Link href="#">Về chúng tôi</Link></div>
          <div><Link href="#">Liên hệ</Link></div>
          <div><Link href="#">Tuyển dụng</Link></div>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Title level={5}>Đăng ký nhận tin</Title>
          <Text type="secondary">Nhận thông tin cập nhật mới nhất và các ưu đãi.</Text>
          {/* Subscription form can be added here */}
        </Col>
      </Row>
      <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e8e8e8' }}>
        <Text type="secondary">©2024 GarageBox. All rights reserved.</Text>
      </div>
    </Footer>
  );
};

export default AppFooter;
