

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  GraduationCap, 
  Award, 
  BookOpen, 
  Briefcase, 
  ExternalLink,
  ChevronRight,
  X,
  CheckCircle,
  Activity,
  Flame,
  ArrowUpDown,
  Maximize2
} from 'lucide-react';
import { StudentProfileModal } from './StudentProfileModal';

export function StaffStudentRoster({ token, onSelectStudentForChat }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [year, setYear] = useState('All');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [detailedStudent, setDetailedStudent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [fullModalStudentId, setFullModalStudentId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [department, year, search]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (department !== 'All') q.set('department', department);
      if (year !== 'All') q.set('year', year);
      if (search.trim()) q.set('search', search.trim());

      const res = await fetch(`/api/admin/students?${q.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectStudent = async (studentId) => {
    setSelectedStudentId(studentId);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/students?studentId=${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDetailedStudent(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, roll number, skill, or email..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-2.5 py-1.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-primary)]"
          >
            <option value="All">All Departments</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Data Science">Data Science</option>
            <option value="Electronics & Communication">Electronics & Communication</option>
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-2.5 py-1.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-primary)]"
          >
            <option value="All">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Student Table / Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Students (2 cols on desktop) */}
        <div className={`space-y-3 ${selectedStudentId ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">
              Enrolled Students ({students.length})
            </span>
            <span>Sorted by CGPA & Academic Standing</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[var(--text-tertiary)]">
              Loading student roster...
            </div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-tertiary)] border border-dashed border-[var(--border)] rounded-lg">
              No students found matching current filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {students.map((student) => {
                const isSelected = selectedStudentId === student._id;
                const activityCount = (student.activityLog || []).reduce((acc, curr) => acc + (curr.count || 1), 0);

                return (
                  <div
                    key={student._id}
                    onClick={() => setFullModalStudentId(student._id)}
                    className={`p-4 rounded-lg border text-xs cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/5 shadow-sm'
                        : 'border-[var(--border)] bg-[var(--bg-page)] hover:border-blue-500/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] font-bold text-xs flex items-center justify-center text-[var(--text-primary)]">
                          {student.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                            <span>{student.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-secondary)]">
                              {student.academicProfile?.rollNumber || 'N/A'}
                            </span>
                          </h4>
                          <p className="text-[11px] text-[var(--text-secondary)]">
                            {student.academicProfile?.department} (Yr {student.academicProfile?.year})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right shrink-0">
                          <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                            {student.academicProfile?.cgpa ? `${student.academicProfile.cgpa} CGPA` : 'N/A'}
                          </div>
                          <div className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1 justify-end">
                            <Flame className="w-2.5 h-2.5 text-amber-500" />
                            <span>{activityCount} acts</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFullModalStudentId(student._id);
                          }}
                          className="p-1.5 rounded-md hover:bg-[var(--bg-subtle)] text-[var(--text-tertiary)] hover:text-blue-500 transition-colors"
                          title="Open Full Student Profile Portfolio"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 text-[11px] text-[var(--text-secondary)] line-clamp-1 italic">
                      "{student.headline || 'Student'}"
                    </p>

                    {/* Skills pills */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(student.skills || []).slice(0, 4).map((sk, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border)] text-[10px] font-medium text-[var(--text-secondary)]"
                        >
                          {sk.name}
                        </span>
                      ))}
                      {(student.skills || []).length > 4 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-[var(--text-tertiary)]">
                          +{(student.skills || []).length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Detailed Student Inspection Drawer / Card */}
        {selectedStudentId && (
          <div className="lg:col-span-1 border border-[var(--border)] rounded-lg bg-[var(--bg-page)] p-4 space-y-4 sticky top-16 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Student Profile Dossier
              </span>
              <button
                onClick={() => { setSelectedStudentId(null); setDetailedStudent(null); }}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {detailLoading ? (
              <div className="py-12 text-center text-xs text-[var(--text-tertiary)]">
                Fetching dossier & course telemetry...
              </div>
            ) : detailedStudent ? (
              <div className="space-y-4 text-xs">
                {/* Header Profile */}
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {detailedStudent.student.name}
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {detailedStudent.student.email} • {detailedStudent.student.academicProfile?.rollNumber}
                  </p>
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    Target Role: <strong className="text-[var(--text-primary)]">{detailedStudent.student.targetRole}</strong>
                  </p>
                </div>

                {/* Direct Action: Message Student */}
                {onSelectStudentForChat && (
                  <button
                    onClick={() => onSelectStudentForChat(detailedStudent.student)}
                    className="w-full py-1.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border)] hover:border-neutral-400 font-semibold text-xs text-[var(--text-primary)] transition-all flex items-center justify-center gap-2"
                  >
                    <span>💬 Message Student (Direct Doubt Clearance)</span>
                  </button>
                )}

                {/* Academic Breakdown */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded bg-[var(--bg-subtle)] border border-[var(--border)]">
                  <div>
                    <span className="text-[10px] text-[var(--text-tertiary)] block">Department</span>
                    <span className="font-semibold">{detailedStudent.student.academicProfile?.department}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-tertiary)] block">CGPA</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {detailedStudent.student.academicProfile?.cgpa} / 10.0
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-tertiary)] block">Year & Section</span>
                    <span className="font-semibold">
                      Year {detailedStudent.student.academicProfile?.year} (Sec {detailedStudent.student.academicProfile?.section || 'A'})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-tertiary)] block">Activity Metric</span>
                    <span className="font-semibold">
                      {(detailedStudent.student.activityLog || []).length} Recorded Engagements
                    </span>
                  </div>
                </div>

                {/* Verified Skills */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                    Technical Skills & Verification Status
                  </span>
                  <div className="space-y-1">
                    {(detailedStudent.student.skills || []).map((sk, idx) => (
                      <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-[var(--bg-subtle)]">
                        <span className="font-medium text-[var(--text-primary)]">{sk.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-[var(--text-secondary)]">{sk.level}</span>
                          {sk.verified && (
                            <CheckCircle className="w-3 h-3 text-emerald-500" title="Verified by faculty/benchmark" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enrolled Courses Progress */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                    Course Enrollments ({detailedStudent.enrollments?.length || 0})
                  </span>
                  {(detailedStudent.enrollments || []).length === 0 ? (
                    <p className="text-[11px] text-[var(--text-tertiary)] italic">No courses currently enrolled.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {detailedStudent.enrollments.map((en, idx) => (
                        <div key={idx} className="p-2 rounded border border-[var(--border)] bg-[var(--bg-subtle)] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium line-clamp-1">{en.course?.title}</span>
                            <span className="text-[10px] font-mono font-bold text-blue-500">
                              {en.progressPercentage || 0}%
                            </span>
                          </div>
                          <div className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-2">
                            <span>{en.course?.institution}</span>
                            <span>•</span>
                            <span>{(en.completedLectures || []).length} lectures completed</span>
                            <span>•</span>
                            <span>{(en.notes || []).length} notes written</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Placement Applications */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                    Campus Drive Applications ({detailedStudent.applications?.length || 0})
                  </span>
                  {(detailedStudent.applications || []).length === 0 ? (
                    <p className="text-[11px] text-[var(--text-tertiary)] italic">No placement applications submitted yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {detailedStudent.applications.map((app, idx) => (
                        <div key={idx} className="p-2 rounded border border-[var(--border)] bg-[var(--bg-subtle)] space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[var(--text-primary)]">
                              {app.placement?.companyName}
                            </span>
                            <span className="font-mono text-[10px] text-blue-500 font-medium">
                              {app.ticketNumber}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
                            <span>{app.placement?.roleTitle}</span>
                            <span className="px-1.5 py-0.2 rounded bg-[var(--bg-page)] border border-[var(--border)] font-medium">
                              {app.currentStage}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Full Modal Dossier */}
      {fullModalStudentId && (
        <StudentProfileModal
          studentId={fullModalStudentId}
          token={token}
          onClose={() => setFullModalStudentId(null)}
          onOpenChat={onSelectStudentForChat}
        />
      )}
    </div>
  );
}
