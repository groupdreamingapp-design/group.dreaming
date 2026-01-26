'use client';

import { useState } from 'react';
import { askTheTeam } from '@/app/actions/consult-team';

// Definimos los colores y estilos de cada silla del directorio
const AGENTS = {
    CTO: { emoji: '💻', color: 'bg-blue-100 border-blue-500 text-blue-900', name: 'Tech Lead' },
    LEGAL: { emoji: '⚖️', color: 'bg-slate-100 border-slate-500 text-slate-900', name: 'Legales' },
    SALES: { emoji: '💰', color: 'bg-green-100 border-green-500 text-green-900', name: 'Ventas' },
    DESIGNER: { emoji: '🎨', color: 'bg-purple-100 border-purple-500 text-purple-900', name: 'UX/UI' },
};

type Message = {
    role: string;
    text: string;
    timestamp: Date;
};

export default function BoardRoom() {
    const [idea, setIdea] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [minutes, setMinutes] = useState<Message[]>([]); // El "Acta" de la reunión

    const conveneTheBoard = async () => {
        if (!idea.trim()) return;

        // 1. Limpiamos la mesa y ponemos la idea central
        setIsThinking(true);
        setMinutes([]); // Opcional: Borrar lo anterior o acumular

        const currentIdea = idea; // Guardamos la referencia
        setIdea(''); // Limpiamos el input

        // Agregamos la propuesta del CEO (Tú) al acta
        setMinutes(prev => [...prev, { role: 'CEO', text: currentIdea, timestamp: new Date() }]);

        // 2. Disparamos a los 4 agentes EN PARALELO
        const roles = ['CTO', 'LEGAL', 'SALES', 'DESIGNER'] as const;

        // Usamos Promise.allSettled para que si uno falla, los otros sigan
        roles.forEach(async (role) => {
            try {
                const response = await askTheTeam(role, `Analiza esta propuesta de nuevo producto: "${currentIdea}". Dime qué debo tener en cuenta desde tu área.`);

                if (response.success && response.text) {
                    setMinutes(prev => [
                        ...prev,
                        { role: role, text: response.text, timestamp: new Date() }
                    ]);
                }
            } catch (error) {
                console.error(`Error con el agente ${role}`, error);
            }
        });

        // Nota: No esperamos a que terminen para liberar el input, 
        // pero apagamos el estado de "pensando" después de unos segundos o cuando respondan.
        setTimeout(() => setIsThinking(false), 2000);
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8">

            {/* 1. ZONA DEL CEO (Tu Input) */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    👔 Tu Propuesta (CEO)
                </h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        placeholder="Ej: Quiero crear un grupo para comprar Laptops Gamers..."
                        className="flex-1 p-4 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && conveneTheBoard()}
                    />
                    <button
                        onClick={conveneTheBoard}
                        disabled={isThinking}
                        className="bg-black text-white px-8 py-4 rounded-lg font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
                    >
                        {isThinking ? 'Convocando...' : 'Reunir Directorio'}
                    </button>
                </div>
            </div>

            {/* 2. LA MESA DE DISCUSIÓN (Respuestas) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {minutes.map((msg, idx) => {
                    if (msg.role === 'CEO') return null; // Ya vimos el input arriba

                    // @ts-ignore
                    const style = AGENTS[msg.role] || AGENTS.CTO;

                    return (
                        <div key={idx} className={`p-6 rounded-xl border-l-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 ${style.color}`}>
                            <div className="flex items-center gap-3 mb-3 border-b border-black/10 pb-2">
                                <span className="text-2xl">{style.emoji}</span>
                                <span className="font-bold uppercase tracking-wider text-sm">{style.name}</span>
                            </div>
                            <div className="prose prose-sm max-w-none">
                                {/* Renderizamos el texto con saltos de línea */}
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {minutes.length === 0 && !isThinking && (
                <div className="text-center text-gray-400 py-10">
                    <p>La sala de reuniones está vacía. Lanza una propuesta.</p>
                </div>
            )}
        </div>
    );
}