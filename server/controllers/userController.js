import {catchAsyncError} from '../middleware/catchAsyncError.js'
import User from '../models/userModel.js';
import ErrorHandler from '../middleware/error.js';
import dotenv from 'dotenv';
dotenv.config();
import nodemailer from "nodemailer";
import { sendToken } from '../utils/sendToken.js';
import Patient from '../models/PatientModel.js';

// REGISTER
export const registerUser = catchAsyncError(async (req, res, next) => {


const { name, email, password,role,uniqueId } = req.body;

if (!name || !email || !password || !role || !uniqueId) {
  return next(new ErrorHandler("All fields required", 400));
}
console.log(name, email, password,role,uniqueId)
const emailRegex = /^\S+@\S+\.\S+$/;
if (!emailRegex.test(email)) {
  return next(new ErrorHandler("Invalid email format", 400));
}



const IDS = {
  Admin: process.env.ADMIN,
  Reception: process.env.RECEPTION,
  Doctor: process.env.DOCTOR,
  Lab: process.env.LAB,
  "X-Ray": process.env.XRAY,
  Pharmacy: process.env.PHARMACY,
};

if (role === "Admin") {
  if (uniqueId !== IDS.Admin) {
    return next(new ErrorHandler("Invalid Admin UniqueID", 400));
  }
} 
else if (role === "Reception") {
  if (uniqueId !== IDS.Reception) {
    return next(new ErrorHandler("Invalid Reception UniqueID", 400));
  }
} 
else if (role === "Doctor") {
  if (uniqueId !== IDS.Doctor) {
    return next(new ErrorHandler("Invalid Doctor UniqueID", 400));
  }
} 
else if (role === "Lab") {
  if (uniqueId !== IDS.Lab) {
    return next(new ErrorHandler("Invalid Lab UniqueID", 400));
  }
} 
else if (role === "X-Ray") {
  if (uniqueId !== IDS["X-Ray"]) {
    return next(new ErrorHandler("Invalid X-Ray UniqueID", 400));
  }
} 
else if (role === "Pharmacy") {
  if (uniqueId !== IDS.Pharmacy) {
    return next(new ErrorHandler("Invalid Pharmacy UniqueID", 400));
  }
} 
else if (role === "Patient") {
    const patient = await Patient.findOne({uniqueID:uniqueId});
 if(!patient){
    return next(new ErrorHandler("Invalid Patient UniqueID", 400));
 }
} 

else {
  return next(new ErrorHandler("Invalid role selected", 400));
}



// Check if email exists at all
let existingUser = await User.findOne({ email });

// If already verified, block
if (existingUser && existingUser.verified) {
  return next(new ErrorHandler("Email is already used.", 400));
}

// If exists but not verified → just update token + password and resend
if (existingUser && !existingUser.verified) {
  existingUser.name = name;
  existingUser.password = password; // will be hashed by pre-save
  existingUser.role = role;
  existingUser.uniqueId = uniqueId;
  const verificationToken = existingUser.generateCode();
  await existingUser.save();

  await sendVerificationEmail(existingUser.email, verificationToken);

  return res.status(200).json({
    success: true,
    message: "Verification code resent to your email.",
  });
}

// Otherwise, create new user
const newUser = new User({ name, email, password, role, uniqueId});
const verificationToken = newUser.generateCode();
await newUser.save();
await sendVerificationEmail(newUser.email, verificationToken);

res.status(201).json({
  success: true,
  message:
    "User registered successfully. Please check your email for verification.",
});

});

