/*
  Warnings:

  - You are about to drop the column `category_id` on the `Size` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Size` DROP FOREIGN KEY `Size_category_id_fkey`;

-- DropIndex
DROP INDEX `Size_category_id_fkey` ON `Size`;

-- AlterTable
ALTER TABLE `Size` DROP COLUMN `category_id`;
