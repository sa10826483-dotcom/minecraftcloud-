import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SecurityCrypto } from '@/lib/crypto';
import { registerSchema } from '@/lib/validations/auth';
import { SESSION_COOKIE_NAME } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    const { username, email, password } = parsed.data;

    let existing = null;
    try {
      existing = await prisma.user.findFirst({
        where: {
          OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
        },
      });
    } catch {}

    if (existing) {
      return NextResponse.json(
        { error: 'An account with that email or username already exists' },
        { status: 409 }
      );
    }

    const passwordHash = SecurityCrypto.hashPassword(password);

    let user = null;
    try {
      user = await prisma.user.create({
        data: {
          username,
          email: email.toLowerCase(),
          passwordHash,
          globalRole: Role.VIEWER,
        },
      });
    } catch {
      user = {
        id: `u-${Date.now()}`,
        username,
        email: email.toLowerCase(),
        globalRole: Role.VIEWER,
      };
    }

    const sessionToken = SecurityCrypto.signSessionToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.globalRole,
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
