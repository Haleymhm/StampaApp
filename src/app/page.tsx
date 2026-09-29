export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-zinc-800/80 backdrop-blur-md sticky top-0 z-50 bg-zinc-950/70">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              S
            </div>
            <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              StampaApp
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              Stack Ready
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-zinc-800/80 border border-zinc-700/60 text-zinc-300">
            <span>Next.js 16 + React 19 + Prisma 7 + Tailwind CSS</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Next.js, Prisma & PostgreSQL{" "}
            <span className="block bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Configurado con PNPM
            </span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Tu proyecto está completamente inicializado y listo para desarrollo. Incluye cliente singleton de Prisma ORM optimizado para PostgreSQL y Tailwind CSS integrado.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Next.js */}
          <div className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-800/40">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-mono text-sm font-bold group-hover:scale-105 transition-transform">
                N
              </div>
              <span className="text-xs font-mono text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded">
                v16.3
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Next.js App Router</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Turbopack ultra-rápido, Server Components de React 19 y estructura organizada en el directorio <code className="text-xs bg-zinc-800 px-1 py-0.5 rounded text-zinc-300 font-mono">src/app</code>.
            </p>
          </div>

          {/* Card 2: Prisma + PostgreSQL */}
          <div className="group relative rounded-2xl border border-indigo-900/40 bg-gradient-to-b from-indigo-950/20 to-zinc-900/60 p-6 transition-all duration-300 hover:border-indigo-500/50 hover:bg-zinc-800/40 shadow-lg shadow-indigo-950/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono text-sm font-bold group-hover:scale-105 transition-transform">
                P
              </div>
              <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                PostgreSQL
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Prisma ORM 7</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Configurado con <code className="text-xs bg-zinc-800 px-1 py-0.5 rounded text-zinc-300 font-mono">@prisma/adapter-pg</code> y cliente singleton listo en <code className="text-xs bg-zinc-800 px-1 py-0.5 rounded text-zinc-300 font-mono">src/lib/prisma.ts</code>.
            </p>
          </div>

          {/* Card 3: Tailwind CSS */}
          <div className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-800/40">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-mono text-sm font-bold group-hover:scale-105 transition-transform">
                TW
              </div>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                v4.0
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Tailwind CSS</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Nueva arquitectura de Tailwind CSS v4 con importación simplificada en <code className="text-xs bg-zinc-800 px-1 py-0.5 rounded text-zinc-300 font-mono">globals.css</code> y soporte de temas.
            </p>
          </div>
        </div>

        {/* Quick Usage Box */}
        <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-8 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>Uso rápido del cliente de Prisma</span>
          </h2>
          <div className="bg-black/70 rounded-xl p-4 font-mono text-xs sm:text-sm text-zinc-300 border border-zinc-800/80 overflow-x-auto">
            <pre>
              <span className="text-purple-400">import</span> &#123; prisma &#125;{" "}
              <span className="text-purple-400">from</span>{" "}
              <span className="text-emerald-400">&quot;@/lib/prisma&quot;</span>;
              <br /><br />
              <span className="text-zinc-500">&#47;&#47; En un Server Component, Server Action o Route Handler:</span><br />
              <span className="text-purple-400">export async function</span>{" "}
              <span className="text-blue-400">getUsers</span>() &#123;<br />
              &nbsp;&nbsp;<span className="text-purple-400">const</span> users ={" "}
              <span className="text-purple-400">await</span> prisma.user.<span className="text-blue-300">findMany</span>();<br />
              &nbsp;&nbsp;<span className="text-purple-400">return</span> users;<br />
              &#125;
            </pre>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 items-center justify-between text-xs text-zinc-400 border-t border-zinc-800 pt-5">
            <div>
              Variable de entorno: <code className="text-indigo-300 font-mono">DATABASE_URL</code> en <code className="text-zinc-300 font-mono">.env</code>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-zinc-800 px-2.5 py-1 rounded-md text-zinc-300 font-mono">pnpm dev</span>
              <span className="bg-zinc-800 px-2.5 py-1 rounded-md text-zinc-300 font-mono">pnpm exec prisma db push</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 py-6 text-center text-xs text-zinc-500">
        <p>Configurado exitosamente con PNPM · Next.js · Prisma ORM · PostgreSQL · Tailwind CSS</p>
      </footer>
    </div>
  );
}
