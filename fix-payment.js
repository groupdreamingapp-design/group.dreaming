const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc, runTransaction, increment, arrayUnion } = require("firebase/firestore");

// Config from .env.local check
const firebaseConfig = {
    apiKey: "AIzaSyAST7qC6KHt_t-v-IqhBkOfgrJSv1WUscg",
    authDomain: "group-dreaming-prod.firebaseapp.com",
    projectId: "group-dreaming-prod",
    storageBucket: "group-dreaming-prod.firebasestorage.app",
    messagingSenderId: "926998717434",
    appId: "1:926998717434:web:76fbff46e60011efca7a43"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PAYMENT_ID = "143144152995";
const GROUP_ID = "ID-20260126-0001";
const USER_ID = "scrrJFm1I7MyU4EMnDMN7LmEoNG2";
const EMAIL = "juanmacorrea1602@gmail.com";

async function fixPayment() {
    console.log("Iniciando reparación manual de pago...");

    // 1. Registrar Pago en 'payments'
    try {
        await setDoc(doc(db, "payments", PAYMENT_ID), {
            id: PAYMENT_ID,
            status: "approved",
            status_detail: "accredited",
            title: `Adhesión Grupo ${GROUP_ID}`,
            payer_email: EMAIL,
            user_id: USER_ID,
            group_id: GROUP_ID,
            payment_type: "adhesion", // Normalized
            created_at: new Date().toISOString(),
            method: "manual_fix"
        }, { merge: true });
        console.log("✅ Colección 'payments' actualizada.");
    } catch (e) {
        console.error("Error en payments:", e);
    }

    // 2. Transacción de Adhesión (Group + Member)
    const groupRef = doc(db, "groups", GROUP_ID);
    const userRef = doc(db, "users", USER_ID);

    try {
        await runTransaction(db, async (transaction) => {
            const groupDoc = await transaction.get(groupRef);
            if (!groupDoc.exists()) throw "Grupo no existe";

            const data = groupDoc.data();
            const members = data.members || [];

            if (!members.includes(USER_ID)) {
                // Update Group
                transaction.update(groupRef, {
                    membersCount: increment(1),
                    members: arrayUnion(USER_ID)
                });

                // Create Member
                const memberRef = doc(db, "groups", GROUP_ID, "members", USER_ID);
                transaction.set(memberRef, {
                    orderNumber: (data.membersCount || 0) + 1,
                    joinedAt: new Date().toISOString(),
                    status: 'Activo',
                    subscriptionPaid: true,
                    installmentsPaid: 1, // Adhesion is usually inst 0, but logic said 1 in route.ts
                    initialPaymentId: PAYMENT_ID
                });
                console.log("✅ Miembro agregado al grupo.");
            } else {
                console.log("ℹ️ El usuario ya es miembro del grupo.");
            }

            // 3. Update User Profile (Crucial for Map)
            transaction.set(userRef, {
                group: GROUP_ID,
                quota: '1',
                method: 'MercadoPago',
                status: 'Cobrado',
                lastPaymentId: PAYMENT_ID,
                updatedAt: new Date().toISOString(),
                email: EMAIL
            }, { merge: true });
            console.log("✅ Perfil de usuario actualizado para Mapa de Cobranza.");
        });
        console.log("🎉 ¡Proceso completado con éxito!");
    } catch (e) {
        console.error("Error en transacción:", e);
    }
}

fixPayment();
