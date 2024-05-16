import { Column, Entity, JoinTable, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";


@Entity()
export class Role{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: String;

    @OneToMany(() => User, user => user.roles)
    user: User[];

    constructor(id: number, name: String, users: User[]) {
        this.id = id;
        this.name = name;
        this.user = users;
    }
}