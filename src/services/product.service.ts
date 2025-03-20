import { Repository } from 'typeorm';
import { AppDataSource } from '../database/db';
import { Product } from '../entities/product.entity';

export class ProductService {
    private productRepository: Repository<Product>;

    constructor() {
        this.productRepository = AppDataSource.getRepository(Product);
    }

    // Get all products with optional pagination
    async getAllWithPagination(page: number = 1, limit: number = 10) {
        try {
            const [products, total] = await this.productRepository.findAndCount({
                skip: (page - 1) * limit,
                take: limit,
                order: { id: 'ASC' }
            });

            return {
                total,
                products: products.map(product => ({
                    id: product.id,
                    name: product.name,
                    price: product.price
                }))
            };
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    // Create a new product
    async create(productData: { name: string; price: number }) {
        try {
            const product = this.productRepository.create(productData);
            const savedProduct = await this.productRepository.save(product);

            return {
                id: savedProduct.id,
                name: savedProduct.name,
                price: savedProduct.price
            };
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    // Update product details
    async update(id: number, updateData: { name?: string; price?: number }) {
        try {
            const product = await this.productRepository.findOne({ where: { id } });

            if (!product) {
                throw new Error('Product not found');
            }

            if (updateData.name) product.name = updateData.name;
            if (updateData.price) product.price = updateData.price;

            const updatedProduct = await this.productRepository.save(product);

            return {
                id: updatedProduct.id,
                name: updatedProduct.name,
                price: updatedProduct.price
            };
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    // Soft delete a product
    async softDelete(id: number) {
        try {
            const product = await this.productRepository.findOne({ where: { id } });

            if (!product) {
                throw new Error('Product not found');
            }

            product.isActive = false;
            await this.productRepository.save(product);

            return {
                id: product.id,
                name: product.name,
                price: product.price,
                isActive: product.isActive
            };
        } catch (error) {
            console.error('Error soft deleting product:', error);
            throw error;
        }
    }

    // Search for a product by name
    async searchByName(name: string) {
        try {
            const products = await this.productRepository.find({
                where: { name: `%${name}%`, isActive: true },
                order: { name: 'ASC' }
            });

            return products.map(product => ({
                id: product.id,
                name: product.name,
                price: product.price
            }));
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }
}
