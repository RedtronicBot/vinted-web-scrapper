-- DropForeignKey
ALTER TABLE `Product` DROP FOREIGN KEY `Product_category_id_fkey`;

-- DropIndex
DROP INDEX `Product_category_id_fkey` ON `Product`;

-- CreateTable
CREATE TABLE `VintedCategory` (
    `id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `VintedCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VintedCategory` ADD CONSTRAINT `VintedCategory_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
