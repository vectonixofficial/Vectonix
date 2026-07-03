"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface AuthUser {
    uid?: string;
    id?: string;
    email: string | null;
    displayName?: string | null;
}

interface AuthContextType {
    user: AuthUser | null;
    isAdmin: boolean;
    loading: boolean;
    signInWithGoogle: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAdmin: false,
    loading: true,
    signInWithGoogle: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const ADMIN_EMAILS = ["rahman.habibur2007@gmail.com", "vectonixofficial@gmail.com"];

    const signInWithGoogle = async () => {
        if (isSupabaseConfigured) {
            return supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: window.location.origin },
            });
        }
        if (!auth) {
            throw new Error("Authentication is not configured. Please check environment variables.");
        }
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    useEffect(() => {
        let isMounted = true;

        if (isSupabaseConfigured) {
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (!isMounted) return;
                const sbUser = session?.user;
                if (sbUser) {
                    setUser({ id: sbUser.id, email: sbUser.email ?? null, displayName: sbUser.user_metadata?.full_name });
                    setIsAdmin(Boolean(sbUser.email && ADMIN_EMAILS.includes(sbUser.email)));
                } else if (!auth) {
                    setUser(null);
                    setIsAdmin(false);
                }
                setLoading(false);
            });

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                const sbUser = session?.user;
                if (sbUser) {
                    setUser({ id: sbUser.id, email: sbUser.email ?? null, displayName: sbUser.user_metadata?.full_name });
                    setIsAdmin(Boolean(sbUser.email && ADMIN_EMAILS.includes(sbUser.email)));
                } else if (!auth) {
                    setUser(null);
                    setIsAdmin(false);
                }
                setLoading(false);
            });

            return () => {
                isMounted = false;
                subscription.unsubscribe();
            };
        }

        if (auth) {
            const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                if (currentUser) {
                    setUser({ uid: currentUser.uid, email: currentUser.email, displayName: currentUser.displayName });
                    setIsAdmin(Boolean(currentUser.email && ADMIN_EMAILS.includes(currentUser.email)));
                } else {
                    setUser(null);
                    setIsAdmin(false);
                }
                setLoading(false);
            });
            return () => unsubscribe();
        }

        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAdmin, loading, signInWithGoogle }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
