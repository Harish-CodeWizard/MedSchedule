import express from "express";
import { createMedicine, getAllMedicines,deleteMedicine} from "../controllers/otherActiveControler.js";

const router = express.Router();

router.post("/", createMedicine);
router.get("/", getAllMedicines);
router.delete("/:id", deleteMedicine);
// router.get("/data", PreceptionStatusSuccess);
// router.get("/:id", getPatientById);
// router.put("/:id", updatePatient);


export default router;
