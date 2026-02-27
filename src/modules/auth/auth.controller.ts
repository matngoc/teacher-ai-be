import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ChangePasswordDto,
} from './dto/auth.dto';
import { Public } from '../../common/decorators/auth.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/dto/api-response.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GoogleProfile } from './strategies/google.strategy';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);
    return ApiResponse.created(data, 'Đăng ký thành công');
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const data = await this.authService.login(dto, req.ip);
    return ApiResponse.ok(data, 'Đăng nhập thành công');
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    const data = await this.authService.refreshToken(dto);
    return ApiResponse.ok(data, 'Làm mới token thành công');
  }

  @ApiBearerAuth('JWT-auth')
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng xuất' })
  async logout(@CurrentUser() user: JwtPayload, @Body() dto: RefreshTokenDto) {
    await this.authService.logout(user.userId, dto.refreshToken);
    return ApiResponse.ok(null, 'Đăng xuất thành công');
  }

  @ApiBearerAuth('JWT-auth')
  @Get('profile')
  @ApiOperation({ summary: 'Lấy thông tin cá nhân' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    const data = await this.authService.getProfile(user.userId);
    return ApiResponse.ok(data);
  }

  @ApiBearerAuth('JWT-auth')
  @Patch('change-password')
  @ApiOperation({ summary: 'Đổi mật khẩu' })
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(user.userId, dto);
    return ApiResponse.ok(null, 'Đổi mật khẩu thành công');
  }

  // ─── GOOGLE SSO ───────────────────────────────────────────────────────────

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  @ApiOperation({
    summary: 'Đăng nhập bằng Google',
    description:
      'Redirect trình duyệt tới trang đăng nhập Google. ' +
      'Dùng cho web-app: mở URL này trực tiếp trong trình duyệt. ' +
      'Sau khi xác thực sẽ redirect về GOOGLE_REDIRECT_CLIENT_URL với token.',
  })
  googleLogin(): void {
    // Guard tự redirect sang Google
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  @ApiExcludeEndpoint()
  async googleCallback(
    @Req() req: Request & { user: GoogleProfile },
    @Res() res: Response,
  ) {
    const tokens = await this.authService.loginWithGoogle(req.user, req.ip);
    const clientRedirectUrl = process.env.GOOGLE_REDIRECT_CLIENT_URL ?? 'http://localhost:3000';
    const redirectUrl = new URL(clientRedirectUrl);
    redirectUrl.searchParams.set('accessToken', tokens.accessToken);
    redirectUrl.searchParams.set('refreshToken', tokens.refreshToken);
    redirectUrl.searchParams.set('expiresIn', String(tokens.expiresIn));
    res.redirect(redirectUrl.toString());
  }

  @Public()
  @Post('google/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng nhập Google cho Mobile / SPA (dùng access_token)',
    description:
      'Mobile app hoặc SPA tự lấy Google access_token rồi gửi lên đây để đổi lấy JWT của hệ thống.',
  })
  async googleTokenLogin(
    @Body('accessToken') googleAccessToken: string,
    @Req() req: Request,
  ) {
    const profile = await this.authService.getGoogleProfileFromToken(googleAccessToken);
    const tokens = await this.authService.loginWithGoogle(profile, req.ip);
    return ApiResponse.ok(tokens, 'Đăng nhập Google thành công');
  }
}
