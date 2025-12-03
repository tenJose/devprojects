-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NULL,
    `fechaNacimiento` DATETIME(3) NULL,
    `password` VARCHAR(191) NOT NULL,
    `fotoPerfil` VARCHAR(191) NULL,
    `descripcion` TEXT NULL,
    `tecnologias` TEXT NULL,
    `lenguajes` TEXT NULL,
    `redesSociales` TEXT NULL,
    `informacionExtra` TEXT NULL,
    `codigoVerificacion` VARCHAR(191) NULL,
    `verificado` BOOLEAN NOT NULL DEFAULT false,
    `rol` VARCHAR(191) NOT NULL DEFAULT 'usuario',
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proyectos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `tecnologias` TEXT NOT NULL,
    `lenguajes` TEXT NULL,
    `tipoProyecto` VARCHAR(50) NULL,
    `presupuesto` DECIMAL(10, 2) NULL,
    `presupuestoTipo` VARCHAR(50) NULL,
    `duracionEstimada` VARCHAR(50) NULL,
    `ubicacion` VARCHAR(100) NULL,
    `fechaLimite` DATETIME(3) NULL,
    `tamanoEquipo` VARCHAR(100) NULL,
    `adjuntos` TEXT NULL,
    `datosAdicionales` TEXT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'activo',
    `destacado` BOOLEAN NOT NULL DEFAULT false,
    `usuarioCreadorId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `proyectos_estado_destacado_idx`(`estado`, `destacado`),
    INDEX `proyectos_usuarioCreadorId_idx`(`usuarioCreadorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `postulaciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `proyectoId` INTEGER NOT NULL,
    `mensaje` TEXT NULL,
    `propuesta` TEXT NULL,
    `presupuestoPropuesto` DECIMAL(10, 2) NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'pendiente',
    `fechaPostulacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaRespuesta` DATETIME(3) NULL,

    INDEX `postulaciones_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mensajes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `remitente` INTEGER NOT NULL,
    `destinatario` INTEGER NOT NULL,
    `contenido` TEXT NOT NULL,
    `leido` BOOLEAN NOT NULL DEFAULT false,
    `proyectoId` INTEGER NULL,
    `conversacionId` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `mensajes_destinatario_leido_idx`(`destinatario`, `leido`),
    INDEX `mensajes_conversacionId_idx`(`conversacionId`),
    INDEX `mensajes_proyectoId_idx`(`proyectoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `amistades` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `solicitanteId` INTEGER NOT NULL,
    `receptorId` INTEGER NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'pendiente',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `amistades_solicitanteId_receptorId_key`(`solicitanteId`, `receptorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificaciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `mensaje` VARCHAR(191) NOT NULL,
    `leido` BOOLEAN NOT NULL DEFAULT false,
    `referenciaId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `proyectos` ADD CONSTRAINT `proyectos_usuarioCreadorId_fkey` FOREIGN KEY (`usuarioCreadorId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `postulaciones` ADD CONSTRAINT `postulaciones_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `postulaciones` ADD CONSTRAINT `postulaciones_proyectoId_fkey` FOREIGN KEY (`proyectoId`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mensajes` ADD CONSTRAINT `mensajes_remitente_fkey` FOREIGN KEY (`remitente`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mensajes` ADD CONSTRAINT `mensajes_destinatario_fkey` FOREIGN KEY (`destinatario`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mensajes` ADD CONSTRAINT `mensajes_proyectoId_fkey` FOREIGN KEY (`proyectoId`) REFERENCES `proyectos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `amistades` ADD CONSTRAINT `amistades_solicitanteId_fkey` FOREIGN KEY (`solicitanteId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `amistades` ADD CONSTRAINT `amistades_receptorId_fkey` FOREIGN KEY (`receptorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificaciones` ADD CONSTRAINT `notificaciones_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
