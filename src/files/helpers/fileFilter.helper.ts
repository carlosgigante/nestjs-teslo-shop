export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
    
    // console.log({file});
    if(!file) return callback(new Error('file is empty'), false);

    const fileExtension = file.mimetype.split('/')[1]; // mimetype define que tipo de archivo es, que si jpg, pdf, word, etc
    const validExtensions = ['jpg','jpeg','png','gif'];

    if(validExtensions.includes(fileExtension)){
        return callback(null, true)
    }

    callback(null, false); // el true y el false del callback decide si se acepta o no el archivo, si se acepta es true, si se rechaza es false
}