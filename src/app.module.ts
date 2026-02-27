import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { StorageModule } from './modules/storage/storage.module';
import { DictionaryModule } from './modules/dictionary/dictionary.module';
import { CourseModule } from './modules/courses/course.module';
import { Course } from './entities/course.entity';
import { User } from './entities/auth/user.entity';
import { Role } from './entities/auth/role.entity';
import { Permission } from './entities/auth/permission.entity';
import { RefreshToken } from './entities/auth/refresh-token.entity';
import { UserSession } from './entities/auth/user-session.entity';
import { UserProfile } from './entities/auth/user-profile.entity';
import { Dictionary } from './entities/dictionary.entity';
import { FileUpload } from './entities/file-upload.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'mysql',
        host: cfg.get('MYSQL_HOST', 'localhost'),
        port: parseInt(cfg.get('MYSQL_PORT', '3306')),
        username: cfg.get('MYSQL_USERNAME'),
        password: cfg.get('MYSQL_PASSWORD'),
        database: cfg.get('MYSQL_DATABASE'),
        entities: [
          User,
          Role,
          Permission,
          RefreshToken,
          UserSession,
          UserProfile,
          Dictionary,
          FileUpload,
          Course,
        ],
        synchronize: cfg.get('NODE_ENV') !== 'production',
        autoLoadEntities: true,
        logging: cfg.get('NODE_ENV') === 'development',
        timezone: '+07:00',
      }),
    }),
    CommonModule,
    AuthModule,
    UsersModule,
    RolesModule,
    StorageModule,
    DictionaryModule,
    CourseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
