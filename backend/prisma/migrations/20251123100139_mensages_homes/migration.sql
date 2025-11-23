/*
  Warnings:

  - You are about to drop the column `tamañoEquipo` on the `proyectos` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `mensajes` DROP FOREIGN KEY `Mensaje_proyectoId_fkey`;

-- AlterTable
ALTER TABLE `proyectos` DROP COLUMN `tamañoEquipo`,
    ADD COLUMN `tamanoEquipo` VARCHAR(100) NULL,
    MODIFY `fechaLimite` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `mensajes` ADD CONSTRAINT `mensajes_proyectoId_fkey` FOREIGN KEY (`proyectoId`) REFERENCES `proyectos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
