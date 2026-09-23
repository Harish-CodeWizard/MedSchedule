export const dashboardPathForRole = (role) => ({
  Admin: '/admin-dashboard',
  Reception: '/reception-dashboard',
  Doctor: '/doctor-dashboard',
  Lab: '/lab-dashboard',
  'X-Ray': '/xray-dashboard',
  Pharmacy: '/pharmacy-dashboard',
  Patient: '/patient-dashboard',
}[role] || '/');
