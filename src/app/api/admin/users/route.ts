import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
        const { email, password, displayName, role } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const auth = getAdminAuth();

        const userRecord = await auth.createUser({
            email,
            password,
            displayName,
        });

        // If role is admin, we could set custom claims here
        if (role === 'admin') {
            // await auth.setCustomUserClaims(userRecord.uid, { admin: true });
        }

        // Create user document in Firestore
        const db = getAdminFirestore();
        await db.collection('users').doc(userRecord.uid).set({
            id: userRecord.uid,
            email: userRecord.email,
            displayName: displayName || '',
            role: role || 'user',
            createdAt: new Date().toISOString(),
            group: '-', // Initial default
        });

        // Also create admin role doc if selected
        if (role === 'admin') {
            await db.collection('roles_admin').doc(userRecord.uid).set({
                createdAt: new Date().toISOString(),
                createdBy: 'admin-api'
            });
        }

        return NextResponse.json({
            uid: userRecord.uid,
            email: userRecord.email,
            message: 'User created successfully'
        });

    } catch (error: any) {
        console.error('Error creating user:', error);
        // Clean up error message for frontend
        let errorMessage = error.message || 'Internal Server Error';
        if (error.code === 'auth/email-already-exists' || error.message.includes('email-already-exists')) {
            errorMessage = 'auth/email-already-in-use';
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
