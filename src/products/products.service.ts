import { Injectable } from '@nestjs/common';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';
import { Logger } from '@nestjs/common/services';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { PaginationDto } from '../common/dtos/pagination.dto';
import {validate as isUUID} from 'uuid'
import { Product, ProductImage } from './entities';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService')

  constructor(
    @InjectRepository(Product)
    private readonly producRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly producImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ){}

  async create(createProductDto: CreateProductDto) {
    try {
      const {images = [], ...productDetails} = createProductDto;

      const product = this.producRepository.create({
        ...productDetails,
      images: images.map(image => this.producImageRepository.create({url: image}))
    });
      await this.producRepository.save(product);

      return {...product, images};
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const {limit = 10, offset = 0} = paginationDto;
    const products = await this.producRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      }
    });
    return products.map((product) => ({
      ...product,
      images: product.images.map(img => img.url)
    }))
  }

  async findOne(term: string) {

    let product: Product;
    if(isUUID(term)){
      product = await this.producRepository.findOneBy({id: term});
    }else{
      // product = await this.producRepository.findOneBy({slug: term});
      const queryBuilder = this.producRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
        .leftJoinAndSelect('prod.images', 'prodImages') //Leftjoinandselect sirve para al hacer la busqueda muestre todo lo qe esta relacionado  con esa tabla, en eeste caso, las imagenes
        .getOne(); 
    }
    if(!product)
      throw new NotFoundException(`Product with term ${term} not found`);
    return product;
  }

  async findOnePlain(term: string){
    const {images = [], ...rest} = await this.findOne(term);
    return {
      ...rest,
      images: images.map(image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const {images, ...toUpdate} = updateProductDto

    const product = await this.producRepository.preload({id, ...toUpdate});

    if(!product) throw new NotFoundException(`Product with id #${id} not found`);

    // create query runner(ojear si es necesario para refrescar)
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();


    try {

      if(images){
        await queryRunner.manager.delete(ProductImage, {product: {id}}); // Borrar todas las imagenes que tengan el id del producto en cuestión.
        product.images = images.map(image => this.producImageRepository.create({url: image}));
      }

      await queryRunner.manager.save(product);
      // await this.producRepository.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    
    await this.producRepository.remove(product);

    return `The product with id #${id} has been deleted`;
  }

  private handleDBExceptions(error: any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

  // borra todos los productos en la base de datos

  async deleteAllProducts(){
    const query = this.producRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();  
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }


}
