import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';

interface SignupInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private readonly SALT_ROUNDS = 12;

  async signup(input: SignupInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new AppError('Email already in use', 409);

    const hashed = await bcrypt.hash(input.password, this.SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, password: hashed },
      select: { id: true, name: true, email: true, plan: true, createdAt: true },
    });

    const tokens = await this.generateTokens(user.id);
    return { user, ...tokens };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const tokens = await this.generateTokens(user.id);
    const { password: _, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  }

  async refreshTokens(token: string): Promise<TokenPair> {
    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await prisma.refreshToken.delete({ where: { token } });
      throw new AppError('Invalid or expired refresh token', 401);
    }

    try {
      jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }

    await prisma.refreshToken.delete({ where: { token } });
    return this.generateTokens(stored.userId);
  }

  async logout(token: string) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, avatar: true, bio: true,
        targetRoles: true, skills: true, linkedinUrl: true, githubUrl: true,
        portfolioUrl: true, plan: true, createdAt: true,
        _count: { select: { applications: true, resumes: true } },
      },
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  private async generateTokens(userId: string): Promise<TokenPair> {
    const accessToken = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { id: userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({ data: { userId, token: refreshToken, expiresAt } });
    return { accessToken, refreshToken };
  }
}
