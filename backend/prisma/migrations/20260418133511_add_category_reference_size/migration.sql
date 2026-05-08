-- AlterTable
ALTER TABLE `Size` ADD COLUMN `category_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Size` ADD CONSTRAINT `Size_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `VintedCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
