
export function generateMotivationalDescription(goalName: string): string {
    const name = goalName.toLowerCase();

    if (name.includes('auto') || name.includes('coche') || name.includes('vehiculo')) {
        return "Tu nuevo vehículo es más que transporte, es la libertad de ir a donde quieras. Cada cuota te acerca a nuevos horizontes. ¡Sigue adelante!";
    }
    if (name.includes('casa') || name.includes('hogar') || name.includes('departamento') || name.includes('terreno')) {
        return "Estás construyendo los cimientos de tu futuro. Un hogar propio es el escenario de tus mejores recuerdos. ¡Cada paso cuenta!";
    }
    if (name.includes('viaje') || name.includes('vacaciones') || name.includes('mundo')) {
        return "El mundo te espera. Esas experiencias inolvidables están cada vez más cerca. ¡Prepara las maletas, tu sueño está en marcha!";
    }
    if (name.includes('moto')) {
        return "Siente el viento y la adrenalina. Tu moto simboliza agilidad y libertad. ¡Ya falta poco para rodar!";
    }
    if (name.includes('negocio') || name.includes('empresa') || name.includes('local') || name.includes('inversion')) {
        return "Tu visión emprendedora toma forma. Este capital será el combustible para tu éxito financiero. ¡Tu imperio comienza aquí!";
    }
    if (name.includes('compu') || name.includes('pc') || name.includes('notebook') || name.includes('mac')) {
        return "Potencia tu creatividad y trabajo. Esa herramienta tecnológica elevará tu productividad al siguiente nivel. ¡Vamos por ello!";
    }

    return `Tu objetivo "${goalName}" es único y especial. Con constancia y la fuerza del grupo, transformarás este sueño en una realidad tangible. ¡Estás en el camino correcto!`;
}

export function summarizeGoal(goalName: string): string {
    let text = goalName.trim();
    if (!text) return "Objetivo Personal";

    const lowerText = text.toLowerCase();

    // Map of specific actions to keep
    const actions: Record<string, string> = {
        'remodelar': 'Remodelar',
        'renovar': 'Renovar',
        'arreglar': 'Arreglar',
        'ampliar': 'Ampliar',
        'agrandar': 'Ampliar',
        'construir': 'Construir',
        'edificar': 'Construir',
        'viajar': 'Viaje',
        'conocer': 'Viaje a',
        'terminar': 'Terminar'
    };

    // Map of objects
    const objects: Record<string, string> = {
        'casa': 'Casa',
        'hogar': 'Casa',
        'vivienda': 'Vivienda',
        'depto': 'Departamento',
        'departamento': 'Departamento',
        'habitacion': 'Habitación',
        'cuarto': 'Habitación',
        'cocina': 'Cocina',
        'baño': 'Baño',
        'quincho': 'Quincho',
        'pileta': 'Pileta',
        'piscina': 'Pileta',
        'auto': 'Auto',
        'coche': 'Auto',
        'vehiculo': 'Vehículo',
        'camioneta': 'Camioneta',
        'moto': 'Moto',
        'motocicleta': 'Moto',
        'negocio': 'Negocio',
        'local': 'Local',
        'compu': 'PC',
        'pc': 'PC',
        'notebook': 'Notebook',
        'macbook': 'MacBook'
    };

    // Detect Action
    let detectedAction = "";
    for (const [key, val] of Object.entries(actions)) {
        if (lowerText.includes(key)) {
            detectedAction = val;
            break;
        }
    }

    // Detect Object
    let detectedObject = "";
    for (const [key, val] of Object.entries(objects)) {
        if (lowerText.includes(key)) {
            detectedObject = val;
            break;
        }
    }

    // Heuristics
    // 1. If "Remodelar" + "Casa" -> "Remodelar Casa"
    // 2. If "Comprar" (or no action) + "Casa" -> "Mi Casa"

    // Explicit "Comprar" check to ignore it
    if (lowerText.includes('comprar') || lowerText.includes('adquirir') || lowerText.includes('tener')) {
        detectedAction = ""; // Reset action to force "Mi [Object]" logic unless another action overrides? 
        // Actually mostly "Comprar" means ownership.
    }

    if (detectedObject) {
        if (detectedAction) {
            // E.g. "Remodelar Cocina"
            // Special case for "Viaje": "Viaje a [Rest of string?]" 
            // Simplifying: return "Action Object"
            if (detectedAction === 'Viaje a') return 'Mi Viaje'; // Hard to parse destination without NLP
            return `${detectedAction} ${detectedObject}`;
        } else {
            // No action (or "Comprar"), so "Mi [Object]"
            return `Mi ${detectedObject}`;
        }
    }

    // Fallback if no object detected but action is detected
    if (detectedAction === 'Viaje' || detectedAction === 'Viaje a') {
        // Try to find destination? Assume "Viaje Soñado"
        return "Mi Viaje";
    }

    // Fallback: Use capitalized original words (filtered)
    // Remove "quiero", "un", "una", "el", "la", "me", "gustaria"
    const stopWords = ['quiero', 'deseo', 'necesito', 'un', 'una', 'el', 'la', 'los', 'las', 'mi', 'me', 'gustaria'];
    const words = text.split(' ').filter(w => !stopWords.includes(w.toLowerCase()));

    if (words.length > 0) {
        const shortName = words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        return shortName.length > 25 ? shortName.substring(0, 22) + '...' : shortName;
    }

    return "Objetivo Personal";
}
