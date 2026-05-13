/*
  Warnings:

  - Added the required column `position` to the `Photo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Photo` ADD COLUMN `position` INTEGER NOT NULL;
