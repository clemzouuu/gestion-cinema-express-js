import Joi from "joi";

export interface SalleRequest{
    name:string,
    capacity:number,
    inMaintenance:boolean,
    description: string, 
    type: string, 
    image: string
}

export const salleValidation = Joi.object<SalleRequest>({
    name: Joi.string()
        .required()
        .min(1),
    capacity: Joi.number()
        .min(15)
        .max(30)
        .required(),
    inMaintenance: Joi.boolean()
        .required(),
    description: Joi.string()
        .required()
        .min(1),
    type: Joi.string()
        .required()
        .min(1),
    image: Joi.string()
        .uri()
        .required(),
    

}).options({ abortEarly: false })

export interface SalleIdRequest {
    id: number
}

export const listSalleValidation = Joi.object<ListSalleRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})


export interface ListSalleRequest {
    page?: number
    limit?: number
}

export const salleIdValidation = Joi.object<SalleIdRequest>({
    id: Joi.number().required(),
})

export const updateSalleValidation = Joi.object<UpdateSalleRequest>({
    id: Joi.number().required(),
    name: Joi.string().min(1).optional(),
    capacity: Joi.number().min(15).max(30).optional(),
    inMaintenance: Joi.boolean().optional(),
    description: Joi.string()
        .optional(),
    type: Joi.string()
        .optional(),
    image: Joi.string()
        .uri()
        .optional(),
})

export interface UpdateSalleRequest {
    id: number
    name?: string
    capacity?: number
    inMaintenance?:boolean
    description?: string, 
    type?: string, 
    image?: string
    
}

export const planningSalleValidation = Joi.object<PlanningSalleRequest>({
    id: Joi.number().required(),
    dateDebut: Joi.date().required(),
    dateFin: Joi.date().optional(),
})

export interface PlanningSalleRequest{
    id: number
    dateDebut: Date
    dateFin?: Date
}