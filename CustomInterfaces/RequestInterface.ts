import { Request } from "express";

export default interface RequestInterface extends Request{
    id?: string,
    version?: string,
    versioncode?:string
}