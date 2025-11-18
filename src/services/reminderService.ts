import { httpClient } from './httpClient';
import { API_CONFIG } from '../config/api';
import { ApiResponse } from '../types/api';
import {
  ViewReminderDTO,
  CountReminderDTO,
  CreateReminderRequest,
  EditReminderRequest,
  CleanReminderResponse,
} from '../types/api';

class ReminderService {
  /**
   * Đếm số lượng reminder chưa đọc của user hiện tại
   */
  async countUnreadReminders(): Promise<CountReminderDTO> {
    try {
      const response = await httpClient.get<CountReminderDTO>(
        API_CONFIG.ENDPOINTS.REMINDER.COUNT
      );
      
      if (response && typeof response === 'object' && 'unreadCount' in response) {
        return response;
      }
      
      return { unreadCount: 0 };
    } catch (error: any) {
      console.error('Error counting unread reminders:', error);
      return { unreadCount: 0 };
    }
  }

  /**
   * User xem toàn bộ thông báo của mình (tự động set IsRead = true)
   */
  async viewReminders(): Promise<ViewReminderDTO[]> {
    try {
      const response = await httpClient.get<ViewReminderDTO[]>(
        API_CONFIG.ENDPOINTS.REMINDER.VIEW
      );
      
      if (Array.isArray(response)) {
        return response;
      }
      
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('Error viewing reminders:', error);
      throw new Error(error.message || 'Không thể lấy danh sách thông báo');
    }
  }

  /**
   * Admin/Staff xem toàn bộ danh sách nhắc nhở (không set IsRead)
   */
  async getAllReminders(): Promise<ViewReminderDTO[]> {
    try {
      const response = await httpClient.get<ViewReminderDTO[]>(
        API_CONFIG.ENDPOINTS.REMINDER.GET_ALL
      );
      
      if (Array.isArray(response)) {
        return response;
      }
      
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('Error getting all reminders:', error);
      throw new Error(error.message || 'Không thể lấy danh sách nhắc nhở');
    }
  }

  /**
   * Admin/Staff tạo Reminder
   */
  async createReminder(data: CreateReminderRequest): Promise<ApiResponse<string>> {
    try {
      const response = await httpClient.post<{ message: string }>(
        API_CONFIG.ENDPOINTS.REMINDER.CREATE,
        data
      );
      
      if (response && typeof response === 'object' && 'message' in response) {
        return { success: true, message: response.message };
      }
      
      return { success: true, message: 'Tạo nhắc nhở thành công' };
    } catch (error: any) {
      console.error('Error creating reminder:', error);
      throw new Error(error.message || 'Không thể tạo nhắc nhở');
    }
  }

  /**
   * Admin sửa Reminder (chỉ khi chưa đọc)
   */
  async editReminder(data: EditReminderRequest): Promise<ApiResponse<string>> {
    try {
      const response = await httpClient.put<{ message: string }>(
        API_CONFIG.ENDPOINTS.REMINDER.EDIT,
        data
      );
      
      if (response && typeof response === 'object' && 'message' in response) {
        return { success: true, message: response.message };
      }
      
      return { success: true, message: 'Cập nhật nhắc nhở thành công' };
    } catch (error: any) {
      console.error('Error editing reminder:', error);
      throw new Error(error.message || 'Không thể cập nhật nhắc nhở');
    }
  }

  /**
   * User dọn dẹp các thông báo đã được gửi cách đây hơn 7 ngày
   */
  async cleanOldReminders(): Promise<CleanReminderResponse> {
    try {
      const response = await httpClient.delete<{ message: string; deletedCount?: number }>(
        API_CONFIG.ENDPOINTS.REMINDER.CLEAN
      );
      
      if (response && typeof response === 'object') {
        return {
          success: true,
          message: response.message || 'Dọn dẹp thông báo thành công',
          deletedCount: response.deletedCount || 0,
        };
      }
      
      return { success: true, message: 'Dọn dẹp thông báo thành công', deletedCount: 0 };
    } catch (error: any) {
      console.error('Error cleaning reminders:', error);
      throw new Error(error.message || 'Không thể dọn dẹp thông báo');
    }
  }
}

export const reminderService = new ReminderService();

