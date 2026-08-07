export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  userPhotoURL?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  userPhotoURL?: string;
  text: string;
  createdAt: string;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  senderUsername: string;
  senderPhotoURL?: string;
  type: 'like' | 'comment' | 'follow';
  postId?: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export type ViewTab = 'home' | 'create' | 'search' | 'profile' | 'admin';
