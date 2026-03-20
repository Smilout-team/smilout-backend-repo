export interface AuthRequestDto {
  name?: string;
  email: string;
  password: string;
  passwordConfirmation?: string;
  phoneNumber: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface GoogleAuthRequestDto {
  authCode: string;
  ipAddress: string;
  userAgent: string;
}
