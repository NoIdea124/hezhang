export interface Comment {
  id: string;
  expense_id: string;
  user_id: string;
  content: string;
  created_at: string;
  // joined
  user_nickname?: string;
  // extra context for WS notifications
  expense_note?: string;
  expense_category?: string;
}

export interface CommentCreate {
  content: string;
}
