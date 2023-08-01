import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from '../../libs/entity/user/user.entity';

@Injectable()
export class UserService {
  findById(userId: number): User {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly userRepository: UserRepository) {}
}
