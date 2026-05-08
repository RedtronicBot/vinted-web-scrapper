-- DropForeignKey
ALTER TABLE `Product` DROP FOREIGN KEY `Product_filter_id_fkey`;

-- DropIndex
DROP INDEX `Product_filter_id_fkey` ON `Product`;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_filter_id_fkey` FOREIGN KEY (`filter_id`) REFERENCES `Filter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
