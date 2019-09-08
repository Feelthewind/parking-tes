export interface IJwtPayload {
  email: string;
  provider: string;
  thirdPartyID: string;
  expiresIn: number;
}
