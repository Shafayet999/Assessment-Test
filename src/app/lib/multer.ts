import multer from "multer";

// Set up Multer for handling file uploads
const storage = multer.memoryStorage();

export const upload = multer({ storage: storage });



// import multer from "multer";

// const storage = multer.memoryStorage();

// export const upload = multer({
//     storage: storage,
//     limits: {
//         fileSize: 2 * 1024 * 1024, // ২ মেগাবাইট
//         files: 1,
//     },
//     fileFilter: (req, file, cb) => {
//         const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

//         if (allowedMimeTypes.includes(file.mimetype)) {
//             cb(null, true); // ফাইল গ্রহণ
//         } else {
//             // সমাধান ১: কেবল এরর অবজেক্ট পাস করা (কোনো false আর্গুমেন্ট ছাড়া)
//             cb(new Error("Only .jpeg, .png and .webp format allowed!"));
//         }
//     },
// });