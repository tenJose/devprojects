CREATE DATABASE  IF NOT EXISTS `devprojects` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `devprojects`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: devprojects
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('42933be3-c711-4a01-9f87-4a760ba5940d','f4b3ab41cae2cb37cfeb86c0cc1f0835d9890565afa43149a59e41baa843edfd','2025-11-18 09:40:55.771','20251118094055_devproyectv2',NULL,NULL,'2025-11-18 09:40:55.554',1),('50e62aaa-e4b3-423f-852f-f53954378823','1c7a8247a59dcdc20214a6e5f67086a1c0457ade487350c87b8c0880c402418d','2025-11-18 06:26:51.002','20251118062650_init',NULL,NULL,'2025-11-18 06:26:50.497',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensajes`
--

DROP TABLE IF EXISTS `mensajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `remitente` int NOT NULL,
  `destinatario` int NOT NULL,
  `contenido` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `leido` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `mensajes_remitente_fkey` (`remitente`),
  KEY `mensajes_destinatario_leido_idx` (`destinatario`,`leido`),
  CONSTRAINT `mensajes_destinatario_fkey` FOREIGN KEY (`destinatario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `mensajes_remitente_fkey` FOREIGN KEY (`remitente`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensajes`
--

LOCK TABLES `mensajes` WRITE;
/*!40000 ALTER TABLE `mensajes` DISABLE KEYS */;
/*!40000 ALTER TABLE `mensajes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `postulaciones`
--

DROP TABLE IF EXISTS `postulaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `postulaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuarioId` int NOT NULL,
  `proyectoId` int NOT NULL,
  `estado` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `fechaPostulacion` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `fechaRespuesta` datetime(3) DEFAULT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci,
  `presupuestoPropuesto` decimal(10,2) DEFAULT NULL,
  `propuesta` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `postulaciones_usuarioId_proyectoId_key` (`usuarioId`,`proyectoId`),
  KEY `postulaciones_proyectoId_fkey` (`proyectoId`),
  KEY `postulaciones_estado_idx` (`estado`),
  CONSTRAINT `postulaciones_proyectoId_fkey` FOREIGN KEY (`proyectoId`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `postulaciones_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `postulaciones`
--

LOCK TABLES `postulaciones` WRITE;
/*!40000 ALTER TABLE `postulaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `postulaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proyectos`
--

DROP TABLE IF EXISTS `proyectos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proyectos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tecnologias` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `lenguajes` text COLLATE utf8mb4_unicode_ci,
  `datosAdicionales` text COLLATE utf8mb4_unicode_ci,
  `estado` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  `usuarioCreadorId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `destacado` tinyint(1) NOT NULL DEFAULT '0',
  `duracionEstimada` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `presupuesto` decimal(10,2) DEFAULT NULL,
  `presupuestoTipo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipoProyecto` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ubicacion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `proyectos_usuarioCreadorId_idx` (`usuarioCreadorId`),
  KEY `proyectos_estado_destacado_idx` (`estado`,`destacado`),
  CONSTRAINT `proyectos_usuarioCreadorId_fkey` FOREIGN KEY (`usuarioCreadorId`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proyectos`
--

LOCK TABLES `proyectos` WRITE;
/*!40000 ALTER TABLE `proyectos` DISABLE KEYS */;
/*!40000 ALTER TABLE `proyectos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fechaNacimiento` datetime(3) DEFAULT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fotoPerfil` text COLLATE utf8mb4_unicode_ci,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `tecnologias` text COLLATE utf8mb4_unicode_ci,
  `lenguajes` text COLLATE utf8mb4_unicode_ci,
  `informacionExtra` text COLLATE utf8mb4_unicode_ci,
  `codigoVerificacion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verificado` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `apellido` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rol` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'usuario',
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (4,'mainetflis@gmail.com','Josecarlos','2002-09-11 00:00:00.000','$2a$10$6PePf/NdxkITYkei1fSsB.gN59LpS0K5tz8YOP3kpLFmlNIBA4Cz2','/uploads/1763625780671-images.jpg','ñaca ñacaaksndhiabushijpdkanhcjoajsnc haousjcnaos hcjhkajmscbaphsijclamnsojcnkaspcjnñaca ñacaaksndhiabushijpdkanhcjoajsnc haousjcnaos hcjhkajmscbaphsijclamnsojcnkaspcjnñaca ñacaaksndhiabushijpdkanhcjoajsnc haousjcnaos hcjhkajmscbaphsijclamnsojcnkaspcjnñaca ñacaaksndhiabushijpdkanhcjoajsnc haousjcnaos hcjhkajmscbaphsijclamnsojcnkaspcjnñaca ñacaaksndhiabushijpdkanhcjoajsnc haousjcnaos hcjhkajmscbaphsijclamnsojcnkaspcjnñaca ñacaaksndhiabushijpdkanhcjoajsnc haousjcnaos hcjhkajmscba','[\"Angular\",\"Vue.js\"]','[\"JavaScript\",\"TypeScript\",\"Python\"]','null','288993',1,'2025-11-18 08:44:03.495','2025-11-20 08:03:00.676',1,NULL,'usuario'),(5,'gonzalezapodacajosecarlos1@gmail.com','Jose carlos','2002-09-11 00:00:00.000','$2a$10$DrPSsoG3osbrN0sxvIGTLuC0YaSKLKGdiGAPGNXwMa0TD6NXli5VG',NULL,NULL,NULL,NULL,NULL,'486673',1,'2025-11-18 10:16:05.180','2025-11-18 10:16:05.180',1,NULL,'usuario'),(11,'prueba','prueba23','2002-09-11 00:00:00.000','$2a$10$4KhGZwcA/RITgbm0SLQEbO5NtvHP.ajPjmj1mxnzaGyR9tH7PvGqq',NULL,NULL,NULL,NULL,NULL,'637548',0,'2025-11-20 07:01:52.567','2025-11-20 07:01:52.567',1,NULL,'usuario'),(12,'genzi1190@gmail.com','prueba33','2002-09-11 00:00:00.000','$2a$10$9AJkCChcDBlnE0/3kfo1meTF/7P64sOcVABPnhj1vE1evcVk2Vg7u',NULL,NULL,NULL,NULL,NULL,NULL,1,'2025-11-20 07:09:01.857','2025-11-20 07:09:53.716',1,NULL,'usuario');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-20  1:06:03
