import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Unsubscribe,
  increment,
  runTransaction
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, Post, Comment, Like, Notification } from '../types';

// 1. Subscribe to all posts in Realtime
export function subscribePosts(
  onData: (posts: Post[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const postsRef = collection(db, 'posts');
  // Order by createdAt desc
  const q = query(postsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const posts = snapshot.docs.map((docSnap) => ({
        ...docSnap.data(),
        id: docSnap.id
      })) as Post[];
      onData(posts);
    },
    (err) => {
      console.error('[Firestore] Error subscribing posts:', err);
      // Fallback query without orderBy if index is building
      onSnapshot(postsRef, (snapshot) => {
        const posts = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id
        })) as Post[];
        posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onData(posts);
      });
      if (onError) onError(err);
    }
  );
}

// 2. Subscribe to comments for a specific post in Realtime
export function subscribePostComments(
  postId: string,
  onData: (comments: Comment[]) => void
): Unsubscribe {
  const commentsRef = collection(db, 'comments');
  const q = query(commentsRef, where('postId', '==', postId));

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map((docSnap) => ({
      ...docSnap.data(),
      id: docSnap.id
    })) as Comment[];
    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    onData(comments);
  });
}

// 3. Subscribe to user likes in Realtime
export function subscribeUserLikes(
  userId: string,
  onData: (likedPostIds: Set<string>) => void
): Unsubscribe {
  const likesRef = collection(db, 'likes');
  const q = query(likesRef, where('userId', '==', userId));

  return onSnapshot(q, (snapshot) => {
    const likedIds = new Set<string>();
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data() as Like;
      likedIds.add(data.postId);
    });
    onData(likedIds);
  });
}

// 4. Subscribe to all registered users in Realtime (Search & Admin)
export function subscribeUsers(onData: (users: UserProfile[]) => void): Unsubscribe {
  const usersRef = collection(db, 'users');
  return onSnapshot(usersRef, (snapshot) => {
    const users = snapshot.docs.map((docSnap) => ({
      ...docSnap.data(),
      uid: docSnap.id
    })) as UserProfile[];
    onData(users);
  });
}

// 5. Subscribe to user notifications
export function subscribeNotifications(
  recipientId: string,
  onData: (notifications: Notification[]) => void
): Unsubscribe {
  const notifsRef = collection(db, 'notifications');
  const q = query(notifsRef, where('recipientId', '==', recipientId));

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((docSnap) => ({
      ...docSnap.data(),
      id: docSnap.id
    })) as Notification[];
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onData(notifications);
  });
}

// 6. Check if username is already taken in Firestore
export async function isUsernameTaken(username: string, currentUid?: string): Promise<boolean> {
  const cleanName = username.trim().toLowerCase();
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', cleanName));
  const snap = await getDocs(q);
  if (snap.empty) return false;
  if (currentUid && snap.docs.length === 1 && snap.docs[0].id === currentUid) {
    return false;
  }
  return true;
}

// 7. Create a new post
export async function createPostData(
  postData: Omit<Post, 'id' | 'likeCount' | 'commentCount' | 'createdAt'>
): Promise<string> {
  const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newPost: Post = {
    ...postData,
    id: postId,
    likeCount: 0,
    commentCount: 0,
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, 'posts', postId), newPost);
  return postId;
}

// 8. Delete a post (Admin or Post Owner)
export async function deletePostData(postId: string): Promise<void> {
  // Delete main post document
  await deleteDoc(doc(db, 'posts', postId));

  // Clean up comments for this post
  const commentsQ = query(collection(db, 'comments'), where('postId', '==', postId));
  const commentsSnap = await getDocs(commentsQ);
  const deleteComments = commentsSnap.docs.map((d) => deleteDoc(d.ref));

  // Clean up likes for this post
  const likesQ = query(collection(db, 'likes'), where('postId', '==', postId));
  const likesSnap = await getDocs(likesQ);
  const deleteLikes = likesSnap.docs.map((d) => deleteDoc(d.ref));

  await Promise.all([...deleteComments, ...deleteLikes]);
}

// 9. Toggle Like/Unlike on a post
export async function toggleLikePost(
  postId: string,
  userId: string,
  username: string,
  postOwnerId?: string
): Promise<boolean> {
  const likeDocId = `${postId}_${userId}`;
  const likeRef = doc(db, 'likes', likeDocId);
  const postRef = doc(db, 'posts', postId);

  const likeSnap = await getDoc(likeRef);
  const isLiked = likeSnap.exists();

  if (isLiked) {
    // Remove like
    await deleteDoc(likeRef);
    await updateDoc(postRef, {
      likeCount: increment(-1)
    });
    return false;
  } else {
    // Add like
    await setDoc(likeRef, {
      id: likeDocId,
      postId,
      userId,
      createdAt: new Date().toISOString()
    });
    await updateDoc(postRef, {
      likeCount: increment(1)
    });

    // Create notification if owner is different
    if (postOwnerId && postOwnerId !== userId) {
      const notifId = `notif_${Date.now()}`;
      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        recipientId: postOwnerId,
        senderId: userId,
        senderUsername: username,
        type: 'like',
        postId,
        text: `أعجب ${username} بـ منشورك.`,
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    return true;
  }
}

// 10. Add a comment to a post
export async function addCommentData(
  commentData: Omit<Comment, 'id' | 'createdAt'>,
  postOwnerId?: string
): Promise<void> {
  const commentId = `comment_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newComment: Comment = {
    ...commentData,
    id: commentId,
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, 'comments', commentId), newComment);

  // Increment comment count on post
  const postRef = doc(db, 'posts', commentData.postId);
  await updateDoc(postRef, {
    commentCount: increment(1)
  });

  // Create notification if owner is different
  if (postOwnerId && postOwnerId !== commentData.userId) {
    const notifId = `notif_${Date.now()}`;
    await setDoc(doc(db, 'notifications', notifId), {
      id: notifId,
      recipientId: postOwnerId,
      senderId: commentData.userId,
      senderUsername: commentData.username,
      type: 'comment',
      postId: commentData.postId,
      text: `علق ${commentData.username} على منشورك: "${commentData.text.substring(0, 30)}..."`,
      read: false,
      createdAt: new Date().toISOString()
    });
  }
}

// 11. Delete a comment (Admin, Post Owner, or Comment Owner)
export async function deleteCommentData(commentId: string, postId: string): Promise<void> {
  await deleteDoc(doc(db, 'comments', commentId));

  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  if (postSnap.exists()) {
    const currentCount = postSnap.data().commentCount || 0;
    if (currentCount > 0) {
      await updateDoc(postRef, {
        commentCount: increment(-1)
      });
    }
  }
}

// 12. Update User Profile in Firestore
export async function updateUserProfileData(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
}

// 13. Admin: Change User Status (Active / Blocked)
export async function setUserStatusData(uid: string, status: 'active' | 'blocked'): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { status });
}

// 14. Admin: Delete User Account Data
export async function deleteUserData(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid));
}
