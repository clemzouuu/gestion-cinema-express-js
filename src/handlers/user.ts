import  express, { Request, Response } from "express";
import { AppDataSource } from "../database/database";
import { createUserValidation, loginUserValidation } from "./validators/user-validator";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";
import { User } from "../database/entities/user";
import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { Token } from "../database/entities/token";
import { getRepository } from "typeorm";
import { Role } from "../database/entities/roles";
import { authMiddleware } from "./middleware/auth-middleware";


export const UserHandler = (app: express.Express) => {
    // Créer un nouvel utilisateur
    app.post('/auth/signup', async(req:Request, res:Response) => {
        try {
            const userValidation = createUserValidation.validate(req.body);
            if(userValidation.error){
                res.status(400).send(generateValidationErrorMessage(userValidation.error.details));
                return;
            }
            const createUserRequest = userValidation.value;
            const hashedPassword = await hash(createUserRequest.password, 10);
            const userRepository = AppDataSource.getRepository(User);
            // Ajouter le rôle de l'utilisateur automatiquement
            const user = await userRepository.save({
                username: createUserRequest.username,
                email: createUserRequest.email,
                password: hashedPassword,
                role: 2,
                solde: 0
            });
            res.status(201).send({id: user.id, email: user.email, role: user.roles});
            return;

        } catch (error) {
            console.log(error);
            res.status(500).send({ "error": "internal error retry later" });
            return;
        }
    });
    // Connexion d'un utilisateur
    app.post('/auth/login', async(req:Request, res: Response) => {
        try {
            const userValidation = loginUserValidation.validate(req.body);
            if(userValidation.error){
                res.status(400).send(generateValidationErrorMessage(userValidation.error.details));
                return;
            }
            const loginUserRequest = userValidation.value;
            const user = await AppDataSource.getRepository(User).findOneBy({username: loginUserRequest.username});
            if (!user) {
                res.status(400).send({ error: " Le premier username or password not valid" })
                return
            }
            // valid password for this user
            const isValid = await compare(loginUserRequest.password, user.password);
            if (!isValid) {
                res.status(400).send({ error: "Le username or password not valid" })
                return
            }
            const secret = process.env.JWT_SECRET ?? ""
            console.log(secret)
            console.log(`le nom de l'utilisateur ${user.username}`);
            console.log(`l'email de l'utilisateur ${user.email}`);
            console.log(`le role de l'utilisateur ${user.roles.id}`);
            const token = sign({ userId: user.id, username: user.username, roles: user.roles.id}, secret, { expiresIn: '1d' });
            await AppDataSource.getRepository(Token).save({ token: token, user: user })
            
            res.status(200).json({ token });
        } catch (error) {

            console.log(error);
            res.status(500).send({ "error": "internal error retry later" });
            return;
        }
    });
    app.delete('/logout', authMiddleware, async(req: Request, res: Response) => {
        try {
            // Objectif : supprimer le token de l'utilisateur
            // Définir le repository
            const tokenRepository = AppDataSource.getRepository(Token);
            const authToken = req.headers.authorization;
            const token = authToken!.replace(/"/g, '').split(' ')[1];
            await tokenRepository.delete({token: token})
            res.status(201).send({message : "Déconnexion réussie"});
           
        } catch (error) {
            console.log(error);
            res.status(500).send({ "error": "pas connecté : internal error retry later" });
            return;
        }
    })
}