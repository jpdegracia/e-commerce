import { IRole } from './role'; 

export interface IUser {
  _id?: string;
  fullname: string;
  email: string;
  password?: string; // Optional: Hidden by backend on fetches
  role?: string | IRole | any; // String ID for saving, IRole object for reading
  isActive?: boolean; // Optional: Defaulted to false by backend
}