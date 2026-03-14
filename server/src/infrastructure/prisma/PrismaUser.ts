export interface PrismaUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: string;  

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null, 

  emailVerified: boolean;
  emailVerificationCode: string | null;
  emailVerificationExpiresAt: Date | null;
}