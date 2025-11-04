import { httpClient } from './httpClient';
import { API_CONFIG } from '../config/api';
import {
  ChatMessage,
  SendMessageRequest,
  SendMessageResponse,
  SendMessageToCenterRequest,
  SendMessageToCenterResponse,
  ViewMessageResponse,
  MessageBox,
  GetMessageBoxListResponse,
  EditMessageRequest,
  EditMessageResponse,
  DeleteMessageBoxRequest,
  DeleteMessageBoxResponse,
} from '../types/api';

class ChatMessageService {
  // Gửi tin nhắn
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      const response = await httpClient.post<SendMessageResponse>(
        API_CONFIG.ENDPOINTS.MESSAGE.SEND,
        {
          ReceiverID: data.receiverID === 0 ? null : data.receiverID,
          Content: data.content,
        }
      );

      // Backend returns { Success, Message }
      if (response && typeof response === 'object') {
        const anyRes: any = response as any;
        if (anyRes.Success !== undefined) {
          return {
            success: anyRes.Success,
            message: anyRes.Message || 'Gửi tin nhắn thành công',
          };
        }
        if (anyRes.success !== undefined) {
          return {
            success: anyRes.success,
            message: anyRes.message || 'Gửi tin nhắn thành công',
          };
        }
      }

      return {
        success: true,
        message: 'Gửi tin nhắn thành công',
      };
    } catch (error: any) {
      console.error('Error sending message:', error);
      throw new Error(error.message || 'Lỗi gửi tin nhắn');
    }
  }

  // Gửi tin nhắn đến trung tâm dịch vụ (Customer only)
  async sendMessageToCenter(data: SendMessageToCenterRequest): Promise<SendMessageToCenterResponse> {
    try {
      const response = await httpClient.post<SendMessageToCenterResponse>(
        API_CONFIG.ENDPOINTS.MESSAGE.SEND_TO_CENTER,
        {
          CenterID: data.centerID === 0 ? null : data.centerID,
          Content: data.content,
        }
      );

      // Backend returns { Success, Message, ReceiverID }
      if (response && typeof response === 'object') {
        const anyRes: any = response as any;
        if (anyRes.Success !== undefined) {
          return {
            success: anyRes.Success,
            message: anyRes.Message || 'Gửi tin nhắn thành công',
            receiverID: anyRes.ReceiverID,
          };
        }
        if (anyRes.success !== undefined) {
          return {
            success: anyRes.success,
            message: anyRes.message || 'Gửi tin nhắn thành công',
            receiverID: anyRes.receiverID,
          };
        }
      }

      return {
        success: true,
        message: 'Gửi tin nhắn thành công',
      };
    } catch (error: any) {
      console.error('Error sending message to center:', error);
      throw new Error(error.message || 'Lỗi gửi tin nhắn đến trung tâm');
    }
  }

  // Xem tin nhắn (tất cả tin nhắn liên quan đến user hiện tại)
  async viewMessages(): Promise<ChatMessage[]> {
    try {
      const response = await httpClient.get<ViewMessageResponse>(
        API_CONFIG.ENDPOINTS.MESSAGE.VIEW
      );

      console.log('[ChatMessageService] ViewMessages response:', response);

      // Backend returns { message, messages: [...] } hoặc { message, Messages: [...] }
      if (response && typeof response === 'object') {
        const anyRes: any = response as any;
        console.log('[ChatMessageService] Response keys:', Object.keys(anyRes));
        
        // Ưu tiên messages (camelCase) trước, sau đó Messages (PascalCase)
        if (Array.isArray(anyRes.messages)) {
          console.log('[ChatMessageService] Found messages (camelCase):', anyRes.messages.length);
          return anyRes.messages as ChatMessage[];
        }
        if (Array.isArray(anyRes.Messages)) {
          console.log('[ChatMessageService] Found Messages (PascalCase):', anyRes.Messages.length);
          return anyRes.Messages as ChatMessage[];
        }
        if (Array.isArray(anyRes.data)) {
          console.log('[ChatMessageService] Found data:', anyRes.data.length);
          return anyRes.data as ChatMessage[];
        }
        if (Array.isArray(anyRes)) {
          console.log('[ChatMessageService] Response is array:', anyRes.length);
          return anyRes as ChatMessage[];
        }
        
        console.warn('[ChatMessageService] No messages array found in response:', anyRes);
      }

      console.warn('[ChatMessageService] Empty response, returning empty array');
      return [];
    } catch (error: any) {
      console.error('Error viewing messages:', error);
      throw new Error(error.message || 'Lỗi tải tin nhắn');
    }
  }

  // Lấy danh sách message box (hội thoại)
  async getMessageBoxes(): Promise<MessageBox[]> {
    try {
      const response = await httpClient.get<GetMessageBoxListResponse>(
        API_CONFIG.ENDPOINTS.MESSAGE.GET_MESSAGE_BOXES
      );

      // Backend returns { Success, message, data: [...] }
      if (response && typeof response === 'object') {
        const anyRes: any = response as any;
        if (Array.isArray(anyRes.data)) {
          return anyRes.data as MessageBox[];
        }
        if (Array.isArray(anyRes)) {
          return anyRes as MessageBox[];
        }
      }

      return [];
    } catch (error: any) {
      console.error('Error getting message boxes:', error);
      throw new Error(error.message || 'Lỗi tải danh sách hộp tin nhắn');
    }
  }

  // Chỉnh sửa tin nhắn
  async editMessage(data: EditMessageRequest): Promise<EditMessageResponse> {
    try {
      const response = await httpClient.put<EditMessageResponse>(
        API_CONFIG.ENDPOINTS.MESSAGE.EDIT,
        {
          MessageID: data.messageID,
          NewContent: data.newContent,
        }
      );

      // Backend returns { Success, Message }
      if (response && typeof response === 'object') {
        const anyRes: any = response as any;
        if (anyRes.Success !== undefined) {
          return {
            success: anyRes.Success,
            message: anyRes.Message || 'Chỉnh sửa tin nhắn thành công',
          };
        }
        if (anyRes.success !== undefined) {
          return {
            success: anyRes.success,
            message: anyRes.message || 'Chỉnh sửa tin nhắn thành công',
          };
        }
      }

      return {
        success: true,
        message: 'Chỉnh sửa tin nhắn thành công',
      };
    } catch (error: any) {
      console.error('Error editing message:', error);
      throw new Error(error.message || 'Lỗi chỉnh sửa tin nhắn');
    }
  }

  // Xóa hộp tin nhắn (chỉ Admin)
  async deleteMessageBox(data: DeleteMessageBoxRequest): Promise<DeleteMessageBoxResponse> {
    try {
      const response = await httpClient.deleteWithBody<DeleteMessageBoxResponse>(
        API_CONFIG.ENDPOINTS.MESSAGE.DELETE_BOX,
        {
          UserID1: data.userID1 === 0 ? null : data.userID1,
          UserID2: data.userID2 === 0 ? null : data.userID2,
        }
      );

      // Backend returns { Message }
      if (response && typeof response === 'object') {
        const anyRes: any = response as any;
        if (anyRes.Message) {
          return { message: anyRes.Message };
        }
        if (anyRes.message) {
          return { message: anyRes.message };
        }
      }

      return { message: 'Xóa hộp tin nhắn thành công' };
    } catch (error: any) {
      console.error('Error deleting message box:', error);
      throw new Error(error.message || 'Lỗi xóa hộp tin nhắn');
    }
  }
}

export const chatMessageService = new ChatMessageService();
export default chatMessageService;

