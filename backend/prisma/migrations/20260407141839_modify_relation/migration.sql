-- DropForeignKey
ALTER TABLE `Filter` DROP FOREIGN KEY `Filter_category_id_fkey`;

-- DropIndex
DROP INDEX `Filter_category_id_fkey` ON `Filter`;

-- AddForeignKey
ALTER TABLE `Filter` ADD CONSTRAINT `Filter_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `VintedCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
