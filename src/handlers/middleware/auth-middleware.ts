import { User } from "../../database/entities/user";
import { NextFunction, Response, Request } from "express";
import { AppDataSource } from "../../database/database";
import { Token } from "../../database/entities/token";
import { verify } from "jsonwebtoken";

// Objectif : vérifier qu'un utilisateur est connecté 
export const authMiddleware = async(req: Request, res: Response, next: NextFunction)=>{
    // Récupérer la valeur du token donné
    const tokenRepository = AppDataSource.getRepository(Token);
    const authToken = req.headers.authorization;
    
        // Vérifier si le token est null ou vide
        if(!authToken){
            // Redirection page login
            return res.status(401).json({"error": "Unauthorized token nul ou vide"});
        }
        const token = authToken.replace(/"/g, '').split(' ')[1];
        // Vérifier si le token correspond à un utilisateur
        const tokenFound = await tokenRepository.findOne({where: {token}});
        if(!tokenFound){
            return res.status(401).json({"error": "Token non trouvé dans la db"})
        }
        // Verify
        const secret = process.env.JWT_SECRET ?? "";
        verify(token,secret,(err,user)=>{
            console.log(err);            
            if (err) return res.status(403).json({"error": "Access Forbidden token non valide pour la vérif"});
            (req as any).user = user;
            next();
        });
}


