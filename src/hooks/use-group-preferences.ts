'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export type GroupPreference = {
    customName?: string;
    customImageUrl?: string;
    motivationalDescription?: string;
};

export function useGroupPreferences(groupId: string) {
    const { user } = useUser();
    const [preferences, setPreferences] = useState<GroupPreference | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !groupId) {
            setLoading(false);
            return;
        }

        const docRef = doc(db, 'users', user.uid, 'group_preferences', groupId);

        // Real-time listener
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setPreferences(docSnap.data() as GroupPreference);
            } else {
                setPreferences(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, groupId]);

    const savePreferences = async (newPrefs: GroupPreference) => {
        if (!user) return;
        const docRef = doc(db, 'users', user.uid, 'group_preferences', groupId);
        await setDoc(docRef, newPrefs, { merge: true });
    };

    return { preferences, loading, savePreferences };
}
