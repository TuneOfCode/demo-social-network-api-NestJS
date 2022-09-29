export interface ILoginUser {
  email: string;
  password: string;
}

export interface IAuthCookie {
  id?: string;
  accessToken?: string;
  refreshToken?: string;
}
