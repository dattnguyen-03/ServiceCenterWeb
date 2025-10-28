import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Modal, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { quoteService, Quote } from '../../services/quoteService';
import { showSuccess, showError } from '../../utils/sweetAlert';
import Swal from 'sweetalert2';

const MyQuotes: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  const handleApprove = async (quote: Quote) => {
    const result = await Swal.fire({
      title: 'Xác nhận báo giá',
      html: `
        <div class="text-left">
          <p><strong>Xe:</strong> ${quote.vehicleModel}</p>
          <p><strong>Dịch vụ:</strong> ${quote.serviceType}</p>
          <p><strong>Giá:</strong> <span class="text-blue-600 font-bold text-xl">${quoteService.formatPrice(quote.finalAmount)}</span></p>
        </div>
        <p class="mt-4">Bạn có chắc chắn đồng ý với báo giá này?</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#22c55e',
    });

    if (result.isConfirmed) {
      try {
        await quoteService.approveQuote({
          quoteID: quote.quoteID,
          action: 'approve',
        });
        showSuccess('Phê duyệt thành công', 'Bạn có thể tiếp tục thanh toán');
        fetchQuotes();
      } catch (error: any) {
        showError('Lỗi', error.message);
      }
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
        rows: 3,
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
      title: 'Giá trị',
      key: 'amount',
      render: (_: any, record: Quote) => (
        <div>
          <div className="font-semibold text-lg text-blue-600">
            {quoteService.formatPrice(record.finalAmount)}
          </div>
          {record.discountAmount && record.discountAmount > 0 && (
            <div className="text-xs text-gray-500 line-through">
              {quoteService.formatPrice(record.totalAmount)}
            </div>
          )}
        </div>
      ),
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
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record)}
              >
                Đồng ý
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

            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tổng giá:</span>
                <span className="font-medium">{quoteService.formatPrice(selectedQuote.totalAmount)}</span>
              </div>
              {selectedQuote.discountAmount && selectedQuote.discountAmount > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Giảm giá:</span>
                  <span>-{quoteService.formatPrice(selectedQuote.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-blue-600 border-t pt-2">
                <span>Thành tiền:</span>
                <span>{quoteService.formatPrice(selectedQuote.finalAmount)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyQuotes;

