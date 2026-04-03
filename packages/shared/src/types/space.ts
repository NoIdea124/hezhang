export interface Space {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface SpaceMember {
  space_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  // joined
  nickname?: string;
  avatar_url?: string | null;
}
