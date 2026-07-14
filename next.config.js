/** @type {import('next').NextConfig} */
const nextConfig = {
  // Asegúrate de que Recharts sea transpilado correctamente
  // para evitar problemas con SSR o entornos de compilación.
  transpilePackages: ['date-fns', 'recharts'],

};

module.exports = nextConfig;
