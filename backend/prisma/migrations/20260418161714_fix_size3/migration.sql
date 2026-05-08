-- DropForeignKey
ALTER TABLE `Size` DROP FOREIGN KEY `Size_category_id_fkey`;

-- DropIndex
DROP INDEX `Size_category_id_fkey` ON `Size`;

-- AddForeignKey
ALTER TABLE `Size` ADD CONSTRAINT `Size_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
