import multer from "multer";
import path from "path";
import fs from "fs";

/*
|--------------------------------------------------------------------------
| Upload directory
|--------------------------------------------------------------------------
*/

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "company-documents"
);


/*
|--------------------------------------------------------------------------
| Create directory if it doesn't exist
|--------------------------------------------------------------------------
*/

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}


/*
|--------------------------------------------------------------------------
| Storage configuration
|--------------------------------------------------------------------------
*/

const storage = multer.diskStorage({

  destination: (
    _req,
    _file,
    cb
  ) => {
    cb(null, uploadDirectory);
  },

  filename: (
    _req,
    file,
    cb
  ) => {

    const uniqueSuffix =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}`;

    const extension =
      path.extname(file.originalname);

    const baseName =
      path
        .basename(
          file.originalname,
          extension
        )
        .replace(
          /[^a-zA-Z0-9-_]/g,
          "-"
        );

    cb(
      null,
      `${baseName}-${uniqueSuffix}${extension}`
    );
  },
});


/*
|--------------------------------------------------------------------------
| File type validation
|--------------------------------------------------------------------------
*/
const fileFilter: multer.Options["fileFilter"] =
  (_req, file, cb) => {

    console.log(
      "UPLOAD FILE:",
      file.originalname,
      file.mimetype
    );

    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    const allowedExtensions = [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png",
    ];

    const extension =
      path
        .extname(file.originalname)
        .toLowerCase();

    const validMimeType =
      allowedMimeTypes.includes(
        file.mimetype
      );

    const validExtension =
      allowedExtensions.includes(
        extension
      );

    if (
      validMimeType ||
      validExtension
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only PDF, JPG, and PNG files are allowed"
        )
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Multer upload middleware
|--------------------------------------------------------------------------
*/

export const uploadCompanyDocument =
  multer({
    storage,
    fileFilter,

    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  });

  