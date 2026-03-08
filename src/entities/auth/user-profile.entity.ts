import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'first_name', nullable: true, length: 255 })
  firstName: string;

  @Column({ name: 'last_name', nullable: true, length: 255 })
  lastName: string;

  @Column({ name: 'motivation', nullable: true, length: 255 })
  motivation: string;

  @Column({ name: 'english_level', nullable: true, length: 255 })
  englishLevel: string;

  @Column({ name: 'favourite_topic', nullable: true, length: 255 })
  favouriteTopic: string;

  @Column({ name: 'age', nullable: true })
  age: number;

  @Column({ name: 'job', nullable: true, length: 255 })
  job: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ name: 'user_description', nullable: true, type: 'longtext' })
  userDescription: string;

  @Column({ name: 'level_assessment', nullable: true, type: 'longtext' })
  levelAssessment: string;

  @Column({ name: 'history_summary', nullable: true, type: 'longtext' })
  historySummary: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
