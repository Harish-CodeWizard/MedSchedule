# Modular Component Refactoring Architecture

## 1. Objectives & Safety Guarantees
Refactor large, monolithic page views into modular, reusable, single-responsibility components without breaking any behavior, styles, or APIs.
Every extracted component will:
- Maintain exact identical prop contracts and state mutations.
- Pass strict ESLint checks.
- Pass `npm run build` production bundling.
- Prevent regression in UI styles (Tailwind / DaisyUI).

## 2. Extraction Targets

### Phase 1: Reception Modals & Subcomponents (`src/pages/Dashboards/Reception.jsx`)
Currently ~1516 lines, containing 4 large modals and print logic in a single file:
1. `src/components/reception/PatientDetailsModal.jsx`
   - Props: `patient`, `isOpen`, `onClose`, `onEdit`, `onEditAppointment`, `onExportData`, `getDoctorName`
2. `src/components/reception/AppointmentEditModal.jsx`
   - Props: `isOpen`, `patient`, `appointmentForm`, `onFormChange`, `onSubmit`, `onClose`, `onRemove`, `doctors`
3. `src/components/reception/EditPatientModal.jsx`
   - Props: `isOpen`, `formData`, `onFormChange`, `onSubmit`, `onClose`, `genders`, `bloodGroups`
4. `src/components/reception/DeleteConfirmModal.jsx`
   - Props: `isOpen`, `patient`, `onConfirm`, `onClose`
5. `src/components/common/InfoRow.jsx`
   - Reusable key-value row display across dashboards.

### Phase 2: Doctor Dashboard Modals & Subcomponents (`src/pages/Dashboards/Doctor.jsx`)
Currently ~1373 lines:
1. `src/components/doctor/DoctorPatientCard.jsx` or table row components.
2. `src/components/doctor/DoctorStatsOverview.jsx`
   - Clean summary card display.

### Phase 3: Admin Dashboard Tab Views (`src/pages/Dashboards/Admin.jsx`)
Currently ~833 lines:
1. `src/components/admin/AdminStatsCards.jsx`
2. `src/components/admin/AdminUsersTab.jsx`
3. `src/components/admin/AdminOverviewTab.jsx`

## 3. Verification Plan
- `npm run lint` - 0 errors
- `npm run build` - clean production build
- Visual & functional verification
