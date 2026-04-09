export interface MembershipCard {
  id: string;
  space_id: string;
  user_id: string;
  store_name: string;
  balance: number;
  note: string;
  created_at: string;
  updated_at: string;
  // joined
  user_nickname?: string;
}

export interface MembershipCardCreate {
  store_name: string;
  balance: number;
  note?: string;
}

export interface MembershipCardUpdate {
  store_name?: string;
  balance?: number;
  note?: string;
}
