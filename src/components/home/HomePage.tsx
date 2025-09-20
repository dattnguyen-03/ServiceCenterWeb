import React, { useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Button, Col, Row, Typography, Dropdown, Space, Card, Statistic, Tag, Avatar, Modal } from 'antd';
import { 
  DownOutlined, 
  GlobalOutlined, 
  RightOutlined,
  ScheduleOutlined,
  DollarCircleOutlined,
  InboxOutlined,
  ToolOutlined,
  CarOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  CalendarOutlined,
  PlusOutlined,
  LogoutOutlined,
  UserOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { mockVehicles } from '../../data/mockData';

const { Title, Paragraph, Text } = Typography;

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="flex items-start p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
    <div className="text-xl mr-4 mt-1 text-blue-600">{icon}</div>
    <div>
      <Text strong>{title}</Text>
      <Paragraph type="secondary" className="text-sm mb-0">{description}</Paragraph>
    </div>
  </div>
);

const featuresDropdownContent = (
  <div className="bg-white rounded-xl shadow-2xl border" style={{ width: 550 }}>
    <div className="p-6">
      <Row gutter={[16, 16]}>
        <Col span={12}><FeatureCard icon={<ScheduleOutlined />} title="Quy trình làm việc" description="Giao việc, lập lịch và theo dõi tiến độ theo thời gian thực." /></Col>
        <Col span={12}><FeatureCard icon={<DollarCircleOutlined />} title="Báo giá" description="Gửi báo giá chuyên nghiệp chỉ trong vài giây." /></Col>
        <Col span={12}><FeatureCard icon={<InboxOutlined />} title="Tồn kho" description="Nắm rõ tồn kho từ phụ tùng đến lốp xe." /></Col>
        <Col span={12}><FeatureCard icon={<ToolOutlined />} title="Kiểm tra phương tiện" description="Phát hiện sớm vấn đề và xây dựng lòng tin." /></Col>
      </Row>
    </div>
    <div className="bg-gray-50 p-4 text-center rounded-b-xl">
      <Link to="/features" className="text-blue-600 font-semibold hover:text-blue-700">
        Xem tất cả tính năng <RightOutlined />
      </Link>
    </div>
  </div>
);

const SimpleMenuItem = ({ title, description }: { title: string, description: string }) => (
  <div className="flex items-start p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
    <div>
      <Text strong>{title}</Text>
      <Paragraph type="secondary" className="text-sm mb-0">{description}</Paragraph>
    </div>
  </div>
);

const solutionsDropdownContent = (
  <div className="bg-white rounded-xl shadow-2xl border p-4" style={{ width: 300 }}>
    <SimpleMenuItem title="Gara ô tô" description="Giải pháp toàn diện cho gara của bạn." />
    <SimpleMenuItem title="Cửa hàng lốp" description="Quản lý lốp xe hiệu quả." />
    <SimpleMenuItem title="Trung tâm detailing" description="Tối ưu hóa quy trình chăm sóc xe." />
  </div>
);

const companyDropdownContent = (
  <div className="bg-white rounded-xl shadow-2xl border p-4" style={{ width: 300 }}>
    <SimpleMenuItem title="Về chúng tôi" description="Tìm hiểu thêm về GarageBox." />
    <SimpleMenuItem title="Tuyển dụng" description="Gia nhập đội ngũ của chúng tôi." />
    <SimpleMenuItem title="Báo chí" description="Thông tin từ truyền thông." />
  </div>
);

const resourcesDropdownContent = (
  <div className="bg-white rounded-xl shadow-2xl border p-4" style={{ width: 300 }}>
    <SimpleMenuItem title="Blog" description="Bài viết và tin tức mới nhất." />
    <SimpleMenuItem title="Hướng dẫn" description="Tài liệu hướng dẫn sử dụng." />
    <SimpleMenuItem title="Trung tâm hỗ trợ" description="Nhận sự trợ giúp khi bạn cần." />
  </div>
);

