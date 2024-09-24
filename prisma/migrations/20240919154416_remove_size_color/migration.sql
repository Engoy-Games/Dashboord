/*
  Warnings:

  - You are about to drop the column `colorId` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `sizeId` on the `product` table. All the data in the column will be lost.
  - You are about to drop the `color` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `size` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX `Product_colorId_idx` ON `product`;

-- DropIndex
DROP INDEX `Product_sizeId_idx` ON `product`;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `colorId`,
    DROP COLUMN `sizeId`;

-- DropTable
DROP TABLE `color`;

-- DropTable
DROP TABLE `size`;
