import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Seance } from "./seance";
import { User } from "./user";  

@Entity()
export class Billet {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "boolean" })
    isSuperBillet: boolean

    @Column({ type: "int", default: 1 })
    totalSessions: number;

    @Column({ type: "int", default: 5 })
    prix: number;

    @ManyToOne(() => Seance, seance => seance.billets, { eager: true })
    seance: Seance;

    @ManyToOne(() => User, user => user.billets)  
    user: User;


    constructor(id: number,isSuperBillet: boolean, seance: Seance, user: User, prix:number) {
        this.id = id;
        this.isSuperBillet = isSuperBillet; 
        this.totalSessions = isSuperBillet ? 10 : 1;  
        this.seance = seance;
        this.user = user;
        this.prix = prix
    }
}