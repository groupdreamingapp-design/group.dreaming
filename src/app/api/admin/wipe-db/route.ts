import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
    const token = request.headers.get("x-admin-token");

    // Simple protection: require accurate Firebase Project ID as token or allow if running locally
    const secret = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    // Allow local check without header if desired? No, let's be safe.
    // User must pass header: x-admin-token: group-dreaming-prod
    if (token !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const db = getAdminFirestore();

        // 1. Delete Groups and subcollections
        const groupsRef = db.collection('groups');
        const groupsSnapshot = await groupsRef.get();
        let deletedCount = 0;

        // Firestore batch has 500 limit. We need multiple batches if large data.
        let batch = db.batch();
        let batchCount = 0;

        for (const groupDoc of groupsSnapshot.docs) {
            // Delete members subcollection
            const membersRef = groupDoc.ref.collection('members');
            const membersSnapshot = await membersRef.get();

            for (const memberDoc of membersSnapshot.docs) {
                batch.delete(memberDoc.ref);
                batchCount++;
                deletedCount++;
                if (batchCount >= 400) { await batch.commit(); batch = db.batch(); batchCount = 0; }
            }

            // Delete Group doc
            batch.delete(groupDoc.ref);
            batchCount++;
            deletedCount++;
            if (batchCount >= 400) { await batch.commit(); batch = db.batch(); batchCount = 0; }
        }

        // 2. Delete Payments
        const paymentsRef = db.collection('payments');
        const paymentsSnapshot = await paymentsRef.get();
        for (const payDoc of paymentsSnapshot.docs) {
            batch.delete(payDoc.ref);
            batchCount++;
            deletedCount++;
            if (batchCount >= 400) { await batch.commit(); batch = db.batch(); batchCount = 0; }
        }

        if (batchCount > 0) { await batch.commit(); }

        return NextResponse.json({
            success: true,
            message: `Database wiped. Deleted ${deletedCount} documents from groups and payments.`
        });

    } catch (error: any) {
        console.error("Wipe Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
