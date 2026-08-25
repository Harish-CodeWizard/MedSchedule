import express from "express";
import { createMedicine, getAllMedicines,deleteMedicine} from "../controllers/otherActiveControler.js";
import { authenticateUser, authorizeRoles, ROLE_GROUPS } from "../middleware/auth.js";

const router = express.Router();

router.post(
	"/",
	authenticateUser,
	authorizeRoles(ROLE_GROUPS.PHARMACIST, ROLE_GROUPS.ADMIN_RECEPTION),
	createMedicine
);
router.get(
	"/",
	authenticateUser,
	authorizeRoles(ROLE_GROUPS.PHARMACIST, ROLE_GROUPS.ADMIN_RECEPTION),
	getAllMedicines
);
router.delete(
	"/:id",
	authenticateUser,
	authorizeRoles(ROLE_GROUPS.PHARMACIST, ROLE_GROUPS.ADMIN_RECEPTION),
	deleteMedicine
);
// router.get("/data", PreceptionStatusSuccess);
// router.get("/:id", getPatientById);
// router.put("/:id", updatePatient);


export default router;
