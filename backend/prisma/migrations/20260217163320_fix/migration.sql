/*
  Warnings:

  - You are about to drop the column `link` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[url]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Product_link_key` ON `Product`;

-- AlterTable
ALTER TABLE `Product` DROP COLUMN `link`;

-- CreateIndex
CREATE UNIQUE INDEX `Product_url_key` ON `Product`(`url`);
