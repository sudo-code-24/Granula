/*
  Warnings:

  - You are about to drop the column `brand` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sku]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `brandId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Product` table without a default value. This is not possible if the table is not empty.

*/

-- First, create the new tables

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "public"."Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "public"."Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "public"."Brand"("name");

-- Insert default categories and brands
INSERT INTO "public"."Category" ("id", "name", "description", "slug", "isActive", "createdAt", "updatedAt") VALUES
('cat_electronics', 'Electronics', 'Electronic devices and gadgets', 'electronics', true, NOW(), NOW()),
('cat_computers', 'Computers', 'Laptops, desktops, and computer accessories', 'computers', true, NOW(), NOW()),
('cat_audio', 'Audio', 'Headphones, speakers, and audio equipment', 'audio', true, NOW(), NOW()),
('cat_fashion', 'Fashion', 'Clothing, shoes, and fashion accessories', 'fashion', true, NOW(), NOW()),
('cat_home_kitchen', 'Home & Kitchen', 'Home appliances and kitchen equipment', 'home-kitchen', true, NOW(), NOW());

INSERT INTO "public"."Brand" ("id", "name", "description", "isActive", "createdAt", "updatedAt") VALUES
('brand_apple', 'Apple', 'Technology company known for innovative products', true, NOW(), NOW()),
('brand_samsung', 'Samsung', 'Global technology company', true, NOW(), NOW()),
('brand_dell', 'Dell', 'Computer technology company', true, NOW(), NOW()),
('brand_sony', 'Sony', 'Japanese multinational conglomerate', true, NOW(), NOW()),
('brand_nike', 'Nike', 'American multinational corporation', true, NOW(), NOW()),
('brand_adidas', 'Adidas', 'German multinational corporation', true, NOW(), NOW()),
('brand_levis', 'Levi''s', 'American clothing company', true, NOW(), NOW()),
('brand_uniqlo', 'Uniqlo', 'Japanese casual wear designer', true, NOW(), NOW()),
('brand_kitchenaid', 'KitchenAid', 'American home appliance brand', true, NOW(), NOW()),
('brand_dyson', 'Dyson', 'British technology company', true, NOW(), NOW());

-- Add new columns to Product table with default values
ALTER TABLE "public"."Product" 
ADD COLUMN "brandId" TEXT,
ADD COLUMN "categoryId" TEXT,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "sku" TEXT,
ADD COLUMN "slug" TEXT;

-- Update existing products with proper category and brand IDs
UPDATE "public"."Product" SET 
  "categoryId" = 'cat_electronics',
  "brandId" = 'brand_apple',
  "slug" = LOWER(REPLACE("title", ' ', '-'))
WHERE "category" = 'Electronics' AND "brand" = 'Apple';

UPDATE "public"."Product" SET 
  "categoryId" = 'cat_electronics',
  "brandId" = 'brand_samsung',
  "slug" = LOWER(REPLACE("title", ' ', '-'))
WHERE "category" = 'Electronics' AND "brand" = 'Samsung';

UPDATE "public"."Product" SET 
  "categoryId" = 'cat_computers',
  "brandId" = 'brand_apple',
  "slug" = LOWER(REPLACE("title", ' ', '-'))
WHERE "category" = 'Computers' AND "brand" = 'Apple';

UPDATE "public"."Product" SET 
  "categoryId" = 'cat_computers',
  "brandId" = 'brand_dell',
  "slug" = LOWER(REPLACE("title", ' ', '-'))
WHERE "category" = 'Computers' AND "brand" = 'Dell';

UPDATE "public"."Product" SET 
  "categoryId" = 'cat_audio',
  "brandId" = 'brand_sony',
  "slug" = LOWER(REPLACE("title", ' ', '-'))
WHERE "category" = 'Audio' AND "brand" = 'Sony';

UPDATE "public"."Product" SET 
  "categoryId" = 'cat_audio',
  "brandId" = 'brand_apple',
  "slug" = LOWER(REPLACE("title", ' ', '-'))
WHERE "category" = 'Audio' AND "brand" = 'Apple';

UPDATE "public"."Product" SET 
  "categoryId" = 'cat_fashion',
  "brandId" = 'brand_nike',
  "slug" = LOWER(REPLACE("title", ' ', '-'))
WHERE "category" = 'Fashion' AND "brand" = 'Nike';

UPDATE "public"."Product" SET 
  "categoryId" = 'cat_fashion',
  "brandId" = 'brand_adidas',
  "slug" = LOWER(REPLACE("title", ' ', '-'))
WHERE "category" = 'Fashion' AND "brand" = 'Adidas';

UPDATE "public"."Product" SET 
  "categoryId" = 'cat_fashion',
  "brandId" = 'brand_levis',
  "slug" = LOWER(REPLACE("title", ' ', '-'))
WHERE "category" = 'Fashion' AND "brand" = 'Levi''s';

UPDATE "public"."Product" SET 
  "categoryId" = 'cat_fashion',
  "brandId" = 'brand_uniqlo',
  "slug" = LOWER(REPLACE("title", ' ', '-'))
WHERE "category" = 'Fashion' AND "brand" = 'Uniqlo';

UPDATE "public"."Product" SET 
  "categoryId" = 'cat_home_kitchen',
  "brandId" = 'brand_kitchenaid',
  "slug" = LOWER(REPLACE("title", ' ', '-'))
WHERE "category" = 'Home & Kitchen' AND "brand" = 'KitchenAid';

UPDATE "public"."Product" SET 
  "categoryId" = 'cat_home_kitchen',
  "brandId" = 'brand_dyson',
  "slug" = LOWER(REPLACE("title", ' ', '-'))
WHERE "category" = 'Home & Kitchen' AND "brand" = 'Dyson';

-- Make the new columns NOT NULL after updating data
ALTER TABLE "public"."Product" ALTER COLUMN "brandId" SET NOT NULL;
ALTER TABLE "public"."Product" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "public"."Product" ALTER COLUMN "slug" SET NOT NULL;

-- Drop the old columns
ALTER TABLE "public"."Product" DROP COLUMN "brand";
ALTER TABLE "public"."Product" DROP COLUMN "category";

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "public"."Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "public"."Product"("slug");

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
