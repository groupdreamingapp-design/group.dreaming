import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

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
            // For now we use the Firestore 'roles_admin' collection logic, so we don't strictly need custom claims yet,
            // but we could add the document to firestore if we had the adminFirestore available here easily.
            // Let's keep it simple: just create the Auth user. The UI can handle the role doc creation client-side 
            // OR we can do it here if we want to be robust (requires Admin Firestore).
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
