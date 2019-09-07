export interface JwtPayload {
  email: string;
}

export interface SocialJwtPayload {
  provider: string;
  thirdPartyId: string;
}
