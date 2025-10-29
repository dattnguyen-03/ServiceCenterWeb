import React, { useMemo, useState, useEffect } from 'react';
import { 
  Card, Row, Col, Button, Tag, Spin, Typography, Steps, Input, 
  Skeleton, Empty, ConfigProvider, Select, DatePicker, Space
} from 'antd';
import { 
  GiftOutlined, 
  CheckCircleOutlined,
  ShoppingCartOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { ServicePackage, ServiceCenter, VehicleResponse } from '../../types/api';
import { servicePackageService } from '../../services/servicePackageService';
import { serviceCenterService } from '../../services/serviceCenterService';
import { vehicleService } from '../../services/vehicleService';
import { appointmentService } from '../../services/appointmentService';
import { showSuccess, showError } from '../../utils/sweetAlert';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

// --- COMPONENT ---
const ServicePackages: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [centersLoading, setCentersLoading] = useState(false);
  const [centerQuery, setCenterQuery] = useState('');
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(0);
  
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<ServiceCenter | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<Dayjs | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Removed payment method - payment will be done when quote is approved

  // --- DATA FETCHING ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setCentersLoading(true);
      setVehiclesLoading(true);
      try {
        const [centersRes, packagesRes, vehiclesRes] = await Promise.all([
          serviceCenterService.getServiceCenters(),
          servicePackageService.getServicePackages(),
          vehicleService.getVehiclesByCustomer()
        ]);
        setServiceCenters([...centersRes].sort((a, b) => a.name.localeCompare(b.name)));
        setPackages(packagesRes);
        setVehicles(vehiclesRes);
      } catch (error: any) {
        console.error('Error loading data:', error);
        showError('Lỗi tải dữ liệu', error.message || 'Không thể tải dữ liệu cần thiết');
      } finally {
        setLoading(false);
        setCentersLoading(false);
        setVehiclesLoading(false);
      }
    };
    loadData();
  }, []);

  // --- HANDLERS ---
  const handleSelectCenter = (center: ServiceCenter) => {
    setSelectedCenter(center);
  };
  
  const handleSelectPackage = (pkg: ServicePackage) => {
    setSelectedPackage(prev => prev?.packageID === pkg.packageID ? null : pkg);
  };

  const handleSubmitBooking = async () => {
    console.log('=== NEW FLOW: Starting booking (no payment) ===');
    console.log('Selected package:', selectedPackage);
    console.log('Selected package price:', selectedPackage?.price);
    
    if (!selectedCenter || !selectedPackage || !selectedVehicleId || !selectedDateTime) {
      showError('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (selectedDateTime.isBefore(dayjs())) {
      showError('Ngày không hợp lệ', 'Vui lòng chọn ngày giờ trong tương lai.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Tạo appointment (không thanh toán)
      const appointmentPayload = {
        vehicleID: selectedVehicleId,
        serviceType: selectedPackage.name,
        centerID: selectedCenter.centerID,
        requestedDate: selectedDateTime.toISOString(),
      };
      
      console.log('🚀 Creating appointment...');
      const appointmentResponse = await appointmentService.book(appointmentPayload);
      const appointmentId = appointmentResponse?.appointmentID;
      
      if (!appointmentId) {
        throw new Error('Không nhận được appointment ID từ server');
      }
      
      console.log('✅ Appointment created, ID:', appointmentId);
      
      showSuccess('Đặt lịch thành công!', 
        `Bạn đã đặt lịch thành công cho dịch vụ ${selectedPackage.name}. ` +
        `Vui lòng đến trung tâm ${selectedCenter.name} vào ${selectedDateTime.format('DD/MM/YYYY HH:mm')}. ` +
        `Thanh toán sẽ được thực hiện sau khi có báo giá từ technician.`
      );
      
      // Reset form sau 2 giây
      setTimeout(() => {
        setCurrentStep(0);
        setSelectedPackage(null);
        setSelectedCenter(null);
        setSelectedVehicleId(null);
        setSelectedDateTime(null);
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Error in booking flow:', error);
      showError('Lỗi đặt lịch', error.message || 'Có lỗi xảy ra khi đặt lịch');
    } finally {
      setSubmitting(false);
    }
  };
  
  // --- WIZARD NAVIGATION ---
  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  // --- DERIVED STATE & HELPERS ---
  const filteredCenters = useMemo(() => {
    if (!centerQuery.trim()) return serviceCenters;
    const q = centerQuery.trim().toLowerCase();
    return serviceCenters.filter(c =>
      c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)
    );
  }, [centerQuery, serviceCenters]);
  
  // --- RENDER METHODS FOR STEPS ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderCenterSelection();
      case 1: return renderPackageSelection();
      case 2: return renderConfirmation();
      default: return null;
    }
  };

  const renderCenterSelection = () => (
    <div className="step-container">
      <div className="step-header">
        <Title level={2}>Chọn Trung Tâm Dịch Vụ</Title>
        <Paragraph type="secondary">Tìm kiếm và lựa chọn trung tâm phù hợp nhất với bạn.</Paragraph>
        <Input.Search
          allowClear
          placeholder="Tìm theo tên hoặc địa chỉ..."
          size="large"
          value={centerQuery}
          onChange={(e) => setCenterQuery(e.target.value)}
          style={{ maxWidth: 500, margin: '24px auto', display: 'block' }}
        />
      </div>
      {centersLoading ? (
        <Row gutter={[24, 24]}>
          {Array.from({ length: 3 }).map((_, idx) => (
            <Col xs={24} sm={12} md={8} key={idx}>
              <Card><Skeleton active paragraph={{ rows: 4 }} /></Card>
            </Col>
          ))}
        </Row>
      ) : filteredCenters.length === 0 ? (
        <Empty description={<Text>Không tìm thấy trung tâm phù hợp với "<Text strong>{centerQuery}</Text>"</Text>} />
      ) : (
        <Row gutter={[24, 24]}>
          {filteredCenters.map((center) => {
            const isSelected = selectedCenter?.centerID === center.centerID;
            return (
              <Col xs={24} sm={12} md={8} key={center.centerID}>
                <Card
                  hoverable
                  className={`service-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectCenter(center)}
                  style={{
                    borderRadius: 20,
                    border: isSelected ? '2px solid #60a5fa' : '1px solid #e5e7eb',
                    boxShadow: isSelected ? '0 8px 24px rgba(96,165,250,0.15)' : '0 2px 12px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
                    position: 'relative',
                    background: isSelected ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' : '#fff',
                    cursor: 'pointer',
                    height: '100%'
                  }}
                  bodyStyle={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      fontSize: 24,
                      color: '#fff',
                      background: 'linear-gradient(135deg, #34d399 0%, #22c55e 100%)',
                      borderRadius: '50%',
                      padding: 4,
                      width: 36,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(34,197,94,0.2)',
                      zIndex: 5
                    }}>
                      <CheckCircleOutlined />
                    </div>
                  )}
                  <div style={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                    borderRadius: 12,
                    padding: '16px 20px',
                    marginBottom: 16,
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(59,130,246,0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 20, fontWeight: 800 }}>
                        {center.name}
                      </div>
                    </div>
                  </div>
                  <Space direction="vertical" size="middle" style={{ width: '100%', flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      fontSize: 14,
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: 8
                    }}>
                      <EnvironmentOutlined style={{ color: '#2563eb', marginRight: 12, marginTop: 2, minWidth: 20, fontSize: 18 }} />
                      <Text style={{ color: '#374151', fontWeight: 500 }}>{center.address}</Text>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      fontSize: 14,
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: 8
                    }}>
                      <PhoneOutlined style={{ color: '#2563eb', marginRight: 12, minWidth: 20, fontSize: 18 }} />
                      <Text style={{ color: '#374151', fontWeight: 500 }}>{center.phone}</Text>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      fontSize: 14,
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: 8
                    }}>
                      <UserOutlined style={{ color: '#2563eb', marginRight: 12, minWidth: 20, fontSize: 18 }} />
                      <Text style={{ color: '#374151', fontWeight: 500 }}>{center.managerName}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );

  const renderPackageSelection = () => (
    <div className="step-container">
      <div className="step-header">
        <Title level={2}>Chọn Gói Dịch Vụ</Title>
        <Paragraph type="secondary">Các gói bảo dưỡng được thiết kế để phù hợp với mọi nhu cầu của bạn.</Paragraph>
      </div>
      <Row gutter={[24, 24]} justify="center">
        {packages.map((pkg, idx) => {
          const isSelected = selectedPackage?.packageID === pkg.packageID;
          
          // Icon/gradient cho từng gói
          const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
          ];
          
          const icons = ['🔧', '⚡', '✨', '⚙️', '🔋'];
          
          let tag = null;
          if (idx === 0) tag = <Tag color="green" className="card-tag">Tiết kiệm nhất</Tag>;
          if (idx === 1) tag = <Tag color="red" className="card-tag">Phổ biến nhất</Tag>;
          
          return (
            <Col xs={24} md={12} lg={8} key={pkg.packageID}>
              <Card
                hoverable
                className={`package-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectPackage(pkg)}
                style={{ 
                  minHeight: 480, 
                  borderRadius: 20,
                  overflow: 'hidden',
                  border: 'none',
                  boxShadow: isSelected ? '0 8px 24px rgba(96,165,250,0.15)' : '0 2px 12px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s cubic-bezier(.4,2,.6,1)'
                }}
                bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                {/* Icon/Placeholder section */}
                <div 
                  style={{
                    background: gradients[idx % 5],
                    height: 160,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 64,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {icons[idx]}
                  {tag && (
                    <div style={{ position: 'absolute', top: 12, right: 12 }}>
                      {tag}
                    </div>
                  )}
                  {isSelected && (
                    <div className="selected-checkmark" style={{ top: 12, right: 12 }}>
                      <CheckCircleOutlined />
                    </div>
                  )}
                </div>
                
                {/* Content section */}
                <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Title level={4} style={{ marginBottom: 8, fontWeight: 800, color: '#1f2937', fontSize: 20 }}>
                    {pkg.name.replace('Gói ', '').replace('Bảo Dưỡng ', '')}
                  </Title>
                  <Paragraph type="secondary" style={{ minHeight: 50, fontSize: 14, color: '#6b7280', marginBottom: 16, flex: 1 }}>
                    {pkg.description}
                  </Paragraph>
                  
                  {/* Price section */}
                  <div style={{ marginBottom: 16, textAlign: 'center' }}>
                    {pkg.price === 0 ? (
                      <div style={{ fontSize: 26, fontWeight: 900, color: '#22c55e', marginBottom: 4 }}>
                        Liên hệ
                      </div>
                    ) : (
                      <div style={{ fontSize: 26, fontWeight: 900, color: '#2563eb', marginBottom: 4 }}>
                        {servicePackageService.formatPrice(pkg.price)}
                      </div>
                    )}
                    <div style={{ fontSize: 14, color: '#9ca3af', fontWeight: 600 }}>
                      Thời hạn {servicePackageService.formatDuration(pkg.durationMonths)}
                    </div>
                  </div>
                  
                  {/* Button */}
                  <Button 
                    type={isSelected ? 'primary' : 'default'} 
                    size="large" 
                    block 
                    style={{ 
                      borderRadius: 12, 
                      fontWeight: 700, 
                      fontSize: 16,
                      background: isSelected ? 'linear-gradient(90deg, #60a5fa 0%, #22c55e 100%)' : undefined,
                      border: isSelected ? 'none' : undefined,
                      color: isSelected ? '#fff' : undefined,
                      marginTop: 'auto'
                    }}
                  >
                    {isSelected ? '✓ Đã chọn' : 'Chọn gói này'}
                  </Button>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );

  const renderConfirmation = () => (
    <div className="step-container">
      <div className="step-header">
        <Title level={2}>Xác Nhận và Đặt Lịch</Title>
        <Paragraph type="secondary">Vui lòng kiểm tra lại thông tin và chọn thời gian mong muốn.</Paragraph>
      </div>
      <Row gutter={[32, 32]}>
        <Col xs={24} lg={14}>
          <Card 
            style={{ 
              borderRadius: 20, 
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              height: '100%'
            }}
            bodyStyle={{ padding: 28 }}
          >
            <div style={{ marginBottom: 24 }}>
              <Title level={4} style={{ marginBottom: 12, fontWeight: 800, color: '#1f2937' }}>
                🚗 Chọn xe của bạn
              </Title>
              <Select
                showSearch
                optionFilterProp="label"
                loading={vehiclesLoading}
                placeholder="Tìm và chọn xe"
                value={selectedVehicleId}
                onChange={setSelectedVehicleId}
                size="large"
                style={{ width: '100%' }}
                options={vehicles.map(v => ({
                  label: `${v.model} • ${v.licensePlate}`,
                  value: v.vehicleID,
                }))}
              />
            </div>
            <div>
              <Title level={4} style={{ marginBottom: 12, fontWeight: 800, color: '#1f2937' }}>
                📅 Chọn ngày giờ mong muốn
              </Title>
              <DatePicker
                showTime
                value={selectedDateTime}
                onChange={setSelectedDateTime}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                format="HH:mm - DD/MM/YYYY"
                placeholder="Chọn ngày và giờ"
                size="large"
                style={{ width: '100%' }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card 
            style={{ 
              borderRadius: 20, 
              border: '2px solid #60a5fa',
              boxShadow: '0 4px 16px rgba(96,165,250,0.12)',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #f9fafb 100%)',
              height: '100%'
            }}
            bodyStyle={{ padding: 28 }}
          >
            <Title level={4} style={{ marginBottom: 20, fontWeight: 800, color: '#1f2937' }}>
              ✨ Tóm Tắt Dịch Vụ
            </Title>
            {selectedPackage && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                  color: '#fff'
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.9 }}>Gói dịch vụ</div>
                  <div style={{ fontSize: 22, fontWeight: 900, marginTop: 8 }}>
                    {selectedPackage.name.replace('Gói ', '').replace('Bảo Dưỡng ', '')}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, marginTop: 12, color: '#fbbf24' }}>
                    {selectedPackage.price === 0 ? 'Liên hệ' : servicePackageService.formatPrice(selectedPackage.price)}
                  </div>
                </div>
                <Paragraph type="secondary" style={{ fontSize: 14, marginBottom: 12 }}>
                  {selectedPackage.description}
                </Paragraph>
              </div>
            )}
            {selectedCenter && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                  borderRadius: 16,
                  padding: 16,
                  color: '#fff'
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.9 }}>Trung tâm dịch vụ</div>
                  <div style={{ fontSize: 20, fontWeight: 900, marginTop: 8 }}>
                    {selectedCenter.name}
                  </div>
                  <div style={{ fontSize: 14, marginTop: 8, opacity: 0.95 }}>
                    📍 {selectedCenter.address}
                  </div>
                  <div style={{ fontSize: 14, marginTop: 6, opacity: 0.95 }}>
                    ☎️ {selectedCenter.phone}
                  </div>
                </div>
              </div>
            )}

           
          </Card>
        </Col>
      </Row>
    </div>
  );

  // --- MAIN RENDER ---
  if (loading) {
    return <div className="loading-container"><Spin size="large" /></div>;
  }
  
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#096dd9',
          borderRadius: 8,
          fontFamily: 'Inter, sans-serif',

          // --- 🎨 CẬP NHẬT MÀU SẮC TẠI ĐÂY ---
          colorTextHeading: '#1f2937', // Xám đậm cho tiêu đề
          colorText: '#374151', // Xám vừa cho văn bản chính
          colorTextSecondary: '#6b7280', // Xám nhạt cho văn bản phụ
        },
        components: { 
          Card: { headerBg: '#fafafa' },
          Button: { defaultBorderColor: '#d1d5db' } // Làm viền button default rõ hơn
        },
      }}
    >
      <style>{`
        body { background-color: #f9fafb; }
        .page-container {
          max-width: 1200px; margin: 0 auto; padding: 40px 24px;
        }
        .main-header { text-align: center; margin-bottom: 48px; }
        .steps-container { 
          max-width: 800px; margin: 0 auto 48px auto; 
          background: #fff; padding: 24px; border-radius: 16px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 24px rgba(96,165,250,0.08);
        }
        .step-container { margin-bottom: 32px; }
        .step-header { text-align: center; margin-bottom: 32px; }

        /* Card Styles */
        .package-card {
          border: none;
          border-radius: 24px;
          transition: all 0.3s cubic-bezier(.4,2,.6,1);
          height: 100%;
          position: relative;
          background: #fff;
          box-shadow: 0 2px 12px rgba(59,130,246,0.07);
          text-align: center;
          padding: 0;
        }
        .package-card.bg1 { background: #f0f9ff; }
        .package-card.bg2 { background: #f1f5ff; }
        .package-card.bg3 { background: #fef9e7; }
        .package-card.bg4 { background: #fef2f2; }
        .package-card.bg5 { background: #f0fdf4; }
        .package-card:hover {
          transform: translateY(-7px) scale(1.02);
          box-shadow: 0 12px 32px rgba(59,130,246,0.13);
        }
        .package-card.selected {
          box-shadow: 0 0 0 4px #60a5fa33, 0 8px 32px rgba(59,130,246,0.10);
          transform: translateY(-7px) scale(1.03);
        }
        .selected-checkmark {
          position: absolute; top: 12px; right: 12px;
          font-size: 24px; 
          color: #fff;
          background: linear-gradient(135deg, #34d399 0%, #22c55e 100%);
          border-radius: 50%; 
          padding: 4px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(34,197,94,0.2);
          z-index: 5;
        }

        /* Tag nổi bật - ribbon style */
        .value-tag {
          position: absolute; 
          top: 12px; 
          left: -8px;
          font-weight: 900 !important;
          font-size: 16px !important;
          background: linear-gradient(135deg,#34d399 0%,#60a5fa 100%) !important;
          color: #fff !important;
          border-radius: 0 8px 8px 0 !important;
          padding: 6px 20px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
          border: none !important;
          text-shadow: 0 1px 3px rgba(0,0,0,0.15);
          transform: skewX(-15deg);
          z-index: 3;
        }
        .value-tag.red {
          background: linear-gradient(135deg,#f43f5e 0%,#f5a623 100%) !important;
          box-shadow: 0 2px 8px rgba(244,63,94,0.15) !important;
        }
        
        /* Card tag cho icon section */
        .card-tag {
          font-weight: 900 !important;
          font-size: 16px !important;
          border-radius: 0 8px 8px 0 !important;
          padding: 6px 20px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
          position: absolute;
          top: 12px;
          left: -8px;
          transform: skewX(-15deg);
          z-index: 3;
        }
        .card-tag.ant-tag-green {
          background: linear-gradient(135deg,#34d399 0%,#10b981 100%) !important;
          border: none !important;
        }
        .card-tag.ant-tag-red {
          background: linear-gradient(135deg,#f43f5e 0%,#f5a623 100%) !important;
          border: none !important;
        }

        /* Price, title, subtitle */
        .price-section {
          margin: 18px 0 10px 0;
          text-align: center;
        }
        .price-main {
          font-size: 28px;
          font-weight: 900;
          color: #2563eb;
          margin-bottom: 2px;
        }
        .price-contact {
          font-size: 28px;
          font-weight: 900;
          color: #22c55e;
          margin-bottom: 2px;
        }
        .duration {
          font-size: 15px;
          color: #64748b;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-title {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 6px;
          color: #222;
        }
        .card-subtitle {
          font-size: 15px;
          color: #374151;
          margin-bottom: 10px;
        }

        /* Button gradient */
        .package-card .ant-btn {
          border-radius: 12px;
          font-weight: 700;
          font-size: 17px;
          margin-top: 18px;
          background: linear-gradient(90deg,#60a5fa 0%,#22c55e 100%);
          color: #fff;
          border: none;
          box-shadow: 0 2px 8px rgba(96,165,250,0.10);
          transition: background 0.2s;
        }
        .package-card .ant-btn:hover {
          background: linear-gradient(90deg,#22c55e 0%,#60a5fa 100%);
          color: #fff;
        }

        /* Actions */
        .actions-container { 
          text-align: center; margin-top: 32px; 
          padding-top: 24px; border-top: 1px solid #f0f0f0;
        }
        .loading-container { 
          display: flex; align-items: center; justify-content: center; min-height: 80vh; 
        }
      `}</style>
      
      <div className="page-container">
        <div className="main-header">
          <Title>Đặt Lịch Bảo Dưỡng Xe</Title>
          <Paragraph type="secondary" style={{ fontSize: 16 }}>
            Chăm sóc xe của bạn chỉ với 3 bước đơn giản.
          </Paragraph>
        </div>

        <div className="steps-container">
          <Steps current={currentStep}>
            <Step title="Chọn Trung Tâm" icon={<EnvironmentOutlined />} />
            <Step title="Chọn Gói Dịch Vụ" icon={<GiftOutlined />} />
            <Step title="Xác Nhận & Đặt Lịch" icon={<CheckCircleOutlined />} />
          </Steps>
        </div>

        <div>{renderStepContent()}</div>

        <div className="actions-container">
          <Space size="large">
            {currentStep > 0 && (
              <Button size="large" icon={<ArrowLeftOutlined />} onClick={prevStep}>
                Quay lại
              </Button>
            )}
            {currentStep < 2 && (
              <Button 
                type="primary" 
                size="large" 
                onClick={nextStep}
                disabled={(currentStep === 0 && !selectedCenter) || (currentStep === 1 && !selectedPackage)}
              >
                Tiếp tục <ArrowRightOutlined />
              </Button>
            )}
            {currentStep === 2 && (
              <Button 
                type="primary" 
                size="large" 
                icon={<ShoppingCartOutlined />}
                loading={submitting}
                disabled={!selectedCenter || !selectedPackage || !selectedVehicleId || !selectedDateTime}
                onClick={handleSubmitBooking}
                style={{
                  minWidth: 280,
                  height: 48,
                  fontSize: 18,
                  fontWeight: 700,
                  borderRadius: 14,
                  background: 'linear-gradient(90deg, #22c55e 0%, #60a5fa 100%)',
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(34,197,94,0.2)',
                }}
              >
                ✓ Hoàn tất đặt lịch
              </Button>
            )}
          </Space>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default ServicePackages;