// SEND VERIFICATION EMAIL
const sendVerificationEmail = async (email, verificationToken) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const mailOptions = {
  from: process.env.MAIL_FROM || `"Hospital" <${process.env.SMTP_USER}>`,
  to: email,
  subject: "✨ Verify your email address",
 html: `
     <div style="font-family: Arial, sans-serif; background-color:#f4f4f4; padding:30px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.1); padding:25px;">
    
    <!-- Header -->
    <div style="text-align:center; margin-bottom:25px;">
      <h1 style="color:#4199c7; margin:0; font-size:32px; font-weight:700;">Hospital</h1>
      <p style="color:#555; font-size:16px; margin-top:6px; font-weight:500;">Secure Email Verification</p>
    </div>

    <!-- Greeting -->
    <p style="font-size:16px; color:#333; margin-bottom:10px;">Hello,</p>
    <p style="font-size:15px; color:#555; line-height:1.7; margin-top:0;">
      We received a request to verify your email address. Please use the following
      <strong style="color:#4199c7;">Valid within Ten Minutes</strong>
      <strong style="color:#4199c7;">verification code</strong>:
    </p>

    <!-- Verification Code -->
    <div style="text-align:center; margin:35px 0;">
      <span style="display:inline-block; background:#4199c7; color:#ffffff; font-size:24px; font-weight:bold; letter-spacing:3px; padding:15px 35px; border-radius:8px;">
        ${verificationToken}
      </span>
    </div>

    <!-- Note -->
    <p style="font-size:14px; color:#777; line-height:1.6; margin-top:0;">
      If you didn’t request this, you can safely ignore this email.
    </p>

    <!-- Footer -->
    <hr style="margin:25px 0; border:none; border-top:1px solid #eee;">
    <p style="font-size:13px; color:#999; text-align:center; margin:0;">
      &copy; ${new Date().getFullYear()} Hospital. All rights reserved.
    </p>
  </div>
</div>

    `,
  text: `Welcome to Hospital! Please verify your email: ${verificationToken}`,
};


  await transporter.sendMail(mailOptions);
};



export const verifyEmail = catchAsyncError(async (req, res, next) => {
    const {code} = req.body;

  // Find user with given token
  const user = await User.findOne({ verificationToken: code });

  if (!user) {
    return next(new ErrorHandler("Invalid verification token", 400));
  }
   if (user.verificationToken !== code) {
    return next(new ErrorHandler("Invalid verification token", 400));
  }
    user.verified = true;
    user.verificationToken = undefined;
    await user.save({ validateBeforeSave: false });


sendToken(user, 200, "successfully.", res);
});




// LOGIN
export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("All fields required", 400));
  }

  // Email format check
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return next(new ErrorHandler("Invalid email format", 400));
  }

  // Only login verified users
  const user = await User.findOne({ email, verified: true }).select(
    "+password"
  );

  if (!user) {
    return next(
      new ErrorHandler("Invalid credentials or email not verified", 400)
    );
  }

  // check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid password ", 400));
  }

  sendToken(user, 200, "User logged in successfully.", res);
});



export const getUserProfile = catchAsyncError(async (req, res, next) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
});



export const logout = catchAsyncError(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });
    res.status(200).json({
        success: true,
        message: "Logged out successfully.",
    });
});





export const forgotPassword = catchAsyncError(async (req, res, next) => {
    const {email} = req.body;
    const user = await User.findOne({email,verified:true});
    if(!user){
        return next(new ErrorHandler("User not found",400))
    };
   
    const verificationToken = await user.generateCode();
    user.verificationToken =verificationToken;
    
    // send verification email
    await sendVerificationEmailForget(user.email, verificationToken);

    await user.save()

res.status(200).json({
    success:true,
    message:"Verify your email"
})

});



