import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Divider, Radio } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, FileTextOutlined, ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { quoteService, Quote } from '../../services/quoteService';
import { paymentService } from '../../services/paymentService';
import { showSuccess, showError } from '../../utils/sweetAlert';
import Swal from 'sweetalert2';

const MyQuotes: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const data = await quoteService.getMyQuotes();
      setQuotes(data);
    } catch (error: any) {
      showError('Lỗi tải dữ liệu', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setPaymentModalVisible(true);
  };

  const handleApproveQuote = async () => {
    if (!selectedQuote) return;

    setProcessingPayment(true);
    
    try {
      if (paymentMethod === 'online') {
        // Bước 1: Approve quote trước (chỉ nếu chưa approved)
        if (selectedQuote.status !== 'approved') {
          await quoteService.approveQuote({
            quoteID: selectedQuote.quoteID,
            action: 'approve',
          });
        }

        // Bước 2: Tạo payment link cho online payment
        const paymentData = {
          appointmentID: selectedQuote.appointmentID,
          amount: selectedQuote.finalAmount,
          description: `Thanh toán báo giá ${selectedQuote.serviceType}`.substring(0, 25),
          paymentMethod: 'online' as const,
          returnUrl: `${window.location.origin}/payment/success`
        };

        const paymentResult = await paymentService.createPayment(paymentData);
        
        if (paymentResult?.paymentUrl) {
          // Redirect to PayOS
          window.location.href = paymentResult.paymentUrl;
        } else {
          throw new Error('Không thể tạo payment link');
        }
      } else {
        // Cash payment - approve quote và tạo payment record với status pending
        // Chỉ approve nếu chưa được approve
        if (selectedQuote.status !== 'approved') {
          await quoteService.approveQuote({
            quoteID: selectedQuote.quoteID,
            action: 'approve',
          });
        }

        // Tạo payment record với status "pending" cho admin xác nhận
        const paymentData = {
          appointmentID: selectedQuote.appointmentID,
          amount: selectedQuote.finalAmount,
          description: `Thanh toán báo giá ${selectedQuote.serviceType}`.substring(0, 25),
          paymentMethod: 'cash' as const
        };

        console.log('Creating payment with data:', paymentData);
        const paymentResult = await paymentService.createPayment(paymentData);
        
        // Cash payment: paymentUrl sẽ là null, đó là điều bình thường
        console.log('Cash payment created successfully:', paymentResult);

        showSuccess('Đồng ý báo giá thành công!', 
          'Bạn đã đồng ý với báo giá. Vui lòng đến trung tâm để thanh toán và sử dụng dịch vụ.'
        );

        setPaymentModalVisible(false);
        fetchQuotes();
      }
    } catch (error: any) {
      showError('Lỗi xử lý thanh toán', error.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleReject = async (quote: Quote) => {
    const { value: reason } = await Swal.fire({
      title: 'Từ chối báo giá',
      html: `
        <div class="text-left mb-4">
          <p><strong>Xe:</strong> ${quote.vehicleModel}</p>
          <p><strong>Dịch vụ:</strong> ${quote.serviceType}</p>
          <p><strong>Giá:</strong> ${quoteService.formatPrice(quote.finalAmount)}</p>
        </div>
      `,
      input: 'textarea',
      inputLabel: 'Lý do từ chối (nếu có)',
      inputPlaceholder: 'Nhập lý do từ chối...',
      inputAttributes: {
        rows: '3',
      },
      showCancelButton: true,
      confirmButtonText: 'Xác nhận từ chối',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#ef4444',
    });

    if (reason !== null) {
      try {
        await quoteService.approveQuote({
          quoteID: quote.quoteID,
          action: 'reject',
          reason: reason,
        });
        showSuccess('Đã từ chối báo giá', 'Bạn có thể liên hệ trung tâm để được tư vấn lại');
        fetchQuotes();
      } catch (error: any) {
        showError('Lỗi', error.message);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'green';
      case 'pending': return 'orange';
      case 'rejected': return 'red';
      case 'expired': return 'gray';
      default: return 'blue';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Đã duyệt';
      case 'pending': return 'Chờ duyệt';
      case 'rejected': return 'Đã từ chối';
      case 'expired': return 'Hết hạn';
      default: return status;
    }
  };

  const columns = [
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceType',
      key: 'serviceType',
      render: (text: string, record: Quote) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.centerName}</div>
        </div>
      ),
    },
    {
      title: 'Xe',
      dataIndex: 'vehicleModel',
      key: 'vehicleModel',
    },
    {
      title: 'Phụ tùng',
      key: 'parts',
      width: 150,
      render: (_: any, record: Quote) => {
        if (!record.parts || record.parts.length === 0) {
          return <span className="text-gray-400">Không có</span>;
        }
        return (
          <div>
            <div className="text-sm font-medium">
              {record.parts.length} phụ tùng
            </div>
            <div className="text-xs text-gray-500">
              {quoteService.formatPrice(quoteService.calculatePartsTotalFromDetail(record.parts))}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hạn hết',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Quote) => (
        <Space>
          <Button
            type="link"
            icon={<FileTextOutlined />}
            onClick={() => {
              setSelectedQuote(record);
              setModalVisible(true);
            }}
          >
            Chi tiết
          </Button>
          {record.status === 'pending' && new Date(record.expiresAt || Date.now()) > new Date() && (
            <>
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => handleViewQuote(record)}
              >
                Xem
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleReject(record)}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Báo Giá Của Tôi</h2>
            <p className="text-gray-600 mt-1">Xem và phê duyệt các báo giá dịch vụ</p>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={quotes}
          loading={loading}
          rowKey="quoteID"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Chi tiết báo giá"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedQuote(null);
        }}
        footer={null}
        width={700}
      >
        {selectedQuote && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <label className="text-gray-600 block mb-1">Xe</label>
                <div className="font-medium">{selectedQuote.vehicleModel}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <label className="text-gray-600 block mb-1">Trung tâm</label>
                <div className="font-medium">{selectedQuote.centerName}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <label className="text-gray-600 block mb-1">Dịch vụ</label>
                <div className="font-medium">{selectedQuote.serviceType}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <label className="text-gray-600 block mb-1">Trạng thái</label>
                <Tag color={getStatusColor(selectedQuote.status)}>
                  {getStatusText(selectedQuote.status)}
                </Tag>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded">
              <label className="text-gray-600 block mb-1">Mô tả dịch vụ</label>
              <div>{selectedQuote.description}</div>
            </div>

            {selectedQuote.notes && (
              <div className="bg-yellow-50 p-4 rounded">
                <label className="text-gray-600 block mb-1">Ghi chú</label>
                <div>{selectedQuote.notes}</div>
              </div>
            )}

            {/* Service Package and Parts Section */}
            <Divider />
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCartOutlined className="text-blue-600" />
                <h3 className="text-lg font-semibold">Danh sách hàng hóa, dịch vụ</h3>
                {selectedQuote.parts && selectedQuote.parts.length > 0 && (
                  <Tag color="blue">{selectedQuote.parts.length} phụ tùng</Tag>
                )}
              </div>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <Table
                  dataSource={(() => {
                    const rows: any[] = [];
                    let rowIndex = 1;
                    
                    // Calculate service package amount (totalAmount - parts total)
                    const partsTotal = selectedQuote.parts && selectedQuote.parts.length > 0
                      ? quoteService.calculatePartsTotalFromDetail(selectedQuote.parts)
                      : 0;
                    const servicePackageAmount = selectedQuote.totalAmount - partsTotal;
                    
                    // Add service package row if amount > 0
                    if (servicePackageAmount > 0) {
                      rows.push({
                        key: 'service-package',
                        rowIndex: rowIndex++,
                        type: 'service',
                        name: selectedQuote.serviceType || 'Gói dịch vụ',
                        description: selectedQuote.description || '',
                        unit: 'Gói',
                        quantity: 1,
                        unitPrice: servicePackageAmount,
                        totalPrice: servicePackageAmount
                      });
                    }
                    
                    // Add parts rows
                    if (selectedQuote.parts && selectedQuote.parts.length > 0) {
                      selectedQuote.parts.forEach((part, index) => {
                        rows.push({
                          key: part.quotePartID || `part-${index}`,
                          rowIndex: rowIndex++,
                          type: 'part',
                          name: part.partName,
                          description: part.partDescription || '',
                          unit: 'Chiếc',
                          quantity: part.quantity,
                          unitPrice: part.unitPrice,
                          totalPrice: part.totalPrice
                        });
                      });
                    }
                    
                    return rows.length > 0 ? rows : [];
                  })()}
                  pagination={false}
                  size="small"
                  className="rounded-lg"
                  components={{
                    header: {
                      cell: (props: any) => (
                        <th {...props} className="!bg-gray-50 !border-gray-300 !px-4 !py-2" />
                      ),
                    },
                  }}
                >
                  <Table.Column
                    title={<div className="text-center font-semibold">STT</div>}
                    width={60}
                    align="center"
                    render={(_: any, record: any) => (
                      <div className="text-center">{record.rowIndex}</div>
                    )}
                  />
                  <Table.Column
                    title={<div className="font-semibold">Tên hàng hóa, dịch vụ</div>}
                    width="40%"
                    render={(_: any, record: any) => (
                      <div>
                        <div className="font-medium text-gray-900">{record.name}</div>
                        {record.description && (
                          <div className="text-sm text-gray-600 mt-1">{record.description}</div>
                        )}
                      </div>
                    )}
                  />
                  <Table.Column
                    title={<div className="text-center font-semibold">Đơn vị tính</div>}
                    width={100}
                    align="center"
                    render={(_: any, record: any) => (
                      <div className="text-center">{record.unit}</div>
                    )}
                  />
                  <Table.Column
                    title={<div className="text-center font-semibold">Số lượng</div>}
                    width={100}
                    align="center"
                    render={(_: any, record: any) => (
                      <div className="text-center">{record.quantity}</div>
                    )}
                  />
                  <Table.Column
                    title={<div className="text-right font-semibold">Đơn giá</div>}
                    width={150}
                    align="right"
                    render={(_: any, record: any) => (
                      <div className="text-right">{quoteService.formatPrice(record.unitPrice)}</div>
                    )}
                  />
                  <Table.Column
                    title={<div className="text-right font-semibold">Thành tiền</div>}
                    width={150}
                    align="right"
                    render={(_: any, record: any) => (
                      <div className="text-right font-semibold text-green-600">
                        {quoteService.formatPrice(record.totalPrice)}
                      </div>
                    )}
                  />
                </Table>
                <div className="px-4 py-1 bg-gray-50 border-b border-gray-300">
                  <div className="text-right text-xs italic text-gray-600">
                    (Thành tiền = Số lượng × Đơn giá)
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 border-t-2 border-gray-400">
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-gray-900">
                      Tổng cộng tiền thanh toán:
                    </div>
                    <div className="text-right text-xl font-bold text-red-600">
                      {quoteService.formatPrice(selectedQuote.finalAmount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              {/* <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tổng giá:</span>
                <span className="font-medium">{quoteService.formatPrice(selectedQuote.totalAmount)}</span>
              </div> */}
              {/* {selectedQuote.discountAmount && selectedQuote.discountAmount > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Giảm giá:</span>
                  <span>-{quoteService.formatPrice(selectedQuote.discountAmount)}</span>
                </div>
              )} */}
              {/* <div className="flex justify-between text-xl font-bold text-blue-600 border-t pt-2">
                <span>Thành tiền:</span>
                <span>{quoteService.formatPrice(selectedQuote.finalAmount)}</span>
              </div> */}
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        title="Xác nhận và thanh toán báo giá"
        open={paymentModalVisible}
        onCancel={() => {
          setPaymentModalVisible(false);
          setSelectedQuote(null);
        }}
        footer={null}
        width={600}
      >
        {selectedQuote && (
          <div>
            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '12px', color: '#374151' }}>Thông tin báo giá:</h4>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                <div><strong>Xe:</strong> {selectedQuote.vehicleModel}</div>
                <div><strong>Dịch vụ:</strong> {selectedQuote.serviceType}</div>
                <div><strong>Tổng giá:</strong> {quoteService.formatPrice(selectedQuote.totalAmount)}</div>
                {selectedQuote.discountAmount && selectedQuote.discountAmount > 0 && (
                  <div><strong>Giảm giá:</strong> -{quoteService.formatPrice(selectedQuote.discountAmount)}</div>
                )}
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff', marginTop: '8px' }}>
                  <strong>Thành tiền: {quoteService.formatPrice(selectedQuote.finalAmount)}</strong>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '12px' }}>Chọn phương thức thanh toán:</h4>
              <Radio.Group 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%' }}
              >
                <div style={{ marginBottom: '12px' }}>
                  <Radio value="online" style={{ width: '100%' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>Thanh toán online</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Thanh toán ngay qua PayOS (Ví điện tử, thẻ ngân hàng)
                      </div>
                    </div>
                  </Radio>
                </div>
                <div>
                  <Radio value="cash" style={{ width: '100%' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>Thanh toán tại trung tâm</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Đồng ý báo giá và thanh toán khi đến trung tâm
                      </div>
                    </div>
                  </Radio>
                </div>
              </Radio.Group>
            </div>

            <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              <Space>
                <Button 
                  onClick={() => setPaymentModalVisible(false)}
                  disabled={processingPayment}
                >
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  onClick={handleApproveQuote}
                  loading={processingPayment}
                  icon={<CheckCircleOutlined />}
                >
                  {paymentMethod === 'online' ? 'Thanh toán ngay' : 'Đồng ý báo giá'}
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyQuotes;

