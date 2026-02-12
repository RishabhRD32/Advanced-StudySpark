
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDoc, writeBatch, Timestamp, getDocs, limit, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '@/lib/auth/use-auth';
import type { Subject, Assignment, UserStats, StudyMaterial, TimetableEntry, TimetableType, UserTimetableSettings, TimeSlot, UserProfile, Announcement, ChatRoom, ChatMessage } from '@/lib/types';
import { subDays, format, startOfDay, isSameDay } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const defaultTimeSlots: TimeSlot[] = [
    { start: '08:00', end: '09:00' },
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' },
    { start: '12:00', end: '13:00' },
    { start: '13:00', end: '14:00' },
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' },
    { start: '16:00', end: '17:00' },
    { start: '17:00', end: '18:00' },
];

export function useClassStudents(ccCode?: string) {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const q = useMemo(() => {
    if (!ccCode || ccCode.trim() === '') return null;
    return query(
      collection(db, 'users'), 
      where('ccCode', '==', ccCode), 
      where('profession', '==', 'student')
    );
  }, [ccCode]);

  useEffect(() => {
    if (!q) {
      setStudents([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(doc => doc.data() as UserProfile));
      setLoading(false);
    }, async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: 'users',
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [q]);

  return { students, loading };
}

export function useBroadcastMaterials(ccCode?: string) {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  const q = useMemo(() => {
    if (!ccCode || ccCode.trim() === '') return null;
    return query(
      collection(db, 'studyMaterials'), 
      where('ccCode', '==', ccCode), 
      where('isBroadcast', '==', true)
    );
  }, [ccCode]);

  useEffect(() => {
    if (!q) {
      setMaterials([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyMaterial)));
      setLoading(false);
    }, async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: 'studyMaterials',
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [q]);

  return { materials, loading };
}

export function useAnnouncements(ccCode?: string) {
  const { user, userProfile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const q = useMemo(() => {
    if (!ccCode || ccCode.trim() === '') return null;
    return query(
      collection(db, 'announcements'),
      where('ccCode', '==', ccCode)
    );
  }, [ccCode]);

  useEffect(() => {
    if (!q) {
      setAnnouncements([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
      list.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
      setAnnouncements(list);
      setLoading(false);
    }, async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: 'announcements',
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [q]);

  const addAnnouncement = useCallback((title: string, content: string) => {
    if (!user || !userProfile) return;
    const data = {
      userId: user.uid,
      title,
      content,
      ccCode: userProfile.ccCode || '',
      teacherName: `${userProfile.firstName} ${userProfile.lastName}`,
      createdAt: serverTimestamp(),
    };
    addDoc(collection(db, 'announcements'), data).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: 'announcements',
        operation: 'create',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, [user, userProfile]);

  const deleteAnnouncement = useCallback((id: string) => {
    const docRef = doc(db, 'announcements', id);
    deleteDoc(docRef).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, []);

  return { announcements, loading, addAnnouncement, deleteAnnouncement };
}

export function useSubjects() {
  const { user, userProfile } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const q = useMemo(() => {
    if (!user) return null;
    return query(collection(db, 'subjects'), where('userId', '==', user.uid));
  }, [user?.uid]);

  useEffect(() => {
    if (!q) {
      setSubjects([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userSubjects: Subject[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
      userSubjects.sort((a, b) => a.title.localeCompare(b.title));
      setSubjects(userSubjects);
      setLoading(false);
    }, async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: 'subjects',
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [q]);

  const addSubject = (subject: Omit<Subject, 'id' | 'userId'>) => {
    if (!user) return;
    const data = {
      ...subject,
      userId: user.uid,
      ccCode: userProfile?.ccCode || null,
    };
    // Non-blocking write
    addDoc(collection(db, 'subjects'), data).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: 'subjects',
        operation: 'create',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };
  
  const updateSubject = (subjectId: string, updates: Partial<Subject>) => {
    const docRef = doc(db, 'subjects', subjectId);
    // Non-blocking write
    updateDoc(docRef, updates).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: updates,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };
  
  const deleteSubject = async (subjectId: string) => {
      if (!user) return;
      
      const batch = writeBatch(db);
      const subjectRef = doc(db, 'subjects', subjectId);
      batch.delete(subjectRef);

      const assignmentsQuery = query(
        collection(db, 'assignments'), 
        where('userId', '==', user.uid), 
        where('subjectId', '==', subjectId)
      );
      
      const materialsQuery = query(
        collection(db, 'studyMaterials'), 
        where('userId', '==', user.uid), 
        where('subjectId', '==', subjectId)
      );

      try {
        const [assignmentsSnap, materialsSnap] = await Promise.all([
          getDocs(assignmentsQuery),
          getDocs(materialsQuery)
        ]);

        assignmentsSnap.forEach(docSnap => batch.delete(docSnap.ref));
        materialsSnap.forEach(docSnap => batch.delete(docSnap.ref));
        
        // Execute mutation (non-blocking)
        batch.commit().catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: `subjects/${subjectId}`,
            operation: 'delete',
          });
          errorEmitter.emit('permission-error', permissionError);
        });
      } catch (e) {
        const permissionError = new FirestorePermissionError({
          path: 'subjects/children',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw e;
      }
  };

  return { subjects, loading, addSubject, updateSubject, deleteSubject };
}

export function useSubject(subjectId: string) {
  const { user } = useAuth();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !subjectId) {
      setSubject(null);
      setLoading(false);
      return;
    }

    const docRef = doc(db, "subjects", subjectId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().userId === user.uid) {
            setSubject({ id: docSnap.id, ...docSnap.data() } as Subject);
        } else {
            setSubject(null);
        }
        setLoading(false);
    }, async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
    });

    return () => unsubscribe();
}, [user?.uid, subjectId]);

  return { subject, loading };
}

export function useAssignments(subjectId?: string) {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    const q = useMemo(() => {
        if (!user) return null;
        return subjectId 
            ? query(collection(db, 'assignments'), where('userId', '==', user.uid), where('subjectId', '==', subjectId))
            : query(collection(db, 'assignments'), where('userId', '==', user.uid));
    }, [user?.uid, subjectId]);

    useEffect(() => {
        if (!q) {
            setAssignments([]);
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const list: Assignment[] = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return { 
                    id: doc.id, 
                    ...data,
                    dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate().toISOString() : data.dueDate,
                } as Assignment;
            });
            list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
            setAssignments(list);
            setLoading(false);
        }, async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: 'assignments',
              operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [q]);

    const addAssignment = async (assignment: Omit<Assignment, 'id' | 'userId' | 'subjectTitle'>) => {
        if (!user || !assignment.subjectId) return;
        
        let subjectSnap;
        try {
            subjectSnap = await getDoc(doc(db, "subjects", assignment.subjectId));
        } catch (e) {
            const permissionError = new FirestorePermissionError({
                path: `subjects/${assignment.subjectId}`,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
            return;
        }

        if (!subjectSnap?.exists()) return;

        const data = { 
            ...assignment, 
            userId: user.uid, 
            dueDate: new Date(assignment.dueDate),
            subjectTitle: subjectSnap.data().title,
            grade: assignment.grade || null,
        };
        // Non-blocking write
        addDoc(collection(db, 'assignments'), data).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: 'assignments',
            operation: 'create',
            requestResourceData: data,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    };

    const updateAssignment = (id: string, updates: Partial<Omit<Assignment, 'id' | 'userId'>>) => {
        const docRef = doc(db, 'assignments', id);
        const dataToUpdate: any = { ...updates };
        if (updates.dueDate) dataToUpdate.dueDate = new Date(updates.dueDate);
        // Non-blocking write
        updateDoc(docRef, dataToUpdate).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: dataToUpdate,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    };

    const deleteAssignment = (id: string) => {
        const docRef = doc(db, 'assignments', id);
        // Non-blocking write
        deleteDoc(docRef).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    };

    return { assignments, loading, addAssignment, updateAssignment, deleteAssignment };
}

export function useStudyMaterials(subjectId?: string) {
    const { user, userProfile } = useAuth();
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);
    const [loading, setLoading] = useState(true);

    const q = useMemo(() => {
        if (!user || !subjectId) return null;
        return query(collection(db, 'studyMaterials'), where('userId', '==', user.uid), where('subjectId', '==', subjectId));
    }, [user?.uid, subjectId]);

    useEffect(() => {
        if (!q) {
            setMaterials([]);
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const list: StudyMaterial[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyMaterial));
            list.sort((a, b) => a.title.localeCompare(b.title));
            setMaterials(list);
            setLoading(false);
        }, async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: 'studyMaterials',
              operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [q]);

    const addMaterial = (material: Omit<StudyMaterial, 'id' | 'userId'>) => {
        if (!user) return;
        const data = { 
          ...material, 
          userId: user.uid,
          ccCode: userProfile?.ccCode || null,
        };
        // Non-blocking write
        addDoc(collection(db, 'studyMaterials'), data).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: 'studyMaterials',
            operation: 'create',
            requestResourceData: data,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    };

    const deleteMaterial = (id: string) => {
        const docRef = doc(db, 'studyMaterials', id);
        // Non-blocking write
        deleteDoc(docRef).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    };

    return { materials, loading, addMaterial, deleteMaterial };
}

export function usePublicMaterials(searchTerm: string) {
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchMaterials = async () => {
            setLoading(true);
            try {
                let q;
                if (!searchTerm || searchTerm.length < 2) {
                    q = query(collection(db, "studyMaterials"), where("isPublic", "==", true), limit(30));
                } else {
                    q = query(collection(db, "studyMaterials"), where("isPublic", "==", true), limit(50));
                }
                
                const snapshot = await getDocs(q);
                let fetched: StudyMaterial[] = [];

                for (const docSnap of snapshot.docs) {
                    const data = docSnap.data() as StudyMaterial;
                    const term = searchTerm.toLowerCase();
                    const matchesSearch = !searchTerm || 
                        data.title.toLowerCase().includes(term) || 
                        data.type.toLowerCase().includes(term);

                    if (matchesSearch) {
                        fetched.push({ ...data, id: docSnap.id });
                    }
                }
                setMaterials(fetched);
            } catch (serverError: any) {
                const permissionError = new FirestorePermissionError({
                  path: 'studyMaterials',
                  operation: 'list',
                });
                errorEmitter.emit('permission-error', permissionError);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchMaterials, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    return { materials, loading };
}

export function useDashboardStats() {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    const subQ = useMemo(() => user ? query(collection(db, 'subjects'), where('userId', '==', user.uid)) : null, [user?.uid]);
    const assignQ = useMemo(() => user ? query(collection(db, 'assignments'), where('userId', '==', user.uid)) : null, [user?.uid]);
    const statsRef = useMemo(() => user ? doc(db, 'userStats', user.uid) : null, [user?.uid]);

    useEffect(() => {
        if (!user || !subQ || !assignQ || !statsRef) return;

        const subUnsub = onSnapshot(subQ, (snap) => setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Subject))), async (serverError) => {
          const permissionError = new FirestorePermissionError({ path: 'subjects', operation: 'list' });
          errorEmitter.emit('permission-error', permissionError);
        });
        const assignUnsub = onSnapshot(assignQ, (snap) => setAssignments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Assignment))), async (serverError) => {
          const permissionError = new FirestorePermissionError({ path: 'assignments', operation: 'list' });
          errorEmitter.emit('permission-error', permissionError);
        });
        const statsUnsub = onSnapshot(statsRef, (snap) => setUserStats(snap.exists() ? snap.data() as UserStats : null), async (serverError) => {
          const permissionError = new FirestorePermissionError({ path: statsRef.path, operation: 'get' });
          errorEmitter.emit('permission-error', permissionError);
        });

        return () => {
            subUnsub();
            assignUnsub();
            statsUnsub();
        };
    }, [user, subQ, assignQ, statsRef]);

    const stats = useMemo(() => {
        const graded = assignments.filter(a => a.status === 'Completed' && a.grade !== null);
        const avg = graded.length > 0 ? graded.reduce((acc, a) => acc + (a.grade || 0), 0) / graded.length : 0;

        // Deterministic Weekly Trend Logic
        const today = startOfDay(new Date());
        const activityMap = new Map();
        
        for (let i = 0; i < 7; i++) {
            const d = subDays(today, i);
            const key = format(d, 'yyyy-MM-dd');
            activityMap.set(key, { day: format(d, 'EEE'), hours: 0 });
        }

        if (userStats?.studySessions) {
            userStats.studySessions.forEach(session => {
                const sessionDate = session.date.toDate();
                const key = format(sessionDate, 'yyyy-MM-dd');
                if (activityMap.has(key)) {
                    activityMap.get(key).hours += session.duration;
                }
            });
        }

        const weeklyActivity = Array.from(activityMap.values()).reverse();

        // Assignment status distribution
        const completedCount = assignments.filter(a => a.status === 'Completed').length;
        const pendingCount = assignments.filter(a => a.status === 'Pending').length;
        const assignmentStatus = [
          { name: 'Completed', value: completedCount, color: 'hsl(var(--primary))' },
          { name: 'Pending', value: pendingCount, color: 'hsl(var(--muted))' }
        ];

        // Subject mastery distribution
        const subjectPerformance = subjects.map(s => {
          const subjectAssignments = assignments.filter(a => a.subjectId === s.id && a.status === 'Completed' && a.grade !== null);
          const score = subjectAssignments.length > 0 
            ? subjectAssignments.reduce((acc, a) => acc + (a.grade || 0), 0) / subjectAssignments.length 
            : 0;
          return { name: s.title, score: Math.round(score) };
        }).filter(s => s.score > 0).sort((a,b) => b.score - a.score).slice(0, 5);
        
        return {
            subjectsCompleted: subjects.length,
            averageScore: Math.round(avg),
            studyStreak: userStats?.studyStreak || 0,
            weeklyActivity,
            assignmentStatus,
            subjectPerformance
        };
    }, [subjects, assignments, userStats]);

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(t);
    }, []);
    
    return { stats, loading };
}

