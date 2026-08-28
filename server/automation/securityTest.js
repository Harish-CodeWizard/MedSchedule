// server/automation/securityTest.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { app } from '../index.js';
import connectDB from '../database/dbConnection.js';
import User from '../models/userModel.js';
import Patient from '../models/PatientModel.js';

// Mock nodemailer to prevent SMTP credentials errors
nodemailer.createTransport = () => {
  return {
    sendMail: async (options) => {
      console.log(`[MOCK EMAIL] Sent verification email to: ${options.to}`);
      return { messageId: 'mock-id-12345' };
    }
  };
};

dotenv.config();

const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}`;

// Test configuration
const TEST_USERS = [
  { name: 'SecTest Admin', email: 'sectest_admin@test.com', password: 'password123', role: 'Admin', uniqueId: process.env.ADMIN || 'admin-unique-id' },
  { name: 'SecTest Reception', email: 'sectest_reception@test.com', password: 'password123', role: 'Reception', uniqueId: process.env.RECEPTION || 'reception-unique-id' },
  { name: 'SecTest Doctor', email: 'sectest_doctor@test.com', password: 'password123', role: 'Doctor', uniqueId: process.env.DOCTOR || 'doctor-unique-id' },
  { name: 'SecTest Lab', email: 'sectest_lab@test.com', password: 'password123', role: 'Lab', uniqueId: process.env.LAB || 'lab-unique-id' },
  { name: 'SecTest XRay', email: 'sectest_xray@test.com', password: 'password123', role: 'X-Ray', uniqueId: process.env.XRAY || 'xray-unique-id' },
  { name: 'SecTest Pharmacy', email: 'sectest_pharmacy@test.com', password: 'password123', role: 'Pharmacy', uniqueId: process.env.PHARMACY || 'pharmacy-unique-id' },
  { name: 'SecTest Patient', email: 'sectest_patient@test.com', password: 'password123', role: 'Patient', uniqueId: 'sectest-patient-uuid-123' },
];

let server;
let dbConn;
const tokens = {};
const userIds = {};

async function setup() {
  console.log('=== Setting Up Test Environment ===');
  
  // 1. Connect DB
  dbConn = await connectDB();
  
  // 2. Start temporary server
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Test server running on ${BASE_URL}`);
  });

  // 3. Clean up any existing test accounts from previous runs
  const emails = TEST_USERS.map(u => u.email);
  await User.deleteMany({ email: { $in: emails } });
  await Patient.deleteMany({ uniqueID: 'sectest-patient-uuid-123' });
  console.log('Cleared old test records.');

  // 4. Create required Patient record for patient registration uniqueID check
  const patient = new Patient({
    name: 'SecTest Patient Record',
    uniqueID: 'sectest-patient-uuid-123',
    age: 30,
    gender: 'Male'
  });
  await patient.save();
  console.log('Created temporary Patient record.');

  // 5. Register and login each user
  for (const tu of TEST_USERS) {
    console.log(`Registering role: ${tu.role}...`);
    
    // Register
    const regRes = await fetch(`${BASE_URL}/api/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tu)
    });
    
    const regData = await regRes.json();
    if (!regRes.ok) {
      throw new Error(`Failed to register ${tu.role}: ${regData.message}`);
    }

    // Programmatically verify the user in database to bypass email code verification
    const dbUser = await User.findOne({ email: tu.email });
    if (!dbUser) {
      throw new Error(`User ${tu.role} not found in DB after registration`);
    }
    dbUser.verified = true;
    dbUser.verificationToken = undefined;
    await dbUser.save({ validateBeforeSave: false });
    
    userIds[tu.role] = dbUser._id.toString();

    // Login to get token
    const loginRes = await fetch(`${BASE_URL}/api/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: tu.email, password: tu.password })
    });
    
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      throw new Error(`Failed to login ${tu.role}: ${loginData.message}`);
    }
    
    tokens[tu.role] = loginData.token;
    console.log(`Success: Registered, verified, and logged in user for role: ${tu.role}`);
  }
}

