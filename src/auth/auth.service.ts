import {
  Injectable,
  Logger,
  NotFoundException,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RolesService } from '../roles/roles.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/loginResponse.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CoreConstant } from '../core/constant/core.constant';
import { UserEntity } from '../users/entities/user.entity';
import { ACCESS_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES } from './constants';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private roleService: RolesService,
  ) {}

  private readonly logger = new Logger();

  async signIn(input: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(input.email);
    if (user != null && input.password == input.password) {
      const role = await this.roleService.findOne(user.roleId);
      const payload = {
        userId: user.id,
        email: user.email,
        roleId: user.roleId,
        role: role?.name,
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: ACCESS_TOKEN_EXPIRES,
      });
      const refreshToken = await this.jwtService.signAsync(
        { userId: user.id.toString() },
        { expiresIn: REFRESH_TOKEN_EXPIRES },
      );
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

      await this.usersService.updateRefreshToken(
        user.id.toString(),
        hashedRefreshToken,
      );

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    }
    throw new UnauthorizedException();
  }

  async refreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.usersService.findOne(payload.userId);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException();
      }
      const isMatch = await bcrypt.compare(token, user.refreshToken);
      if (!isMatch) {
        throw new UnauthorizedException();
      }
      const role = await this.roleService.findOne(user.roleId);
      const newPayload = {
        userId: user.id.toString(),
        email: user.email,
        roleId: user.roleId,
        role: role?.name,
      };

      return {
        access_token: await this.jwtService.signAsync(newPayload, {
          expiresIn: ACCESS_TOKEN_EXPIRES,
        }),
      };
    } catch {
      throw new UnauthorizedException();
    }
  }

  async register(input: RegisterDto, @Req() req: Request): Promise<UserEntity> {
    const checkUser = await this.usersService.findByEmail(input.email);

    if (checkUser == null) {
      const userDto = new CreateUserDto();
      userDto.email = input.email;
      userDto.password = input.password;
      userDto.fullName = input.fullName;
      userDto.age = input.age;
      userDto.job = input.job;
      userDto.motivation = input.motivation;
      userDto.englishLevel = input.englishLevel;
      userDto.favouriteTopic = input.favouriteTopic;
      userDto.roleId = 0;

      return await this.usersService.create(userDto, req);
    } else {
      throw new NotFoundException('Email đã được sử dụng');
    }
  }
}
