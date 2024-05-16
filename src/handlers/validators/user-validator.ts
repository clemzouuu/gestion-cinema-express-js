import Joi from "joi";

// User validation create
export interface createUserValidationRequest {
    username: string;
    email: string;
    password: string;
}
export const createUserValidation = Joi.object<createUserValidationRequest>({
    username: Joi.string().alphanum().min(5).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
}).options({abortEarly:false});
// User authentification valid

export interface loginUserValidationRequest {
    username: string;
    password: string;
}

export const loginUserValidation = Joi.object<loginUserValidationRequest>({
    username: Joi.string().required(),
    password: Joi.string().required()
}).options({abortEarly: false});
// User logout

// Liste utilisateurs

export interface userListValidationRequest {
    page: number;
    result: number;
}

export const userListValidation = Joi.object<userListValidationRequest>({
    page: Joi.number().min(1).optional(),
    result: Joi.number().min(1).optional()
})