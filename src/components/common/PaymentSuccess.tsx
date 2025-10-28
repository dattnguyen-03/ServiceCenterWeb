import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { showSuccess, showError } from '../../utils/sweetAlert';
import { paymentService } from '../../services/paymentService';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const orderCodeParam = searchParams.get('orderCode');
        
        if (!orderCodeParam) {
          setStatus('error');
          setMessage('Không tìm thấy mã thanh toán');
          return;
        }

        const orderCode = parseInt(orderCodeParam, 10);
        if (isNaN(orderCode)) {
          setStatus('error');
          setMessage('Mã thanh toán không hợp lệ');
          return;
        }

        // ✅ Gọi backend để xác nhận thanh toán
        const result = await paymentService.verifyPayment(orderCode);

        if (result.success) {
          setStatus('success');
          setMessage('Thanh toán thành công! Đang điều hướng...');
          showSuccess('Thanh toán thành công', 'Lịch hẹn của bạn đã được xác nhận.');
        } else {
          setStatus('error');
          setMessage('Xác nhận thất bại');
          showError('Thanh toán thất bại', result.message);
        }

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/customer/booking', { replace: true });
        }, 2000);
        
      } catch (error: any) {
        console.error('Error verifying payment:', error);
        setStatus('error');
        setMessage('Có lỗi xảy ra khi xác nhận thanh toán');
        showError('Lỗi xác nhận thanh toán', error.message);
        
        setTimeout(() => {
          navigate('/customer/booking', { replace: true });
        }, 3000);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Đang xử lý thanh toán...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Result
          status="success"
          icon={<CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a' }} />}
          title="Thanh toán thành công!"
          subTitle={message}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Result
        status="error"
        icon={<CloseCircleOutlined style={{ fontSize: 72, color: '#ff4d4f' }} />}
        title="Thanh toán thất bại"
        subTitle={message}
      />
    </div>
  );
};

export default PaymentSuccess;

