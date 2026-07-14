/** @type {import('next').NextConfig} */
const nextConfig = {
  // Asegúrate de que Recharts sea transpilado correctamente
  // para evitar problemas con SSR o entornos de compilación.
  transpilePackages: ['recharts', 'date-fns'],
};

module.exports = nextConfig;
