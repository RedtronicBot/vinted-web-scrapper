/*
  Warnings:

  - You are about to drop the column `size_group_id` on the `Size` table. All the data in the column will be lost.
  - You are about to drop the `SizeGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Size` DROP FOREIGN KEY `Size_size_group_id_fkey`;

-- DropIndex
DROP INDEX `Size_size_group_id_fkey` ON `Size`;

-- AlterTable
ALTER TABLE `Size` DROP COLUMN `size_group_id`,
    ADD COLUMN `category_id` INTEGER NULL;

-- DropTable
DROP TABLE `SizeGroup`;

-- AddForeignKey
ALTER TABLE `Size` ADD CONSTRAINT `Size_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `VintedCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
