import React, { useMemo, useState, useEffect } from 'react';
import { Card, Row, Col, Button, Tag, Spin, Typography, Steps, Input, Skeleton, Badge, Empty, ConfigProvider, Select, DatePicker } from 'antd';
import { 
  GiftOutlined, 
  CheckCircleOutlined,
  ShoppingCartOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined
} from '@ant-design/icons';
import { ServicePackage, ServiceCenter, VehicleResponse } from '../../types/api';
import { servicePackageService } from '../../services/servicePackageService';
import { serviceCenterService } from '../../services/serviceCenterService';
import { vehicleService } from '../../services/vehicleService';
import { appointmentService } from '../../services/appointmentService';
import { sweetAlert } from '../../utils/sweetAlert';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { Step } = Steps;

const ServicePackages: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [centersLoading, setCentersLoading] = useState(false);
  const [centerQuery, setCenterQuery] = useState('');
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  
  // State for wizard steps
  const [currentStep, setCurrentStep] = useState(0);
  
  // State for user selections
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<ServiceCenter | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<Dayjs | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // --- DATA FETCHING ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setCentersLoading(true);
      setVehiclesLoading(true);
      try {
        const [centers, servicePackages] = await Promise.all([
          serviceCenterService.getServiceCenters(),
          servicePackageService.getServicePackages(),
        ]);
        // sort centers by name for stable display
        setServiceCenters([...centers].sort((a, b) => a.name.localeCompare(b.name)));
        setPackages(servicePackages);
        // load vehicles for current user
        const v = await vehicleService.getVehiclesByCustomer();
        setVehicles(v);
      } catch (error: any) {
        console.error('Error loading data:', error);
        sweetAlert.error('Lỗi tải dữ liệu', error.message || 'Không thể tải dữ liệu cần thiết');
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
    if (selectedPackage?.packageID === pkg.packageID) {
      // Nếu đã chọn rồi thì bỏ chọn
      setSelectedPackage(null);
    } else {
      // Chọn gói mới
      setSelectedPackage(pkg);
    }
  };
  
  // booking handled inline in the action button

  // --- WIZARD NAVIGATION ---
  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // --- UI HELPER FUNCTIONS ---
  const getPackageTag = (pkg: ServicePackage) => {
    const tags: { [key: number]: { color: string; text: string } } = {
      1: { color: 'green', text: 'Cơ Bản' },
      2: { color: 'gold', text: 'Nâng Cao' },
    };
    const tag = tags[pkg.packageID] || { color: 'blue', text: 'Đặc Biệt' };
    return <Tag color={tag.color}>{tag.text}</Tag>;
  };

  // Best value package calculation (lower price per month is better)
  const bestValuePackageId = useMemo(() => {
    if (!packages.length) return undefined;
    let bestId = packages[0].packageID;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const p of packages) {
      const months = Math.max(1, p.durationMonths || 1);
      const score = p.price / months; // price per month
      if (score < bestScore) {
        bestScore = score;
        bestId = p.packageID;
      }
    }
    return bestId;
  }, [packages]);

  // Centers filtering by query (name/address)
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
      case 0:
        return renderCenterSelection();
      case 1:
        return renderPackageSelection();
      case 2:
        return renderConfirmation();
      default:
        return null;
    }
  };

  const renderCenterSelection = () => (
    <Card className="shadow-sm" style={{ borderRadius: '16px' }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <Title level={3} className="!mb-1">Bước 1: Chọn Trung Tâm Dịch Vụ</Title>
          <Text type="secondary">Vui lòng chọn một trung tâm để thực hiện dịch vụ.</Text>
        </div>
        <Input.Search
          allowClear
          placeholder="Tìm theo tên hoặc địa chỉ trung tâm..."
          style={{ maxWidth: 420 }}
          value={centerQuery}
          onChange={(e) => setCenterQuery(e.target.value)}
        />
      </div>

      {centersLoading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Col xs={24} sm={12} lg={8} key={idx}>
              <Card style={{ borderRadius: 12 }}>
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : filteredCenters.length === 0 ? (
        <div className="py-10">
          <Empty description={
            <span>Không tìm thấy trung tâm phù hợp với "{centerQuery}"</span>
          } />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredCenters.map((center) => {
            const isSelected = selectedCenter?.centerID === center.centerID;
            const card = (
              <Card
                className={`h-full cursor-pointer transition-all duration-300 hover:shadow-md border ring-1 ring-transparent hover:ring-blue-200 ${
                  isSelected ? 'border-blue-300 bg-blue-50 glow-selected ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-200'
                } hover:-translate-y-0.5`}
                onClick={() => handleSelectCenter(center)}
                style={{ borderRadius: '12px', position: 'relative' }}
                bodyStyle={{ padding: 14 }}
              >
                <div className="h-1 w-full rounded-t-lg mb-3" style={{
                  background: 'linear-gradient(90deg, #bfdbfe 0%, #a7f3d0 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'gradientMove 4s linear infinite'
                }} />
                {isSelected && (
                  <div className="absolute top-2 right-2 h-7 w-7 rounded-full flex items-center justify-center text-white shadow-md"
                       style={{ background: 'linear-gradient(135deg, #34d399 0%, #60a5fa 100%)' }}>
                    <CheckCircleOutlined />
                  </div>
                )}
                <Title level={5} className="!mb-2">{center.name}</Title>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><EnvironmentOutlined className="mr-2" />{center.address}</p>
                  <p><PhoneOutlined className="mr-2" />{center.phone}</p>
                  <p><UserOutlined className="mr-2" />{center.managerName}</p>
                </div>
              </Card>
            );
            return (
              <Col xs={24} sm={12} lg={8} key={center.centerID}>
                {isSelected ? (
                  <Badge.Ribbon text="Đã chọn" color="blue">
                    {card}
                  </Badge.Ribbon>
                ) : card}
              </Col>
            );
          })}
        </Row>
      )}
    </Card>
  );

  // Dán hàm này để thay thế hàm renderPackageSelection CŨ trong file của bạn

