import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
      <div className="border-4 border-red-600 p-8 rounded-lg max-w-sm shadow-[10px_10px_0px_0px_rgba(220,38,38,1)]">
        <h1 className="text-4xl font-black text-red-600 mb-6 uppercase italic">
          In Case of Fire 🔥
        </h1>

        <div className="space-y-4 font-mono text-xl font-bold text-slate-800">
          <div className="bg-slate-100 p-3 rounded border-l-8 border-red-600">
            1. git add .
          </div>
          <div className="bg-slate-100 p-3 rounded border-l-8 border-red-600">
            2. git commit -m "FIRE"
          </div>
          <div className="bg-slate-100 p-3 rounded border-l-8 border-red-600">
            3. git push
          </div>
          <Link href="/login" className="block w-full">
            <button className="w-full bg-red-600 text-white p-3 rounded animate-pulse cursor-pointer">
              4. RUN! 🏃‍♂️
            </button>
          </Link>
        </div>


      </div>
    </main>
  );
}