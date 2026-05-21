import { HeartPulse, Link2 } from "lucide-react";

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/20">
        <HeartPulse className="h-7 w-7 text-white" />
        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
          <Link2 className="h-3 w-3 text-teal-600" />
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950">
          Medi<span className="text-teal-600">Link</span>
        </h1>
        <p className="-mt-1 text-xs font-medium tracking-wide text-slate-500">
          Connected Healthcare
        </p>
      </div>
    </div>
  );
}

export default Logo;