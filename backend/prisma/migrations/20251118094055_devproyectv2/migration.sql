-- AlterTable
ALTER TABLE `postulaciones` ADD COLUMN `fechaRespuesta` DATETIME(3) NULL,
    ADD COLUMN `mensaje` TEXT NULL,
    ADD COLUMN `presupuestoPropuesto` DECIMAL(10, 2) NULL,
    ADD COLUMN `propuesta` TEXT NULL;

-- AlterTable
ALTER TABLE `proyectos` ADD COLUMN `destacado` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `duracionEstimada` VARCHAR(50) NULL,
    ADD COLUMN `presupuesto` DECIMAL(10, 2) NULL,
    ADD COLUMN `presupuestoTipo` VARCHAR(50) NULL,
    ADD COLUMN `tipoProyecto` VARCHAR(50) NULL,
    ADD COLUMN `ubicacion` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `activo` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `apellido` VARCHAR(191) NULL,
    ADD COLUMN `rol` VARCHAR(191) NOT NULL DEFAULT 'usuario';

-- CreateIndex
CREATE INDEX `mensajes_destinatario_leido_idx` ON `mensajes`(`destinatario`, `leido`);

-- CreateIndex
CREATE INDEX `postulaciones_estado_idx` ON `postulaciones`(`estado`);

-- CreateIndex
CREATE INDEX `proyectos_estado_destacado_idx` ON `proyectos`(`estado`, `destacado`);

-- RenameIndex
ALTER TABLE `proyectos` RENAME INDEX `proyectos_usuarioCreadorId_fkey` TO `proyectos_usuarioCreadorId_idx`;
