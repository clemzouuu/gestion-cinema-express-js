import express, { Request, Response } from "express";
import { UserHandler } from "./user";
import { authMiddleware } from "./middleware/auth-middleware";
import { roleMiddleware } from "./middleware/role-middleware";
import { userListValidation } from "./validators/user-validator";
import { creditUserValidation, debitUserValidation } from "./validators/argent-validator";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";
import { UserUsecase } from "../domain/user-usecase";
import { AppDataSource } from "../database/database";
import { getUserIdFromToken } from "./utils/getUserId";
import { SalleUsecase } from "../domain/salle-usecase";
import { listSalleValidation, planningSalleValidation, salleIdValidation, salleValidation, updateSalleValidation } from "./validators/salle-validator";
import { Salle } from "../database/entities/salle";
import { listSeanceValidation, planningSeanceValidation, seanceIdValidation, seanceValidation, updateSeanceValidation } from "./validators/seance-validator";
import { Seance } from "../database/entities/seance";
import { SeanceUsecase } from "../domain/seance-usecase";
import { filmValidation,getByIdFilmValidation, getByTitleFilmValidation,deleteFilmValidation,updateFilmValidation,/*getFilmByTitleAndPeriod*/ } from "./validators/film-validator"; 
import { FilmUsecase } from "../domain/film-usecase";
import { Film } from "../database/entities/film";
import { Billet } from "../database/entities/billet";
import { BilletUsecase } from "../domain/billet-usecase";
import { getBilletsByUserId, billetValidation, frequentationValidation } from "./validators/billet-validator"; 


