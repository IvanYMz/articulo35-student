const API_BASE = import.meta.env.PUBLIC_API_BASE_URL;

export const API_ROUTES = {
  STUDENT_SEND_REQUEST: `${API_BASE}/api/student_info/send_request`,
  AUTH_SIGNOUT: `${API_BASE}/api/auth/signout`,
  STUDENT_SUBJECTS: `${API_BASE}/api/student_info/subjects`,
  STUDENT_FILES: `${API_BASE}/api/student_info/student_files`,
  UPDATE_FILES: `${API_BASE}/api/student_info/update_files`,
  STUDENT_INFORMATION: `${API_BASE}/api/student_info/student_information`,

  // If signin by fetch is required
  AUTH_SIGNIN: `${API_BASE}/api/auth/signin`
};
