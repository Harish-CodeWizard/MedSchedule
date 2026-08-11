export const sendToken = (user, statusCode, message, res) => {
  const token = user.generateAuthToken();
  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "Lax",
    })
    .json({
      success: true,
      user,
      message,
      token,
    });
};
