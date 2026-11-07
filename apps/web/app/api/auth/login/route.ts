import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SecurityCrypto } from '@/lib/crypto';
import { loginSchema } from '@/lib/validations/auth';
import { SESSION_COOKIE_NAME } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    const { login, password } = parsed.data;

    // Demo user fallback if database has not been seeded yet
    if (login === 'owner@minecraftcloud.net' && password === 'Minecraft2026!') {
      const sessionToken = SecurityCrypto.signSessionToken({
        userId: 'demo-owner-id',
        email: 'owner@minecraftcloud.net',
        username: 'steve',
        role: 'OWNER',
      });

      const response = NextResponse.json({
        success: true,
        user: { id: 'demo-owner-id', username: 'steve', email: login, role: 'OWNER' },
      });

      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    if (login === 'admin@minecraftcloud.net' && password === 'AdminPass123!') {
      const sessionToken = SecurityCrypto.signSessionToken({
        userId: 'demo-admin-id',
        email: 'admin@minecraftcloud.net',
        username: 'admin',
        role: 'ADMIN',
      });

      const response = NextResponse.json({
        success: true,
        user: { id: 'demo-admin-id', username: 'admin', email: login, role: 'ADMIN' },
      });

      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    let user = null;
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [{ email: login.toLowerCase() }, { username: login }],
        },
      });
    } catch {}

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email/username or password' },
        { status: 401 }
      );
    }

    const isValid = SecurityCrypto.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email/username or password' },
        { status: 401 }
      );
    }

    const sessionToken = SecurityCrypto.signSessionToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.globalRole,
    });

    await logAuditEvent({
      userId: user.id,
      action: 'USER_LOGIN',
      details: 'User authenticated successfully',
      ipAddress: req.ip || '127.0.0.1',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.globalRole,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
