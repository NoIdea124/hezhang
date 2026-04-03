export interface User {
  id: string;
  phone: string;
  nickname: string;
  avatar_url: string | null;
  created_at: string;
}

export interface UserCreate {
  phone: string;
  nickname?: string;
}
