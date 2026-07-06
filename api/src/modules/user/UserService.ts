import { PrismaClient, UserStatus } from "../../../generated/prisma";
import logger from "../../utils/logger";
import { IUserRepository } from "./interfaces/IUserRepository";
import { IUserService } from "./interfaces/IUserService";
import { CreateUserDto, UserResponseDto } from "./UserDTO";
import { UserMapper } from "./UserMapper";

export class UserService implements IUserService {
  private readonly userRepository: IUserRepository;
  private readonly prisma: PrismaClient;

  constructor(userRepository: IUserRepository, prisma: PrismaClient) {
    ((this.userRepository = userRepository), (this.prisma = prisma));
  }

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const data = {
      email: dto.email,
      role: dto.role,
      status: UserStatus.PENDING,
      profile: {
        create: {
          fullName: dto.fullName,
        },
      },
    };

    const createdUser = await this.userRepository.create(data);

    logger.info("User created successfully", {
      userId: createdUser.id,
      email: createdUser.email,
    });

    return UserMapper.toResponseDto(createdUser);
  }
}
