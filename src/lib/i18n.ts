
export const translations = {
    es: {
        common: {
            profile: "Perfil",
            verification: "Verificación",
            logout: "Cerrar sesión",
            language: "Idioma",
            settings: "Configuración",
            welcome: "Bienvenido",
            dashboard: "Panel",
            search: "Buscar...",
            notifications: "Notificaciones",
            admin: "Administrador",
            user: "Usuario",
            loading: "Cargando..."
        },
        nav: {
            dashboard: "Inicio",
            groups: "Grupos",
            wallet: "Billetera",
            learning: "Aprender",
            community: "Comunidad",
            support: "Ayuda/Soporte",
            my_dashboard: "Mi Panel",
            my_groups: "Mis Grupos",
            notifications: "Notificaciones",
            explore_groups: "Explorar Grupos",
            auctions: "Subastas",
            my_profile: "Mi Perfil",
            comparisons: "Comparativas",
            info: "Información",
            how_it_works: "Cómo Funciona",
            benefits: "Beneficios",
            rules: "Reglamento",
            compliance: "Marco Legal",
            faq: "Preguntas Frecuentes",
            admin: "Admin",
            administration: "Administración",
            collection_map: "Mapa de Cobranza",
            demo_users: "Usuarios Demo"
        }
    },
    en: {
        common: {
            profile: "Profile",
            verification: "Verification",
            logout: "Log out",
            language: "Language",
            settings: "Settings",
            welcome: "Welcome",
            dashboard: "Dashboard",
            search: "Search...",
            notifications: "Notifications",
            admin: "Admin",
            user: "User",
            loading: "Loading..."
        },
        nav: {
            dashboard: "Home",
            groups: "Groups",
            wallet: "Wallet",
            learning: "Learn",
            community: "Community",
            support: "Help/Support",
            my_dashboard: "My Dashboard",
            my_groups: "My Groups",
            notifications: "Notifications",
            explore_groups: "Explore Groups",
            auctions: "Auctions",
            my_profile: "My Profile",
            comparisons: "Comparisons",
            info: "Information",
            how_it_works: "How It Works",
            benefits: "Benefits",
            rules: "Rules",
            compliance: "Compliance",
            faq: "FAQ",
            admin: "Admin",
            administration: "Administration",
            collection_map: "Collection Map",
            demo_users: "Demo Users"
        }
    }
};

export type Language = 'es' | 'en';
export type TranslationKey = keyof typeof translations.es;
