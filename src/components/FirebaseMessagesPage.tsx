import { useState, useEffect, useRef } from 'react';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';
import { 
  ChatRoom, 
  ChatMessage, 
  subscribeToInbox, 
  subscribeToMessages, 
  sendMessage, 
  startChat,
  markChatAsRead
} from '../firebase/chatService';
import { getUserProfile, getUserByUsername, FirestoreUser } from '../firebase/firestoreService';
import { Send, Search, MessageSquare, ArrowLeft, Loader2, Check, CheckCircle } from 'lucide-react';

export default function FirebaseMessagesPage() {
  const { userProfile } = useFirebaseAuth();
  const [inbox, setInbox] = useState([] as ChatRoom[]);
  const [activeRoomId, setActiveRoomId] = useState(null as string | null);
  const [messages, setMessages] = useState([] as ChatMessage[]);
  const [messageInput, setMessageInput] = useState('');
  
  // Cache for user profiles to avoid refetching
  const [userCache, setUserCache] = useState({} as Record<string, FirestoreUser>);
  
  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [newChatUser, setNewChatUser] = useState('');
  const [isSearchingNew, setIsSearchingNew] = useState(false);
  const [loadingNewChat, setLoadingNewChat] = useState(false);
  const messagesEndRef = useRef(null as HTMLDivElement | null);

  // Read URL Hash for auto-opening chats (e.g. #messages:resul)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#messages:')) {
      const targetUsername = hash.split(':')[1];
      if (targetUsername) {
        handleStartNewChat(targetUsername);
      }
    }
  }, []); // Run once on mount

  // Inbox subscription
  useEffect(() => {
    if (!userProfile?.uid) return;
    const unsubscribe = subscribeToInbox(userProfile.uid, (chats) => {
      setInbox(chats);
      
      // Fetch missing profiles
      chats.forEach(chat => {
        const otherUid = chat.participants.find(id => id !== userProfile.uid);
        if (otherUid && !userCache[otherUid]) {
          getUserProfile(otherUid).then(profile => {
            if (profile) {
              setUserCache(prev => ({ ...prev, [otherUid]: profile }));
            }
          });
        }
      });
    });
    return () => unsubscribe();
  }, [userProfile?.uid]); // removed userCache dependency config

  // Messages subscription
  useEffect(() => {
    if (!activeRoomId || !userProfile?.uid) return;
    
    // Arkada hemen okundu işaretle
    markChatAsRead(activeRoomId, userProfile.uid);
    
    const unsubscribe = subscribeToMessages(activeRoomId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => scrollToBottom(), 100);
      
      // Eğer yeni mesaj gelirse ve ekrandaysak tekrar okundu işaretle
      if (msgs.length > 0) {
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg.senderId !== userProfile.uid && !lastMsg.isRead) {
          markChatAsRead(activeRoomId, userProfile.uid);
        }
      }
    });

    return () => unsubscribe();
  }, [activeRoomId, userProfile?.uid]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeRoomId || !userProfile?.uid) return;

    const activeRoom = inbox.find(r => r.id === activeRoomId);
    if (!activeRoom) return;

    const receiverId = activeRoom.participants.find(id => id !== userProfile.uid);
    if (!receiverId) return;

    const text = messageInput;
    setMessageInput('');
    await sendMessage(activeRoomId, userProfile.uid, text, receiverId);
  };

  const handleStartNewChat = async (usernameOverride?: string) => {
    const targetUsername = usernameOverride || newChatUser;
    if (!targetUsername.trim() || !userProfile?.uid) return;
    
    if (targetUsername.toLowerCase() === userProfile.username?.toLowerCase()) {
      alert("Kendinize mesaj gönderemezsiniz.");
      return;
    }

    setLoadingNewChat(true);
    try {
      const targetUser = await getUserByUsername(targetUsername.trim());
      if (!targetUser) {
        alert("Böyle bir kullanıcı bulunamadı.");
        setLoadingNewChat(false);
        return;
      }
      
      // Target UID ve username'i caches'e ekleyelim
      setUserCache(prev => ({ ...prev, [targetUser.uid]: targetUser }));

      const roomId = await startChat(
        userProfile.uid, 
        userProfile.username || 'Bilinmeyen',
        targetUser.uid,
        targetUser.username
      );
      
      setActiveRoomId(roomId);
      setNewChatUser('');
      setIsSearchingNew(false);
      
      // URL'yi temizleyerek düz messages'a döndürebiliriz (opsiyonel)
      window.history.replaceState(null, '', '#messages');

    } catch (error) {
      console.error(error);
      alert("Sohbet başlatılırken bir hata oluştu.");
    } finally {
      setLoadingNewChat(false);
    }
  };

  // Render variables
  const activeRoom = inbox.find(r => r.id === activeRoomId);
  const otherParticipantId = activeRoom?.participants.find(id => id !== userProfile?.uid);
  const otherParticipantProfile = otherParticipantId ? userCache[otherParticipantId] : null;

  const filteredInbox = inbox.filter(chat => {
    const otherId = chat.participants.find(id => id !== userProfile?.uid);
    if (!otherId) return false;
    const profile = userCache[otherId];
    if (!searchQuery) return true;
    return profile?.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
           profile?.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="pt-24 pb-8 px-4 max-w-6xl mx-auto h-screen flex flex-col">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Mesajlar</h1>
        <p className="text-white/50 text-sm">Topluluk üyeleriyle özel olarak mesajlaşın.</p>
      </div>

      {!userProfile ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900/50 rounded-3xl border border-white/10 p-8 text-center backdrop-blur-xl">
          <MessageSquare className="w-16 h-16 text-white/20 mb-4" />
          <p className="text-white">Mesaj atabilmek için giriş yapmalısınız.</p>
        </div>
      ) : (
        <div className="flex-1 bg-gray-900/40 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden flex flex-col md:flex-row shadow-2xl">
          
          {/* INBOX LIST (Sol Taraf) */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-white/5 flex flex-col ${activeRoomId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-white/5">
              {!isSearchingNew ? (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input 
                      type="text" 
                      placeholder="Sohbetlerde ara..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-800/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 border border-white/5 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                  </div>
                  <button 
                    onClick={() => setIsSearchingNew(true)}
                    className="p-2.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-xl transition-colors shrink-0"
                    title="Yeni Sohbet Başlat"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 relative">
                  <input 
                    type="text" 
                    placeholder="Kullanıcı adı yazın (Örn: resul)" 
                    value={newChatUser}
                    onChange={(e) => setNewChatUser(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStartNewChat()}
                    className="w-full bg-gray-800/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 border border-indigo-500/50 focus:outline-none ring-2 ring-indigo-500/20 transition-all"
                    autoFocus
                  />
                  {loadingNewChat ? (
                    <button disabled className="p-2.5 bg-gray-800 text-white/50 rounded-xl"><Loader2 className="w-5 h-5 animate-spin" /></button>
                  ) : (
                    <button 
                      onClick={() => handleStartNewChat()}
                      className="p-2.5 bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl transition-colors shrink-0"
                    >
                      Başlat
                    </button>
                  )}
                  <button 
                    onClick={() => setIsSearchingNew(false)}
                    className="absolute -bottom-6 left-1 text-xs text-white/40 hover:text-white"
                  >
                    İptal et
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
              {filteredInbox.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <span className="text-white/30 text-sm">Sohbet bulunamadı.</span>
                </div>
              ) : (
                filteredInbox.map(chat => {
                  const otherId = chat.participants.find(id => id !== userProfile.uid);
                  const profile = otherId ? userCache[otherId] : null;
                  const isActive = activeRoomId === chat.id;
                  const unreadCount = (chat.unreadCount && chat.unreadCount[userProfile.uid]) || 0;
                  
                  return (
                    <button
                      key={chat.id}
                      onClick={() => setActiveRoomId(chat.id)}
                      className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-colors ${isActive ? 'bg-indigo-500/15 border border-indigo-500/20' : 'hover:bg-gray-800/50 border border-transparent'}`}
                    >
                      <div className="relative">
                        {profile?.photoURL ? (
                          <img src={profile.photoURL} alt={profile.username} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-indigo-300 font-bold">
                            {profile?.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className={`font-medium text-sm truncate ${unreadCount > 0 ? 'text-white' : 'text-white/80'}`}>
                            {profile?.displayName || profile?.username || 'Yükleniyor...'}
                          </h3>
                          {chat.lastMessageTime && (
                            <span className="text-[10px] text-white/40 shrink-0 ml-2">
                              {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs truncate ${unreadCount > 0 ? 'text-indigo-300 font-medium' : 'text-white/40'}`}>
                          {chat.lastMessageSenderId === userProfile.uid && <span>Sen: </span>}
                          <span>{chat.lastMessage || "Sohbet başladı."}</span>
                        </p>
                      </div>
                      
                      {unreadCount > 0 && (
                        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-lg shadow-indigo-500/30">
                          {unreadCount}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* CHAT WINDOW (Sağ Taraf) */}
          <div className={`flex-1 flex flex-col bg-gray-900/20 ${!activeRoomId ? 'hidden md:flex' : 'flex'}`}>
            {!activeRoomId ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-indigo-500/5 rounded-full flex items-center justify-center border border-indigo-500/10 mb-6">
                  <MessageSquare className="w-8 h-8 text-indigo-400/50" />
                </div>
                <h2 className="text-xl font-semibold text-white/80 mb-2">Sohbet Seçin</h2>
                <p className="text-white/40 text-sm max-w-xs">Sol taraftan bir görüşme seçin veya yeni bir sohbet başlatmak için arama yapın.</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="h-16 border-b border-white/5 bg-gray-900/40 px-4 flex items-center gap-3 shrink-0">
                  <button 
                    onClick={() => setActiveRoomId(null)} 
                    className="md:hidden p-2 -ml-2 text-white/60 hover:text-white"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  
                  {otherParticipantProfile?.photoURL ? (
                    <img src={otherParticipantProfile.photoURL} alt="" className="w-9 h-9 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-indigo-300 font-bold text-sm">
                      {otherParticipantProfile?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <h2 className="font-semibold text-white text-sm">{otherParticipantProfile?.displayName || otherParticipantProfile?.username || 'Yükleniyor...'}</h2>
                    <p className="text-xs text-white/40">@{otherParticipantProfile?.username}</p>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                      <div className="text-4xl">👋</div>
                      <p className="text-white/40 text-sm max-w-xs">Bu sohbetin ilk mesajını sen gönder. Kurallar çerçevesinde sohbet etmeyi unutma.</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMe = msg.senderId === userProfile.uid;
                      const showTime = index === 0 || (msg.createdAt - messages[index - 1].createdAt > 10 * 60 * 1000); // 10 dakika fark varsa saati göster
                      
                      return (
                        <div key={msg.id || index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          {showTime && (
                            <span className="text-[10px] text-white/30 mb-2 mt-4">
                              {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          <div className={`
                            max-w-[75%] px-4 py-2.5 rounded-2xl relative group
                            ${isMe 
                              ? 'bg-indigo-600 text-white rounded-br-sm shadow-md shadow-indigo-600/20' 
                              : 'bg-gray-800 text-white/90 rounded-bl-sm border border-white/5'}
                          `}>
                            <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                            
                            <div className={`absolute bottom-1 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'text-indigo-200' : 'text-white/30'}`}>
                              <span className="text-[9px]">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {isMe && (
                                msg.isRead ? <CheckCircle className="w-3 h-3 text-blue-300" /> : <Check className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Form */}
                <form onSubmit={handleSend} className="p-4 bg-gray-900/60 border-t border-white/5 shrink-0 flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(e);
                        }
                      }}
                      placeholder="Bir mesaj yazın..."
                      className="w-full bg-gray-800/80 rounded-2xl pl-4 pr-3 py-3 text-sm text-white placeholder-white/30 border border-white/5 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none overflow-hidden max-h-32"
                      rows={1}
                      style={{ minHeight: '44px' }}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={!messageInput.trim()}
                    className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-white/20 text-white justify-center items-center rounded-2xl transition-all shadow-lg shadow-indigo-500/20 disabled:shadow-none shrink-0"
                  >
                    <Send className="w-5 h-5 ml-1" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
