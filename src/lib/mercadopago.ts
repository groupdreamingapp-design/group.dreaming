import 'server-only';
import MercadoPagoConfig, { Preference } from 'mercadopago';

if (!process.env.MP_ACCESS_TOKEN) {
    console.warn("⚠️ MP_ACCESS_TOKEN no encontrado. (Normal durante el build si no es estático)");
}

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || 'dummy_token_for_build'
});

export const preference = new Preference(client);
export default client;
