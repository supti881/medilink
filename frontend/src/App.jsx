import "./App.css";

function App() {
  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-teal-700">MediLink</h1>
            <p className="text-sm text-slate-500">Telemedicine Healthcare System</p>
          </div>

          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#" className="hover:text-teal-700">Home</a>
            <a href="#" className="hover:text-teal-700">Doctors</a>
            <a href="#" className="hover:text-teal-700">Services</a>
            <a href="#" className="hover:text-teal-700">Contact</a>
          </div>

          <button className="rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700">
            Login
          </button>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 md:grid-cols-2">
        <div>
          <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-700">
            Secure Online Medical Consultation
          </span>

          <h2 className="mt-6 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            Book doctors, manage appointments, and get digital prescriptions online.
          </h2>

          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            MediLink helps patients register, verify accounts, find specialist doctors,
            book consultation slots, track consultation status, and download digital prescriptions.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button className="rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-teal-700">
              Book Appointment
            </button>
            <button className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:border-teal-600 hover:text-teal-700">
              View Doctors
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 p-6 text-white">
            <p className="text-sm font-medium text-teal-50">Today&apos;s Overview</p>
            <h3 className="mt-3 text-3xl font-bold">Patient Care Dashboard</h3>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/15 p-4">
                <p className="text-sm text-teal-50">Doctors</p>
                <p className="mt-2 text-3xl font-bold">24</p>
              </div>
              <div className="rounded-2xl bg-white/15 p-4">
                <p className="text-sm text-teal-50">Appointments</p>
                <p className="mt-2 text-3xl font-bold">128</p>
              </div>
              <div className="rounded-2xl bg-white/15 p-4">
                <p className="text-sm text-teal-50">Prescriptions</p>
                <p className="mt-2 text-3xl font-bold">87</p>
              </div>
              <div className="rounded-2xl bg-white/15 p-4">
                <p className="text-sm text-teal-50">Support Tickets</p>
                <p className="mt-2 text-3xl font-bold">09</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;