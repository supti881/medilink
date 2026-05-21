function Register() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-3xl font-black text-slate-950">Patient Registration</h2>
        <p className="mt-2 text-slate-600">Create your account to request medical consultation.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <input className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="Full name" />
          <input className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="Email address" />
          <input className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="Phone number" />
          <input className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="Password" type="password" />
          <input className="rounded-2xl border border-slate-300 px-4 py-3 md:col-span-2" placeholder="Address" />
        </div>

        <button className="mt-6 rounded-2xl bg-teal-600 px-6 py-3 font-bold text-white hover:bg-teal-700">
          Create Account
        </button>
      </div>
    </section>
  );
}

export default Register;