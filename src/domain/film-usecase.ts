import { Between, DataSource, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { Film } from "../database/entities/film";

export interface UpdateFilmParams {
    title?: string
    description?: string
    duration?:number
    genre?: string
    author?: string 
}

export class FilmUsecase {
    constructor(private readonly db: DataSource) { }

    async getFilmAuth():Promise<Film[] | null> {

        const repo = this.db.getRepository(Film)
        const filmFound = await repo
        .createQueryBuilder()
        .getMany()

        if (filmFound === null) return null
             
        return filmFound
    }

    async getFilm(): Promise<{ author: string, sortie: Date }[] | null> {
        const repo = this.db.getRepository(Film);
        const films = await repo
            .createQueryBuilder('film')
            .select(['film.title AS title','film.description AS description','film.duration AS duration','film.genre AS genre','film.author AS author']) 
            .getRawMany();
    
        if (films === null) return null;
    
        return films;
    }

    async getFilmById(id: number):Promise<Film | null> {

        const repo = this.db.getRepository(Film)
        const filmFound = await repo.findOneBy({ id })

        if (filmFound === null) return null
             
        return filmFound
    }

    async getFilmDuration(id:number):Promise<number | null>{
        const film = await this.getFilmById(id)
        if (film === null) return null
        return film.duration
    }

    async getFilmByTitle(title: string):Promise<Film[] | null> {

        const repo = this.db.getRepository(Film)
        const filmFound = await repo.find({ where: { title } });

        if (filmFound === null) return null
             
        return filmFound
    }

    /*async getFilmByTitleAndPeriod(
        title: string,
        startDate: number, 
        endDate: number
    ): Promise<Film[] | null> {

        const filmRepo = this.db.getRepository(Film);

        const films = await filmRepo.find({
            where: {
                title: title,
                startDate: LessThanOrEqual(endDate),
                endDate: MoreThanOrEqual(startDate)
            }
        });

        if (!films.length) return null;

        return films;
    }
*/
    async deleteFilm(id: number):Promise<string | null>{
        const repo = this.db.getRepository(Film)
        const filmFound = await repo.findOneBy({ id })

        if (filmFound === null) return null

        await repo.createQueryBuilder()
        .delete()
        .from(Film)
        .where("id = :id", { id })
        .execute();

        return `Le film à l'id ${id} a bien été supprimé`
    }


    async updateFilm(id: number, params: UpdateFilmParams): Promise<Film | null> {
        const repo = this.db.getRepository(Film)
        const filmFound = await repo.findOneBy({ id })

        if (!filmFound) return null;  
        Object.assign(filmFound, params);

        const filmUpdated = await repo.save(filmFound);

        return filmUpdated;  
    } 
}