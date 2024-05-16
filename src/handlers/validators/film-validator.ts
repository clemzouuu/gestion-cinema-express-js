import Joi from "joi";

export const filmValidation = Joi.object<FilmRequest>({
    title: Joi.string()
        .min(1)
        .required(),
    description: Joi.string()
        .min(1)
        .required(),
    duration: Joi.number()
        .min(1)
        .required(),
    genre : Joi.string()
        .min(1)
        .required(),
    author: Joi.string()
        .min(1)
        .required(),
    
}).options({ abortEarly: false })

export interface FilmRequest {
    title: string
    description: string
    duration: number
    genre: string 
    author: string
}

export const getByIdFilmValidation = Joi.object<getByIdFilmRequest>({
    id: Joi.number().min(1).required(),
})

export interface getByIdFilmRequest {
    id: number
}

export const getByTitleFilmValidation = Joi.object<getByTitleFilmRequest>({
    title: Joi.string().required(),
})

export interface getByTitleFilmRequest { 
    title: string
}

export const deleteFilmValidation = Joi.object<DeleteFilmRequest>({
    id: Joi.number().min(1).required(),
})

export interface DeleteFilmRequest {
    id: number
}

export const updateFilmValidation = Joi.object<UpdateFilmRequest>({
    id: Joi.number(),
    title: Joi.string()
        .min(1),
    description: Joi.string()
        .min(1),
    duration: Joi.number()
        .min(1),
    genre : Joi.string()
        .min(1),
    author: Joi.string()
        .min(1),
})


export interface UpdateFilmRequest {
    id: number
    title?: string
    description?: string
    duration?: number
    genre?: string 
    author?: string
}