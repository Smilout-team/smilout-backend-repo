export const AUTH_MESSAGES = {
  EMAIL_ALREADY_EXISTS: 'Email đã tồn tại',
  INVALID_EMAIL_OR_PASSWORD: 'Email hoặc mật khẩu không hợp lệ',
  INVALID_GOOGLE_ACCOUNT:
    'Tài khoản Google không hợp lệ, chỉ cho phép passerellesnumeriques.org',
  SUCCESSFUL_GOOGLE_AUTHENTICATION: 'Xác thực bằng Google thành công',
  SUCCESSFUL_EMAIL_AUTHENTICATION: 'Xác thực bằng email thành công',
  USER_REGISTERED_SUCCESSFULLY: 'Đăng ký người dùng thành công',
  USER_SIGNED_OUT_SUCCESSFULLY: 'Đăng xuất thành công',
  INVALID_TOKEN: 'Token không hợp lệ',
  TOKEN_EXPIRED: 'Token đã hết hạn',
  SESSION_EXPIRED_PLEASE_SIGN_IN_AGAIN:
    'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
  USER_PROFILE_RETRIEVED_SUCCESSFULLY:
    'Lấy thông tin hồ sơ người dùng thành công',
  PHONE_NUMBER_ALREADY_EXISTS: 'Số điện thoại đã tồn tại',
  USER_NOT_FOUND: 'Người dùng không tồn tại',
  OTP_SENT_IF_EMAIL_EXISTS: 'Nếu email tồn tại, mã OTP đã được gửi',
  OTP_REQUEST_TOO_FREQUENTLY: 'Vui lòng đợi 60 giây trước khi yêu cầu mã mới',
  INVALID_OTP: 'Mã OTP không hợp lệ hoặc đã hết hạn',
  OTP_VERIFIED_SUCCESSFULLY: 'Xác thực OTP thành công',
  PASSWORD_RESET_SUCCESSFULLY: 'Đặt lại mật khẩu thành công',
} as const;
