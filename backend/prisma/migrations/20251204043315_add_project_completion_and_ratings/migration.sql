-- AlterTable
ALTER TABLE `proyectos` ADD COLUMN `estadoFinalizacion` VARCHAR(191) NULL DEFAULT 'pendiente',
    ADD COLUMN `fechaFinalizacion` DATETIME(3) NULL,
    ADD COLUMN `usuarioAsignadoId` INTEGER NULL;

-- CreateTable
CREATE TABLE `proyecto_calificaciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `proyectoId` INTEGER NOT NULL,
    `calificadorId` INTEGER NOT NULL,
    `calificadoId` INTEGER NOT NULL,
    `puntuacion` INTEGER NOT NULL,
    `comentario` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `proyecto_calificaciones_proyectoId_calificadorId_key`(`proyectoId`, `calificadorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `proyectos` ADD CONSTRAINT `proyectos_usuarioAsignadoId_fkey` FOREIGN KEY (`usuarioAsignadoId`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proyecto_calificaciones` ADD CONSTRAINT `proyecto_calificaciones_proyectoId_fkey` FOREIGN KEY (`proyectoId`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proyecto_calificaciones` ADD CONSTRAINT `proyecto_calificaciones_calificadorId_fkey` FOREIGN KEY (`calificadorId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proyecto_calificaciones` ADD CONSTRAINT `proyecto_calificaciones_calificadoId_fkey` FOREIGN KEY (`calificadoId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
