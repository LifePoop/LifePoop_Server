export const AuthProvider = {
  KAKAO: 'KAKAO',
  APPLE: 'APPLE',
  // NYONG: 'NYONG',
} as const;

export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider];
