import { NextRequest, NextResponse } from "next/server";
import { payment } from "@/lib/mercadopago";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const headers = request.headers;
    const searchParams = request.nextUrl.searchParams;

    // console.log("Webhook MP received:", JSON.stringify(body, null, 2));

    const topic = searchParams.get("topic") || body.type;
    const id = searchParams.get("data.id") || body.data?.id || searchParams.get("id"); // MP sends id in data.id for topic=payment or id param

    if (!topic || !id) {
        return NextResponse.json({ status: "ok", message: "No topic or id provided" }, { status: 200 });
    }

    if (topic === "payment") {
        try {
            console.log(`Processing payment ID: ${id}`);
            const paymentInfo = await payment.get({ id: id });

            if (!paymentInfo) {
                console.error("Payment not found via API");
                return NextResponse.json({ status: "error", message: "Payment not found" }, { status: 404 });
            }

            const status = paymentInfo.status;
            const metadata = paymentInfo.metadata;
            const externalRef = paymentInfo.external_reference;

            const db = getAdminFirestore();
            const payerEmail = paymentInfo.payer?.email;
            const paymentDocRef = db.collection('payments').doc(String(id));

            // Validate metadata (it comes as snake_case from MP usually, but SDK might normalize it? 
            // The SDK returns it as is. We sent snake_case in preference: user_id, group_id)
            const userId = metadata?.user_id;
            const groupId = metadata?.group_id;
            const paymentType = metadata?.payment_type;

            await paymentDocRef.set({
                id: String(id),
                status: status,
                status_detail: paymentInfo.status_detail,
                transaction_amount: paymentInfo.transaction_amount,
                date_created: paymentInfo.date_created,
                date_approved: paymentInfo.date_approved,
                title: paymentInfo.description || paymentInfo.additional_info?.items?.[0]?.title,
                payer_email: payerEmail,
                user_id: userId || null,
                group_id: groupId || null,
                payment_type: paymentType || null,
                metadata: metadata || {},
                external_reference: externalRef,
                updated_at: new Date().toISOString()
            }, { merge: true });

            console.log(`Payment stored. ID: ${id}, Status: ${status}`);

            if (status === 'approved' && userId && groupId) {
                if (paymentType === 'adhesion' || paymentType === 'adhésion') {
                    await handleAdhesion(db, groupId, userId, String(id), payerEmail);
                } else if (paymentType === 'cuota') {
                    await handleCuota(db, groupId, userId, String(id));
                }
            }

            return NextResponse.json({ status: "ok" }, { status: 200 });

        } catch (error: any) {
            console.error("Error processing webhook:", error);
            // Return 200 to avoid MP retries loop if it's our logic failing
            return NextResponse.json({ status: "error", message: error.message }, { status: 200 });
        }
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
}

async function handleAdhesion(db: FirebaseFirestore.Firestore, groupId: string, userId: string, paymentId: string, email?: string) {
    const groupRef = db.collection('groups').doc(groupId);
    const userRef = db.collection('users').doc(userId);

    try {
        await db.runTransaction(async (transaction) => {
            const groupDoc = await transaction.get(groupRef);
            if (!groupDoc.exists) return;

            const data = groupDoc.data();
            const members: string[] = data?.members || [];

            // Update Group Members if not already present
            if (!members.includes(userId)) {
                transaction.update(groupRef, {
                    membersCount: FieldValue.increment(1),
                    members: FieldValue.arrayUnion(userId)
                });

                const memberRef = groupRef.collection('members').doc(userId);
                transaction.set(memberRef, {
                    orderNumber: (data?.membersCount || 0) + 1,
                    joinedAt: new Date().toISOString(),
                    status: 'Activo',
                    subscriptionPaid: true,
                    installmentsPaid: 1,
                    initialPaymentId: paymentId
                });
            }

            // Sync User Profile for Collection Map / Admin
            // This ensures the user appears in the "Mapa de Cobranza"
            transaction.set(userRef, {
                group: groupId,
                quota: '1', // Adhesion counts as quota 1 usually, or just 'Adhesión'
                method: 'MercadoPago',
                status: 'Cobrado', // Payment approved
                lastPaymentId: paymentId,
                updatedAt: new Date().toISOString(),
                ...(email ? { email } : {}) // Update email if provided and missing
            }, { merge: true });

        });
        console.log(`Adhesion processed for User ${userId}, sync to users collection complete.`);
    } catch (e) {
        console.error("Error processing adhesion tx:", e);
    }
}

async function handleCuota(db: FirebaseFirestore.Firestore, groupId: string, userId: string, paymentId: string) {
    const memberRef = db.collection('groups').doc(groupId).collection('members').doc(userId);
    const userRef = db.collection('users').doc(userId);

    try {
        await memberRef.update({
            installmentsPaid: FieldValue.increment(1),
            lastPaymentId: paymentId,
            lastPaymentDate: new Date().toISOString()
        });

        // Update User Profile for Collection Map
        await userRef.set({
            status: 'Cobrado',
            lastPaymentDate: new Date().toISOString(),
            lastPaymentId: paymentId,
            method: 'MercadoPago'
            // We might want to increment quota here too effectively, but 'quota' field is string in map 
            // Assume we update it to the just paid quota number? 
            // Use 'installmentsPaid' from memberRef if we could read it, but here we just blindly update for now.
        }, { merge: true });

        console.log(`Quota payment processed for User ${userId}`);
    } catch (e) {
        console.error("Error processing quota update:", e);
    }
}
