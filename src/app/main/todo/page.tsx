
"use client"

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, CheckCircle2, ListTodo, Zap } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/lib/auth/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Todo } from "@/lib/types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

export default function TodoPage() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "todos"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Todo));
      list.sort((a, b) => {
        if (a.completed !== b.completed) {
          return Number(a.completed) - Number(b.completed);
        }
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
      setTodos(list);
      setLoading(false);
    }, async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: 'todos',
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim() || !user) return;
    setIsAdding(true);
    const data = {
      userId: user.uid,
      text: newTodo,
      completed: false,
      createdAt: serverTimestamp()
    };
    addDoc(collection(db, "todos"), data).then(() => {
      setNewTodo("");
      toast({ title: "Saved", description: "Your task has been added." });
    }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: 'todos',
        operation: 'create',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    }).finally(() => {
      setIsAdding(false);
    });
  };

  const toggleTodo = (id: string, current: boolean) => {
    const docRef = doc(db, "todos", id);
    const updates = { completed: !current };
    updateDoc(docRef, updates).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: updates,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const deleteTodo = (id: string) => {
    const docRef = doc(db, "todos", id);
    deleteDoc(docRef).then(() => {
      toast({ title: "Deleted", description: "Task removed." });
    }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center">
        <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ListTodo className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-muted-foreground font-medium">A simple list for your daily goals.</p>
      </div>

      <Card className="border-2 shadow-xl overflow-hidden bg-card/50 backdrop-blur-xl rounded-[2.5rem]">
        <CardHeader className="bg-primary/5 border-b py-8 px-8">
          <form onSubmit={addTodo} className="flex gap-4">
            <Input 
              placeholder="What do you need to do?" 
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              className="h-14 font-bold border-2 rounded-2xl bg-background"
            />
            <Button type="submit" disabled={isAdding || !newTodo.trim()} className="h-14 px-8 rounded-2xl font-bold shadow-lg">
              {isAdding ? <Zap className="animate-bolt h-6 w-6 fill-primary/20" /> : <Plus className="h-6 w-6" />}
            </Button>
          </form>
        </CardHeader>
        <CardContent className="p-8">
          {loading ? (
            <div className="py-20 text-center"><Zap className="animate-bolt mx-auto text-primary h-12 w-12 fill-primary/20" /></div>
          ) : todos.length > 0 ? (
            <div className="space-y-4">
              {todos.map((todo) => (
                <div 
                  key={todo.id} 
                  className={cn(
                    "flex items-center justify-between p-6 rounded-2xl border-2 transition-all group",
                    todo.completed ? "bg-muted/30 border-muted opacity-60" : "bg-background hover:border-primary/50 shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-6">
                    <Checkbox 
                      checked={todo.completed} 
                      onCheckedChange={() => toggleTodo(todo.id, todo.completed)} 
                      className="h-7 w-7 rounded-xl border-2"
                    />
                    <span className={cn("text-xl font-bold transition-all", todo.completed && "line-through text-muted-foreground")}>
                      {todo.text}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteTodo(todo.id)} className="h-10 w-10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center opacity-30">
              <CheckCircle2 className="h-20 w-20 mx-auto mb-4" />
              <p className="font-bold uppercase tracking-[0.2em] text-sm">No tasks today!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
