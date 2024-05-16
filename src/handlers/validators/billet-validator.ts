import Joi from 'joi';
import { Seance } from '../../database/entities/seance';
import { User } from '../../database/entities/user';
 
export const billetValidation = Joi.object<BilletRequest>({
    isSuperBillet: Joi.boolean()
        .required(),
    totalSessions: Joi.number()
        .integer()
        .min(1)
        .required()
        .when('isSuperBillet', { is: true, then: Joi.number().valid(10), otherwise: Joi.number().valid(1) }),
    seance: Joi.object<Seance>({
        id: Joi.number().required(),
    }).required(),
    user: Joi.object<User>({
        id: Joi.number().required(),
    }).required(),
    prix: Joi.number().min(1).required()
}).options({ abortEarly: false });
 
export interface BilletRequest {
    isSuperBillet: boolean
    totalSessions: number
    seance: Seance
    user: User
    prix: number
}
export const getBilletsByUserId = Joi.object({
    id: Joi.number()
        .integer()
        .min(1)
        .required(),
});
export const frequentationValidation = Joi.object<frequentationRequest>({
    dateDebut: Joi.date().required(),
    dateFin: Joi.date().required(),
})

export interface frequentationRequest{
    dateDebut:Date
    dateFin:Date
}

 