async function runTests() {
  console.log('\n=== Running Test Cases ===');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // Helper to make API requests with optional authentication
  async function makeRequest(path, method, roleToken = null, headers = {}) {
    const requestHeaders = { ...headers };
    if (roleToken) {
      requestHeaders['Authorization'] = `Bearer ${roleToken}`;
    }
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: requestHeaders
      });
      const data = await response.json().catch(() => ({}));
      return { status: response.status, data };
    } catch (err) {
      return { status: 500, error: err.message };
    }
  }

  // Test Case 1: Every Role Access Authorization
  console.log('\n--- 1. Testing Authorized Access for Every Role ---');
  
  // Admin & Reception access to Admin/Reception dashboard route
  const adminGetUsers = await makeRequest('/api/user/getAllUsers', 'GET', tokens['Admin']);
  assert(adminGetUsers.status === 200, `Admin should access getAllUsers (status ${adminGetUsers.status})`);
  
  const recepGetUsers = await makeRequest('/api/user/getAllUsers', 'GET', tokens['Reception']);
  assert(recepGetUsers.status === 200, `Reception should access getAllUsers (status ${recepGetUsers.status})`);

  // Doctor access to patient list route
  const doctorGetPatients = await makeRequest('/api/patient/', 'GET', tokens['Doctor']);
  assert(doctorGetPatients.status === 200, `Doctor should access patient list (status ${doctorGetPatients.status})`);

  // Lab access to lab records
  const labGetRecords = await makeRequest('/api/lab/', 'GET', tokens['Lab']);
  assert(labGetRecords.status === 200, `Lab should access lab records (status ${labGetRecords.status})`);

  // X-Ray access to xray records
  const xrayGetRecords = await makeRequest('/api/xray/', 'GET', tokens['X-Ray']);
  assert(xrayGetRecords.status === 200, `X-Ray should access xray records (status ${xrayGetRecords.status})`);

  // Pharmacy access to patient records success list
  const pharmaGetPatients = await makeRequest('/api/patient/data', 'GET', tokens['Pharmacy']);
  assert(pharmaGetPatients.status === 200, `Pharmacy should access prescriptions data (status ${pharmaGetPatients.status})`);

  // Patient access to patient profile
  const patientMe = await makeRequest('/api/user/me', 'GET', tokens['Patient']);
  assert(patientMe.status === 200, `Patient should access self profile /me (status ${patientMe.status})`);


  // Test Case 2: Unauthorized Access (Wrong Role)
  console.log('\n--- 2. Testing Unauthorized Access (Role Mismatch) ---');

  // Patient access to Admin-only route
  const patientGetUsers = await makeRequest('/api/user/getAllUsers', 'GET', tokens['Patient']);
  assert(patientGetUsers.status === 403, `Patient should be blocked from Admin routes (status ${patientGetUsers.status}, expected 403)`);

  // Doctor access to Lab-only write route (deleteLabRecord)
  const doctorDeleteLab = await makeRequest('/api/lab/fake-id', 'DELETE', tokens['Doctor']);
  assert(doctorDeleteLab.status === 403, `Doctor should be blocked from deleting lab records (status ${doctorDeleteLab.status}, expected 403)`);

  // Lab access to X-Ray Walk-in routes
  const labWalkin = await makeRequest('/api/xray/walkin/all', 'GET', tokens['Lab']);
  assert(labWalkin.status === 403, `Lab technician should be blocked from X-Ray walkin records (status ${labWalkin.status}, expected 403)`);

  // Pharmacy access to xray records
  const pharmacyXrays = await makeRequest('/api/xray/', 'GET', tokens['Pharmacy']);
  assert(pharmacyXrays.status === 403, `Pharmacy should be blocked from X-Ray records (status ${pharmacyXrays.status}, expected 403)`);


  // Test Case 3: Unauthorized Access (No Authentication)
  console.log('\n--- 3. Testing Unauthenticated Access ---');
  
  const guestMe = await makeRequest('/api/user/me', 'GET', null);
  assert(guestMe.status === 401, `Guest should be blocked from self profile /me (status ${guestMe.status}, expected 401)`);
  assert(guestMe.data.message === 'User is not authenticated.', 'Guest message should be "User is not authenticated."');

  const guestGetPatients = await makeRequest('/api/patient/', 'GET', null);
  assert(guestGetPatients.status === 401, `Guest should be blocked from patient list (status ${guestGetPatients.status}, expected 401)`);


  // Test Case 4: Invalid Authentication (Malformed JWT)
  console.log('\n--- 4. Testing Invalid Authentication (Malformed Token) ---');
  
  const invalidToken = 'not.a.valid.jwt.token';
  const malformedRequest = await makeRequest('/api/user/me', 'GET', invalidToken);
  assert(malformedRequest.status === 400, `Malformed token should return 400 Bad Request (status ${malformedRequest.status}, expected 400)`);
  assert(malformedRequest.data.message === 'Json Web Token is invalid, Try again.', 'Malformed token message should verify JWT invalidity');


  // Test Case 5: Expired Authentication (Expired JWT)
  console.log('\n--- 5. Testing Expired Authentication (Expired Token) ---');

  // Sign an expired token using secret
  const expiredToken = jwt.sign(
    {
      id: userIds['Doctor'],
      email: TEST_USERS.find(u => u.role === 'Doctor').email,
      role: 'Doctor',
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: '-10s', // Expired 10 seconds ago
    }
  );

  const expiredRequest = await makeRequest('/api/user/me', 'GET', expiredToken);
  assert(expiredRequest.status === 400, `Expired token should return 400 Bad Request (status ${expiredRequest.status}, expected 400)`);
  assert(expiredRequest.data.message === 'Json Web Token is expired, Try again.', 'Expired token message should verify expiration');

  // Test Case 6: Patient Cross-Resource Unauthorized Access
  console.log('\n--- 6. Testing Patient Cross-Resource Unauthorized Access (Cross-Patient Block) ---');

  // 1. Create Patient B record
  const patientB = new Patient({
    name: 'SecTest Patient B',
    uniqueID: 'sectest-patient-b-uuid',
    age: 25,
    gender: 'Female'
  });
  await patientB.save();

  // Try to access Patient B details with Patient A (role: Patient) token
  const patientAccessOther = await makeRequest(`/api/patient/${patientB._id}`, 'GET', tokens['Patient']);
  assert(patientAccessOther.status === 403, `Patient A should be blocked from GET Patient B details (status ${patientAccessOther.status}, expected 403)`);

  const patientUpdateOther = await makeRequest(`/api/patient/${patientB._id}`, 'PUT', tokens['Patient'], {
    'Content-Type': 'application/json'
  });
  assert(patientUpdateOther.status === 403, `Patient A should be blocked from PUT Patient B details (status ${patientUpdateOther.status}, expected 403)`);

  const patientGetUniqueOther = await makeRequest(`/api/patient/unique/sectest-patient-b-uuid`, 'GET', tokens['Patient']);
  assert(patientGetUniqueOther.status === 403, `Patient A should be blocked from GET Patient B by unique ID (status ${patientGetUniqueOther.status}, expected 403)`);

  // Clean up Patient B
  await Patient.deleteOne({ _id: patientB._id });

  console.log(`\n=== Tests Complete ===`);
  console.log(`Passed assertions: ${passed}`);
  console.log(`Failed assertions: ${failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

async function cleanup() {
  console.log('\n=== Cleaning Up Test Environment ===');
  try {
    const emails = TEST_USERS.map(u => u.email);
    await User.deleteMany({ email: { $in: emails } });
    await Patient.deleteMany({ uniqueID: 'sectest-patient-uuid-123' });
    console.log('Cleaned up test users and test patients.');
  } catch (err) {
    console.error('Error during cleanup:', err);
  }

  if (server) {
    server.close();
    console.log('Test server closed.');
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('Mongoose connection closed.');
  }
}

async function main() {
  try {
    await setup();
    await runTests();
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exitCode = 1;
  } finally {
    await cleanup();
  }
}

main();
