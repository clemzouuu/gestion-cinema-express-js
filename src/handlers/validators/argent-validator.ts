import Joi from "joi";

export interface creditUserValidationRequest {
    solde: number
}
export const creditUserValidation = Joi.object<creditUserValidationRequest>({
    solde: Joi.number().min(1).max(1000).required().positive()
});

export interface debitUserValidationRequest {
    solde : number;
}
export const debitUserValidation = Joi.object<debitUserValidationRequest>({
    solde: Joi.number().min(1).max(1000).required().positive()
})