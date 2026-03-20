import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const otpTemplate = (otp: string) => `
<div style="font-family:Arial,sans-serif;background:#f6f9fc;padding:24px">
  <div style="max-width:480px;margin:auto;background:white;padding:32px;border-radius:12px">
    <h2 style="margin-top:0">Khôi phục mật khẩu</h2>
    <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Smilout.</p>
    <p>Mã OTP của bạn là:</p>
    <div style="
      font-size:32px;
      font-weight:bold;
      letter-spacing:8px;
      text-align:center;
      margin:24px 0;
      color:#2563eb;
    ">
      ${otp}
    </div>
    <p>Mã có hiệu lực trong <b>1 phút</b>.</p>
    <p style="color:#6b7280;font-size:13px">
      Nếu bạn không yêu cầu, hãy bỏ qua email này.
    </p>
  </div>
</div>
`;

const mailService = {
  sendResetPasswordOtp: async (email: string, otp: string) => {
    await transporter.sendMail({
      from: `"Smilout Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Khôi phục mật khẩu Smilout',
      html: otpTemplate(otp),
    });
  },
};

export default mailService;
