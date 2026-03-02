import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 mt-auto py-8 z-10 relative">
      <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} ATS Benchmarker. All rights reserved.</p>
          <p className="text-xs text-slate-500 mt-1 font-mono">Powered by Cohere + Gemini.</p>
        </div>
        <div className="flex gap-6 text-sm text-slate-500">
          <Link href="#" className="hover:text-slate-300 transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-slate-300 transition-colors">Terms</Link>
          <Link href="#" className="hover:text-slate-300 transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}