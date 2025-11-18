import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, Button, Empty, Spin, Typography, Space, Divider } from 'antd';
import { BellOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { reminderService } from '../../services/reminderService';
import { ViewReminderDTO } from '../../types/api';
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

interface NotificationBellProps {
  userRole?: 'customer' | 'staff' | 'technician' | 'admin';
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userRole = 'customer' }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [reminders, setReminders] = useState<ViewReminderDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Load unread count
  const loadUnreadCount = async () => {
    try {
      const result = await reminderService.countUnreadReminders();
      setUnreadCount(result.unreadCount);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  // Load reminders
  const loadReminders = async () => {
    setLoading(true);
    try {
      let result: ViewReminderDTO[];
      if (userRole === 'admin' || userRole === 'staff') {
        result = await reminderService.getAllReminders();
      } else {
        result = await reminderService.viewReminders();
      }
      setReminders(result);
      // Reload count after viewing (for customer, viewing marks as read)
      if (userRole === 'customer') {
        await loadUnreadCount();
      }
    } catch (error: any) {
      console.error('Error loading reminders:', error);
      showError('Lỗi', error.message || 'Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  // Clean old reminders
  const handleCleanOld = async () => {
    const confirmed = await showConfirm(
      'Dọn dẹp thông báo',
      'Bạn có chắc muốn xóa tất cả thông báo đã được gửi cách đây hơn 7 ngày?',
      'warning'
    );
    
    if (!confirmed) return;

    try {
      const result = await reminderService.cleanOldReminders();
      showSuccess('Thành công', result.message || `Đã xóa ${result.deletedCount || 0} thông báo`);
      await loadReminders();
      await loadUnreadCount();
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể dọn dẹp thông báo');
    }
  };

  // Load on mount and when dropdown opens
  useEffect(() => {
    loadUnreadCount();
    // Auto refresh every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      loadReminders();
    }
  }, [open]);

  const formatTime = (dateString: string) => {
    const date = dayjs(dateString);
    const now = dayjs();
    const diffDays = now.diff(date, 'day');
    
    if (diffDays === 0) {
      return date.format('HH:mm');
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return date.format('dddd, DD/MM');
    } else {
      return date.format('DD/MM/YYYY');
    }
  };

  const dropdownContent = (
    <div style={{ width: 380, maxHeight: 500, overflow: 'auto' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Text strong style={{ fontSize: 16 }}>
          Thông báo {unreadCount > 0 && `(${unreadCount} chưa đọc)`}
        </Typography.Text>
        {userRole === 'customer' && reminders.length > 0 && (
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={handleCleanOld}
            style={{ fontSize: 12 }}
          >
            Dọn dẹp
          </Button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <Spin />
        </div>
      ) : reminders.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Không có thông báo"
          style={{ padding: 40 }}
        />
      ) : (
        <div>
          {reminders.map((reminder, index) => (
            <div key={reminder.reminderID}>
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: !reminder.isRead ? '#f0f7ff' : '#fff',
                  borderLeft: !reminder.isRead ? '3px solid #1890ff' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = !reminder.isRead ? '#e6f4ff' : '#fafafa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = !reminder.isRead ? '#f0f7ff' : '#fff';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <Typography.Text
                    strong
                    style={{
                      fontSize: 14,
                      color: !reminder.isRead ? '#1890ff' : '#262626',
                      flex: 1,
                    }}
                  >
                    {reminder.title}
                  </Typography.Text>
                  {!reminder.isRead && (
                    <Badge
                      dot
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </div>
                <Typography.Text
                  style={{
                    fontSize: 13,
                    color: '#595959',
                    display: 'block',
                    marginBottom: 8,
                    lineHeight: 1.5,
                  }}
                >
                  {reminder.message}
                </Typography.Text>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 11 }}
                >
                  {formatTime(reminder.createdAt)}
                </Typography.Text>
              </div>
              {index < reminders.length - 1 && <Divider style={{ margin: 0 }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      overlayStyle={{ padding: 0 }}
    >
      <Button
        type="text"
        icon={<BellOutlined style={{ fontSize: 18 }} />}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Badge count={unreadCount} offset={[-2, 2]} size="small">
          <span style={{ width: 20, height: 20 }} />
        </Badge>
      </Button>
    </Dropdown>
  );
};

export default NotificationBell;