const CustomerVehicleDashboard = () => {
  const vehicles = mockVehicles.filter(v => v.customerId === '1');

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)} ngày trước`;
    return `Còn ${diffDays} ngày`;
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Xe của tôi</h1>
        <p className="text-gray-600 text-base">Quản lý thông tin và lịch sử bảo dưỡng các xe điện</p>
      </div>

      <Row gutter={[32, 32]}>
        {vehicles.map((vehicle) => (
          <Col key={vehicle.id} xs={24} lg={12}>
            <Card
              style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
              bodyStyle={{ padding: 0 }}
            >
              {/* Vehicle Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                <Row align="middle" gutter={16}>
                  <Col>
                    <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                      <CarOutlined style={{ fontSize: '32px' }} />
                    </div>
                  </Col>
                  <Col>
                    <h3 className="text-xl font-bold">{vehicle.model}</h3>
                    <p className="text-blue-100 opacity-90">VIN: {vehicle.vin}</p>
                    <p className="text-blue-100 opacity-90">Năm sản xuất: {vehicle.year}</p>
                  </Col>
                </Row>
              </div>

              {/* Vehicle Stats & Maintenance */}
              <div className="p-6">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card bodyStyle={{ padding: 16 }} className="bg-blue-50 border-blue-100">
                      <Statistic
                        title={<span className="text-gray-600">Dung lượng pin</span>}
                        value={vehicle.batteryCapacity}
                        prefix={<ThunderboltOutlined />}
                        valueStyle={{ color: '#1d4ed8', fontWeight: 600 }}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                     <Card bodyStyle={{ padding: 16 }} className="bg-green-50 border-green-100">
                      <Statistic
                        title={<span className="text-gray-600">Quãng đường</span>}
                        value={`${vehicle.mileage.toLocaleString()} km`}
                        prefix={<DashboardOutlined />}
                        valueStyle={{ color: '#16a34a', fontWeight: 600 }}
                      />
                    </Card>
                  </Col>
                  <Col span={24}>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mt-2">
                      <Space align="start">
                        <CalendarOutlined className="text-gray-500 mt-1" />
                        <div>
                          <div className="font-medium text-gray-900">Bảo dưỡng cuối cùng</div>
                          <div className="text-sm text-gray-600">Kiểm tra tổng thể</div>
                        </div>
                      </Space>
                      <div className="text-right">
                        <Tag>{new Date(vehicle.lastService).toLocaleDateString('vi-VN')}</Tag>
                        <div className="text-sm text-gray-500 mt-1">{getDaysRemaining(vehicle.lastService)}</div>
                      </div>
                    </div>
                  </Col>
                   <Col span={24}>
                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                       <Space align="start">
                        <CalendarOutlined className="text-orange-500 mt-1" />
                        <div>
                          <div className="font-medium text-gray-900">Bảo dưỡng tiếp theo</div>
                          <div className="text-sm text-gray-600">Bảo dưỡng định kỳ 20,000km</div>
                        </div>
                      </Space>
                      <div className="text-right">
                        <Tag color="orange">{new Date(vehicle.nextServiceDue).toLocaleDateString('vi-VN')}</Tag>
                        <div className="text-sm text-orange-600 font-semibold mt-1">{getDaysRemaining(vehicle.nextServiceDue)}</div>
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Actions */}
                <Row gutter={16} className="mt-6">
                  <Col span={16}>
                    <Button type="primary" block size="large" className="!bg-gradient-to-r !from-blue-600 !to-indigo-700">
                      Đặt lịch bảo dưỡng
                    </Button>
                  </Col>
                  <Col span={8}>
                    <Button block size="large">
                      Xem lịch sử
                    </Button>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        ))}

        {/* Add Vehicle Card */}
        <Col xs={24} lg={12} className="flex">
           <Link to="/vehicles/add" className="w-full">
            <div className="h-full flex items-center justify-center bg-white rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors duration-300 cursor-pointer">
              <div>
                <PlusOutlined className="text-3xl text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Thêm xe mới</h3>
                <p className="text-gray-600">Đăng ký xe điện mới để quản lý bảo dưỡng</p>
              </div>
            </div>
          </Link>
        </Col>
      </Row>
    </div>
  );
}

const FeatureSectionCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-blue-100">
    <div className="text-4xl text-blue-500 mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">{title}</h3>
    <p className="text-gray-600 text-base leading-relaxed">{description}</p>
  </div>
);

const PublicHomePage = () => {
  const navigate = useNavigate();
  const [demoVisible, setDemoVisible] = useState(false);

  return (
    <>
      {/* Header/Navbar only for HomePage */}
      <header className="border-b sticky top-0 bg-white/80 backdrop-blur-lg z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
           <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-4a2 2 0 012-2h10a2 2 0 012 2v4m-6 0v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2" />
            </svg>
          </div>
          <Title level={3} className="!mb-0 ml-2">GarageBox</Title>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-base">
          <Dropdown overlay={featuresDropdownContent} placement="bottomLeft">
            <a onClick={e => e.preventDefault()} className="flex items-center text-gray-600 hover:text-blue-600">
              <Space>
                Tính năng
                <DownOutlined style={{ fontSize: '12px' }} />
              </Space>
            </a>
          </Dropdown>
          <Dropdown overlay={solutionsDropdownContent} placement="bottomLeft">
            <a onClick={e => e.preventDefault()} className="flex items-center text-gray-600 hover:text-blue-600">
              <Space>
                Giải pháp
                <DownOutlined style={{ fontSize: '12px' }} />
              </Space>
            </a>
          </Dropdown>
          <Dropdown overlay={companyDropdownContent} placement="bottomLeft">
            <a onClick={e => e.preventDefault()} className="flex items-center text-gray-600 hover:text-blue-600">
              <Space>
                Công ty
                <DownOutlined style={{ fontSize: '12px' }} />
              </Space>
            </a>
          </Dropdown>
          <Dropdown overlay={resourcesDropdownContent} placement="bottomLeft">
            <a onClick={e => e.preventDefault()} className="flex items-center text-gray-600 hover:text-blue-600">
              <Space>
                Tài nguyên
                <DownOutlined style={{ fontSize: '12px' }} />
              </Space>
            </a>
          </Dropdown>
          <a href="#" className="text-gray-600 hover:text-blue-600">Giá cả</a>
        </nav>
        <div className="flex items-center space-x-4">
          <Button icon={<GlobalOutlined />}>Tiếng Việt</Button>
          <Space>
            <Link to="/login">
              <Button>Đăng nhập</Button>
            </Link>
            <Link to="/register">
              <Button type="primary">Đăng ký</Button>
            </Link>
          </Space>
        </div>
      </div>
    </header>

    {/* Hero Section + Slider */}
    <main className="bg-gradient-to-br from-blue-100 via-white to-blue-50">
      <div className="container mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="text-center lg:text-left flex flex-col justify-center lg:col-span-5">
          <Title level={1} className="!text-4xl md:!text-6xl font-extrabold !mb-4 text-gray-900 leading-tight">
            Kết Nối Garage và <span className="text-blue-600">Chủ Xe</span>
          </Title>
          <Paragraph className="max-w-xl text-lg text-gray-600 mb-6">
            GarageBox là giải pháp toàn diện, giúp chủ xe dễ dàng đặt lịch và theo dõi bảo dưỡng, đồng thời hỗ trợ các garage vận hành chuyên nghiệp và hiệu quả hơn.
          </Paragraph>
          <div className="mt-2 flex flex-col md:flex-row gap-4 justify-center md:justify-start">
            <Button
              type="primary"
              size="large"
              className="!bg-blue-600 hover:!bg-blue-700 !h-12 !px-8 !text-base !font-semibold shadow-lg"
              onClick={() => navigate('/login')}
            >
              Bắt đầu miễn phí
            </Button>
            <Button
              size="large"
              icon={<PlayCircleOutlined />}
              className="!h-12 !px-8 !text-base !font-semibold border-blue-600 text-blue-600 shadow"
              onClick={() => setDemoVisible(true)}
            >
              Xem Demo
            </Button>
          </div>
        </div>
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full">
            <Slider
              dots
              infinite
              speed={600}
              slidesToShow={1}
              slidesToScroll={1}
              autoplay
              autoplaySpeed={2000}
              className="rounded-3xl shadow-2xl border-4 border-blue-200"
            >
              <div>
                <img src="https://vinfast.otohungyen.com/wp-content/uploads/2021/04/Rectangle5850-1.png" alt="Garage Hero" className="rounded-3xl w-full h-96 object-cover" />
              </div>
              <div>
                <img src="https://cmu-cdn.vinfast.vn/2022/10/1945d3c5-sua_chua_dong_son_vinfast_2.png" alt="Garage Team" className="rounded-3xl w-full h-96 object-cover" />
              </div>
              <div>
                <img src="https://cdn.dailyxe.com.vn/image/dai-ly-vinfast-mien-bac-1-332991j.jpg" alt="Garage Service" className="rounded-3xl w-full h-96 object-cover" />
              </div>
              <div>
                <img src="https://cdn2.tuoitre.vn/thumb_w/480/471584752817336320/2024/10/26/vinfast-mo-rong-mang-luoi-xuong-dich-vu-17299051277801226705121.jpg" alt="Garage Customer" className="rounded-3xl w-full h-96 object-cover" />
              </div>
            </Slider>
          </div>
        </div>
      </div>
    </main>
    {/* Features Section */}
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <Title level={2} className="!text-3xl md:!text-4xl font-bold text-gray-900 mb-2">Tại sao chọn GarageBox?</Title>
          <Paragraph className="max-w-2xl mx-auto text-gray-600 text-lg">
            Những lợi ích vượt trội cho cả chủ xe và đối tác garage.
          </Paragraph>
        </div>
        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} md={8}><FeatureSectionCard icon={<CarOutlined />} title="Dành cho Chủ xe" description="Dễ dàng tìm kiếm garage uy tín, đặt lịch hẹn online, theo dõi lịch sử bảo dưỡng và nhận thông báo nhắc nhở." /></Col>
          <Col xs={24} md={8}><FeatureSectionCard icon={<ToolOutlined />} title="Dành cho Garage" description="Quản lý lịch hẹn, phiếu sửa chữa, tồn kho phụ tùng và chăm sóc khách hàng trên một nền tảng duy nhất." /></Col>
          <Col xs={24} md={8}><FeatureSectionCard icon={<ScheduleOutlined />} title="Quy trình minh bạch" description="Cập nhật tiến độ sửa chữa theo thời gian thực, báo giá rõ ràng và thanh toán tiện lợi cho cả hai bên." /></Col>
        </Row>
      </div>
    </section>

    {/* Workflow Section - làm đẹp lại */}
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <Title level={2} className="!text-3xl md:!text-4xl font-bold text-gray-900 mb-2">Quy trình làm việc đơn giản</Title>
        </div>
        <Row gutter={[32, 32]} justify="center" align="middle">
          <Col xs={24} md={8}>
            <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg p-8 h-full border border-blue-100 hover:shadow-2xl transition">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4 border-2 border-blue-300">1</div>
              <h3 className="text-lg font-semibold mb-2">Tiếp nhận & Đặt lịch</h3>
              <p className="text-gray-600 text-center">Ghi nhận thông tin khách hàng và xe, tạo lịch hẹn nhanh qua giao diện trực quan.</p>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg p-8 h-full border border-blue-100 hover:shadow-2xl transition">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4 border-2 border-blue-300">2</div>
              <h3 className="text-lg font-semibold mb-2">Lập phiếu & Sửa chữa</h3>
              <p className="text-gray-600 text-center">Tạo phiếu sửa chữa, chỉ định kỹ thuật viên, cập nhật tiến độ công việc.</p>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg p-8 h-full border border-blue-100 hover:shadow-2xl transition">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4 border-2 border-blue-300">3</div>
              <h3 className="text-lg font-semibold mb-2">Thanh toán & Bàn giao</h3>
              <p className="text-gray-600 text-center">In hóa đơn, ghi nhận thanh toán, bàn giao xe cho khách hàng.</p>
            </div>
          </Col>
        </Row>
        <div className="mt-12 flex justify-center">
          <img
            src="https://images2.thanhnien.vn/528068263637045248/2023/9/11/edit-sua-oto-dien-3-169439663847451556909.png"
            alt="Workflow"
            className="rounded-3xl shadow-2xl w-full max-w-5xl border-4 border-blue-200 object-cover transition-transform duration-500 hover:scale-105 hover:shadow-3xl"
            style={{ aspectRatio: '16/7', objectFit: 'cover' }}
          />
        </div>
      </div>
    </section>
    {/* Info Section */}
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
        <div className="flex flex-col items-center text-center">
          <Avatar size={96} src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1" />
          <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">Nguyễn Văn Nam</h3>
          <p className="text-gray-600">Chủ xe VinFast, khách hàng của GarageBox</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <Avatar size={96} src="https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1" />
          <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">Trần Minh Hùng</h3>
          <p className="text-gray-600">Chủ Gara H-Auto, đối tác của GarageBox</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <Avatar size={96} src="https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1" />
          <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">Lê Thị An</h3>
          <p className="text-gray-600">Quản lý hệ thống, hỗ trợ khách hàng 24/7</p>
        </div>
      </div>
    </section>
    {/* Modal Video Demo */}
    <Modal
      open={demoVisible}
      onCancel={() => setDemoVisible(false)}
      footer={null}
      centered
      width={800}
      bodyStyle={{
        padding: 0,
        background: "transparent",
      }}
      style={{
        background: "transparent",
      }}
      styles={{
        content: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        }
      }}
      destroyOnClose
      maskStyle={{ background: "rgba(0,0,0,0.7)" }}
      closable={false}
    >
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        {demoVisible && (
          <video
            src="/asset/videodemo.mp4"
            controls
            autoPlay
            className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
          >
            Trình duyệt của bạn không hỗtrợ video.
          </video>
        )}
      </div>
    </Modal>
    </>
  );
};

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const userMenu = (
    <div className="bg-white rounded-xl shadow-2xl border p-2" style={{ width: 200 }}>
       <SimpleMenuItem title="Trang cá nhân" description="Xem và sửa thông tin" />
       <SimpleMenuItem title="Lịch hẹn" description="Quản lý lịch hẹn của bạn" />
       <hr className="my-2" />
       <div
        onClick={handleLogout}
        className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
      >
        <LogoutOutlined className="mr-2" />
        <Text>Đăng xuất</Text>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <div className="flex-1">
        {user && user.role === 'customer' ? <CustomerVehicleDashboard /> : <PublicHomePage />}
      </div>
    </div>
  );
};

export default HomePage;
