import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UploadCloud,
  UserRound,
} from "lucide-react";

const checklist = [
  "Patient profile creation",
  "OTP email verification",
  "Clinical document upload",
  "Consultation application access",
];

function Register() {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl shadow-slate-200">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-teal-200">
          <ShieldCheck className="h-4 w-4" />
          Patient Onboarding
        </div>

        <h2 className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-5xl">
          Create your MediLink patient account.
        </h2>

        <p className="mt-5 leading-8 text-slate-300">
          Register once, verify your email with OTP, upload required medical
          records, and access the full consultation workflow.
        </p>

        <div className="mt-8 space-y-4">
          {checklist.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
              <CheckCircle2 className="h-5 w-5 text-teal-300" />
              <p className="font-bold text-slate-100">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl bg-teal-500 p-5">
          <p className="text-sm font-bold text-teal-50">Next verification step</p>
          <p className="mt-2 text-2xl font-black">Email OTP Confirmation</p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <h3 className="text-3xl font-black text-slate-950">Patient Registration</h3>
          <p className="mt-2 text-slate-600">
            Fill in patient details to start your secure consultation application.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <label>
            <span className="text-sm font-bold text-slate-700">Full Name</span>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-3 focus-within:border-teal-500">
              <UserRound className="h-5 w-5 text-teal-600" />
              <input className="w-full outline-none" placeholder="Mst. Sharmin Akter" />
            </div>
          </label>

          <label>
            <span className="text-sm font-bold text-slate-700">Email Address</span>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-3 focus-within:border-teal-500">
              <Mail className="h-5 w-5 text-teal-600" />
              <input className="w-full outline-none" placeholder="patient@email.com" />
            </div>
          </label>

          <label>
            <span className="text-sm font-bold text-slate-700">Phone Number</span>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-3 focus-within:border-teal-500">
              <Phone className="h-5 w-5 text-teal-600" />
              <input className="w-full outline-none" placeholder="+8801XXXXXXXXX" />
            </div>
          </label>

          <label>
            <span className="text-sm font-bold text-slate-700">Blood Group</span>
            <select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500">
              <option>Select blood group</option>
              <option>A+</option>
              <option>B+</option>
              <option>O+</option>
              <option>AB+</option>
            </select>
          </label>

          <label className="md:col-span-2">
            <span className="text-sm font-bold text-slate-700">Address</span>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-3 focus-within:border-teal-500">
              <MapPin className="h-5 w-5 text-teal-600" />
              <input className="w-full outline-none" placeholder="Sylhet, Bangladesh" />
            </div>
          </label>

          <label className="md:col-span-2">
            <span className="text-sm font-bold text-slate-700">Health Issue Summary</span>
            <div className="mt-2 flex items-start gap-3 rounded-2xl border border-slate-300 px-4 py-3 focus-within:border-teal-500">
              <FileText className="mt-1 h-5 w-5 text-teal-600" />
              <textarea
                className="min-h-24 w-full outline-none"
                placeholder="Describe your primary health problem..."
              />
            </div>
          </label>

          <div className="md:col-span-2 rounded-3xl border border-dashed border-teal-300 bg-teal-50 p-5">
            <div className="flex items-center gap-3">
              <UploadCloud className="h-6 w-6 text-teal-700" />
              <div>
                <p className="font-black text-slate-950">Upload Medical Documents</p>
                <p className="text-sm text-slate-600">PDF, JPG, PNG files for doctor review</p>
              </div>
            </div>
          </div>
        </div>

        <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 py-4 font-black text-white hover:bg-teal-700">
          Continue to OTP Verification
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}

export default Register;