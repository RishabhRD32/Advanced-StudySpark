"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { 
  onAuthStateChanged, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";
import { doc, setDoc, updateDoc, onSnapshot, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { auth, db } from "../firebase";
import { AuthContext } from "./auth-context";
import type { UserProfile } from "../types";
import { useRouter } from "next/navigation";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const userDocRef = doc(db, "users", authUser.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
            setLoading(false);
          } else {
            setUserProfile(null);
          }
        }, (error) => {
          // Silent failure during auth transitions
          setUserProfile(null);
          setLoading(false);
        });
        return () => unsubscribeProfile();
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    router.push('/main/dashboard');
    return userCredential;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const googleUser = userCredential.user;
    
    const userDocRef = doc(db, "users", googleUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      const names = googleUser.displayName?.split(' ') || ['User', ''];
      const newUserProfile: UserProfile = {
        uid: googleUser.uid,
        email: googleUser.email,
        firstName: names[0],
        lastName: names.slice(1).join(' '),
        profession: 'student',
        photoURL: null,
        ccCode: '',
        accessTimetable: true,
        accessAnnouncements: true,
        accessTeacherFiles: true
      };
      await setDoc(userDocRef, newUserProfile);
      setUserProfile(newUserProfile);
    }
    
    router.push('/main/dashboard');
    return userCredential;
  };

  const signup = async (
    firstName: string,
    lastName: string,
    email: string,
    pass: string,
    profession: 'student' | 'teacher',
    className?: string,
    collegeName?: string,
    ccCode?: string,
    division?: string
  ) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const newUserProfile: UserProfile = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      firstName,
      lastName,
      profession,
      className,
      collegeName,
      ccCode: ccCode?.toUpperCase().trim() || '',
      division,
      photoURL: null,
      accessTimetable: true,
      accessAnnouncements: true,
      accessTeacherFiles: true
    };
    await setDoc(doc(db, "users", userCredential.user.uid), newUserProfile);
    setUserProfile(newUserProfile); 
    router.push('/main/dashboard');
    return userCredential;
  };

  const logout = async () => {
    setIsLoggingOut(true);
    // 5-second delay to show the bolt animation and ensure clean teardown of listeners
    await new Promise(resolve => setTimeout(resolve, 5000));
    await signOut(auth);
    setIsLoggingOut(false);
    // Force a full page refresh to the landing page to purge all application state and listeners
    window.location.href = '/';
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error("Not authenticated");
    
    const userDocRef = doc(db, "users", user.uid);
    const cleanedUpdates = { ...updates };
    if (cleanedUpdates.ccCode) cleanedUpdates.ccCode = cleanedUpdates.ccCode.toUpperCase().trim();
    
    await updateDoc(userDocRef, cleanedUpdates);
  };
  
  const changePassword = async () => {
    if (!user?.email) throw new Error("No user email found.");
    await sendPasswordResetEmail(auth, user.email);
  };

  const updatePasswordDirectly = async (currentPass: string, newPass: string) => {
    if (!user || !user.email) throw new Error("Not authenticated");
    const credential = EmailAuthProvider.credential(user.email, currentPass);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPass);
  };

  const value = { 
    user, 
    userProfile, 
    loading, 
    isLoggingOut, 
    login, 
    loginWithGoogle, 
    signup, 
    logout, 
    updateUserProfile, 
    changePassword, 
    updatePasswordDirectly 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;