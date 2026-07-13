import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const electronics = await prisma.category.create({
    data: { name: 'Eletrônicos', status: 1 },
  });

  const books = await prisma.category.create({
    data: { name: 'Livros', status: 1 },
  });

  const clothing = await prisma.category.create({
    data: { name: 'Roupas', status: 1 },
  });

  const home = await prisma.category.create({
    data: { name: 'Casa & Decoração', status: 1 },
  });

  const sports = await prisma.category.create({
    data: { name: 'Esportes', status: 1 },
  });

  const draftCategory = await prisma.category.create({
    data: { name: 'Categoria Rascunho', status: 0 },
  });

  const products = [
    { name: 'Smartphone Galaxy S25', price: 4999.99, stock: 50, categoryId: electronics.id, status: 1 },
    { name: 'Notebook Pro 16"', price: 7899.90, stock: 25, categoryId: electronics.id, status: 1 },
    { name: 'Fone Bluetooth ANC', price: 349.90, stock: 120, categoryId: electronics.id, status: 1 },
    { name: 'Monitor 27" 4K', price: 2599.00, stock: 15, categoryId: electronics.id, status: 1 },
    { name: 'Clean Code', price: 129.90, stock: 80, categoryId: books.id, status: 1 },
    { name: 'Domain-Driven Design', price: 199.90, stock: 45, categoryId: books.id, status: 1 },
    { name: 'O Programador Pragmático', price: 149.90, stock: 60, categoryId: books.id, status: 1 },
    { name: 'Design Patterns', price: 179.90, stock: 35, categoryId: books.id, status: 1 },
    { name: 'Camiseta Básica', price: 49.90, stock: 200, categoryId: clothing.id, status: 1 },
    { name: 'Jaqueta Jeans', price: 249.90, stock: 40, categoryId: clothing.id, status: 1 },
    { name: 'Calça Jeans Slim', price: 189.90, stock: 65, categoryId: clothing.id, status: 1 },
    { name: 'Vestido Floral', price: 159.90, stock: 30, categoryId: clothing.id, status: 1 },
    { name: 'Sofá 3 Lugares', price: 2999.00, stock: 5, categoryId: home.id, status: 1 },
    { name: 'Luminária de Mesa', price: 89.90, stock: 100, categoryId: home.id, status: 1 },
    { name: 'Jogo de Panelas', price: 399.90, stock: 20, categoryId: home.id, status: 1 },
    { name: 'Tapete 2x3m', price: 249.90, stock: 15, categoryId: home.id, status: 1 },
    { name: 'Bicicleta Aro 29', price: 2499.00, stock: 10, categoryId: sports.id, status: 1 },
    { name: 'Halter 10kg (par)', price: 159.90, stock: 35, categoryId: sports.id, status: 1 },
    { name: 'Corda de Pular', price: 29.90, stock: 150, categoryId: sports.id, status: 1 },
    { name: 'Colchonete Yoga', price: 79.90, stock: 55, categoryId: sports.id, status: 1 },
    { name: 'Produto Rascunho', price: 99.90, stock: 10, categoryId: electronics.id, status: 0 },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`Seed completed: ${await prisma.category.count()} categories, ${await prisma.product.count()} products`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
