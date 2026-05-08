import { API_ROUTES } from "@/api/routes";
import { api } from "@/utils/api-client";

export interface UserListItem {
  userId: number;
  shownId: string;
  email: string;
  fullName: string;
  role: string;
  dateOfBirth: string;
}

interface UserListResponse {
  code: string;
  message: string;
  data: {
    items: UserListItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export const userService = {
  getUsers: async (params?: {
    page?: number;
    size?: number;
    searchName?: string;
  }) => {
    const query = new URLSearchParams();
    query.set("page", String(params?.page ?? 0));
    query.set("size", String(params?.size ?? 50));
    if (params?.searchName && params.searchName.trim()) {
      query.set("searchName", params.searchName.trim());
    }
    const endpoint = `${API_ROUTES.USER.LIST}?${query.toString()}`;
    const response = await api.get<UserListResponse>(endpoint);
    return response.data;
  },
};

