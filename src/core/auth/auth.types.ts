export enum Role {
  STUDENT = 'STUDENT',
  PROFESSOR = 'PROFESSOR',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  specialty?: string; // Optional, for professors
}
