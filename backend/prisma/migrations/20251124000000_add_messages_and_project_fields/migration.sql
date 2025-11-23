-- Add new fields to Proyecto table
ALTER TABLE `proyectos` ADD COLUMN `fechaLimite` DATETIME NULL;
ALTER TABLE `proyectos` ADD COLUMN `tamañoEquipo` VARCHAR(100) NULL;
ALTER TABLE `proyectos` ADD COLUMN `adjuntos` TEXT NULL;

-- Add conversation tracking to Mensaje table
ALTER TABLE `mensajes` ADD COLUMN `proyectoId` INT NULL;
ALTER TABLE `mensajes` ADD COLUMN `conversacionId` VARCHAR(100) NULL;

-- Add foreign key for proyecto in mensajes
ALTER TABLE `mensajes` ADD CONSTRAINT `Mensaje_proyectoId_fkey` FOREIGN KEY (`proyectoId`) REFERENCES `proyectos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index for conversation queries
CREATE INDEX `mensajes_conversacionId_idx` ON `mensajes`(`conversacionId`);
CREATE INDEX `mensajes_proyectoId_idx` ON `mensajes`(`proyectoId`);
