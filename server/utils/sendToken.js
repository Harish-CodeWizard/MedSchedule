import jwt from 'jsonwebtoken';

export const sendToken = (user, statusCode, message, res) => {
  const token =
    typeof user.generateAuthToken === 'function'
      ? user.generateAuthToken()
      : jwt.sign(
          {
            id: user._id,
            email: user.email,
            role: user.role,
          },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: process.env.JWT_EXPIRE || '7d',
          }
        );

  res
    .status(statusCode)
    .cookie('token', token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'Lax',
    })
    .json({
      success: true,
      user,
      message,
      token,
    });
};
