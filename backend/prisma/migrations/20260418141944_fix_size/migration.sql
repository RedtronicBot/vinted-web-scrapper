-- AlterTable
ALTER TABLE `Size` ADD COLUMN `size_group_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `SizeGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Size` ADD CONSTRAINT `Size_size_group_id_fkey` FOREIGN KEY (`size_group_id`) REFERENCES `SizeGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
