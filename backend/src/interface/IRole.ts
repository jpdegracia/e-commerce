import mongoose from "mongoose";

interface IRole {
    rolename: string,
    description: string,
    permissions: mongoose.Types.ObjectId[]
}

export default IRole