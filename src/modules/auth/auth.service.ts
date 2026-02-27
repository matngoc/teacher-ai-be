import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from '../../entities/auth/user.entity';
import { Role } from '../../entities/auth/role.entity';
import { RefreshToken } from '../../entities/auth/refresh-token.entity';
import { UserProfile } from '../../entities/auth/user-profile.entity';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ChangePasswordDto,
  TokenResponseDto,
} from './dto/auth.dto';
import { CoreConstant } from '../../common/constants/core.constant';
import { GoogleProfile } from './strategies/google.strategy';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly ACCESS_EXPIRES_IN = parseInt(
    process.env.JWT_ACCESS_EXPIRES_IN ?? '10000',
  );
  private readonly REFRESH_EXPIRES_DAYS = parseInt(
    process.env.JWT_REFRESH_EXPIRES_DAYS ?? '7',
  );

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(UserProfile)
    private readonly profileRepo: Repository<UserProfile>,
    private readonly jwtService: JwtService,
  ) {}

  // ─── REGISTER ─────────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const exists = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (exists) throw new ConflictException('Username đã tồn tại');

    const emailExists = await this.profileRepo.findOne({
      where: { email: dto.email },
    });
    if (emailExists) throw new ConflictException('Email đã được sử dụng');

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
    const defaultRole = await this.roleRepo.findOne({
      where: { name: CoreConstant.User },
    });

    const user = this.userRepo.create({
      username: dto.username,
      passwordHash,
      status: UserStatus.ACTIVE,
      roles: defaultRole ? [defaultRole] : [],
    });
    const savedUser = await this.userRepo.save(user);

    await this.profileRepo.save(
      this.profileRepo.create({
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        user: savedUser,
      }),
    );

    return { message: 'Đăng ký thành công' };
  }

  // ─── LOGIN ────────────────────────────────────────────────────────────────

  async login(dto: LoginDto, ip?: string): Promise<TokenResponseDto> {
    const user = await this.userRepo.findOne({
      where: { username: dto.username },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) throw new UnauthorizedException('Tài khoản không tồn tại');
    if (user.status === UserStatus.LOCKED)
      throw new UnauthorizedException('Tài khoản đã bị khóa');

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      // Tăng số lần đăng nhập sai
      await this.userRepo.update(user.id, {
        failedLoginAttempts: (user.failedLoginAttempts ?? 0) + 1,
      });
      throw new UnauthorizedException('Mật khẩu không đúng');
    }

    // Reset failed attempts
    await this.userRepo.update(user.id, {
      failedLoginAttempts: 0,
      lastLoginAt: new Date(),
    });

    const tokens = await this.generateTokens(user);

    // Lưu refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_EXPIRES_DAYS);
    const tokenHash = await bcrypt.hash(tokens.refreshToken, this.SALT_ROUNDS);

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        tokenHash,
        user,
        expiresAt,
        deviceInfo: dto.deviceInfo,
        ipAddress: ip,
      }),
    );

    return tokens;
  }

  // ─── REFRESH ──────────────────────────────────────────────────────────────

  async refreshToken(dto: RefreshTokenDto): Promise<TokenResponseDto> {
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    const userId = (payload as { userId: number }).userId;
    const stored = await this.refreshTokenRepo.find({
      where: { user: { id: userId }, revoked: false },
      relations: ['user', 'user.roles', 'user.roles.permissions'],
    });

    let matched: RefreshToken | null = null;
    for (const token of stored) {
      const ok = await bcrypt.compare(dto.refreshToken, token.tokenHash);
      if (ok) {
        matched = token;
        break;
      }
    }

    if (!matched)
      throw new UnauthorizedException('Refresh token không tìm thấy');
    if (matched.expiresAt < new Date()) {
      await this.refreshTokenRepo.update(matched.id, { revoked: true });
      throw new UnauthorizedException('Refresh token đã hết hạn');
    }

    // Revoke token cũ (rotation)
    await this.refreshTokenRepo.update(matched.id, {
      revoked: true,
      revokedAt: new Date(),
    });

    const user = matched.user;
    const tokens = await this.generateTokens(user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_EXPIRES_DAYS);
    const newHash = await bcrypt.hash(tokens.refreshToken, this.SALT_ROUNDS);

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        tokenHash: newHash,
        user,
        expiresAt,
        ipAddress: matched.ipAddress,
        deviceInfo: matched.deviceInfo,
      }),
    );

    return tokens;
  }

  // ─── LOGOUT ───────────────────────────────────────────────────────────────

  async logout(userId: number, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      const tokens = await this.refreshTokenRepo.find({
        where: { user: { id: userId }, revoked: false },
      });
      for (const t of tokens) {
        const ok = await bcrypt.compare(refreshToken, t.tokenHash);
        if (ok) {
          await this.refreshTokenRepo.update(t.id, {
            revoked: true,
            revokedAt: new Date(),
          });
          break;
        }
      }
    } else {
      // Revoke tất cả token của user
      await this.refreshTokenRepo.update(
        { user: { id: userId }, revoked: false },
        { revoked: true, revokedAt: new Date() },
      );
    }
  }

  // ─── CHANGE PASSWORD ──────────────────────────────────────────────────────

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isMatch) throw new BadRequestException('Mật khẩu hiện tại không đúng');

    const newHash = await bcrypt.hash(dto.newPassword, this.SALT_ROUNDS);
    await this.userRepo.update(userId, {
      passwordHash: newHash,
      lastPasswordChangeAt: new Date(),
    });

    // Revoke tất cả refresh token sau khi đổi mật khẩu
    await this.refreshTokenRepo.update(
      { user: { id: userId }, revoked: false },
      { revoked: true, revokedAt: new Date() },
    );
  }

  // ─── PROFILE ──────────────────────────────────────────────────────────────

  async getProfile(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['profile', 'roles', 'roles.permissions'],
    });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    return {
      id: user.id,
      username: user.username,
      status: user.status,
      email: user.profile?.email,
      firstName: user.profile?.firstName,
      lastName: user.profile?.lastName,
      avatarUrl: user.profile?.avatarUrl,
      motivation: user.profile?.motivation,
      englishLevel: user.profile?.englishLevel,
      favouriteTopic: user.profile?.favouriteTopic,
      age: user.profile?.age,
      job: user.profile?.job,
      roles: user.roles,
      permissions: this.extractPermissions(user.roles),
      lastLoginAt: user.lastLoginAt,
    };
  }

  // ─── GOOGLE SSO ───────────────────────────────────────────────────────────

  async loginWithGoogle(
    googleProfile: GoogleProfile,
    ip?: string,
  ): Promise<TokenResponseDto> {
    let user = await this.userRepo.findOne({
      where: { googleId: googleProfile.googleId },
      relations: ['roles', 'roles.permissions', 'profile'],
    });

    if (!user) {
      // Tìm theo email nếu đã tồn tại tài khoản thường
      const profile = await this.profileRepo.findOne({
        where: { email: googleProfile.email },
        relations: ['user', 'user.roles', 'user.roles.permissions'],
      });

      if (profile?.user) {
        // Liên kết tài khoản Google vào user hiện có
        await this.userRepo.update(profile.user.id, {
          googleId: googleProfile.googleId,
          isEmailVerified: true,
        });
        user = await this.userRepo.findOne({
          where: { id: profile.user.id },
          relations: ['roles', 'roles.permissions', 'profile'],
        });
      } else {
        // Tạo tài khoản mới từ Google
        const defaultRole = await this.roleRepo.findOne({
          where: { name: CoreConstant.User },
        });

        const username = await this.generateUniqueUsername(
          googleProfile.email.split('@')[0],
        );

        const newUser = this.userRepo.create({
          username,
          passwordHash: '',
          googleId: googleProfile.googleId,
          status: UserStatus.ACTIVE,
          isEmailVerified: true,
          roles: defaultRole ? [defaultRole] : [],
        });
        const savedUser = await this.userRepo.save(newUser);

        await this.profileRepo.save(
          this.profileRepo.create({
            email: googleProfile.email,
            firstName: googleProfile.firstName,
            lastName: googleProfile.lastName,
            user: savedUser,
          }),
        );

        user = await this.userRepo.findOne({
          where: { id: savedUser.id },
          relations: ['roles', 'roles.permissions', 'profile'],
        });
      }
    }

    if (!user)
      throw new UnauthorizedException('Không thể xác thực tài khoản Google');
    if (user.status === UserStatus.LOCKED)
      throw new UnauthorizedException('Tài khoản đã bị khóa');

    await this.userRepo.update(user.id, { lastLoginAt: new Date() });

    const tokens = await this.generateTokens(user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_EXPIRES_DAYS);
    const tokenHash = await bcrypt.hash(tokens.refreshToken, this.SALT_ROUNDS);

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        tokenHash,
        user,
        expiresAt,
        deviceInfo: 'Google OAuth',
        ipAddress: ip,
      }),
    );

    return tokens;
  }

  async getGoogleProfileFromToken(accessToken: string): Promise<GoogleProfile> {
    const url = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`;
    const res = await fetch(url);
    if (!res.ok)
      throw new UnauthorizedException('Google access_token không hợp lệ');

    const data = (await res.json()) as {
      sub: string;
      email: string;
      given_name: string;
      family_name: string;
      picture: string;
    };

    return {
      googleId: data.sub,
      email: data.email,
      firstName: data.given_name ?? '',
      lastName: data.family_name ?? '',
      avatar: data.picture ?? '',
      accessToken,
    };
  }

  // ─── PRIVATE ──────────────────────────────────────────────────────────────

  private extractPermissions(roles: Role[] = []): string[] {
    const perms = new Set<string>();
    for (const role of roles) {
      for (const perm of role.permissions ?? []) {
        perms.add(perm.name);
      }
    }
    return [...perms];
  }

  private async generateUniqueUsername(base: string): Promise<string> {
    const sanitized = base.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    let username = sanitized;
    let counter = 1;
    while (await this.userRepo.findOne({ where: { username } })) {
      username = `${sanitized}${counter++}`;
    }
    return username;
  }

  private async generateTokens(user: User): Promise<TokenResponseDto> {
    const roles = (user.roles ?? []).map((r) => r.name);
    const permissions = this.extractPermissions(user.roles);

    const payload = {
      userId: user.id,
      username: user.username,
      roles,
      permissions,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: this.ACCESS_EXPIRES_IN,
      }),
      this.jwtService.signAsync(
        { userId: user.id },
        {
          secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET,
          expiresIn: `${this.REFRESH_EXPIRES_DAYS}d`,
        },
      ),
    ]);

    return {
      user: user,
      accessToken,
      refreshToken,
      expiresIn: this.ACCESS_EXPIRES_IN,
      tokenType: 'Bearer',
    };
  }
}
