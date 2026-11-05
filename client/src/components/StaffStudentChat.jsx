

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Send, 
  Search, 
  MessageSquare, 
  GraduationCap, 
  Check, 
  CheckCheck,
  Clock,
  Sparkles
} from 'lucide-react';

export function StaffStudentChat({ token, preselectedStudent }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(preselectedStudent || null);
  const [messages, setMessages] = useState([]);
  const [inputContent, setInputContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const chatBottomRef = useRef(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (preselectedStudent) {
      setSelectedStudent(preselectedStudent);
    }
  }, [preselectedStudent]);

  useEffect(() => {
    if (selectedStudent) {
      fetchConversation(selectedStudent._id);
    }
  }, [selectedStudent]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/messages/peers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setStudents(data);
        if (!selectedStudent && data.length > 0) {
          setSelectedStudent(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (studentId) => {
    try {
      const res = await fetch(`/api/messages/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputContent.trim() || !selectedStudent) return;

    setSending(true);
    try {
      const res = await fetch(`/api/messages/${selectedStudent._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: inputContent.trim() })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages([...messages, newMsg]);
        setInputContent('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.academicProfile?.department?.toLowerCase().includes(search.toLowerCase()) ||
    s.academicProfile?.rollNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-[var(--border)] rounded-lg bg-[var(--bg-page)] overflow-hidden h-[600px]">
      {/* Left Column: Student Roster for Doubts */}
      <div className="border-r border-[var(--border)] flex flex-col h-full bg-[var(--bg-subtle)]/40">
        <div className="p-3 border-b border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              Student Conversations ({students.length})
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)]">Direct Clearance</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student by name or roll..."
              className="w-full pl-7 pr-2.5 py-1 text-xs rounded bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
          {loading ? (
            <div className="p-4 text-center text-xs text-[var(--text-tertiary)]">
              Loading students...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-4 text-center text-xs text-[var(--text-tertiary)]">
              No students found.
            </div>
          ) : (
            filteredStudents.map((student) => {
              const isSelected = selectedStudent?._id === student._id;

              return (
                <div
                  key={student._id}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-3 cursor-pointer transition-colors text-xs flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-blue-500/10 border-l-2 border-l-blue-500'
                      : 'hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-7 h-7 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] font-bold text-[10px] flex items-center justify-center shrink-0">
                      {student.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-semibold text-[var(--text-primary)] truncate">
                        {student.name}
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] truncate">
                        {student.academicProfile?.department} (Yr {student.academicProfile?.year})
                      </div>
                    </div>
                  </div>

                  {student.unreadCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                      {student.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Chat Canvas */}
      <div className="md:col-span-2 flex flex-col h-full bg-[var(--bg-page)]">
        {selectedStudent ? (
          <>
            {/* Chat Header */}
            <div className="p-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-subtle)]/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] font-bold text-xs flex items-center justify-center">
                  {selectedStudent.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-[var(--text-primary)]">
                    {selectedStudent.name}
                  </h4>
                  <p className="text-[10px] text-[var(--text-secondary)]">
                    {selectedStudent.academicProfile?.rollNumber} • {selectedStudent.academicProfile?.department} • {selectedStudent.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)]">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedStudent.academicProfile?.cgpa ? `${selectedStudent.academicProfile.cgpa} CGPA` : ''}
                </span>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-[var(--text-tertiary)] space-y-1">
                  <MessageSquare className="w-8 h-8 stroke-[1.5]" />
                  <p className="text-xs font-medium">No previous doubt clearance messages</p>
                  <p className="text-[11px]">Send guidance, schedule a 1-on-1, or review code issues.</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isStaff = msg.sender !== selectedStudent._id;

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[75%] rounded-lg px-3 py-2 ${
                        isStaff
                          ? 'bg-[var(--text-primary)] text-[var(--bg-page)] rounded-br-none'
                          : 'bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-primary)] rounded-bl-none'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <span className="text-[9px] text-[var(--text-tertiary)] mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Prompt Presets */}
            <div className="px-3 py-1.5 border-t border-[var(--border)] bg-[var(--bg-subtle)]/30 flex items-center gap-2 overflow-x-auto text-[10px]">
              <span className="text-[var(--text-tertiary)] shrink-0">Quick reply:</span>
              <button
                type="button"
                onClick={() => setInputContent("Your implementation of the assignment was solid. Let's schedule a 15-minute review during office hours.")}
                className="px-2 py-0.5 rounded bg-[var(--bg-page)] border border-[var(--border)] hover:border-neutral-400 shrink-0"
              >
                Schedule Office Hours
              </button>
              <button
                type="button"
                onClick={() => setInputContent("Please review the lecture notes on Self-Attention before attempting the next benchmark test.")}
                className="px-2 py-0.5 rounded bg-[var(--bg-page)] border border-[var(--border)] hover:border-neutral-400 shrink-0"
              >
                Review Lecture Notes
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-[var(--border)] flex items-center gap-2">
              <input
                type="text"
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder={`Message ${selectedStudent.name}...`}
                className="flex-1 px-3 py-2 text-xs rounded-md bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-blue-500 font-sans"
              />
              <button
                type="submit"
                disabled={sending || !inputContent.trim()}
                className="p-2 rounded-md bg-[var(--text-primary)] text-[var(--bg-page)] disabled:opacity-40 transition-all"
                title="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-[var(--text-tertiary)]">
            Select a student to inspect doubts and send guidance.
          </div>
        )}
      </div>
    </div>
  );
}
