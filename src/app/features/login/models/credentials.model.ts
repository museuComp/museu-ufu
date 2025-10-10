export enum Role {
  PUBLIC = 'PUBLIC',
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  COORDINATOR = 'COORDINATOR',
}

export interface Credentials {
  accessToken: string;
  role: Role;
  
  email?: string;
  is_superuser?: boolean;
  name?: string;
  id?: number;
}