export function useTimetable(type?: TimetableType) {
  const { user, userProfile } = useAuth();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(defaultTimeSlots);
  const [settingsDocId, setSettingsDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const q = useMemo(() => {
    if (!user || !type) return null;
    return query(collection(db, 'timetableEntries'), where('userId', '==', user.uid), where('type', '==', type));
  }, [user?.uid, type]);

  const settingsQ = useMemo(() => {
    if (!user) return null;
    return query(collection(db, 'userTimetableSettings'), where('userId', '==', user.uid), limit(1));
  }, [user?.uid]);

  useEffect(() => {
    if (!q) {
      setEntries([]);
      return;
    }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data, date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date } as TimetableEntry;
      });
      list.sort((a, b) => a.startTime.localeCompare(b.startTime));
      setEntries(list);
      setLoading(false);
    }, async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: 'timetableEntries',
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [q]);
  
  useEffect(() => {
    if (!settingsQ) return;
    const unsubscribe = onSnapshot(settingsQ, (snapshot) => {
        if (snapshot.empty) {
            if (!user) return;
            const data = { userId: user.uid, timeSlots: defaultTimeSlots, ccCode: userProfile?.ccCode || null };
            addDoc(collection(db, 'userTimetableSettings'), data).catch(async (serverError) => {
              const permissionError = new FirestorePermissionError({ path: 'userTimetableSettings', operation: 'create', requestResourceData: data });
              errorEmitter.emit('permission-error', permissionError);
            });
            setTimeSlots(defaultTimeSlots);
        } else {
            const docSnap = snapshot.docs[0];
            setSettingsDocId(docSnap.id);
            const data = docSnap.data() as UserTimetableSettings;
            setTimeSlots(data.timeSlots.sort((a,b) => a.start.localeCompare(b.start)));
            if (!data.ccCode && userProfile?.ccCode) {
              updateDoc(docSnap.ref, { ccCode: userProfile.ccCode }).catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({ path: docSnap.ref.path, operation: 'update', requestResourceData: { ccCode: userProfile.ccCode } });
                errorEmitter.emit('permission-error', permissionError);
              });
            }
        }
    }, async (serverError) => {
      const permissionError = new FirestorePermissionError({ path: 'userTimetableSettings', operation: 'list' });
      errorEmitter.emit('permission-error', permissionError);
    });
    return () => unsubscribe();
  }, [settingsQ, user, userProfile?.ccCode]);

  const addTimetableEntry = (entry: Omit<TimetableEntry, 'id' | 'userId'>) => {
    if (!user || !userProfile) return;
    const data: any = { 
      ...entry, 
      userId: user.uid,
      ccCode: userProfile.ccCode || null,
      isShared: userProfile.profession === 'teacher' && userProfile.shareTimetable === true
    };
    if (entry.date) data.date = new Date(entry.date);
    addDoc(collection(db, 'timetableEntries'), data).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: 'timetableEntries',
        operation: 'create',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const updateTimetableEntry = (id: string, updates: Partial<TimetableEntry>) => {
    const docRef = doc(db, 'timetableEntries', id);
    const data: any = { ...updates };
    if (updates.date) data.date = new Date(updates.date);
    updateDoc(docRef, data).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const deleteTimetableEntry = (id: string) => {
    const docRef = doc(db, 'timetableEntries', id);
    deleteDoc(docRef).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const addTimeSlot = (newSlot: TimeSlot) => {
    if (!user || !settingsDocId) return;
    const docRef = doc(db, 'userTimetableSettings', settingsDocId);
    updateDoc(docRef, { timeSlots: arrayUnion(newSlot) }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: { timeSlots: arrayUnion(newSlot) },
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const deleteTimeSlot = (slotToDelete: TimeSlot) => {
    if (!user || !settingsDocId) return;
    const docRef = doc(db, 'userTimetableSettings', settingsDocId);
    updateDoc(docRef, { timeSlots: arrayRemove(slotToDelete) }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: { timeSlots: arrayRemove(slotToDelete) },
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  return { entries, loading, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry, timeSlots, addTimeSlot, deleteTimeSlot };
}

export function useClassTimetable(ccCode?: string) {
  const [teacherUid, setTeacherUid] = useState<string | null>(null);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);

  const teacherQ = useMemo(() => {
    if (!ccCode || ccCode.trim() === '') return null;
    return query(collection(db, 'users'), where('ccCode', '==', ccCode), where('profession', '==', 'teacher'), where('shareTimetable', '==', true), limit(1));
  }, [ccCode]);

  useEffect(() => {
    if (!teacherQ) {
      setTeacherUid(null);
      setIsLoadingSettings(false);
      setIsLoadingEntries(false);
      return;
    }
    const unsub = onSnapshot(teacherQ, (snapshot) => {
      if (!snapshot.empty) {
        setTeacherUid(snapshot.docs[0].id);
      } else {
        setTeacherUid(null);
        setIsLoadingSettings(false);
        setIsLoadingEntries(false);
      }
    }, async (serverError) => { 
      const permissionError = new FirestorePermissionError({ path: 'users', operation: 'list' });
      errorEmitter.emit('permission-error', permissionError);
      setIsLoadingSettings(false); 
      setIsLoadingEntries(false);
    });
    return () => unsub();
  }, [teacherQ]);

  useEffect(() => {
    if (!teacherUid) {
      setEntries([]);
      return;
    }
    
    setIsLoadingSettings(true);
    setIsLoadingEntries(true);

    const entriesQ = query(
      collection(db, 'timetableEntries'), 
      where('userId', '==', teacherUid), 
      where('isShared', '==', true)
    );
    
    const settingsQ = query(
      collection(db, 'userTimetableSettings'), 
      where('userId', '==', teacherUid), 
      limit(1)
    );

    const eUnsub = onSnapshot(entriesQ, (snap) => {
      const list = snap.docs.map(d => {
        const data = d.data();
        return { 
          id: d.id, 
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date 
        } as TimetableEntry;
      });
      setEntries(list);
      setIsLoadingEntries(false);
    }, async (serverError) => {
      const permissionError = new FirestorePermissionError({ path: 'timetableEntries', operation: 'list' });
      errorEmitter.emit('permission-error', permissionError);
      setIsLoadingEntries(false);
    });

    const sUnsub = onSnapshot(settingsQ, (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data() as UserTimetableSettings;
        setTimeSlots(data.timeSlots.sort((a,b) => a.start.localeCompare(b.start)));
      } else {
        setTimeSlots(defaultTimeSlots);
      }
      setIsLoadingSettings(false);
    }, async (serverError) => { 
      const permissionError = new FirestorePermissionError({ path: 'userTimetableSettings', operation: 'list' });
      errorEmitter.emit('permission-error', permissionError);
      setIsLoadingSettings(false); 
    });

    return () => { eUnsub(); sUnsub(); };
  }, [teacherUid]);

  return { 
    entries, 
    timeSlots, 
    loading: isLoadingSettings || isLoadingEntries 
  };
}

export function useChat(studentUid: string, teacherUid: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const roomId = `${teacherUid}_${studentUid}`;

  useEffect(() => {
    const q = query(
      collection(db, 'chats', roomId, 'messages')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      list.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeA - timeB;
      });
      setMessages(list);
      setLoading(false);
    }, async (serverError) => {
      const permissionError = new FirestorePermissionError({ path: `chats/${roomId}/messages`, operation: 'list' });
      errorEmitter.emit('permission-error', permissionError);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = async (text: string, senderUid: string, chatRoomData: Omit<ChatRoom, 'id' | 'updatedAt'>) => {
    const batch = writeBatch(db);
    const roomRef = doc(db, 'chats', roomId);
    const messageRef = doc(collection(db, 'chats', roomId, 'messages'));

    const roomUpdateData = {
      ...chatRoomData,
      participants: [studentUid, teacherUid],
      lastMessage: text,
      updatedAt: serverTimestamp()
    };

    const messageData = {
      text,
      senderUid,
      createdAt: serverTimestamp()
    };

    batch.set(roomRef, roomUpdateData, { merge: true });
    batch.set(messageRef, messageData);

    // Non-blocking write
    batch.commit().catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({ path: `chats/${roomId}`, operation: 'write', requestResourceData: roomUpdateData });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  return { messages, loading, sendMessage };
}

export function useChatRooms(teacherUid: string) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const q = useMemo(() => teacherUid ? query(
    collection(db, 'chats'),
    where('teacherUid', '==', teacherUid)
  ) : null, [teacherUid]);

  useEffect(() => {
    if (!q) return;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom));
      list.sort((a, b) => {
        const timeA = a.updatedAt?.toMillis() || 0;
        const timeB = b.updatedAt?.toMillis() || 0;
        return timeA - timeB;
      });
      setRooms(list);
      setLoading(false);
    }, async (serverError) => {
      const permissionError = new FirestorePermissionError({ path: 'chats', operation: 'list' });
      errorEmitter.emit('permission-error', permissionError);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [q]);

  return { rooms, loading };
}
