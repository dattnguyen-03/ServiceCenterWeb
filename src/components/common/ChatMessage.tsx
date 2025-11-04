import React, { useState, useEffect, useRef } from 'react';
import {
  List,
  Input,
  Button,
  Space,
  Avatar,
  Typography,
  Badge,
  Popconfirm,
  Modal,
  Form,
  Spin,
  Empty,
} from 'antd';
import {
  SendOutlined,
  EditOutlined,
  DeleteOutlined,
  MessageOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CheckCircleTwoTone,
} from '@ant-design/icons';
import { chatMessageService } from '../../services/chatMessageService';
import { serviceCenterService, ServiceCenter } from '../../services/serviceCenterService';
import {
  ChatMessage as ChatMessageType,
  MessageBox,
  SendMessageRequest,
  SendMessageToCenterRequest,
  EditMessageRequest,
  DeleteMessageBoxRequest,
} from '../../types/api';
import { useAuth } from '../../contexts/AuthContext';
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert';

const { TextArea } = Input;
const { Text, Title } = Typography;

interface ChatMessageProps {
  selectedUserId?: number; // Optional: để mở chat với user cụ thể
}

const ChatMessage: React.FC<ChatMessageProps> = ({ selectedUserId }) => {
  const { user } = useAuth();
  const [messageBoxes, setMessageBoxes] = useState<MessageBox[]>([]);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [selectedBox, setSelectedBox] = useState<MessageBox | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState<ChatMessageType | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [sendForm] = Form.useForm();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State cho modal chọn center
  const [selectCenterModalVisible, setSelectCenterModalVisible] = useState(false);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [loadingCenters, setLoadingCenters] = useState(false);

  // Load message boxes khi component mount
  useEffect(() => {
    loadMessageBoxes();
  }, []);

      // Auto-select user nếu có selectedUserId
  useEffect(() => {
    if (selectedUserId && messageBoxes.length > 0) {
      const box = messageBoxes.find(b => (b.TargetUserID || b.targetUserID) === selectedUserId);
      if (box) {
        handleSelectBox(box);
      }
    }
  }, [selectedUserId, messageBoxes]);

  // Auto scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessageBoxes = async () => {
    try {
      setLoading(true);
      const boxes = await chatMessageService.getMessageBoxes();
      setMessageBoxes(boxes);
    } catch (error: any) {
      // Nếu lỗi do thiếu cột Status trong database
      if (error.message?.includes('Status') || error.message?.includes('Invalid column')) {
        showError(
          'Lỗi cấu hình database', 
          'Bảng ChatMessage thiếu cột Status. Vui lòng chạy script SQL để thêm cột: ALTER TABLE ChatMessage ADD Status NVARCHAR(50) NOT NULL DEFAULT \'Sent\';'
        );
      } else {
        showError('Lỗi', error.message || 'Không thể tải danh sách hộp tin nhắn');
      }
      setMessageBoxes([]); // Set empty array để không crash UI
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (targetUserId: number) => {
    try {
      setLoading(true);
      const allMessages = await chatMessageService.viewMessages();
      console.log('[ChatMessage] Loaded all messages:', allMessages.length);
      
      // Lọc tin nhắn giữa user hiện tại và target user
      const currentUserId = user?.id ? Number(user.id) : null;
      if (!currentUserId) {
        console.warn('[ChatMessage] No current user ID');
        return;
      }
      
      console.log('[ChatMessage] Filtering messages for currentUserId:', currentUserId, 'targetUserId:', targetUserId);
      
      const filteredMessages = allMessages.filter(
        (msg) => {
          const senderID = msg.SenderID || msg.senderID || 0;
          const receiverID = msg.ReceiverID || msg.receiverID || 0;
          const matches = (
            (senderID === currentUserId && receiverID === targetUserId) ||
            (senderID === targetUserId && receiverID === currentUserId)
          );
          return matches;
        }
      );
      
      console.log('[ChatMessage] Filtered messages:', filteredMessages.length);
      
      // Sắp xếp theo thời gian tăng dần
      filteredMessages.sort((a, b) => {
        const sentAtA = a.SentAt || a.sentAt || '';
        const sentAtB = b.SentAt || b.sentAt || '';
        return new Date(sentAtA).getTime() - new Date(sentAtB).getTime();
      });
      setMessages(filteredMessages);
    } catch (error: any) {
      // Nếu lỗi do thiếu cột Status trong database
      if (error.message?.includes('Status') || error.message?.includes('Invalid column')) {
        showError(
          'Lỗi cấu hình database', 
          'Bảng ChatMessage thiếu cột Status. Vui lòng chạy script SQL để thêm cột: ALTER TABLE ChatMessage ADD Status NVARCHAR(50) NOT NULL DEFAULT \'Sent\';'
        );
      } else {
        showError('Lỗi', error.message || 'Không thể tải tin nhắn');
      }
      setMessages([]); // Set empty array để không crash UI
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBox = (box: MessageBox) => {
    setSelectedBox(box);
    const targetUserId = box.TargetUserID || box.targetUserID || 0;
    loadMessages(targetUserId);
    sendForm.resetFields();
  };

  const handleSendMessage = async (values: { content: string; receiverID?: number }) => {
    if (!selectedBox) {
      showError('Lỗi', 'Vui lòng chọn một cuộc trò chuyện');
      return;
    }

    try {
      setSending(true);
      const targetUserId = selectedBox.TargetUserID || selectedBox.targetUserID || 0;
      const data: SendMessageRequest = {
        receiverID: values.receiverID || targetUserId,
        content: values.content.trim(),
      };

      await chatMessageService.sendMessage(data);
      sendForm.resetFields();
      
      // Reload messages và message boxes để đồng bộ
      await Promise.all([
        loadMessages(targetUserId),
        loadMessageBoxes()
      ]);
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleEditMessage = (msg: ChatMessageType) => {
    // Kiểm tra thời gian (chỉ cho phép chỉnh sửa trong 2 phút)
    const sentAt = msg.SentAt || msg.sentAt || '';
    const sentTime = new Date(sentAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - sentTime.getTime()) / (1000 * 60);

    if (diffMinutes > 2) {
      showError('Lỗi', 'Chỉ có thể chỉnh sửa tin nhắn trong vòng 2 phút sau khi gửi');
      return;
    }

    // Kiểm tra quyền (chỉ người gửi mới chỉnh sửa được)
    const currentUserId = user?.id ? Number(user.id) : null;
    const senderID = msg.SenderID || msg.senderID || 0;
    if (!currentUserId || senderID !== currentUserId) {
      showError('Lỗi', 'Bạn chỉ có thể chỉnh sửa tin nhắn do mình gửi');
      return;
    }

    setEditingMessage(msg);
    // Loại bỏ "(Đã chỉnh sửa)" nếu có
    const content = (msg.Content || msg.content || '').replace(' (Đã chỉnh sửa)', '').trim();
    editForm.setFieldsValue({ newContent: content });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async (values: { newContent: string }) => {
    if (!editingMessage) return;

    try {
      const data: EditMessageRequest = {
        messageID: editingMessage.MessageID || editingMessage.messageID || 0,
        newContent: values.newContent.trim(),
      };

      await chatMessageService.editMessage(data);
      showSuccess('Thành công', 'Chỉnh sửa tin nhắn thành công');
      setEditModalVisible(false);
      setEditingMessage(null);
      editForm.resetFields();
      
      // Reload messages và message boxes để đồng bộ
      if (selectedBox) {
        const targetUserId = selectedBox.TargetUserID || selectedBox.targetUserID || 0;
        await Promise.all([
          loadMessages(targetUserId),
          loadMessageBoxes()
        ]);
      }
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể chỉnh sửa tin nhắn');
    }
  };

  const handleDeleteMessageBox = async (box: MessageBox) => {
    if (!user || user.role !== 'admin') {
      showError('Lỗi', 'Chỉ Admin mới có quyền xóa hộp tin nhắn');
      return;
    }

    const result = await showConfirm(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa toàn bộ tin nhắn với ${box.targetName}?`,
      'Xóa',
      'Hủy'
    );

    if (!result.isConfirmed) return;

    try {
      const data: DeleteMessageBoxRequest = {
        userID1: user.id ? Number(user.id) : null,
        userID2: box.TargetUserID || box.targetUserID || 0,
      };

      await chatMessageService.deleteMessageBox(data);
      showSuccess('Thành công', 'Xóa hộp tin nhắn thành công');
      
      // Reload message boxes và clear selection
      await loadMessageBoxes();
      setSelectedBox(null);
      setMessages([]);
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể xóa hộp tin nhắn');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isMyMessage = (msg: ChatMessageType) => {
    const currentUserId = user?.id ? Number(user.id) : null;
    if (!currentUserId) return false;
    const senderID = msg.SenderID || msg.senderID || 0;
    return senderID === currentUserId;
  };

  const canEditMessage = (msg: ChatMessageType) => {
    if (!isMyMessage(msg)) return false;
    const sentAt = msg.SentAt || msg.sentAt || '';
    const sentTime = new Date(sentAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - sentTime.getTime()) / (1000 * 60);
    return diffMinutes <= 2;
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar - Danh sách hộp tin nhắn */}
      <div className="w-80 border-r bg-white flex flex-col shadow-sm mr-4">
        <div className="p-4 border-b">
          <Title level={4} className="mb-0 flex items-center gap-2">
            <MessageOutlined />
            Tin nhắn
          </Title>
          {user?.role === 'customer' && (
            <Button
              type="primary"
              size="small"
              icon={<MessageOutlined />}
              className="mt-2 w-full"
              onClick={async () => {
                setLoadingCenters(true);
                try {
                  const centers = await serviceCenterService.getServiceCenters();
                  setServiceCenters(centers);
                  setSelectCenterModalVisible(true);
                } catch (error: any) {
                  showError('Lỗi', error.message || 'Không thể tải danh sách trung tâm');
                } finally {
                  setLoadingCenters(false);
                }
              }}
            >
              Gửi tin nhắn đến trung tâm
            </Button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && messageBoxes.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <Spin />
            </div>
          ) : messageBoxes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 p-4">
              <Empty
                description="Chưa có cuộc trò chuyện nào"
                className="mb-4"
              />
              {user?.role === 'customer' && (
                <Space direction="vertical" size="middle" className="w-full">
                  <Button
                    type="primary"
                    icon={<MessageOutlined />}
                    onClick={async () => {
                      try {
                        // Gửi tin nhắn đầu tiên đến support (receiverID = null sẽ tự động gửi đến support)
                        const data: SendMessageRequest = {
                          receiverID: null,
                          content: 'Xin chào! Tôi cần được hỗ trợ.',
                        };
                        await chatMessageService.sendMessage(data);
                        await loadMessageBoxes();
                      } catch (error: any) {
                        showError('Lỗi', error.message || 'Không thể gửi tin nhắn');
                      }
                    }}
                    block
                  >
                    Liên hệ hỗ trợ chung
                  </Button>
                  <Button
                    type="default"
                    icon={<MessageOutlined />}
                    onClick={async () => {
                      setLoadingCenters(true);
                      try {
                        const centers = await serviceCenterService.getServiceCenters();
                        setServiceCenters(centers);
                        setSelectCenterModalVisible(true);
                      } catch (error: any) {
                        showError('Lỗi', error.message || 'Không thể tải danh sách trung tâm');
                      } finally {
                        setLoadingCenters(false);
                      }
                    }}
                    block
                  >
                    Gửi tin nhắn đến trung tâm dịch vụ
                  </Button>
                  <div className="mt-2 pt-2 border-t w-full">
                    <Text type="secondary" className="text-xs text-center block">
                      Nếu có vấn đề gì, vui lòng liên hệ với <strong>Admin</strong> (người có quyền hạn cao nhất)
                    </Text>
                  </div>
                </Space>
              )}
            </div>
          ) : (
            <List
              dataSource={messageBoxes}
              renderItem={(box) => (
                <List.Item
                  className={`mr-5 cursor-pointer hover:bg-gray-50 transition-colors px-3 py-3 ${
                    (selectedBox?.TargetUserID || selectedBox?.targetUserID) === (box.TargetUserID || box.targetUserID) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => handleSelectBox(box)}
                  actions={
                    user?.role === 'admin'
                      ? [
                          <Popconfirm
                            title="Xác nhận xóa"
                            description={`Xóa toàn bộ tin nhắn với ${box.TargetName || box.targetName}?`}
                            onConfirm={() => handleDeleteMessageBox(box)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                          >
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Popconfirm>,
                        ]
                      : []
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <Badge count={(box.UnreadCount || box.unreadCount || 0) > 0 ? (box.UnreadCount || box.unreadCount || 0) : 0} offset={[-5, 5]}>
                        <Avatar 
                          style={{ 
                            backgroundColor: '#1890ff',
                            flexShrink: 0
                          }}
                        >
                          {(box.TargetName || box.targetName || 'U').charAt(0).toUpperCase()}
                        </Avatar>
                      </Badge>
                    }
                    title={
                      <div className="flex items-center justify-between">
                        <Text strong className="text-base">{box.TargetName || box.targetName}</Text>
                        {(box.UnreadCount || box.unreadCount || 0) > 0 && (
                          <Badge count={box.UnreadCount || box.unreadCount || 0} />
                        )}
                      </div>
                    }
                    description={
                      <div className="mt-1">
                        <Text ellipsis className="block text-sm">
                          {box.LastMessage || box.lastMessage}
                        </Text>
                        <Text type="secondary" className="text-xs mt-1">
                          {formatTime(box.LastMessageTime || box.lastMessageTime || '')}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white ml-4">
        {selectedBox ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-white">
              <Title level={5} className="mb-0">
                {selectedBox.TargetName || selectedBox.targetName}
              </Title>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading && messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <Spin />
                </div>
              ) : messages.length === 0 ? (
                <Empty description="Chưa có tin nhắn nào" />
              ) : (
                messages.map((msg) => {
                  const isMyMsg = isMyMessage(msg);
                  const targetName = selectedBox?.TargetName || selectedBox?.targetName || 'Người dùng';
                  const targetInitial = targetName.charAt(0).toUpperCase();
                  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';
                  
                  return (
                    <div
                      key={msg.MessageID || msg.messageID || 0}
                      className={`flex items-end gap-2 ${isMyMsg ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Avatar cho tin nhắn của người đối diện (bên trái) */}
                      {!isMyMsg && (
                        <Avatar 
                          size="default"
                          style={{ backgroundColor: '#1890ff', flexShrink: 0 }}
                        >
                          {targetInitial}
                        </Avatar>
                      )}
                      
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isMyMsg
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="mb-1 whitespace-pre-wrap">{msg.Content || msg.content}</p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {isMyMsg && (
                              <>
                                {(msg.Status || msg.status) === 'Seen' ? (
                                  <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: '16px' }} />
                                ) : (
                                  <CheckCircleOutlined className="text-white" style={{ fontSize: '16px' }} />
                                )}
                                {canEditMessage(msg) && (
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined />}
                                    className="text-white hover:text-gray-200"
                                    onClick={() => handleEditMessage(msg)}
                                  />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <Text
                          className={`text-xs ${
                            isMyMsg ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(msg.SentAt || msg.sentAt || '')}
                        </Text>
                      </div>
                      
                      
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Send Message Form */}
            <div className="p-4 border-t bg-white">
              <Form
                form={sendForm}
                onFinish={handleSendMessage}
                layout="inline"
                className="flex gap-2"
              >
                <Form.Item
                  name="content"
                  rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                  className="flex-1 mb-0"
                >
                  <TextArea
                    placeholder="Nhập tin nhắn..."
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    onPressEnter={(e) => {
                      if (e.shiftKey) return;
                      e.preventDefault();
                      sendForm.submit();
                    }}
                  />
                </Form.Item>
                <Form.Item className="mb-0">
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    htmlType="submit"
                    loading={sending}
                  >
                    Gửi
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
            <Empty
              description="Chọn một cuộc trò chuyện để bắt đầu"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="mb-6"
            />
            {user?.role === 'customer' && (
              <Space direction="vertical" size="middle" className="w-full px-4">
                <Button
                  type="primary"
                  size="large"
                  icon={<MessageOutlined />}
                  onClick={async () => {
                    try {
                      // Gửi tin nhắn đầu tiên đến support
                      const data: SendMessageRequest = {
                        receiverID: null,
                        content: 'Xin chào! Tôi cần được hỗ trợ.',
                      };
                      await chatMessageService.sendMessage(data);
                      await loadMessageBoxes();
                    } catch (error: any) {
                      showError('Lỗi', error.message || 'Không thể gửi tin nhắn');
                    }
                  }}
                  block
                >
                  Liên hệ hỗ trợ chung
                </Button>
                <Button
                  type="default"
                  size="large"
                  icon={<MessageOutlined />}
                  onClick={async () => {
                    setLoadingCenters(true);
                    try {
                      const centers = await serviceCenterService.getServiceCenters();
                      setServiceCenters(centers);
                      setSelectCenterModalVisible(true);
                    } catch (error: any) {
                      showError('Lỗi', error.message || 'Không thể tải danh sách trung tâm');
                    } finally {
                      setLoadingCenters(false);
                    }
                  }}
                  block
                >
                  Gửi tin nhắn đến trung tâm dịch vụ
                </Button>
                <div className="mt-2 pt-2 border-t w-full">
                  <Text type="secondary" className="text-xs text-center block">
                    Nếu có vấn đề gì, vui lòng liên hệ với <strong>Admin</strong>
                  </Text>
                </div>
              </Space>
            )}
          </div>
        )}
      </div>

      {/* Select Center Modal - Cho Customer chọn center hoặc Admin để gửi tin nhắn */}
      {user?.role === 'customer' && (
        <Modal
          title="Chọn người nhận tin nhắn"
          open={selectCenterModalVisible}
          onCancel={() => {
            setSelectCenterModalVisible(false);
            setServiceCenters([]);
          }}
          footer={null}
          width={600}
        >
          <div className="space-y-4">
            {loadingCenters ? (
              <div className="flex justify-center items-center py-8">
                <Spin />
              </div>
            ) : (
              <>
                {/* Option: Gửi đến Admin */}
                <div className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                      <div>
                        <Text strong className="block">Admin</Text>
                        <Text type="secondary" className="text-sm">Người có quyền hạn cao nhất</Text>
                      </div>
                    </div>
                    <Button
                      type="primary"
                      onClick={async () => {
                        try {
                          const data: SendMessageRequest = {
                            receiverID: 1, // Admin ID = 1
                            content: 'Xin chào! Tôi cần được hỗ trợ từ Admin.',
                          };
                          await chatMessageService.sendMessage(data);
                          setSelectCenterModalVisible(false);
                          await loadMessageBoxes();
                          
                          // Auto-select conversation với Admin
                          setTimeout(async () => {
                            await loadMessageBoxes();
                            const boxes = await chatMessageService.getMessageBoxes();
                            const adminBox = boxes.find(b => (b.TargetUserID || b.targetUserID) === 1);
                            if (adminBox) {
                              handleSelectBox(adminBox);
                            }
                          }, 500);
                        } catch (error: any) {
                          showError('Lỗi', error.message || 'Không thể gửi tin nhắn');
                        }
                      }}
                    >
                      Chọn
                    </Button>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t pt-4">
                  <Title level={5} className="mb-3">Trung tâm dịch vụ</Title>
                </div>

                {/* Service Centers List */}
                {serviceCenters.length === 0 ? (
                  <Empty description="Không có trung tâm dịch vụ nào" />
                ) : (
                  <List
                    dataSource={serviceCenters}
                    renderItem={(center) => (
                      <List.Item
                        className="hover:bg-gray-50 cursor-pointer border rounded-lg mb-2"
                        actions={[
                          <Button
                            type="primary"
                            onClick={async () => {
                              try {
                                const data: SendMessageToCenterRequest = {
                                  centerID: center.centerID,
                                  content: `Xin chào! Tôi cần được hỗ trợ từ trung tâm ${center.name}.`,
                                };
                                const result = await chatMessageService.sendMessageToCenter(data);
                                setSelectCenterModalVisible(false);
                                await loadMessageBoxes();
                                
                                // Auto-select conversation mới
                                setTimeout(async () => {
                                  await loadMessageBoxes();
                                  const boxes = await chatMessageService.getMessageBoxes();
                                  const newBox = boxes.find(b => (b.TargetUserID || b.targetUserID) === result.receiverID);
                                  if (newBox) {
                                    handleSelectBox(newBox);
                                  }
                                }, 500);
                              } catch (error: any) {
                                showError('Lỗi', error.message || 'Không thể gửi tin nhắn');
                              }
                            }}
                          >
                            Chọn
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={<Text strong>{center.name}</Text>}
                          description={
                            <div>
                              <Text className="block">{center.address}</Text>
                              <Text type="secondary" className="text-sm">{center.phone}</Text>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </>
            )}
          </div>
        </Modal>
      )}

      {/* Edit Message Modal */}
      <Modal
        title="Chỉnh sửa tin nhắn"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingMessage(null);
          editForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={editForm}
          onFinish={handleSaveEdit}
          layout="vertical"
        >
          <Form.Item
            name="newContent"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập nội dung mới..."
            />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space>
              <Button
                type="primary"
                htmlType="submit"
              >
                Lưu
              </Button>
              <Button
                onClick={() => {
                  setEditModalVisible(false);
                  setEditingMessage(null);
                  editForm.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChatMessage;