// SEND VERIFICATION EMAIL
const sendVerificationEmailForget = async (email, verificationToken) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const mailOptions = {
  from: process.env.MAIL_FROM || `"practice" <${process.env.SMTP_USER}>`,
  to: email,
  subject: "✨ Verify your email address",
 html: `
     <div style="font-family: Arial, sans-serif; background-color:#f4f4f4; padding:30px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.1); padding:25px;">
    
    <!-- Header -->
    <div style="text-align:center; margin-bottom:25px;">
      <h1 style="color:#4199c7; margin:0; font-size:32px; font-weight:700;">Hospital</h1>
      <p style="color:#555; font-size:16px; margin-top:6px; font-weight:500;">Secure Email Verification</p>
    </div>

    <!-- Greeting -->
    <p style="font-size:16px; color:#333; margin-bottom:10px;">Hello,</p>
    <p style="font-size:15px; color:#555; line-height:1.7; margin-top:0;">
      We received a request to verify your email address. Please use the following
      <strong style="color:#4199c7;">verification code</strong>:
    </p>

    <!-- Verification Code -->
    <div style="text-align:center; margin:35px 0;">
      <span style="display:inline-block; background:#4199c7; color:#ffffff; font-size:24px; font-weight:bold; letter-spacing:3px; padding:15px 35px; border-radius:8px;">
        ${verificationToken}
      </span>
    </div>

    <!-- Note -->
    <p style="font-size:14px; color:#777; line-height:1.6; margin-top:0;">
      If you didn’t request this, you can safely ignore this email.
    </p>

    <!-- Footer -->
    <hr style="margin:25px 0; border:none; border-top:1px solid #eee;">
    <p style="font-size:13px; color:#999; text-align:center; margin:0;">
      &copy; ${new Date().getFullYear()} Hospital. All rights reserved.
    </p>
  </div>
</div>

    `,
  text: `Welcome to Hospital! Please verify your email: ${verificationToken}`,
};


  await transporter.sendMail(mailOptions);
};






export const verifyForgot = catchAsyncError(async (req, res, next) => {
    const {code} = req.body;

  // Find user with given token
  const user = await User.findOne({ verificationToken: code })

  if (!user) {
    return next(new ErrorHandler("Invalid verification token", 400));
  }
  if (user.verificationToken !== code) {
    return next(new ErrorHandler("Invalid verification token", 400));
  }
 
  res.status(200).json({ message: "Email verified successfully" });

});


export const newPassword = catchAsyncError(async (req, res, next) => {
    const {password,code} = req.body;
    const user = await User.findOne({verificationToken:code});
    if(!user){
        return next(new ErrorHandler("Invalid token",400))
    };
    user.password = password;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
        success:true,
        message:"Password changed successfully."
    });
});


export const updateUserProfile = catchAsyncError(async (req, res, next) => {
  const {
    name,
    phone,
    address,
    emergencyContact,
    bloodGroup,
    allergies,
    SpecialistDoctor,
    ConsultationCharges,
    ConsultationTime,
    ConsultationTimePerPatient,
    TotalAppointments,
    
    AppointmentStart,
    AppointmentsToday,
    licenseNumber
  } = req.body;

  // req.user comes from auth middleware
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Phone validation (Pakistan)
  if (phone && !/^03\d{9}$/.test(phone)) {
    return next(
      new ErrorHandler("Phone number must be 11 digits and start with 03", 400)
    );
  }

  if (emergencyContact && !/^03\d{9}$/.test(emergencyContact)) {
    return next(
      new ErrorHandler("Emergency contact must be valid", 400)
    );
  }

  // Update only provided fields
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address) user.address = address;
  if (emergencyContact) user.emergencyContact = emergencyContact;
  if (bloodGroup) user.bloodGroup = bloodGroup;
  if (allergies) user.allergies = allergies;
  if (SpecialistDoctor) user.SpecialistDoctor = SpecialistDoctor;
  if (ConsultationCharges) user.ConsultationCharges = ConsultationCharges;
  if (ConsultationTime) user.ConsultationTime = ConsultationTime;
  if (ConsultationTimePerPatient) user.ConsultationTimePerPatient = ConsultationTimePerPatient;
  if (AppointmentStart) user.AppointmentStart = AppointmentStart;
  if (TotalAppointments) user.TotalAppointments = TotalAppointments;
  if (AppointmentsToday) user.AppointmentsToday = AppointmentsToday;
  if (licenseNumber) user.licenseNumber = licenseNumber;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});




export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  if (users.length === 0) {
    return next(new ErrorHandler("No users found", 404));
  }

  res.status(200).json({
    success: true,
    users,
  });
});



//      GET SINGLE USER 
export const getUserById = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});