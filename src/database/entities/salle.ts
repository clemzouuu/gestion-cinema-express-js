import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Seance } from "./seance";

@Entity()
export class Salle{

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    description: string

    @Column()
    type: string

    @Column()
    image: string

    @Column()
    capacity: number

    @Column()
    inMaintenance: boolean

    @OneToMany(() => Seance, seances => seances.salle)
    seances: Seance[]
    
    constructor(id: number, name: string, capacity:number, inMaintenance:boolean, seances:Seance[], description: string, type: string, image: string) {
        this.id = id
        this.name = name
        this.capacity = capacity
        this.inMaintenance = inMaintenance
        this.seances = seances
        this.description = description
        this.type = type
        this.image = image
    }
}