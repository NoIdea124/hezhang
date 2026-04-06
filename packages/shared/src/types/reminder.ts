export interface Reminder {
  id: string;
  space_id: string;
  from_user_id: string;
  to_user_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  // joined
  from_nickname?: string;
}
