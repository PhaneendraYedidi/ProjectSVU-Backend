import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (!file.originalname.endsWith(".xlsx")) {
      cb(new Error("Only Excel files allowed"));
    } else {
      cb(null, true);
    }
  }
});
