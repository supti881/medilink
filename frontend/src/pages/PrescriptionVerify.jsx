function PrescriptionVerify() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-3xl font-black text-slate-950">Verify Prescription</h2>
        <p className="mt-2 text-slate-600">Enter a prescription token to verify authenticity.</p>

        <div className="mt-8 flex gap-3">
          <input className="flex-1 rounded-2xl border border-slate-300 px-4 py-3" placeholder="Prescription token" />
          <button className="rounded-2xl bg-teal-600 px-6 py-3 font-bold text-white hover:bg-teal-700">
            Verify
          </button>
        </div>
      </div>
    </section>
  );
}

export default PrescriptionVerify;