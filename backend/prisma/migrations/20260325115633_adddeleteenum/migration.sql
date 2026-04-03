-- AlterTable
ALTER TABLE `Product` MODIFY `status` ENUM('ACTIVE', 'SOLD', 'DELETE') NOT NULL;