const renderPackageSelection = () => (
  <Card className="shadow-sm" style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.96)' }}>
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
      <div>
        <Title level={3} className="!mb-1">Bước 2: Chọn Gói Dịch Vụ</Title>
        <Text type="secondary">Chọn gói bảo dưỡng phù hợp với nhu cầu của bạn.</Text>
      </div>
    </div>

    <Row gutter={[24, 24]} justify="start" align="stretch">
      {packages.map((pkg) => {
        const isSelected = selectedPackage?.packageID === pkg.packageID;
        const isBestValue = bestValuePackageId === pkg.packageID;
        let ribbonText = '';
        let ribbonColor = '';
        if (isBestValue) {
          ribbonText = 'Giá trị tốt';
          ribbonColor = 'green';
        } else if (pkg.packageID === 2) {
          ribbonText = 'Phổ biến';
          ribbonColor = 'gold';
        }
        const card = (
          <Card
            key={pkg.packageID}
            hoverable
            onClick={() => handleSelectPackage(pkg)}
            style={{
              borderRadius: 18,
              height: 240,
              boxShadow: isSelected ? '0 4px 18px 0 rgba(96,165,250,0.10)' : '0 2px 8px 0 rgba(0,0,0,0.03)',
              border: isSelected
                ? '2.5px solid #60a5fa'
                : '2px solid #bcd0e0', // viền rõ hơn
              background: isSelected ? 'linear-gradient(90deg,#f0f9ff 0%,#f0fdf4 100%)' : '#fff',
              transition: 'all 0.18s cubic-bezier(.4,2,.6,1)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'stretch',
              padding: 20,
              outline: isSelected ? '2px solid #60a5fa' : undefined,
              outlineOffset: isSelected ? '1px' : undefined
            }}
            bodyStyle={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 0}}
          >
            <div>
              <div style={{marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <Title level={5} style={{marginBottom: 0, fontWeight: 700, fontSize: 17, color: isSelected ? '#2563eb' : '#222'}}>{pkg.name}</Title>
                <span style={{transform: 'scale(0.95)'}}>{getPackageTag(pkg)}</span>
              </div>
              <div style={{fontSize: 13, color: isSelected ? '#2563eb' : '#555', marginBottom: 10, minHeight: 36}}>{pkg.description}</div>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: 26, fontWeight: 900, color: isSelected ? '#2563eb' : '#222', marginBottom: 2}}>{servicePackageService.formatPrice(pkg.price)}</div>
              <div style={{fontSize: 14, fontWeight: 600, color: isSelected ? '#2563eb' : '#888', marginBottom: 10}}>{servicePackageService.formatDuration(pkg.durationMonths)}</div>
              <Button
                type={isSelected ? 'primary' : 'default'}
                block
                size="middle"
                style={{
                  borderRadius: 10,
                  height: 36,
                  fontWeight: 600,
                  borderWidth: 1.5,
                  marginTop: 2,
                  background: isSelected ? 'linear-gradient(90deg,#60a5fa 0%,#22c55e 100%)' : undefined,
                  color: isSelected ? '#fff' : undefined,
                  borderColor: isSelected ? '#60a5fa' : '#e5e7eb',
                  boxShadow: isSelected ? '0 2px 8px 0 rgba(96,165,250,0.10)' : undefined
                }}
                className={isSelected ? 'font-bold' : 'font-semibold'}
              >
                {isSelected ? '✓ Đã chọn' : 'Chọn gói'}
              </Button>
            </div>
          </Card>
        );
        return (
          <Col xs={24} sm={12} md={8} lg={6} key={pkg.packageID} style={{display: 'flex', alignItems: 'stretch'}}>
            {ribbonText ? (
              <Badge.Ribbon text={ribbonText} color={ribbonColor} placement="end">
                {card}
              </Badge.Ribbon>
            ) : card}
          </Col>
        );
      })}
    </Row>
  </Card>
);

  const renderConfirmation = () => (
    <Card className="shadow-lg border border-green-100" style={{ borderRadius: 24, background: 'rgba(255,255,255,0.98)', padding: 0 }}>
      <Title level={3} className="!mb-6 text-emerald-700 text-center" style={{fontWeight: 800, fontSize: 28, letterSpacing: 0.5}}>Bước 3: Xác Nhận & Đặt Lịch</Title>
      <Row gutter={[32, 24]} align="stretch" style={{marginBottom: 8}}>
        {selectedPackage && (
          <Col xs={24} lg={12}>
            <div
              style={{
                background: 'linear-gradient(120deg,#e0f2fe 60%,#f0fdf4 100%)',
                borderRadius: 20,
                boxShadow: '0 2px 12px 0 rgba(59,130,246,0.07)',
                padding: 28,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: 160
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', marginBottom: 10}}>
                <GiftOutlined style={{color: '#2563eb', fontSize: 22, marginRight: 10}} />
                <span style={{fontWeight: 700, color: '#2563eb', fontSize: 18, letterSpacing: 0.2}}>Gói Dịch Vụ</span>
              </div>
              <div style={{fontWeight: 800, fontSize: 20, color: '#0f172a', marginBottom: 6}}>{selectedPackage.name}</div>
              <div
                style={{
                  color: '#059669',
                  fontSize: 26,
                  fontWeight: 800,
                  fontFamily: 'Montserrat, Arial, sans-serif',
                  letterSpacing: 0.5,
                  marginBottom: 2,
                  textShadow: '0 2px 8px rgba(16,185,129,0.10)'
                }}
              >
                {servicePackageService.formatPrice(selectedPackage.price)}
              </div>
              <div style={{color: '#64748b', fontWeight: 500, fontSize: 15}}>Thời hạn: {servicePackageService.formatDuration(selectedPackage.durationMonths)}</div>
            </div>
          </Col>
        )}
        {selectedCenter && (
          <Col xs={24} lg={12}>
            <div
              style={{
                background: 'linear-gradient(120deg,#f0fdf4 60%,#e0f2fe 100%)',
                borderRadius: 20,
                boxShadow: '0 2px 12px 0 rgba(16,185,129,0.07)',
                padding: 28,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: 160
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', marginBottom: 10}}>
                <EnvironmentOutlined style={{color: '#059669', fontSize: 22, marginRight: 10}} />
                <span style={{fontWeight: 700, color: '#059669', fontSize: 18, letterSpacing: 0.2}}>Trung Tâm</span>
              </div>
              <div style={{fontWeight: 800, fontSize: 20, color: '#0f172a', marginBottom: 6}}>{selectedCenter.name}</div>
              <div style={{color: '#64748b', fontWeight: 500, fontSize: 15}}>{selectedCenter.address}</div>
              <div style={{color: '#64748b', fontWeight: 500, fontSize: 15}}>{selectedCenter.phone}</div>
            </div>
          </Col>
        )}
      </Row>

      <Row gutter={[20, 20]} className="mt-4">
        <Col xs={24} md={12}>
          <Text strong className="block mb-2">Chọn xe</Text>
          <Select
            loading={vehiclesLoading}
            placeholder="Chọn xe của bạn"
            value={selectedVehicleId ?? undefined}
            onChange={(v) => setSelectedVehicleId(v)}
            className="w-full"
            size="large"
            options={vehicles.map(v => ({
              label: `${v.model} • ${v.licensePlate}`,
              value: v.vehicleID,
            }))}
          />
        </Col>
        <Col xs={24} md={12}>
          <Text strong className="block mb-2">Ngày giờ mong muốn</Text>
          <DatePicker
            className="w-full"
            size="large"
            showTime
            value={selectedDateTime as any}
            onChange={(val) => setSelectedDateTime(val)}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
            format="DD/MM/YYYY HH:mm"
          />
        </Col>
      </Row>
    </Card>
  );

  // --- MAIN RENDER ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }
  
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#60a5fa', // light blue
          colorInfo: '#60a5fa',
          borderRadius: 12,
          colorBorder: '#e5e7eb',
          colorText: '#334155',
          colorTextSecondary: '#64748b',
          colorBgContainer: '#ffffff',
        },
      }}
    >
    {/* Local CSS for subtle animations and glow effects */}
    <style>{`
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-12px); }
        100% { transform: translateY(0px); }
      }
      @keyframes gradientMove {
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
      }
      .animate-float-slow { animation: float 12s ease-in-out infinite; }
      .animate-float-slower { animation: float 18s ease-in-out infinite; }
      .glow-selected { box-shadow: 0 10px 25px rgba(96,165,250,0.35), 0 2px 6px rgba(99,102,241,0.15); }
    `}</style>
    <div className="relative p-6 bg-gradient-to-b from-sky-50 via-white to-emerald-50 min-h-screen overflow-hidden">
      {/* Decorative animated background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -left-20 h-72 w-72 rounded-full bg-gradient-to-br from-sky-300/40 to-emerald-300/40 blur-3xl animate-float-slow" />
        <div className="absolute -bottom-16 -right-24 h-80 w-80 rounded-full bg-gradient-to-br from-fuchsia-300/30 to-rose-300/30 blur-3xl animate-float-slower" />
      </div>
      <div className="text-center mb-8">
        <Title level={2} className="!mb-1 bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
          Đặt Lịch Dịch Vụ Bảo Dưỡng
        </Title>
        <Text type="secondary" className="text-lg">Thực hiện theo các bước dưới đây để hoàn tất đặt lịch</Text>
      </div>

      <div className="mb-8 max-w-4xl mx-auto bg-white/70 backdrop-blur rounded-xl shadow-sm ring-1 ring-gray-100 p-3">
        <Steps current={currentStep} size="small">
        <Step title="Chọn Trung Tâm" icon={<EnvironmentOutlined />} />
        <Step title="Chọn Gói Dịch Vụ" icon={<GiftOutlined />} />
        <Step title="Xác Nhận" icon={<CheckCircleOutlined />} />
        </Steps>
      </div>

      <div className="steps-content mb-8">{renderStepContent()}</div>

      <div className="steps-action text-center space-x-4">
        {currentStep > 0 && (
          <Button 
            size="large" 
            style={{ minWidth: '120px' }} 
            className="hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
            onClick={prevStep}
          >
            Quay lại
          </Button>
        )}
        {currentStep < 2 && (
          <Button 
            type="primary" 
            size="large" 
            style={{ 
              minWidth: '120px',
              background: ((currentStep === 0 && !selectedCenter) || (currentStep === 1 && !selectedPackage))
                ? undefined
                : 'linear-gradient(90deg, #34d399 0%, #60a5fa 100%)',
              border: 'none'
            }}
            className="hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            onClick={nextStep}
            disabled={(currentStep === 0 && !selectedCenter) || (currentStep === 1 && !selectedPackage)}
          >
            Tiếp tục
          </Button>
        )}
        {currentStep === 2 && (
          <Button 
            type="primary" 
            size="large" 
            icon={<ShoppingCartOutlined />}
            style={{ 
              background: (!selectedCenter || !selectedPackage || !selectedVehicleId || !selectedDateTime)
                ? undefined
                : 'linear-gradient(90deg, #22c55e 0%, #60a5fa 100%)',
              border: 'none' 
            }}
            className="hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            loading={submitting}
            disabled={!selectedCenter || !selectedPackage || !selectedVehicleId || !selectedDateTime}
            onClick={async () => {
              if (!selectedCenter || !selectedPackage || !selectedVehicleId || !selectedDateTime) return;
              // Validate không cho chọn ngày quá khứ
              if (selectedDateTime.isBefore(dayjs(), 'minute')) {
                sweetAlert.error('Ngày không hợp lệ', 'Vui lòng chọn ngày giờ trong tương lai.');
                return;
              }
              try {
                setSubmitting(true);
                const payload = {
                  vehicleID: selectedVehicleId,
                  serviceType: selectedPackage.name,
                  centerID: selectedCenter.centerID,
                  requestedDate: selectedDateTime.toDate().toISOString(),
                };
                const message = await appointmentService.book(payload);
                sweetAlert.success('Thành công', message || 'Đặt lịch thành công');
              } catch (err: any) {
                sweetAlert.error('Đặt lịch thất bại', err.message || 'Vui lòng thử lại sau');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            Hoàn tất đặt lịch
          </Button>
        )}
      </div>
    </div>
    </ConfigProvider>
  );
};

export default ServicePackages;