import { userManagementService, type UserListItem, type CreateUserRequest, type EditUserRequest } from '../services/userManagementService';

// Re-export types for backward compatibility
export type { UserListItem, CreateUserRequest, EditUserRequest };

// API functions using the service
export const getAllUsers = () => userManagementService.getAllUsers();

export const searchUsers = (keyword: string) => userManagementService.searchUsers(keyword);

export const createUser = (dto: CreateUserRequest) => userManagementService.createUser(dto);

export const editUser = (dto: EditUserRequest) => userManagementService.editUser(dto);

export const deleteUser = (userID: number) => userManagementService.deleteUser(userID);


