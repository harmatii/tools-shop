/*
  Warnings:

  - You are about to drop the column `numReviews` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "numReviews",
DROP COLUMN "rating";
