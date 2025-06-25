// src/types/user.ts

export interface UserProfile {
  user_id?: string;
  profilePicture: string;
  displayName: string;
  username: string;
  bio?: string;
  banner_url?: string;
}
