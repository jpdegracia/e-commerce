export interface IRole {
    _id?: string,
    rolename: string,
    description: string,
    permissions?: string[] | any[];
}