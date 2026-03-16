import type{ User as PrismaUser, UserRole as PrismaUserRole, Role as PrismaRole } from '@prisma/client';

type UserRoleWithRole = PrismaUserRole & { role: PrismaRole };

export type PrismaUserWithRoles = Omit<PrismaUser, 'roles'> & {
  roles: UserRoleWithRole[];
};

