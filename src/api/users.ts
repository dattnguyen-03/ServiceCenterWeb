import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5109/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export type UserListItem = {
  userID: number;
  username: string;
  role: string;
  name: string;
  email: string;
  phone: string;
  address: string;
};

export const getAllUsers = () => api.get<UserListItem[]>('/GetAllUserAPI');

export const searchUsers = (keyword: string) =>
  api.get<UserListItem[]>('/SearchUserAPI', { params: { keyword } });

export const createUser = (dto: {
  username: string;
  password: string;
  role: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}) => api.post('/CreateUserAPI', dto);

export const editUser = (dto: {
  userID: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}) => api.put('/EditUserAPI', dto);

export const deleteUser = (userID: number) =>
  api.delete('/DeleteUserAPI', { data: { userID } });


