import { Column, DeleteDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Salle } from "./salle";
import { Film } from "./film";
import { Billet } from "./billet";

@Entity()
export class Seance{

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    dateDebut:Date

    @Column()
    dateFin:Date

    @ManyToOne(() => Salle, salle => salle.seances, { eager: true }) 
    salle: Salle;

    @ManyToOne(() => Film, film => film.seances, { eager: true })
    film: Film;

    @OneToMany(() => Billet, billets => billets.seance)
    billets: Billet[];

    constructor(id: number, salle: Salle, dateDebut:Date, dateFin:Date, film:Film, placesVendues:number, billets: Billet[]) {
        this.id = id
        this.dateDebut = dateDebut
        this.dateFin = dateFin
        this.salle = salle
        this.film = film
        this.billets = billets
    }
}