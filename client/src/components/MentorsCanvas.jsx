

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Send, 
  Mail, 
  Search,
  MessageSquare,
  GraduationCap
} from 'lucide-react';

export function MentorsCanvas({ user, token }) {
  const [faculty, setFaculty] = useState([]);
  const [activePeer, setActivePeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchFaculty();
  }, [token]);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/messages/faculty', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFaculty(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activePeer && token) {
      fetchMessages(activePeer._id);
    } else {
      setMessages([]);
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
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (e) {
      console.error(e);
    }
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
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const filteredFaculty = faculty.filter(f => {
    return !search || 
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.staffProfile?.disciplines || []).some(d => d.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-fadeIn py-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Faculty Mentorship</h2>
          <p className="text-xs text-[var(--text-tertiary)]">{faculty.length} professors available for academic advisory</p>
        </div>

        <div className="relative w-60">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search disciplines..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-xs text-[var(--text-primary)] focus:outline-none"
          />
        </div>
      </div>

      {/* 2-Column Minimalist Chat Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-[580px]">
        {/* Left: 8 Mentors List (5 cols) */}
        <div className="md:col-span-5 border border-[var(--border)] rounded-xl bg-[var(--bg-surface)] p-3 overflow-y-auto space-y-2 scrollbar-thin">
          {filteredFaculty.map((mentor) => {
            const isSelected = activePeer?._id === mentor._id;

            return (
              <div
                key={mentor._id}
                onClick={() => setActivePeer(mentor)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[var(--text-primary)] bg-[var(--bg-page)]'
                    : 'border-[var(--border)] hover:bg-[var(--bg-page)]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded bg-[var(--bg-subtle)] border border-[var(--border)] font-bold text-[10px] text-[var(--text-primary)] flex items-center justify-center shrink-0">
                    {mentor.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-[var(--text-primary)] truncate">{mentor.name}</h4>
                      <span className="text-[9px] font-mono text-[var(--text-tertiary)] capitalize">{mentor.role}</span>
                    </div>

                    <p className="text-[11px] text-[var(--text-tertiary)] truncate mt-0.5">
                      {mentor.staffProfile?.designation || mentor.headline}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(mentor.staffProfile?.disciplines || []).slice(0, 2).map((disc, idx) => (
                        <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
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

        {/* Right: Message Stream (7 cols) */}
        <div className="md:col-span-7 border border-[var(--border)] rounded-xl bg-[var(--bg-page)] flex flex-col overflow-hidden">
          {activePeer ? (
            <>
              {/* Header */}
              <div className="p-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-surface)]">
                <div>
                  <h4 className="text-xs font-semibold text-[var(--text-primary)]">{activePeer.name}</h4>
                  <p className="text-[10px] text-[var(--text-tertiary)]">
                    {activePeer.staffProfile?.designation || 'Faculty Mentor'} • Hours: {activePeer.staffProfile?.officeHours || 'Mon-Fri'}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)] font-mono">
                  <Mail className="w-3 h-3" />
                  <span>{activePeer.email}</span>
                </div>
              </div>

              {/* Chat Log */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2.5 scrollbar-thin">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[var(--text-tertiary)] text-center text-xs space-y-1">
                    <MessageSquare className="w-6 h-6 opacity-30" />
                    <p className="font-medium text-[var(--text-primary)]">Clean Conversation</p>
                    <p className="text-[11px]">Send a note to discuss lecture questions or research thesis.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender === user?._id || m.sender?.id === user?._id;
                    return (
                      <div key={m._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-1.5 text-xs ${
                            isMe 
                              ? 'bg-[var(--text-primary)] text-[var(--bg-page)]' 
                              : 'bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)]'
                          }`}
                        >
                          {m.content}
                        </div>
                        <span className="text-[9px] text-[var(--text-tertiary)] font-mono mt-0.5 px-1">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-2.5 border-t border-[var(--border)] flex items-center gap-2 bg-[var(--bg-surface)]">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Message ${activePeer.name}...`}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-page)] text-xs text-[var(--text-primary)] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sending || !inputMessage.trim()}
                  className="px-3 py-1.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-page)] text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-xs text-[var(--text-tertiary)] text-center p-4 space-y-1">
              <Users className="w-8 h-8 opacity-25" />
              <p>Select a faculty advisor from the directory to start a new message.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
