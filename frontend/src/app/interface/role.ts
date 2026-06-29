export interface IRole {
    _id?: string,
    rolename: string,
    description: string,
    permission: string[] | any;
}