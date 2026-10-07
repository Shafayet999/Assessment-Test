import { UserRole } from "../../../generated/prisma/enums";


export interface IRegisterUser {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}

export interface ILoginUser {
    email: string;
    password: string;
}

export interface IAuthUser {
    id: string;
    email: string;
    role: UserRole;
}

export interface ILoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
        credits: number;
    };
}