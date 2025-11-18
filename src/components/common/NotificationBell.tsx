import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, Button, Empty, Spin, Typography, Space, Divider } from 'antd';
import { 
  BellOutlined, 
  DeleteOutlined, 
  CheckOutlined,
  CarOutlined,
  ToolOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
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

  const getNotificationIcon = (title: string, isRead: boolean) => {
    const lowerTitle = title.toLowerCase();
    const iconColor = isRead ? '#8c8c8c' : '#fff';
    const iconSize = 18;
    
    if (lowerTitle.includes('bảo dưỡng') || lowerTitle.includes('maintenance')) {
      return <ToolOutlined style={{ fontSize: iconSize, color: iconColor }} />;
    } else if (lowerTitle.includes('xe') || lowerTitle.includes('vehicle')) {
      return <CarOutlined style={{ fontSize: iconSize, color: iconColor }} />;
    } else if (lowerTitle.includes('lịch') || lowerTitle.includes('appointment')) {
      return <CalendarOutlined style={{ fontSize: iconSize, color: iconColor }} />;
    } else if (lowerTitle.includes('cảnh báo') || lowerTitle.includes('warning')) {
      return <ExclamationCircleOutlined style={{ fontSize: iconSize, color: iconColor }} />;
    }
    return <InfoCircleOutlined style={{ fontSize: iconSize, color: iconColor }} />;
  };

  const dropdownContent = (
    <div 
      style={{ 
        width: 400, 
        maxHeight: 600, 
        overflow: 'hidden',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        background: '#fff',
      }}
    >
      {/* Header với gradient */}
      <div 
        style={{ 
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BellOutlined style={{ fontSize: 20, color: '#fff' }} />
          <Typography.Text strong style={{ fontSize: 16, color: '#fff' }}>
            Thông báo
          </Typography.Text>
          {unreadCount > 0 && (
            <Badge
              count={unreadCount}
              style={{
                backgroundColor: '#ff4d4f',
                boxShadow: '0 0 0 1px #fff',
              }}
            />
          )}
        </div>
        {userRole === 'customer' && reminders.length > 0 && (
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={handleCleanOld}
            style={{ 
              color: '#fff',
              fontSize: 12,
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            Dọn dẹp
          </Button>
        )}
      </div>

      {/* Content */}
      <div style={{ maxHeight: 500, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#8c8c8c' }}>Đang tải thông báo...</div>
          </div>
        ) : reminders.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ 
              fontSize: 48, 
              color: '#d9d9d9', 
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'center',
            }}>
              <BellOutlined />
            </div>
            <Typography.Text type="secondary" style={{ fontSize: 14 }}>
              Không có thông báo nào
            </Typography.Text>
          </div>
        ) : (
          <div>
            {reminders.map((reminder, index) => (
              <div key={reminder.reminderID}>
                <div
                  style={{
                    padding: '16px 20px',
                    backgroundColor: !reminder.isRead ? '#f0f7ff' : '#fff',
                    borderLeft: !reminder.isRead ? '4px solid #1890ff' : '4px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = !reminder.isRead ? '#e6f4ff' : '#fafafa';
                    e.currentTarget.style.transform = 'translateX(2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = !reminder.isRead ? '#f0f7ff' : '#fff';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', gap: 12 }}>
                    {/* Icon */}
                    <div style={{ 
                      flexShrink: 0,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: !reminder.isRead 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                        : '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: !reminder.isRead 
                        ? '0 2px 8px rgba(102, 126, 234, 0.3)' 
                        : 'none',
                    }}>
                      {getNotificationIcon(reminder.title, reminder.isRead)}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: 6,
                        gap: 8,
                      }}>
                        <Typography.Text
                          strong
                          style={{
                            fontSize: 15,
                            color: !reminder.isRead ? '#1890ff' : '#262626',
                            flex: 1,
                            lineHeight: 1.4,
                          }}
                          ellipsis={{ tooltip: reminder.title }}
                        >
                          {reminder.title}
                        </Typography.Text>
                        {!reminder.isRead && (
                          <Badge
                            dot
                            style={{ 
                              backgroundColor: '#ff4d4f',
                              marginTop: 4,
                            }}
                          />
                        )}
                      </div>
                      
                      <Typography.Text
                        style={{
                          fontSize: 13,
                          color: '#595959',
                          display: 'block',
                          marginBottom: 10,
                          lineHeight: 1.6,
                          wordBreak: 'break-word',
                        }}
                      >
                        {reminder.message}
                      </Typography.Text>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Typography.Text
                          type="secondary"
                          style={{ 
                            fontSize: 12,
                            color: '#8c8c8c',
                          }}
                        >
                          {formatTime(reminder.createdAt)}
                        </Typography.Text>
                      </div>
                    </div>
                  </div>
                </div>
                {index < reminders.length - 1 && (
                  <Divider 
                    style={{ 
                      margin: 0,
                      borderColor: '#f0f0f0',
                    }} 
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
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
        icon={<BellOutlined style={{ fontSize: 20 }} />}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          width: 40,
          height: 40,
          borderRadius: '50%',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f0f0f0';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Badge 
          count={unreadCount} 
          offset={[-4, 4]} 
          size="small"
          style={{
            boxShadow: '0 0 0 2px #fff',
          }}
        >
          <span style={{ width: 24, height: 24 }} />
        </Badge>
      </Button>
    </Dropdown>
  );
};

export default NotificationBell;

