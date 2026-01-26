'use client';

import { useState } from 'react';
import { db } from '@/firebase/config'; // Asegúrate que esta ruta a tu config de firebase sea real
import { collection, addDoc } from 'firebase/firestore';

export default function CreateMotoButton() {
    const [loading, setLoading] = useState(false);

    const createMoto = async () => {
        setLoading(true);
        try {
            // ESTA ES LA DEFINICIÓN DEL CÍRCULO EN LA BASE DE DATOS
            const docRef = await addDoc(collection(db, "groups"), {
                title: "Moto Honda Wave 110cc",
                description: "Tu primera moto 0km. Adjudicación por sorteo mensual.",
                totalPrice: 2000000,     // 2 Millones
                quotaAmount: 40000,      // Cuota de 40k
                maxParticipants: 50,
                currentParticipants: 0,
                frequency: "monthly",
                status: "OPEN",          // Importante para que se vea
                imageUrl: "https://http2.mlstatic.com/D_NQ_NP_944378-MLA74673327663_022024-O.webp", // Foto de MercadoLibre
                createdAt: new Date()
            });

            alert(`✅ Círculo Creado con ID: ${docRef.id}`);
        } catch (error) {
            console.error("Error creando círculo:", error);
            alert("❌ Error al crear (Revisa la consola)");
        }
        setLoading(false);
    };

    return (
        <button
            onClick={createMoto}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all"
        >
            {loading ? "Creando..." : "🛠️ CREAR MOTO (ADMIN)"}
        </button>
    );
}