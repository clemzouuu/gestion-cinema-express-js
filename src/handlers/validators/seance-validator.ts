import Joi from "joi";
import { Salle } from "../../database/entities/salle";
import { Film } from "../../database/entities/film";

export interface SeanceRequest{
    salle : Salle,
    dateDebut: Date,
    film: Film,
}

export const seanceValidation = Joi.object<SeanceRequest>({
    salle: Joi.object<Salle>({
        id: Joi.number().required(),
    }).required(),
    dateDebut: Joi.date().required(),
    film: Joi.object<Salle>({
        id: Joi.number().required(),
    }).required()
}).options({ abortEarly: false })

export interface SeanceIdRequest { 
    id: number
}

export const seanceIdValidation = Joi.object<SeanceIdRequest>({
    id: Joi.number().required(),
})

export const listSeanceValidation = Joi.object<ListSeanceRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})


export interface ListSeanceRequest {
    page?: number
    limit?: number
}

export const updateSeanceValidation = Joi.object<UpdateSeanceRequest>({
    id: Joi.number().required(),
    salle: Joi.object<Salle>({
        id: Joi.number(),
    }).optional(),
    dateDebut: Joi.date().optional(),
    film: Joi.object<Salle>({
        id: Joi.number(),
    }).optional()
})

export interface UpdateSeanceRequest {
    id: number
    dateDebut?: Date
    film?:Film
    salle?:Salle
}

export const planningSeanceValidation = Joi.object<PlanningSeanceRequest>({
    dateDebut: Joi.date().required(),
    dateFin: Joi.date().optional(),
})

export interface PlanningSeanceRequest{
    dateDebut:Date
    dateFin?:Date
}