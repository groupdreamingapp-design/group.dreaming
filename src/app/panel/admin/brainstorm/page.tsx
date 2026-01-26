'use client';

import { useState } from 'react';
import { askTheTeam } from '@/app/actions/consult-team';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, Scale, Palette, DollarSign, Send, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

// Definimos los perfiles de tu equipo
const AGENTS = [
    { id: 'CTO', name: 'Tech Lead', icon: Terminal, color: 'text-blue-500', bg: 'bg-blue-50', desc: 'Seguridad, Código, Arquitectura' },
    { id: 'LEGAL', name: 'Legal & Compliance', icon: Scale, color: 'text-gray-600', bg: 'bg-gray-50', desc: 'Contratos, Términos, Normativa' },
    { id: 'DESIGNER', name: 'UX/UI Designer', icon: Palette, color: 'text-pink-500', bg: 'bg-pink-50', desc: 'Componentes, Estilos, Tailwind' },
    { id: 'SALES', name: 'Comercial', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', desc: 'Ventas, Pitch, Soporte' },
] as const;

type Role = typeof AGENTS[number]['id'];

interface Message {
    role: 'user' | 'ai';
    content: string;
    agent?: Role;
}

export default function BrainstormPage() {
    const [selectedAgent, setSelectedAgent] = useState<Role>('CTO');
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!input.trim()) return;

        // 1. Agregamos tu pregunta al chat
        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);
        const currentQuery = input;
        setInput(''); // Limpiamos input

        // 2. Llamamos al Server Action
        const result = await askTheTeam(selectedAgent, currentQuery);

        // 3. Agregamos la respuesta del agente
        const aiMsg: Message = {
            role: 'ai',
            content: result.text || "Error de conexión.",
            agent: selectedAgent
        };
        setMessages(prev => [...prev, aiMsg]);
        setLoading(false);
    };

    // Encontrar el agente actual para mostrar su info
    const currentAgent = AGENTS.find(a => a.id === selectedAgent)!;

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-slate-50">

            {/* LATERAL: Selección de Agente */}
            <div className="w-64 bg-white border-r p-4 flex flex-col gap-4">
                <h2 className="font-bold text-xl px-2">Tu Equipo</h2>
                <div className="space-y-2">
                    {AGENTS.map((agent) => (
                        <button
                            key={agent.id}
                            onClick={() => setSelectedAgent(agent.id)}
                            className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                                selectedAgent === agent.id
                                    ? `${agent.bg} ring-1 ring-inset ring-gray-200 shadow-sm`
                                    : "hover:bg-gray-100"
                            )}
                        >
                            <agent.icon className={cn("h-5 w-5", agent.color)} />
                            <div>
                                <div className="font-semibold text-sm">{agent.name}</div>
                                <div className="text-xs text-muted-foreground">{agent.desc.split(',')[0]}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* CENTRAL: Área de Chat */}
            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
                <Card className="flex-1 flex flex-col shadow-sm border-gray-200">
                    <CardHeader className="border-b py-3 px-6 bg-white rounded-t-lg flex flex-row items-center gap-3">
                        <currentAgent.icon className={cn("h-6 w-6", currentAgent.color)} />
                        <div>
                            <CardTitle className="text-lg">Hablando con {currentAgent.name}</CardTitle>
                            <p className="text-xs text-muted-foreground">{currentAgent.desc}</p>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 relative overflow-hidden flex flex-col">

                        {/* Historial de Mensajes */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-6">
                                {messages.length === 0 && (
                                    <div className="text-center text-gray-400 mt-20">
                                        <p>La sala está vacía.</p>
                                        <p className="text-sm">Selecciona un agente y haz una consulta.</p>
                                    </div>
                                )}

                                {messages.map((m, i) => (
                                    <div key={i} className={cn("flex gap-3", m.role === 'user' ? "justify-end" : "justify-start")}>
                                        {m.role === 'ai' && (
                                            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                                AGENTS.find(a => a.id === m.agent)?.bg || 'bg-gray-100'
                                            )}>
                                                <Bot className="h-4 w-4 opacity-70" />
                                            </div>
                                        )}

                                        <div className={cn(
                                            "p-3 rounded-2xl max-w-[80%] whitespace-pre-wrap text-sm",
                                            m.role === 'user'
                                                ? "bg-blue-600 text-white rounded-tr-none"
                                                : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200"
                                        )}>
                                            {m.content}
                                        </div>

                                        {m.role === 'user' && (
                                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                                <User className="h-4 w-4 text-blue-600" />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {loading && (
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse" />
                                        <div className="bg-gray-50 p-3 rounded-2xl text-sm text-gray-400 animate-pulse">
                                            Escribiendo...
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t mt-auto">
                            <div className="relative">
                                <Textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={`Pregúntale al ${currentAgent.name}... (Ej: "Revisame este código...")`}
                                    className="pr-12 min-h-[60px] resize-none"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit();
                                        }
                                    }}
                                />
                                <Button
                                    size="icon"
                                    className="absolute right-2 bottom-2 h-8 w-8"
                                    onClick={handleSubmit}
                                    disabled={loading || !input.trim()}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}