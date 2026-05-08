/*
  Warnings:

  - You are about to drop the column `state_id` on the `Filter` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[search,min_cost,max_cost,brand_id]` on the table `Filter` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Filter` DROP FOREIGN KEY `Filter_state_id_fkey`;

-- DropIndex
DROP INDEX `Filter_search_min_cost_max_cost_brand_id_state_id_key` ON `Filter`;

-- DropIndex
DROP INDEX `Filter_state_id_fkey` ON `Filter`;

-- AlterTable
ALTER TABLE `Filter` DROP COLUMN `state_id`;

-- CreateIndex
CREATE UNIQUE INDEX `Filter_search_min_cost_max_cost_brand_id_key` ON `Filter`(`search`, `min_cost`, `max_cost`, `brand_id`);
