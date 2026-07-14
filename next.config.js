/** @type {import('next').NextConfig} */
const nextConfig = {
  // Asegúrate de que Recharts sea transpilado correctamente
  // para evitar problemas con SSR o entornos de compilación.
  transpilePackages: ['date-fns', 'recharts'],


  // Configuración explícita de Webpack para transpilar módulos específicos
  webpack: (config, { isServer }) => {
    // Asegurarse de que date-fns y recharts se transpilen
    // Esto es un workaround para el "Module not found" persistente
    config.module.rules.push({
      test: /\.+(js|jsx|ts|tsx)$/,
      include: [/node_modules\/date-fns/, /node_modules\/recharts/],
      use: {
        loader: 'babel-loader', // Usar babel-loader para transpilar
        options: {
          presets: ['next/babel'],
          plugins: [],
        },
      },
    });

    return config;
  },
};

module.exports = nextConfig;
