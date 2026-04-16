/*
  Warnings:

  - You are about to drop the column `condition_id` on the `Filter` table. All the data in the column will be lost.
  - You are about to drop the `Condition` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[search,min_cost,max_cost,brand_id,state_id]` on the table `Filter` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Filter` DROP FOREIGN KEY `Filter_condition_id_fkey`;

-- DropIndex
DROP INDEX `Filter_condition_id_fkey` ON `Filter`;

-- DropIndex
DROP INDEX `Filter_search_min_cost_max_cost_brand_id_condition_id_key` ON `Filter`;

-- AlterTable
ALTER TABLE `Filter` DROP COLUMN `condition_id`,
    ADD COLUMN `state_id` INTEGER NULL;

-- DropTable
DROP TABLE `Condition`;

-- CreateTable
CREATE TABLE `State` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FilterState` (
    `filter_id` INTEGER NOT NULL,
    `state_id` INTEGER NOT NULL,

    PRIMARY KEY (`filter_id`, `state_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Filter_search_min_cost_max_cost_brand_id_state_id_key` ON `Filter`(`search`, `min_cost`, `max_cost`, `brand_id`, `state_id`);

-- AddForeignKey
ALTER TABLE `Filter` ADD CONSTRAINT `Filter_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `State`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FilterState` ADD CONSTRAINT `FilterState_filter_id_fkey` FOREIGN KEY (`filter_id`) REFERENCES `Filter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FilterState` ADD CONSTRAINT `FilterState_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `State`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
