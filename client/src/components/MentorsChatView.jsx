import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  MessageSquare, 
  Send, 
  GraduationCap, 
  Clock, 
  Mail, 
  MapPin, 
  BookOpen, 
  Loader2,
  CheckCheck
} from 'lucide-react';

export function MentorsChatView({ user, token }) {
  const [faculty, setFaculty] = useState([]);
  const [threads, setThreads] = useState([]);
  const [activePeer, setActivePeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Load faculty directory & chat threads
  useEffect(() => {
    fetchFacultyAndThreads();
  }, [token]);

  const fetchFacultyAndThreads = async () => {
    try {
      setLoading(true);
      const [facRes, thrRes] = await Promise.all([
        fetch('/api/messages/faculty', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/messages/threads', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (facRes.ok) {
        const facData = await facRes.json();
        setFaculty(facData);
        // Default peer to first faculty if none
        if (facData.length > 0 && !activePeer) {
          setActivePeer(facData[0]);
        }
      }

      if (thrRes.ok) {
        const thrData = await thrRes.json();
        setThreads(thrData);
      }
    } catch (err) {
      console.error('Error fetching mentors/threads:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load chat messages when activePeer changes
  useEffect(() => {
    if (activePeer && token) {
      fetchMessages(activePeer._id);
    }
  }, [activePeer, token]);

  const fetchMessages = async (peerId) => {
    try {
      const res = await fetch(`/api/messages/${peerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activePeer) return;

    try {
      setSending(true);
      const res = await fetch(`/api/messages/${activePeer._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: inputMessage.trim() })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
        setInputMessage('');
        scrollToBottom();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl p-8 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#d97746]/15 text-[#d97746] border border-[#d97746]/30">
              Institutional Mentorship Cell
            </span>
            <span className="text-xs text-[var(--text-muted)]">College Faculty Directory & Direct Messaging</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
            Academic & Placement Faculty Mentors
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            Connect directly with department professors, thesis advisors, and placement cell heads. Inquire about research projects, course prerequisites, or request recommendations on your Stanford and MIT course problem set submissions.
          </p>
        </div>
      </div>

      {/* Main 2-Column Chat & Faculty Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[720px]">
        {/* Left Col: Faculty Roster */}
        <div className="rounded-3xl p-5 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl flex flex-col overflow-hidden">
          <h3 className="font-bold text-sm text-[var(--text-main)] mb-3">Faculty Mentors ({faculty.length})</h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {faculty.map((mentor) => {
              const isSelected = activePeer?._id === mentor._id;

              return (
                <div
                  key={mentor._id}
                  onClick={() => setActivePeer(mentor)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#d97746]/10 border-[#d97746] shadow-md shadow-[#d97746]/10'
                      : 'bg-[var(--bg-main)] border-[var(--border-color)] hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#d97746] to-[#f49d37] text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {mentor.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-[#d97746]' : 'text-[var(--text-main)]'}`}>
                          {mentor.name}
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--border-color)]">
                          {mentor.role}
                        </span>
                      </div>

                      <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                        {mentor.staffProfile?.designation || mentor.headline}
                      </p>

                      {/* Disciplines */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(mentor.staffProfile?.disciplines || []).slice(0, 2).map((disc, idx) => (
                          <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--border-color)]">
                            {disc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Chat Message Thread */}
        <div className="lg:col-span-2 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl flex flex-col overflow-hidden">
          {activePeer ? (
            <>
              {/* Chat Header */}
              <div className="p-4 md:p-5 border-b border-[var(--border-color)] bg-[var(--card-bg)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#d97746] to-[#f49d37] text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {activePeer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-main)]">{activePeer.name}</h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      {activePeer.staffProfile?.designation || 'Faculty Mentor'} • Office Hours: {activePeer.staffProfile?.officeHours || 'Mon-Fri'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#d97746]" />
                    {activePeer.email}
                  </span>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-thin bg-[var(--bg-main)]/30">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-center p-6">
                    <MessageSquare className="w-10 h-10 mb-2 opacity-40 text-[#d97746]" />
                    <p className="text-xs font-semibold text-[var(--text-main)]">Start a Conversation</p>
                    <p className="text-[11px] max-w-sm mt-1">
                      Send a message to discuss your Stanford/MIT assignments, research questions, or placement drive recommendations.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;

                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-[#d97746] text-white rounded-br-none'
                              : 'bg-[var(--card-bg)] text-[var(--text-main)] border border-[var(--border-color)] rounded-bl-none'
                          }`}
                        >
                          <p>{msg.content}</p>
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--border-color)] bg-[var(--card-bg)] flex items-center gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Message ${activePeer.name}...`}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
                />
                <button
                  type="submit"
                  disabled={sending || !inputMessage.trim()}
                  className="px-5 py-2.5 rounded-2xl bg-[#d97746] hover:bg-[#c26233] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-[#d97746]/20 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-xs">
              Select a faculty mentor from the directory to start chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
