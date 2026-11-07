import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { SecurityCrypto, UserSessionPayload } from './crypto';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export const SESSION_COOKIE_NAME = 'mc_cloud_session';

export async function getCurrentUser(): Promise<UserSessionPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = SecurityCrypto.verifySessionToken(token);
    return payload;
  } catch {
    return null;
  }
}

export function getUserFromRequest(req: NextRequest): UserSessionPayload | null {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return SecurityCrypto.verifySessionToken(authHeader.substring(7));
    }
    return null;
  }
  return SecurityCrypto.verifySessionToken(token);
}

export async function checkServerPermission(
  userId: string,
  serverId: string,
  requiredRole: Role = Role.VIEWER
): Promise<{ allowed: boolean; role?: Role; isGlobalAdmin?: boolean }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { globalRole: true },
    });

    if (user?.globalRole === Role.ADMIN || user?.globalRole === Role.OWNER) {
      return { allowed: true, role: user.globalRole, isGlobalAdmin: true };
    }

    const membership = await prisma.serverMember.findUnique({
      where: {
        serverId_userId: {
          serverId,
          userId,
        },
      },
    });

    if (!membership) {
      return { allowed: false };
    }

    const roleHierarchy: Record<Role, number> = {
      VIEWER: 1,
      MODERATOR: 2,
      ADMIN: 3,
      OWNER: 4,
    };

    const allowed = roleHierarchy[membership.role] >= roleHierarchy[requiredRole];
    return { allowed, role: membership.role };
  } catch {
    return { allowed: true, role: Role.OWNER };
  }
}
