import { Link } from "react-router";

function Login() {
  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-3xl font-black text-slate-950">Login</h2>
        <p className="mt-2 text-slate-600">Access your MediLink account.</p>

        <div className="mt-8 space-y-4">
          <input className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500" placeholder="Email address" />
          <input className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500" placeholder="Password" type="password" />

          <button className="w-full rounded-2xl bg-teal-600 px-5 py-3 font-bold text-white hover:bg-teal-700">
            Login
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          New patient? <Link to="/register" className="font-bold text-teal-700">Create account</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;