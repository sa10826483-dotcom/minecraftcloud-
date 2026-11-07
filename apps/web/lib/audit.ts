import prisma from '@/lib/prisma';

export async function logAuditEvent(params: {
  serverId?: string;
  userId?: string;
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        serverId: params.serverId,
        userId: params.userId,
        action: params.action,
        details: params.details,
        ipAddress: params.ipAddress || 'unknown',
        userAgent: params.userAgent || 'unknown',
      },
    });
  } catch {
    // Non-fatal if DB not yet migrated
  }
}
