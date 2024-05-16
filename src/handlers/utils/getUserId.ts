import { Request } from "express";

export function getUserIdFromToken(req: Request): number | undefined {
    const auth = req.headers.authorization;
    if (auth) {
        const authSeparation = auth.split('.')[1];
        const decodedPayload = Buffer.from(authSeparation, 'base64').toString('utf-8');
        const user = JSON.parse(decodedPayload);
        return user.userId;
    }
    return undefined;
}
