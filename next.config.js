/** @type {import('next').NextConfig} */
const nextConfig = {
  // Asegúrate de que Recharts sea transpilado correctamente
  // para evitar problemas con SSR o entornos de compilación.
  transpilePackages: ['recharts', 'date-fns'],
  // DESACTIVAR TURBOPACK para resolver problemas de build con Next.js 16.x
  experimental: {
    useDeploymentWrapper: false, // Desactivar Turbopack en Vercel
  },
  // Forzar Webpack como compilador.
  webpack: (config, { isServer }) => {
    return config;
  },
};

module.exports = nextConfig;
