import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// 请求拦截器：后台 API 自动附加 token
api.interceptors.request.use((config) => {
  if (config.url?.startsWith("/admin")) {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
  }
  return config;
});

// 响应拦截器：401 自动跳转登录
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      window.location.href = "/admin/login";
    }
    return Promise.reject(err);
  }
);

// ============ 公开 API ============

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  isPublished: number;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export const fetchPosts = (params?: {
  page?: number;
  limit?: number;
  tag?: string;
  search?: string;
}) => api.get<{ posts: Post[]; total: number }>("/posts", { params });

export const fetchPost = (slug: string) =>
  api.get<Post>(`/posts/${slug}`);

export const fetchTags = () => api.get<Tag[]>("/tags");

export const fetchSettings = () =>
  api.get<Record<string, string>>("/settings");

// ============ 后台 API ============

export const login = (username: string, password: string) =>
  api.post<{ token: string; username: string }>("/auth/login", { username, password });

export const fetchAdminPosts = (params?: { page?: number; limit?: number }) =>
  api.get<{ posts: Post[]; total: number }>("/admin", { params });

export const createPost = (data: {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  isPublished?: boolean;
  tagIds?: number[];
}) => api.post("/admin", data);

export const updatePost = (
  id: number,
  data: {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    coverImage?: string;
    isPublished?: boolean;
    tagIds?: number[];
  }
) => api.put(`/admin/${id}`, data);

export const deletePost = (id: number) =>
  api.delete(`/admin/${id}`);

export const createTag = (name: string, slug: string) =>
  api.post("/admin/tags", { name, slug });

export const deleteTag = (id: number) =>
  api.delete(`/admin/tags/${id}`);

export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  return api.post<{ url: string }>("/admin/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateSettings = (settings: Record<string, string>) =>
  api.put("/admin/settings", { settings });

// ============ 歌曲 API ============

export interface Song {
  id: number;
  title: string;
  artist: string;
  filePath: string;
  coverPath: string;
  lrcContent: string;
  createdAt: string;
}

export const fetchSongs = () => api.get<Song[]>("/songs");

export const uploadSong = (formData: FormData) =>
  api.post<{ id: number; title: string; artist: string }>("/admin/songs/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteSong = (id: number) =>
  api.delete(`/admin/songs/${id}`);
