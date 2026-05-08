/*
  Warnings:

  - A unique constraint covering the columns `[category_id]` on the table `VintedCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `VintedCategory_category_id_key` ON `VintedCategory`(`category_id`);
