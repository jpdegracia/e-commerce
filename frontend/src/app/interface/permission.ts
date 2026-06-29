// interface/permission.ts
export interface IPermission {
    _id?: string;
    permissionName: string;
    description: string;
    group?: string;
}

export interface PermissionGroup {
  groupName: string;
  permissions: IPermission[];
  isOpen: boolean;
}