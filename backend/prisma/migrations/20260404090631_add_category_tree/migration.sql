-- AlterTable
ALTER TABLE `Category` ADD COLUMN `parent_id` INTEGER NULL,
    ADD COLUMN `position` INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
