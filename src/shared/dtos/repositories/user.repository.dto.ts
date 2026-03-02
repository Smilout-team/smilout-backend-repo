export interface CreateUserParams {
  name: string;
  email: string;
  phoneNumber: string;
  passwordHash: string;
}

export interface UpdateUserParams {
  id: string;
  name?: string;
  passwordHash?: string;
  avatarUrl?: string;
}

export interface SearchUserParams {
  keyword: string;
  page: number;
  limit: number;
}
