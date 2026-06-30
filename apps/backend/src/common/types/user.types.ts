export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export type PublicUser = Pick<User, 'id' | 'name' | 'email'>;

export interface JwtUserPayload {
  sub: string;
  email: string;
  name: string;
}
