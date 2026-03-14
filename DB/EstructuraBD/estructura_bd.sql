-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         12.2.2-MariaDB - MariaDB Server
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.14.0.7165
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para healthup_dba
CREATE DATABASE IF NOT EXISTS `healthup_dba` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `healthup_dba`;

-- Volcando estructura para tabla healthup_dba.alimentos
CREATE TABLE IF NOT EXISTS `alimentos` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) NOT NULL DEFAULT '0',
  `Calorias` int(11) NOT NULL DEFAULT 0,
  `Proteinas` float NOT NULL DEFAULT 0,
  `Carbohidratos` float NOT NULL DEFAULT 0,
  `Grasas` float NOT NULL DEFAULT 0,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla healthup_dba.alimentos: ~0 rows (aproximadamente)

-- Volcando estructura para tabla healthup_dba.metasnutricionales
CREATE TABLE IF NOT EXISTS `metasnutricionales` (
  `UsuariosId` int(11) NOT NULL,
  `Peso_Kg` float NOT NULL DEFAULT 0,
  `CaloriasDiarias` int(11) NOT NULL DEFAULT 0,
  `ProteinasMet` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`UsuariosId`),
  CONSTRAINT `UsuarioId` FOREIGN KEY (`UsuariosId`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla healthup_dba.metasnutricionales: ~0 rows (aproximadamente)

-- Volcando estructura para tabla healthup_dba.registrodiario
CREATE TABLE IF NOT EXISTS `registrodiario` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `UsuarioId` int(11) NOT NULL DEFAULT 0,
  `AlimentosId` int(11) NOT NULL DEFAULT 0,
  `GramosConsumidos` float NOT NULL DEFAULT 0,
  `Fecha` date NOT NULL DEFAULT '0000-00-00',
  PRIMARY KEY (`Id`),
  KEY `FK_registrodiario_usuarios` (`UsuarioId`),
  KEY `FK_registrodiario_alimentos` (`AlimentosId`),
  CONSTRAINT `FK_registrodiario_alimentos` FOREIGN KEY (`AlimentosId`) REFERENCES `alimentos` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_registrodiario_usuarios` FOREIGN KEY (`UsuarioId`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla healthup_dba.registrodiario: ~0 rows (aproximadamente)

-- Volcando estructura para tabla healthup_dba.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) NOT NULL DEFAULT '0',
  `Email` varchar(150) NOT NULL DEFAULT '0',
  `PasswordHash` varchar(225) DEFAULT '0',
  `GoogleID` varchar(225) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Nombre` (`Nombre`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla healthup_dba.usuarios: ~0 rows (aproximadamente)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
