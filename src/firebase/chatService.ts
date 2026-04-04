import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  getDoc,
  serverTimestamp,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from './config';
import { getUserByUsername } from './firestoreService'; // Profil resimleri falan almak için kullanabiliriz

export interface ChatRoom {
  id: string;
  participants: string[]; // [uid1, uid2]
  participantUsernames: string[]; // [username1, username2] - search için
  lastMessage?: string;
  lastMessageTime?: number;
  lastMessageSenderId?: string;
  unreadCount?: Record<string, number>;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  createdAt: number;
  isRead?: boolean;
}

// Yeni bir sohbet başlat (veya varsa var olanın id'sini dön)
export async function startChat(uid1: string, username1: string, uid2: string, username2: string): Promise<string> {
  if (!db) throw new Error('Firestore bulunamadı');

  // Her zaman alfabetik olarak sıralı bir ID kullanalım ki aynı 2 kişi için tek oda olsun
  const sortedUids = [uid1, uid2].sort();
  const roomId = `${sortedUids[0]}_${sortedUids[1]}`;

  const roomRef = doc(db, 'chats', roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    const newRoom: Partial<ChatRoom> = {
      participants: [uid1, uid2],
      participantUsernames: [username1, username2],
      createdAt: Date.now(),
      unreadCount: { [uid1]: 0, [uid2]: 0 }
    };
    await setDoc(roomRef, newRoom);
  }

  return roomId;
}

// Mesaj Gönder
export async function sendMessage(roomId: string, senderId: string, text: string, receiverId: string) {
  if (!db || !text.trim()) return;

  const messagesRef = collection(db, 'chats', roomId, 'messages');
  const now = Date.now();
  
  await addDoc(messagesRef, {
    roomId,
    senderId,
    text: text.trim(),
    createdAt: now,
    isRead: false
  });

  // Odadaki son mesaj bilgisini ve okunmamış sayısını güncelle
  const roomRef = doc(db, 'chats', roomId);
  const roomSnap = await getDoc(roomRef);
  if (roomSnap.exists()) {
    const data = roomSnap.data();
    let currentUnread = (data.unreadCount && data.unreadCount[receiverId]) || 0;
    
    await updateDoc(roomRef, {
      lastMessage: text.trim(),
      lastMessageTime: now,
      lastMessageSenderId: senderId,
      [`unreadCount.${receiverId}`]: currentUnread + 1
    });
  }
}

// Okundu olarak işaretle
export async function markChatAsRead(roomId: string, currentUid: string) {
  if (!db) return;
  const roomRef = doc(db, 'chats', roomId);
  
  // Odanın unread sayısını 0 yap
  await updateDoc(roomRef, {
    [`unreadCount.${currentUid}`]: 0
  });

  // Opsiyonel: Bireysel mesajları (isRead: true) yapma kısmı da eklenebilir,
  // ancak unreadCount sıfırlamak UI için genelde yeterlidir.
}

// Gelen Kutusu (Kullanıcının aktif sohbetlerini dinle)
export function subscribeToInbox(uid: string, callback: (chats: ChatRoom[]) => void) {
  if (!db) return () => {};

  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', uid),
    orderBy('lastMessageTime', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const chats: ChatRoom[] = [];
    snapshot.forEach((docSnap) => {
      chats.push({ id: docSnap.id, ...docSnap.data() } as ChatRoom);
    });
    callback(chats);
  });
}

// Bir odadaki mesajları dinle (Real-time)
export function subscribeToMessages(roomId: string, callback: (messages: ChatMessage[]) => void) {
  if (!db) return () => {};

  const q = query(
    collection(db, 'chats', roomId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(200) // Son 200 mesaj yeterli
  );

  return onSnapshot(q, (snapshot) => {
    const msgs: ChatMessage[] = [];
    snapshot.forEach((docSnap) => {
      msgs.push({ id: docSnap.id, ...docSnap.data() } as ChatMessage);
    });
    callback(msgs);
  });
}
