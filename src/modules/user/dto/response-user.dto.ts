import { Role } from '../Enums/role.enum';

export class UserResponseDto {
  id: string;
  email: string;
  username: string;
  role: Role;
}
