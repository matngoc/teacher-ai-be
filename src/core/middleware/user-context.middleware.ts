import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../../auth/constants';

@Injectable()
export class UserContextMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: any, res: any, next: () => void) {
    const auth = req.headers.authorization;

    if (auth?.startsWith('Bearer ')) {
      const token = auth.substring(7);
      try {
        const decoded = this.jwtService.verify(token, {
          secret: jwtConstants.secret,
        });
        req.userId = decoded['userId'];
      } catch {}
    }

    next();
  }
}
