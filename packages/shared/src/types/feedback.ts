export interface Feedback {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  // joined
  user_nickname?: string;
}