export const initRoutes = (app:express.Express) => {

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List of users
 *     description: Retrieves a paginated list of users according to specified criteria.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number to display.
 *       - in: query
 *         name: result
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of users per page.
 *     responses:
 *       200:
 *         description: Successfully returned a list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid query parameters.
 *       500:
 *         description: Internal server error.
 */
    app.get('/users',authMiddleware, roleMiddleware, async(req: Request, res:Response)=>{

        const usersValidation = userListValidation.validate(req.body);
        if(usersValidation.error){
            res.status(400).send(generateValidationErrorMessage(usersValidation.error.details));
            return;
        }
        const userList = usersValidation.value;
        let result = 20
        if (userList.result) {
            result = userList.result
        }
        const page = userList.page ?? 1

        try {
            const userUsecase = new UserUsecase(AppDataSource);
            const listUser = await userUsecase.userList({ ... userList,page, result })
            res.status(200).send(listUser)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    });


    /**
 * @openapi
 * /users/credit:
 *   patch:
 *     summary: Credit user's account
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to be credited
 *     responses:
 *       200:
 *         description: Credit added successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
    // Route pour crédit solde user
    app.patch('/users/credit', authMiddleware, async(req: Request, res: Response)=>{
       const creditValidation = creditUserValidation.validate(req.body);
       if(creditValidation.error){
            res.status(400).send(generateValidationErrorMessage(creditValidation.error.details));
            return;
       }
       const credit = creditValidation.value;
       const userId = getUserIdFromToken(req);
       try{
            const userUsecase = new UserUsecase(AppDataSource);
            const creditUser = await userUsecase.addCreditUser(credit, userId!)
            res.status(200).json(creditUser);
       } catch(error){
        console.log(error);
        res.status(500).send({error: "Internal error"});
       }
    })
    /**
 
@openapi
/billets/perso:
get:
summary: Retrieve personal tickets
description: Fetches all tickets associated with the authenticated user.
tags:
Tickets
security:
bearerAuth: []
responses:
200:
description: Successfully retrieved the tickets for the user.
content:
application/json:
schema:
type: array
items:
$ref: '#/components/schemas/Ticket'
404:
description: No tickets available for this user.
500:
description: Internal server error.
*/
    app.get("/billets/perso", authMiddleware, async (req: Request, res: Response) => { 
        try {
            const userId = getUserIdFromToken(req);
            console.log(userId);

            const billetUsecase = new BilletUsecase(AppDataSource);
            const billets = await billetUsecase.getBilletsByUserId(userId!);

            if (billets.length === 0) {
                return res.status(404).send({"error": "No tickets available for this user."});
            }
            res.status(200).send(billets);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: "Internal error" });
        }
    });
    /**
 
@openapi
/billets/frequentation:
get:
summary: Retrieve attendance information
description: Fetches attendance information based on the specified criteria. Validates the request body to ensure it contains valid data for querying attendance.
tags:
Tickets
security:
bearerAuth: []
requestBody:
required: true
content:
application/json:
schema:
$ref: '#/components/schemas/FrequentationRequest'
responses:
200:
description: Successfully retrieved attendance information.
400:
description: Validation error with input data.
500:
description: Internal server error.
*/

    app.get("/billets/frequentation", authMiddleware, async (req: Request, res: Response) => {

        const validation = frequentationValidation.validate(req.body)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const frequentationRequest = validation.value

        try {
            const billetUsecase = new BilletUsecase(AppDataSource);
            const frequentation= await billetUsecase.getFrequentation(frequentationRequest)
            res.status(200).send(frequentation)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    /**
 * @openapi
 * /users/debit:
 *   patch:
 *     summary: Debit user's account
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to be debited
 *     responses:
 *       200:
 *         description: Debit processed successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
    // Route pour retirer solde user
    app.patch('/users/debit', authMiddleware, async(req: Request, res: Response)=>{
        const debitValidation = debitUserValidation.validate(req.body);
        if(debitValidation.error){
             res.status(400).send(generateValidationErrorMessage(debitValidation.error.details));
             return;
        }
        const debit = debitValidation.value;
        const userId = getUserIdFromToken(req);
        try{
             const userUsecase = new UserUsecase(AppDataSource);
             const debitUser = await userUsecase.debitUser(debit, userId!)
             res.status(200).json(debitUser);
        } catch(error:any){
         console.log(error);
         res.status(500).send({ error: error.message });       
        }
    })

    /**
 * @openapi
 * /billets:
 *   post:
 *     summary: Create a new ticket
 *     tags:
 *       - Ticket
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ticket'
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
    app.post("/billets", authMiddleware, async (req: Request, res: Response) => {
        const validation = billetValidation.validate(req.body);
        
        if (validation.error) { 
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }
        
        const billetRequest = validation.value; 
        try {
            const billetUsecase = new BilletUsecase(AppDataSource)
            const billetCreated = await billetUsecase.createBillets(billetRequest)
            res.status(201).send(billetCreated)
        } catch (error) {
            res.status(500).send((error as Error).message)
        }
    });

    /**
 * @openapi
 * /films:
 *   get:
 *     summary: Retrieve all films
 *     description: Fetches a list of all films available in the database. Returns an error if no films are available.
 *     tags:
 *       - Film
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of films retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Film'
 *       404:
 *         description: No movies available.
 *       500:
 *         description: Internal server error due to a backend issue.
 */

    // Accessible pour tous les users
    app.get("/films", authMiddleware, async (req: Request, res: Response) => { 

        try {
            const filmUsecase = new FilmUsecase(AppDataSource);

            const getFilm = await filmUsecase.getFilm()
            if (getFilm === null) {
                res.status(404).send({"error": `no movies available.`})
                return
            }
            res.status(200).send(getFilm)
        }catch (error){
            console.log(error)
            res.status(500).send({ error: "Internal error" }) 
        } 
    })

    /**
 * @openapi
 * /films/{id}:
 *   get:
 *     summary: Retrieve a film by its ID
 *     tags:
 *       - Film
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Film retrieved successfully
 *       404:
 *         description: Film not found
 *       500:
 *         description: Internal server error
 */

    // Accessible pour tous les users
    app.get("/films/:id", authMiddleware, async (req: Request, res: Response) => { 
        const validation = getByIdFilmValidation.validate(req.params)
         
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }
         
        const getByIdFilmRequest = validation.value

        try {
            const filmUsecase = new FilmUsecase(AppDataSource);

            const getByIdFilm = await filmUsecase.getFilmById(getByIdFilmRequest.id)
            if (getByIdFilm === null) {
                res.status(404).send({"error": `film ${getByIdFilmRequest.id} not found`})
                return
            }
            res.status(200).send(getByIdFilm)
        }catch (error){
            console.log(error)
            res.status(500).send({ error: "Internal error" }) 
        } 
    })


/**
 * @openapi
 * /films:
 *   get:
 *     summary: Retrieve all films accessible to authenticated users
 *     description: Fetches a list of all films available to the authenticated user. If no films are available, a 404 is returned.
 *     tags:
 *       - Film
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of films retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Film'
 *       404:
 *         description: No movies available.
 *       500:
 *         description: Internal server error due to backend issues.
 */
    // Accessible pour les users authentifiés
    app.get("/films",authMiddleware, async (req: Request, res: Response) => { 

        try {
            const filmUsecase = new FilmUsecase(AppDataSource);

            const getFilm = await filmUsecase.getFilmAuth()
            if (getFilm === null) {
                res.status(404).send({"error": `no movies available.`})
                return
            }
            res.status(200).send(getFilm)
        }catch (error){
            console.log(error)
            res.status(500).send({ error: "Internal error" }) 
        } 
    })

    /**
 * @openapi
 * /films:
 *   post:
 *     summary: Create a new film
 *     tags:
 *       - Film
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Film'
 *     responses:
 *       201:
 *         description: Film created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
    // Accessible pour les admins
    app.post("/films",authMiddleware,roleMiddleware,async (req: Request, res: Response) => {
        const validation = filmValidation.validate(req.body)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const filmRequest = validation.value
        const filmRepo = AppDataSource.getRepository(Film)
        try {
            const filmCreated = await filmRepo.save(
                filmRequest
            )
            res.status(201).send(filmCreated)
        } catch (error) {
            res.status(500).send({ error: "Internal error" })
        }
    })


    /**
 * @openapi
 * /films/{id}:
 *   delete:
 *     summary: Delete a film
 *     tags:
 *       - Film
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Film deleted successfully
 *       404:
 *         description: Film not found
 *       500:
 *         description: Internal server error
 */
    // Accessible pour les admins
    app.delete("/films/:id",authMiddleware, roleMiddleware, async (req: Request, res: Response) => {
        const validation = deleteFilmValidation.validate(req.params)

        if(validation.error){
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const deleteFilmRequest = validation.value
        try {
            const filmUsecase = new FilmUsecase(AppDataSource);

            const deleteFilm= await filmUsecase.deleteFilm(deleteFilmRequest.id)
            if (deleteFilm === null) {
                res.status(404).send({"error": `film ${deleteFilmRequest.id} not found`})
                return
            }
            res.status(200).send(deleteFilm)
        }catch (error){
            console.log(error)
            res.status(500).send({ error: "Internal error" }) 
        }
        
    })
    

    /**
 * @openapi
 * /films/{id}:
 *   patch:
 *     summary: Update film details
 *     tags:
 *       - Film
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Film'
 *     responses:
 *       200:
 *         description: Film updated successfully
 *       404:
 *         description: Film not found
 *       500:
 *         description: Internal server error
 */
    // Accessible pour les admins
    app.patch("/films/:id", authMiddleware, roleMiddleware, async (req: Request, res: Response) => {

        const validation = updateFilmValidation.validate({...req.params, ...req.body})

        
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const updateFilmRequest = validation.value

        try {
            const filmUsecase = new FilmUsecase(AppDataSource);
            const updatedFilm = await filmUsecase.updateFilm(updateFilmRequest.id, { ...updateFilmRequest })
            if (updatedFilm === null) {
                res.status(404).send({"error": `film ${updateFilmRequest.id} not found`})
                return
            }
            res.status(200).send(updatedFilm)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    /**
 * @openapi
 * /seances:
 *   get:
 *     summary: List film sessions
 *     tags:
 *       - Seance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sessions listed successfully
 *       500:
 *         description: Internal server error
 */
    app.get("/salles", authMiddleware, async (req: Request, res: Response) => {
        const validation = listSalleValidation.validate(req.query)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const listSalleRequest = validation.value
        let limit = 20
        if (listSalleRequest.limit) {
            limit = listSalleRequest.limit
        }
        const page = listSalleRequest.page ?? 1

        try {
            const salleUsecase = new SalleUsecase(AppDataSource);
            const listSalle = await salleUsecase.salleList({ ...listSalleRequest, page, limit })
            res.status(200).send(listSalle)
        } catch (error) {   
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    /**
 * @openapi
 * /salles/{id}/planning:
 *   get:
 *     summary: Get the planning for a specific room
 *     tags:
 *       - Room
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the room
 *     responses:
 *       200:
 *         description: Planning retrieved successfully
 *       404:
 *         description: No seances found
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
    app.get("/salles/:id/planning", authMiddleware, async (req: Request, res: Response) => {

        const validation = planningSalleValidation.validate({...req.params, ...req.body})

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const planningSalleRequest = validation.value

        try {
            const salleUsecase = new SalleUsecase(AppDataSource);
            const listeSalles= await salleUsecase.planningSeance(planningSalleRequest.id, {...planningSalleRequest})
            if (listeSalles === null) {
                res.status(404).send({"error": `not seances found`})
                return
            }
            res.status(200).send(listeSalles)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    /**
 * @openapi
 * /salles/{id}:
 *   patch:
 *     summary: Update room details
 *     tags:
 *       - Room
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the room to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Room'
 *     responses:
 *       200:
 *         description: Room updated successfully
 *       404:
 *         description: Room not found
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
    app.patch("/salles/:id", authMiddleware, roleMiddleware, async (req: Request, res: Response) => {

        const validation = updateSalleValidation.validate({...req.params, ...req.body})

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const updateSalleRequest = validation.value

        try {
            const salleUsecase = new SalleUsecase(AppDataSource);
            const updatedSalle = await salleUsecase.updateSalle(updateSalleRequest.id, { ...updateSalleRequest })
            if (updatedSalle === null) {
                res.status(404).send({"error": `salle ${updateSalleRequest.id} not found`})
                return
            }
            res.status(200).send(updatedSalle)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    /**
 * @openapi
 * /salles:
 *   post:
 *     summary: Create a new room
 *     tags:
 *       - Room
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Room'
 *     responses:
 *       201:
 *         description: Room created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
    app.post("/salles", authMiddleware, roleMiddleware, async (req: Request, res: Response) => {
        const validation = salleValidation.validate(req.body)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const salleRequest = validation.value
        const salleRepo = AppDataSource.getRepository(Salle)
        try {

            const salleCreated = await salleRepo.save(
                salleRequest
            )
            res.status(201).send(salleCreated)
        } catch (error) {
            res.status(500).send({ error: "Internal error" })
        }
    })


    /**
 * @openapi
 * /salles/{id}:
 *   delete:
 *     summary: Delete a room
 *     tags:
 *       - Room
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the room to delete
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *       404:
 *         description: Room not found
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
    app.delete("/salles/:id", authMiddleware, roleMiddleware, async (req: Request, res: Response) => {
        try {
            const validationResult = salleIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const salleId = validationResult.value

            const salleRepository = AppDataSource.getRepository(Salle)
            const salle = await salleRepository.findOneBy({ id: salleId.id })
            if (salle === null) {
                res.status(404).send({ "error": `salle ${salleId.id} not found` })
                return
            }

            const salleDeleted = await salleRepository.remove(salle)
            res.status(200).send(salleDeleted)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    /**
 * @openapi
 * /seances:
 *   post:
 *     summary: Schedule a new seance
 *     tags:
 *       - Seance
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Seance'
 *     responses:
 *       201:
 *         description: Seance created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
    app.post("/seances", authMiddleware, roleMiddleware, async (req: Request, res: Response) => {

        const validation = seanceValidation.validate(req.body)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const seanceRequest = validation.value
        try {
            const seanceUsecase = new SeanceUsecase(AppDataSource)
            const createdSeance = await seanceUsecase.createSeance(seanceRequest)
            res.status(201).send(createdSeance)
        } catch (error) {
            res.status(500).send((error as Error).message)
        }
    })

    /**
 * @openapi
 * /seances:
 *   get:
 *     summary: List all seances
 *     tags:
 *       - Seance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of seances per page
 *     responses:
 *       200:
 *         description: List of seances retrieved successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
    app.get("/seances", authMiddleware, async (req: Request, res: Response) => {
        const validation = listSeanceValidation.validate(req.query)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const listSeanceRequest = validation.value
        let limit = 20
        if (listSeanceRequest.limit) {
            limit = listSeanceRequest.limit
        }
        const page = listSeanceRequest.page ?? 1

        try {
            const seanceUsecase = new SeanceUsecase(AppDataSource);
            const listSeance= await seanceUsecase.seanceList({ ...listSeanceRequest, page, limit })
            res.status(200).send(listSeance)
        } catch (error) {   
            console.log(error) 
            res.status(500).send({ error: "Internal error" })
        }
    })

    /**
 * @openapi
 * /seances/planning:
 *   get:
 *     summary: Get the planning for seances
 *     tags:
 *       - Seance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Planning retrieved successfully
 *       404:
 *         description: No seances found
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
    app.get("/seances/planning", authMiddleware, async (req: Request, res: Response) => {

        const validation = planningSeanceValidation.validate(req.body)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const planningSalleRequest = validation.value

        try {
            const seanceUsecase = new SeanceUsecase(AppDataSource);
            const listSeances= await seanceUsecase.planningSeance(planningSalleRequest)
            if (listSeances === null) {
                res.status(404).send({"error": `not seances found`})
                return
            }
            res.status(200).send(listSeances)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    /**
 * @openapi
 * /seances/{id}:
 *   delete:
 *     summary: Delete a seance
 *     tags:
 *       - Seance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the seance to delete
 *     responses:
 *       200:
 *         description: Seance deleted successfully
 *       404:
 *         description: Seance not found
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
    app.delete("/seances/:id", authMiddleware, roleMiddleware, async (req: Request, res: Response) => {
        try {
            const validationResult = seanceIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const seanceId = validationResult.value

            const seanceRepository = AppDataSource.getRepository(Seance)
            const seance = await seanceRepository.findOneBy({ id: seanceId.id })
            if (seance === null) {
                res.status(404).send({ "error": `salle ${seanceId.id} not found` })
                return
            }

            const salleDeleted = await seanceRepository.remove(seance)
            res.status(200).send(salleDeleted)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    /**
 * @openapi
 * /seances/{id}:
 *   patch:
 *     summary: Update a seance
 *     tags:
 *       - Seance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the seance to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Seance'
 *     responses:
 *       200:
 *         description: Seance updated successfully
 *       404:
 *         description: Seance not found
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
    app.patch("/seances/:id", authMiddleware, roleMiddleware, async (req: Request, res: Response) => {
        
        const validation = updateSeanceValidation.validate({...req.params, ...req.body})

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const updateSeanceRequest = validation.value
        console.log(updateSeanceRequest)
        try {
            const seanceUsecase = new SeanceUsecase(AppDataSource);
            const updatedSeance = await seanceUsecase.updateSeance(updateSeanceRequest.id, { ...updateSeanceRequest })
            if (updatedSeance === null) {
                res.status(404).send({"error": `seance ${updateSeanceRequest.id} not found`})
                return
            }
            res.status(200).send(updatedSeance)
        } catch (error) {
            console.log(error)
            res.status(500).send((error as Error).message)
        }
    })
    UserHandler(app)
}