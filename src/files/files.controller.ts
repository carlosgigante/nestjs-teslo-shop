import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';


@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
    ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response, // Esto hace que nest no tenga control sobre la respuesta de lo que esta debajo del decorador, le deja la libertad al programador de controlar la respuesta
    @Param('imageName') imageName: string
  ){

    const path = this.filesService.getStaticProductImage(imageName);

    // return path; // Hcaiendolo asi, dejabamos que nest decidiera la respuesta, por lo que iba a mandar el path (la ubiccacion del  archivo en nuestra pc) al usuario

    res.sendFile(path); // Con el decorador res, nosotros le decimos que va a mostrar, en este caso enseñamos la imagen directamente
  } 

  @Post('product')
  @UseInterceptors(FileInterceptor('file',{
    fileFilter: fileFilter,
    // limits: {fileSize: 1000} // aqui decimos el limite del tamaño de la imagen
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  uploadProductImage(@UploadedFile() file: Express.Multer.File){ // aqui se espera un archivo, eso se usa para el tipado
    if(!file){
      throw new BadRequestException('Make sure that the file is an image');
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;

    return {
      secureUrl
    };
  }
}
