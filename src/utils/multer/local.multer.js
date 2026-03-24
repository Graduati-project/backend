import multer from "multer";
import path from "node:path";
import fs from "node:fs";
export const fileValidation = {
  image: ["image/png", "image/jpeg", "image/gif"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  video: ["video/mp4", "video/mpeg", "video/quicktime"],
  audio: ["audio/mpeg", "audio/mp3", "audio/ogg", "audio/wav"],
  other: [],
};

export const localfileUpload = ({
  customPath = "general",
  validation = [],
} = {}) => {
  const basePath = `uploads/${customPath}`;

  const storage = multer.diskStorage({
    destination: function (req, file, callback) {
      let destPath = basePath;

      if (req.user?._id) {
        destPath += `/${req.user._id}`;
      }

      req.destPath = destPath;
      const fullPath = path.resolve(`./src/${destPath}`);

      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }

      callback(null, fullPath);
    },

    filename: function (req, file, callback) {
      const uniqueFileName =
        Date.now() + "_" + Math.random() + "_" + file.originalname;
      file.finalPath = req.destPath + "/" + uniqueFileName;
      callback(null, uniqueFileName);
    },
  });

  const fileFilter = function (req, file, callback) {
    if (validation.includes(file.mimetype)) {
      return callback(null, true);
    }
    return callback(new Error("In-Valid file format"), false);
  };

  return multer({
    dest: "./temp",
    fileFilter,
    storage,
  });
};
