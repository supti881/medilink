const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const getToken = () => {
  return localStorage.getItem("medilink_token");
};

const setToken = (token) => {
  localStorage.setItem("medilink_token", token);
};

const removeToken = () => {
  localStorage.removeItem("medilink_token");
};

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const text = await response.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
};

const uploadRequest = async (endpoint, formData) => {
  const token = getToken();

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });

  const text = await response.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(data.message || `Upload failed (${response.status})`);
  }

  return data;
};

export const authApi = {
  register: async (payload) => {
    const isFormData =
      typeof FormData !== "undefined" && payload instanceof FormData;

    return request("/auth/register", {
      method: "POST",
      body: isFormData ? payload : JSON.stringify(payload),
    });
  },

  login: async (payload) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (data.token) {
      setToken(data.token);
    }

    return data;
  },

  verifyOtp: async (payload) => {
    return request("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getMe: async () => {
    return request("/auth/me");
  },

  updateProfile: async (payload) => {
    return request("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  getAdminPatients: async () => {
    return request("/auth/admin/patients");
  },

  updatePatientStatus: async (patientId, payload) => {
    return request(`/auth/admin/patients/${patientId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  updatePatientProfile: async (patientId, payload) => {
    return request(`/auth/admin/patients/${patientId}/profile`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  logout: async () => {
    const data = await request("/auth/logout", {
      method: "POST",
    });

    removeToken();

    return data;
  },
};

export const doctorApi = {
  getAll: async () => {
    return request("/doctors");
  },

  getMyProfile: async () => {
    return request("/doctors/me");
  },

  updateMyProfile: async (payload) => {
    return request("/doctors/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  getById: async (doctorId) => {
    return request(`/doctors/${doctorId}`);
  },

  getAdminDoctors: async () => {
    return request("/doctors/admin/all");
  },

  updateDoctorStatus: async (doctorId, payload) => {
    return request(`/doctors/admin/${doctorId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};

export const appointmentApi = {
  book: async (payload) => {
    return request("/appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getMyAppointments: async () => {
    return request("/appointments/my");
  },

  getDoctorAppointments: async () => {
    return request("/appointments/doctor");
  },

  updateStatus: async (appointmentId, payload) => {
    return request(`/appointments/${appointmentId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};

export const prescriptionApi = {
  create: async (payload) => {
    return request("/prescriptions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getMyPrescriptions: async () => {
    return request("/prescriptions/my");
  },

  verify: async (token) => {
    return request(`/prescriptions/verify/${token}`);
  },
};

export const paymentApi = {
  createMockPayment: async (payload) => {
    return request("/payments/mock", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getMyPayments: async () => {
    return request("/payments/my");
  },

  getById: async (paymentId) => {
    return request(`/payments/${paymentId}`);
  },

  getDoctorPaymentSummary: async () => {
    return request("/payments/doctor/summary");
  },

  createPayoutRequest: async (payload) => {
    return request("/payments/doctor/payout-request", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getMyPayoutRequests: async () => {
    return request("/payments/doctor/payout-requests");
  },

  getAllPayoutRequests: async () => {
    return request("/payments/admin/payout-requests");
  },

  updatePayoutRequestStatus: async (payoutRequestId, payload) => {
    return request(`/payments/admin/payout-requests/${payoutRequestId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};

export const supportTicketApi = {
  create: async (payload) => {
    return request("/support-tickets", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getMyTickets: async () => {
    return request("/support-tickets/my");
  },

  getAllTickets: async () => {
    return request("/support-tickets");
  },

  update: async (ticketId, payload) => {
    return request(`/support-tickets/${ticketId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};

export const replacementRequestApi = {
  create: async (payload) => {
    return request("/replacement-requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getMyRequests: async () => {
    return request("/replacement-requests/my");
  },

  getAllRequests: async () => {
    return request("/replacement-requests");
  },

  update: async (requestId, payload) => {
    return request(`/replacement-requests/${requestId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};

export const uploadApi = {
  uploadDoctorPhoto: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    return uploadRequest("/uploads/doctor-photo", formData);
  },
};

export const medicalRecordApi = {
  upload: async (formData) => {
    return uploadRequest("/medical-records", formData);
  },

  getMyRecords: async () => {
    return request("/medical-records/my");
  },

  getPatientRecords: async (patientId) => {
    return request(`/medical-records/patient/${patientId}`);
  },

  archive: async (recordId) => {
    return request(`/medical-records/${recordId}/archive`, {
      method: "PATCH",
    });
  },
};

export const tokenService = {
  getToken,
  setToken,
  removeToken,
};