import { ApiProperty } from "@nestjs/swagger/dist/decorators";
import { User } from "src/auth/entities/user.entity";
import { text } from "stream/consumers";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./";

// @Entity({name: 'products'}) asi se cambia el nombre a las tablas
@Entity()
export class Product {
    
    @ApiProperty({
        example: 'fb2d7d62-ca36-486e-8f8c-7b0aa18bc868',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'Womens T Logo Short Sleeve Scoop Neck Tee',
        description: 'Product title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true,
    })
    title: string;

    @ApiProperty({
        example: 35,
        description: 'Product Price',
        default: 0
    })
    @Column('float', {
        default: 0,
    })
    price: number;

    @ApiProperty({
        example: 'Designed for style and comfort, the ultrasoft Womens T Logo Short Sleeve Scoop Neck Tee features a tonal 3D silicone-printed T logo on the left chest. Made of 50% Peruvian cotton and 50% Peruvian viscose.',
        description: 'Product description'
    })
    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @ApiProperty({
        example: 'women_t_logo_short_sleeve_scoop_neck_tee',
        description: 'Product slog created from products title - For SEO',
        uniqueItems: true
    })
    @Column('text', {
        unique: true,
    })
    slug: string;

    @ApiProperty({
        example: 30,
        description: 'Product quantity',
        default: 0
    })
    @Column('int',{
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        description: 'Product sizes [array]'
    })
    @Column('text',{
        array: true,
    })
    sizes: string[];

    @ApiProperty({
        example: 'women',
        description: 'Product gender'
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example: ['shirt'],
        description: 'Product ID',
        default: []
    })
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    // Relacion con la tabla productimage
    @ApiProperty({
        example: ['8765090-00-A_1.jpg', '8765090-00-A_0_2000.jpg'],
        description: 'Product image'
    })
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        {cascade: true, eager: true}
    )
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }
    )
    user: User

    @BeforeInsert()
    checkSlogInsert(){
        if(!this.slug){
            this.slug = this.title;
        }
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')
            .replaceAll("-",'')
    }
    @BeforeUpdate()
    checkSlogUpdate(){
        
    this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ','_')
        .replaceAll("'",'')
        .replaceAll("-",'')
    }

}
