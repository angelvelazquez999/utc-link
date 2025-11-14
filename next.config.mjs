/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Excluir el directorio components dentro de pages del build
  experimental: {
    outputFileTracingExcludes: {
      '*': ['pages/components/**/*']
    }
  }
};

export default nextConfig;
