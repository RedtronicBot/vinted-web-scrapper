/*
  Warnings:

  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.

*/
-- DropForeignKey
ALTER TABLE `Product` DROP FOREIGN KEY `Product_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `Product` DROP FOREIGN KEY `Product_member_id_fkey`;

-- DropIndex
DROP INDEX `Product_category_id_fkey` ON `Product`;

-- DropIndex
DROP INDEX `Product_member_id_fkey` ON `Product`;

-- AlterTable
ALTER TABLE `Product` MODIFY `price` DECIMAL(65, 30) NOT NULL,
    MODIFY `member_id` INTEGER NULL,
    MODIFY `category_id` INTEGER NULL,
    MODIFY `sell_at` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `Member`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
