-- DropForeignKey
ALTER TABLE `Filter` DROP FOREIGN KEY `Filter_brand_id_fkey`;

-- DropForeignKey
ALTER TABLE `Filter` DROP FOREIGN KEY `Filter_condition_id_fkey`;

-- DropIndex
DROP INDEX `Filter_brand_id_fkey` ON `Filter`;

-- DropIndex
DROP INDEX `Filter_condition_id_fkey` ON `Filter`;

-- AlterTable
ALTER TABLE `Filter` ADD COLUMN `category_id` INTEGER NULL,
    MODIFY `brand_id` INTEGER NULL,
    MODIFY `condition_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Filter` ADD CONSTRAINT `Filter_brand_id_fkey` FOREIGN KEY (`brand_id`) REFERENCES `Brand`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Filter` ADD CONSTRAINT `Filter_condition_id_fkey` FOREIGN KEY (`condition_id`) REFERENCES `Condition`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Filter` ADD CONSTRAINT `Filter_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
