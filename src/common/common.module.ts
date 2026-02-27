import { Global, Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { UserContextService } from './context/user-context.service';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
  ],
  providers: [UserContextService],
  exports: [UserContextService],
})
export class CommonModule {}
