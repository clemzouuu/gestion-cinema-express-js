import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm"
import { Token } from "./token";
import { Role } from "./roles";
import { Billet } from "./billet";
import "reflect-metadata"

@Entity()
export class User{

    @PrimaryGeneratedColumn()
    id: number; 

    @Column()
    username: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    solde: number;

    @OneToMany(() => Token, token => token.user)
    tokens: Token[];

    @ManyToOne(() => Role, roles => roles.user, {eager: true})
    roles: Role;

    @OneToMany(() => Billet, billet => billet.user)
    billets: Billet[];

    constructor(id: number, username: string,email: string, password: string, solde: number, tokens: Token[], roles: Role, billets: Billet[]){
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.solde = solde;
        this.tokens = tokens;
        this.roles = roles;
        this.billets = billets;
    }

}