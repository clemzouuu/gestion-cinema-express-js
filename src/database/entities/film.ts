import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Seance } from "./seance";

@Entity({ name: "film" })
export class Film {
  @PrimaryGeneratedColumn()
  id: number;  

  @Column()
  title: string; 

  @Column()
  description: string;  

  @Column()
  duration: number;

  @Column()
  genre: string; 

  @Column()
  author: string; 

  @OneToMany(() => Seance, seances => seances.salle)
    seances: Seance[]


constructor(id: number, title: string, description: string, duration: number,  genre: string, author: string, seances:Seance[] /*, affectedRoom:string, startDate: number, endDate:number*/) {
    this.id = id
    this.title = title
    this.description = description
    this.duration = duration
    this.genre = genre
    this.author = author
    this.seances = seances

  }
}