import { Router } from "express";
import { authRouter } from "./auth.route";
import { userRouter } from "./user.route";
import { createAndGetMeSuperAdminRouter } from "./createAndGetMe_super_admin.route";
import { coachRouter } from "./coach.route";
import { adminRouter } from "./admin.route";
import { customerRouter } from "./customer.route";
import { gymRouter } from "./gym.route";
import { sportRouter } from "./sport.route";
import { gymSportRouter } from "./gypSport.route";
import { userGymRouter } from "./userGym.route";
import { userSportRouter } from "./userSport.route";
import { adminGymRouter } from "./adminGym.route";

let router:Router = Router()
router.use("/auth",authRouter)
router.use("/user",userRouter)
router.use("/admin",adminRouter)
router.use("/superAdmin",createAndGetMeSuperAdminRouter)
router.use("/coach",coachRouter)
router.use("/customer",customerRouter)
router.use("/gym",gymRouter)
router.use("/sport",sportRouter)
router.use("/gymSport",gymSportRouter)
router.use("/userGym",userGymRouter)
router.use("/userSport",userSportRouter)
router.use("/adminGym",adminGymRouter)


export {router} 