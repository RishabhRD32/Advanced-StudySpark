'use client';

import { format, addMinutes, parse } from 'date-fns';

export interface SchedulerTeacher {
  name: string;
  subject: string;
  targetClass: string;
  targetDivision: string;
  lecturesPerWeek: number;
  labsPerWeek: number;
  isLab?: boolean; // Legacy support, but we now use labsPerWeek
}

export interface SchedulerClass {
  name: string;
  division: string;
}

export interface SchedulerConfig {
  startTime: string;
  lectureDuration: number;
  lectureCount: number;
  breakAfter: number;
  breakDuration: number;
  teachers: SchedulerTeacher[];
  classes: SchedulerClass[];
}

export interface ScheduledEntry {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacherName: string;
  className: string;
  division: string;
  isBreak: boolean;
  isLab: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function generateSmartSchedule(config: SchedulerConfig): ScheduledEntry[] {
  const { startTime, lectureDuration, lectureCount, breakAfter, breakDuration, teachers, classes } = config;
  const entries: ScheduledEntry[] = [];

  // 1. Generate Time Slots
  const timeSlots: { start: string; end: string; isBreak: boolean }[] = [];
  let currentTime = parse(startTime, 'HH:mm', new Date());

  for (let i = 1; i <= lectureCount; i++) {
    const start = format(currentTime, 'HH:mm');
    currentTime = addMinutes(currentTime, lectureDuration);
    const end = format(currentTime, 'HH:mm');
    timeSlots.push({ start, end, isBreak: false });

    if (i === breakAfter) {
      const bStart = format(currentTime, 'HH:mm');
      currentTime = addMinutes(currentTime, breakDuration);
      const bEnd = format(currentTime, 'HH:mm');
      timeSlots.push({ start: bStart, end: bEnd, isBreak: true });
    }
  }

  // 2. Initialize Session Inventory
  // Key: name-subject-class-div
  const inventory = new Map<string, { lectures: number; labs: number }>();
  teachers.forEach((t, idx) => {
    const key = `${t.name}-${t.subject}-${t.targetClass}-${t.targetDivision}`;
    inventory.set(key, { 
      lectures: Number(t.lecturesPerWeek) || 0, 
      labs: Number(t.labsPerWeek) || 0 
    });
  });

  // 3. Algorithm: Iterate through Days -> Slots -> Classes
  DAYS.forEach((day) => {
    // Reset daily lab usage
    timeSlots.forEach((slot) => {
      if (slot.isBreak) {
        classes.forEach((cls) => {
          entries.push({
            id: Math.random().toString(36).substr(2, 9),
            day,
            startTime: slot.start,
            endTime: slot.end,
            subject: 'Recess',
            teacherName: 'N/A',
            className: cls.name,
            division: cls.division,
            isBreak: true,
            isLab: false,
          });
        });
        return;
      }

      const busyTeachersInSlot = new Set<string>();
      const busyLabsInSlot = new Set<string>();
      
      classes.forEach((cls) => {
        // Find all teachers assigned to this class
        const assignmentsForClass = teachers.filter(t => 
          t.targetClass === cls.name && 
          t.targetDivision === cls.division
        );

        // Filter those who aren't busy and have remaining sessions
        let eligible = assignmentsForClass.filter(t => {
          if (busyTeachersInSlot.has(t.name)) return false;
          
          const key = `${t.name}-${t.subject}-${t.targetClass}-${t.targetDivision}`;
          const inv = inventory.get(key);
          if (!inv) return false;

          const hasLec = inv.lectures > 0;
          const hasLab = inv.labs > 0 && !busyLabsInSlot.has(t.subject);

          return hasLec || hasLab;
        });

        if (eligible.length > 0) {
          // Priority: Labs first, then lectures
          const labOption = eligible.find(t => {
            const inv = inventory.get(`${t.name}-${t.subject}-${t.targetClass}-${t.targetDivision}`);
            return inv && inv.labs > 0 && !busyLabsInSlot.has(t.subject);
          });

          const selected = labOption || eligible[Math.floor(Math.random() * eligible.length)];
          const key = `${selected.name}-${selected.subject}-${selected.targetClass}-${selected.targetDivision}`;
          const inv = inventory.get(key)!;

          const isAssignedAsLab = labOption !== undefined;
          
          if (isAssignedAsLab) {
            inv.labs--;
            busyLabsInSlot.add(selected.subject);
          } else {
            inv.lectures--;
          }
          
          busyTeachersInSlot.add(selected.name);
          
          entries.push({
            id: Math.random().toString(36).substr(2, 9),
            day,
            startTime: slot.start,
            endTime: slot.end,
            subject: selected.subject,
            teacherName: selected.name,
            className: cls.name,
            division: cls.division,
            isBreak: false,
            isLab: isAssignedAsLab,
          });
        } else {
          entries.push({
            id: Math.random().toString(36).substr(2, 9),
            day,
            startTime: slot.start,
            endTime: slot.end,
            subject: 'Free Period',
            teacherName: 'None',
            className: cls.name,
            division: cls.division,
            isBreak: false,
            isLab: false,
          });
        }
      });
    });
  });

  return entries;
}
