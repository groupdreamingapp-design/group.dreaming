import MercadoPagoConfig, { Preference } from 'mercadopago';

if (!process.env.MP_ACCESS_TOKEN) {
    console.warn("MP_ACCESS_TOKEN no está definido en las variables de entorno.");
}

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || ''
});

export const preference = new Preference(client);
export default client;
