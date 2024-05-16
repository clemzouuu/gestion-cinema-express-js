import { DataSource } from "typeorm";
import { User } from "../database/entities/user";
import { AppDataSource } from "../database/database";
import { Err } from "joi";

export interface listUserFilter{
    page: number,
    result: number
}

export interface addCreditUser{
    solde: number;
}
export interface debitUser{
    solde: number;
}

export class UserUsecase{
    constructor(private readonly db: DataSource) { }

    async userList(listUserFilter: listUserFilter): Promise<{user: User[]}>{
        const query = this.db.createQueryBuilder(User, 'user');
        // Demander à prendre les utilisateurs en fonction de la limite
        query.take(listUserFilter.result);
        // retourner les utilisateurs
        const listeUser = await query.getMany()
        return {user:listeUser};
    }

    async addCreditUser(addCreditUser: addCreditUser, userId : number): Promise<{ user: User }> {
        const { solde} = addCreditUser;

        try {
            // Récupérer l'utilisateur à qui ajouter le crédit
            const userRepository = AppDataSource.getRepository(User);
            const userToUpdate = await userRepository.findOne({ where:{id: userId}});

            if (!userToUpdate) {
                throw new Error("Utilisateur non trouvé");
            }

            // Mettre à jour le solde de l'utilisateur
            userToUpdate.solde += solde;
            await userRepository.save(userToUpdate);

            // Renvoyer l'utilisateur mis à jour
            return { user: userToUpdate };
        } catch (error) {
            throw new Error("Erreur lors de l'ajout du crédit à l'utilisateur : " + (error as Error).message);
        }
    }
    async debitUser(debitUser: debitUser, userId: number): Promise<{user: User}>{
        const { solde} = debitUser;

        try {
            // Récupérer l'utilisateur à débiter
            const userRepository = AppDataSource.getRepository(User);
            const userToUpdate = await userRepository.findOne({ where:{id: userId}});

            if (!userToUpdate) {
                throw new Error("Utilisateur non trouvé");
            }

            // Mettre à jour le solde de l'utilisateur
            if(solde > userToUpdate.solde){
                throw new Error("Argent insuffisant pour faire la transaction")
            }
            userToUpdate.solde -= solde;
            await userRepository.save(userToUpdate);

            // Renvoyer l'utilisateur mis à jour
            return { user: userToUpdate };
        } catch (error) {
            throw new Error("Erreur lors de l'ajout du débit à l'utilisateur : " + (error as Error).message);
        }
    }
}
