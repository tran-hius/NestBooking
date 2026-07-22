import { TxClient } from "@/config/prisma";
import {
  Prisma,
  User,
  UserStatus,
  PrismaClient,
} from "../../../../generated/prisma";
import { IUserRepository } from "@/modules/user/interfaces/IUserRepository";

export class UserRepository implements IUserRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private getClient(tx?: TxClient): TxClient | PrismaClient {
    return tx ?? this.prisma;
  }

  findAll(tx?: TxClient): Promise<User[]> {
    return this.getClient(tx).user.findMany({
      where: { deletedAt: null },
      include: { profile: true },
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string, tx?: TxClient): Promise<User | null> {
    return this.getClient(tx).user.findFirst({
      where: { id, deletedAt: null },
      include: { profile: true, agentProfile: true },
    });
  }

  findByEmail(email: string, tx?: TxClient): Promise<User | null> {
    return this.getClient(tx).user.findFirst({
      where: { email, deletedAt: null },
    });
  }

  findByPhone(phone: string, tx?: TxClient): Promise<User | null> {
    return this.getClient(tx).user.findFirst({
      where: {
        deletedAt: null,
        profile: {
          phoneNumber: phone,
        },
      },
      include: { profile: true },
    });
  }

  findByEmailOrPhone(
    email: string,
    phoneNumber?: string,
    tx?: TxClient,
  ): Promise<User | null> {
    return this.getClient(tx).user.findFirst({
      where: {
        deletedAt: null,
        OR: [{ email }, ...(phoneNumber ? [{ profile: { phoneNumber } }] : [])],
      },
      include: { profile: true },
    });
  }

  create(data: Prisma.UserCreateInput, tx?: TxClient): Promise<User> {
    return this.getClient(tx).user.create({
      data,
      include: { profile: true },
    });
  }

  update(
    id: string,
    data: Prisma.UserUpdateInput,
    tx?: TxClient,
  ): Promise<User> {
    return this.getClient(tx).user.update({
      where: { id },
      data,
      include: { profile: true, agentProfile: true },
    });
  }

  async incrementLoginAttempts(id: string, tx?: TxClient): Promise<void> {
    await this.getClient(tx).user.update({
      where: { id },
      data: {
        loginAttempts: {
          increment: 1,
        },
      },
    });
  }

  async resetLoginAttempts(id: string, tx?: TxClient): Promise<void> {
    await this.getClient(tx).user.update({
      where: { id },
      data: {
        loginAttempts: 0,
        lockUntil: null,
      },
    });
  }

  updatePassword(
    id: string,
    passwordHash: string,
    tx?: TxClient,
  ): Promise<User> {
    return this.getClient(tx).user.update({
      where: { id },
      data: {
        passwordHash,
      },
      include: { profile: true },
    });
  }

  updateStatus(id: string, status: UserStatus, tx?: TxClient): Promise<User> {
    return this.getClient(tx).user.update({
      where: { id },
      data: {
        status,
      },
      include: { profile: true },
    });
  }

  async delete(id: string, tx?: TxClient): Promise<void> {
    await this.getClient(tx).user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string, tx?: TxClient): Promise<void> {
    await this.getClient(tx).user.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });
  }

  getUserWithPasswordByEmail(
    email: string,
    tx?: TxClient,
  ): Promise<User | null> {
    return this.getClient(tx).user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }
}
