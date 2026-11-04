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
  CheckCheck,
  Search,
  Sparkles
} from 'lucide-react';

export function MentorsChatView({ user, token }) {
  const [faculty, setFaculty] = useState([]);
  const [activePeer, setActivePeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('All');
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
        const facData = await res.json();
        setFaculty(facData);
      }
    } catch (err) {
      console.error('Error fetching mentors:', err);
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

  // Collect unique disciplines across all mentors
  const allDisciplines = ['All'];
  faculty.forEach(f => {
    (f.staffProfile?.disciplines || []).forEach(d => {
      if (!allDisciplines.includes(d)) allDisciplines.push(d);
    });
  });

  const filteredFaculty = faculty.filter(f => {
    const matchesSearch = !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.headline || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.staffProfile?.disciplines || []).some(d => d.toLowerCase().includes(search.toLowerCase()));

    const matchesDiscipline = selectedDiscipline === 'All' ||
      (f.staffProfile?.disciplines || []).includes(selectedDiscipline);

    return matchesSearch && matchesDiscipline;
  });

  return (
    <div className="space-y-5 animate-fadeIn pb-8">
      {/* Top Banner - Minimal & Downsized Typography */}
      <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#d97746]/10 text-[#d97746] border border-[#d97746]/20">
              Faculty Directory & Mentorship
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">{faculty.length} Professors Available</span>
          </div>
          <h1 className="text-base font-bold text-[var(--text-main)] mt-1">
            Department Faculty & Academic Mentors
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 max-w-2xl">
            Directly connect with subject-matter specialists across NLP, Systems, Cloud, Algorithms, and Cybersecurity. Select any mentor to initiate a fresh advisory conversation.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mentors or disciplines..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
          />
        </div>
      </div>

      {/* Disciplines Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
        {allDisciplines.slice(0, 8).map(d => (
          <button
            key={d}
            onClick={() => setSelectedDiscipline(d)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
              selectedDiscipline === d
                ? 'bg-[#d97746] text-white shadow-sm'
                : 'bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[620px]">
        {/* Left Column: Faculty Directory Cards (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] p-4 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-3">
            <span className="text-xs font-bold text-[var(--text-main)]">Mentors List</span>
            <span className="text-[11px] text-[var(--text-muted)]">{filteredFaculty.length} matched</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
            {filteredFaculty.map((mentor) => {
              const isSelected = activePeer?._id === mentor._id;

              return (
                <div
                  key={mentor._id}
                  onClick={() => setActivePeer(mentor)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#d97746]/10 border-[#d97746] shadow-sm'
                      : 'bg-[var(--bg-main)] border-[var(--border-color)] hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#d97746] to-[#f49d37] text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {mentor.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-[#d97746]' : 'text-[var(--text-main)]'}`}>
                          {mentor.name}
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--border-color)] capitalize">
                          {mentor.role}
                        </span>
                      </div>

                      <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                        {mentor.staffProfile?.designation || mentor.headline}
                      </p>

                      <div className="flex flex-wrap gap-1 mt-1.5">
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

        {/* Right Column: Direct Messaging Workspace (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] flex flex-col overflow-hidden">
          {activePeer ? (
            <>
              {/* Header */}
              <div className="p-3.5 border-b border-[var(--border-color)] bg-[var(--card-bg)] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#d97746] to-[#f49d37] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {activePeer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[var(--text-main)]">{activePeer.name}</h3>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {activePeer.staffProfile?.designation || 'Faculty Mentor'} • Hours: {activePeer.staffProfile?.officeHours || 'Mon-Fri'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                  <Mail className="w-3 h-3 text-[#d97746]" />
                  <span>{activePeer.email}</span>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[var(--bg-main)]/30 scrollbar-thin">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-center p-6 space-y-2">
                    <MessageSquare className="w-8 h-8 opacity-30 text-[#d97746]" />
                    <p className="text-xs font-semibold text-[var(--text-main)]">No Previous Messages</p>
                    <p className="text-[11px] max-w-xs leading-relaxed">
                      Start a new conversation with {activePeer.name} to discuss course assignments, research, or career guidance.
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
                          className={`max-w-[78%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-[#d97746] text-white rounded-br-none'
                              : 'bg-[var(--card-bg)] text-[var(--text-main)] border border-[var(--border-color)] rounded-bl-none'
                          }`}
                        >
                          <p>{msg.content}</p>
                        </div>
                        <span className="text-[9px] text-[var(--text-muted)] mt-0.5 px-1 font-mono">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-[var(--border-color)] bg-[var(--card-bg)] flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Send a message to ${activePeer.name}...`}
                  className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
                />
                <button
                  type="submit"
                  disabled={sending || !inputMessage.trim()}
                  className="px-4 py-2 rounded-xl bg-[#d97746] hover:bg-[#c26233] text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-center p-6 space-y-2">
              <Users className="w-10 h-10 opacity-30 text-[#d97746]" />
              <p className="text-xs font-semibold text-[var(--text-main)]">Select a Mentor</p>
              <p className="text-[11px] max-w-xs">
                Click any professor from the left directory to open a fresh messaging thread.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
