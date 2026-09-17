-- MySQL dump 10.13  Distrib 26.7.0, for macos26.6 (arm64)
--
-- Host: localhost    Database: mwdgymdb
-- ------------------------------------------------------
-- Server version	26.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `is_read` bit(1) NOT NULL,
  `sent_at` datetime(6) NOT NULL,
  `recipient_id` bigint NOT NULL,
  `sender_id` bigint NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK9cy5qdbo924k3jflvj0y04s6y` (`recipient_id`),
  KEY `FKgiqeap8ays4lf684x7m0r2729` (`sender_id`),
  CONSTRAINT `FK9cy5qdbo924k3jflvj0y04s6y` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKgiqeap8ays4lf684x7m0r2729` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coin_orders`
--

DROP TABLE IF EXISTS `coin_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coin_orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `admin_notes` varchar(500) DEFAULT NULL,
  `coins_amount` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `package_id` bigint NOT NULL,
  `payment_method` varchar(32) DEFAULT NULL,
  `price_mmk` bigint NOT NULL,
  `processed_at` datetime(6) DEFAULT NULL,
  `rejection_reason` varchar(500) DEFAULT NULL,
  `screenshot_url` varchar(500) DEFAULT NULL,
  `status` enum('APPROVED','PENDING','REJECTED') NOT NULL,
  `transfer_id` varchar(128) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coin_orders`
--

LOCK TABLES `coin_orders` WRITE;
/*!40000 ALTER TABLE `coin_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `coin_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coin_packages`
--

DROP TABLE IF EXISTS `coin_packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coin_packages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `is_active` bit(1) DEFAULT NULL,
  `badge_text` varchar(32) DEFAULT NULL,
  `bonus_coins` bigint DEFAULT NULL,
  `coins` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `is_popular` bit(1) DEFAULT NULL,
  `price_mmk` bigint NOT NULL,
  `sort_order` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coin_packages`
--

LOCK TABLES `coin_packages` WRITE;
/*!40000 ALTER TABLE `coin_packages` DISABLE KEYS */;
INSERT INTO `coin_packages` VALUES (1,_binary '','Starter',0,86,'2026-09-10 12:22:23.211021','86 Coins',_binary '\0',5000,1),(2,_binary '','+8 Bonus',8,172,'2026-09-10 12:22:23.232362','172 Coins',_binary '\0',10000,2),(3,_binary '','Popular',32,344,'2026-09-10 12:22:23.235086','344 Coins',_binary '',19000,3),(4,_binary '','+80 Bonus',80,706,'2026-09-10 12:22:23.237295','706 Coins',_binary '\0',38000,4),(5,_binary '','+200 Bonus',200,1412,'2026-09-10 12:22:23.239804','1412 Coins',_binary '\0',75000,5),(6,_binary '','Best Value',500,2845,'2026-09-10 12:22:23.242150','2845 Coins',_binary '\0',145000,6);
/*!40000 ALTER TABLE `coin_packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diet_plans`
--

DROP TABLE IF EXISTS `diet_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diet_plans` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `content_json` text NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `name` varchar(255) NOT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `theme` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diet_plans`
--

LOCK TABLES `diet_plans` WRITE;
/*!40000 ALTER TABLE `diet_plans` DISABLE KEYS */;
/*!40000 ALTER TABLE `diet_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exercise_library`
--

DROP TABLE IF EXISTS `exercise_library`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exercise_library` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `default_note` varchar(255) DEFAULT NULL,
  `default_reps` varchar(255) DEFAULT NULL,
  `default_sets` varchar(255) DEFAULT NULL,
  `default_weight` varchar(255) DEFAULT NULL,
  `muscle_group` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `sort_order` int NOT NULL,
  `created_by` bigint DEFAULT NULL,
  `created_by_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercise_library`
--

LOCK TABLES `exercise_library` WRITE;
/*!40000 ALTER TABLE `exercise_library` DISABLE KEYS */;
INSERT INTO `exercise_library` VALUES (1,_binary '',NULL,'12','4','','Legs','Dumbbell Sumo Squat',0,NULL,NULL),(2,_binary '',NULL,'20','3',NULL,'Legs','Dumbbell Romanian Deadlift',1,NULL,NULL),(3,_binary '',NULL,'20','3','light weight','Legs','Leg Press',2,NULL,NULL),(4,_binary '',NULL,'15','4',NULL,'Legs','Leg Curl',3,NULL,NULL),(5,_binary '',NULL,'20','4','light weight','Legs','Leg Extension',4,NULL,NULL),(6,_binary '',NULL,'15','4',NULL,'Legs','Hip Thrust',5,NULL,NULL),(7,_binary '',NULL,'20','3',NULL,'Legs','Hip Drive Machine with Pause',6,NULL,NULL),(8,_binary '',NULL,'15','3',NULL,'Legs','Hip Bridge',7,NULL,NULL),(9,_binary '',NULL,'15','4',NULL,'Legs','Goodmorning',8,NULL,NULL),(10,_binary '',NULL,'15','3',NULL,'Legs','One Dumbbell Deadlift',9,NULL,NULL),(11,_binary '','each leg','15','3',NULL,'Legs','Smith Machine Lever Lunge',10,NULL,NULL),(12,_binary '','each leg','15','3',NULL,'Legs','Cable Step Up',11,NULL,NULL),(13,_binary '','each leg','15','3',NULL,'Legs','Cable Side Kick',12,NULL,NULL),(14,_binary '',NULL,'15','3',NULL,'Legs','Cable Pull Through with Rope',13,NULL,NULL),(15,_binary '',NULL,'12','4',NULL,'Legs','Cable Cross Over Hip Kick',14,NULL,NULL),(16,_binary '',NULL,'15','3',NULL,'Legs','Cable Hip Abduction',15,NULL,NULL),(17,_binary '',NULL,'15, 13, 12','3','heavy weight','Legs','Hack Squat',16,NULL,NULL),(18,_binary '',NULL,'12','3','light weight','Legs','Sumo Deadlift',17,NULL,NULL),(19,_binary '',NULL,'15','3',NULL,'Legs','Sumo with Belt Machine',18,NULL,NULL),(20,_binary '',NULL,'15','3','light weight','Legs','Step Up',19,NULL,NULL),(21,_binary '',NULL,'12','3',NULL,'Legs','Single Deadlift',20,NULL,NULL),(22,_binary '','1min',NULL,'3',NULL,'Core','Planking',21,NULL,NULL),(23,_binary '',NULL,'15','3',NULL,'Chest','Chest Press (Dumbbell)',22,NULL,NULL),(24,_binary '',NULL,'15','3',NULL,'Chest','Machine Chest Press',23,NULL,NULL),(25,_binary '',NULL,'12','4',NULL,'Shoulders','Machine Shoulder Press',24,NULL,NULL),(26,_binary '',NULL,'15','3',NULL,'Shoulders','Machine Reverse Fly',25,NULL,NULL),(27,_binary '',NULL,'15','4',NULL,'Shoulders','Dumbbell Lateral Raise',26,NULL,NULL),(28,_binary '',NULL,'15','4',NULL,'Shoulders','Dumbbell Shoulder Press',27,NULL,NULL),(29,_binary '','sit down','15','3',NULL,'Shoulders','Dumbbell Hammer Front Raise',28,NULL,NULL),(30,_binary '','each arm','12','3',NULL,'Shoulders','Dumbbell Side Lateral',29,NULL,NULL),(31,_binary '',NULL,'15','3',NULL,'Shoulders','Dumbbell Reverse Fly with Bench',30,NULL,NULL),(32,_binary '',NULL,'12','4',NULL,'Shoulders','Cable Front Raise with Rope',31,NULL,NULL),(33,_binary '',NULL,'15','4',NULL,'Shoulders','Cable Reverse Fly',32,NULL,NULL),(34,_binary '','sit down','15','4',NULL,'Shoulders','Face Pull',33,NULL,NULL),(35,_binary '',NULL,'12','3',NULL,'Shoulders','Side Lateral Raise Machine with Pause',34,NULL,NULL),(36,_binary '','each arm','12','3',NULL,'Shoulders','One Armed Dumbbell Lateral',35,NULL,NULL),(37,_binary '',NULL,'20','3',NULL,'Arms','Cable Tricep with Rope',36,NULL,NULL),(38,_binary '',NULL,'15','3',NULL,'Arms','Cable Biceps Curl',37,NULL,NULL),(39,_binary '',NULL,'20','3',NULL,'Arms','Rope Extension',38,NULL,NULL),(40,_binary '',NULL,'15','4',NULL,'Back','Cable Close Grip',39,NULL,NULL),(41,_binary '',NULL,'15','3',NULL,'Back','Cable Pull Over with Rope',40,NULL,NULL),(42,_binary '',NULL,'20','3',NULL,'Back','Cable Front Lat Pull Down',41,NULL,NULL),(43,_binary '',NULL,'20','3',NULL,'Back','Cable Lat Pull Down behind The Neck',42,NULL,NULL),(44,_binary '','sit down','15','3',NULL,'Back','Dual Cable Lat Pulldown',43,NULL,NULL),(45,_binary '','each arm','15','3',NULL,'Back','Row Machine',44,NULL,NULL),(46,_binary '','each arm','15','3',NULL,'Back','High Row Machine or Cable',45,NULL,NULL),(47,_binary '',NULL,'15','3',NULL,'Back','Seated Row',46,NULL,NULL),(48,_binary '','each arm','15','3',NULL,'Back','One Armed Dumbbell Row',47,NULL,NULL),(49,_binary '',NULL,'15','3',NULL,'Back','Pull Up',48,NULL,NULL),(50,_binary '',NULL,'15','4',NULL,'Back','Wide Lat Pull Down',49,NULL,NULL),(51,_binary '',NULL,'15','2','no weight','Back','Hyperextension',50,NULL,NULL);
/*!40000 ALTER TABLE `exercise_library` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `food_library`
--

DROP TABLE IF EXISTS `food_library`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `food_library` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `category` varchar(255) NOT NULL,
  `created_by` bigint DEFAULT NULL,
  `created_by_name` varchar(255) DEFAULT NULL,
  `default_calories` varchar(255) DEFAULT NULL,
  `default_carbs` varchar(255) DEFAULT NULL,
  `default_fat` varchar(255) DEFAULT NULL,
  `default_note` varchar(255) DEFAULT NULL,
  `default_protein` varchar(255) DEFAULT NULL,
  `default_quantity` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `sort_order` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `food_library`
--

LOCK TABLES `food_library` WRITE;
/*!40000 ALTER TABLE `food_library` DISABLE KEYS */;
INSERT INTO `food_library` VALUES (1,_binary '','Snacks',NULL,NULL,NULL,NULL,NULL,'no sugar',NULL,'1 cup','Hot Black Coffee',1),(2,_binary '','Snacks',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.5 bar','Protein Bar',2),(3,_binary '','Snacks',NULL,NULL,'0 cal',NULL,NULL,'clean sauce',NULL,NULL,'Keto Sauce Clean',3),(4,_binary '','Snacks',NULL,NULL,NULL,NULL,NULL,'unsweetened',NULL,'1 glass','Ice Americano',4),(5,_binary '','Carbs',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'65g','Dry Oatmeal',5),(6,_binary '','Carbs',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'230g','White Rice',6),(7,_binary '','Carbs',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'80g','Dry Spaghetti',7),(8,_binary '','Carbs',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'80g','Dry Macaroni',8),(9,_binary '','Carbs',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'230g','Uncooked Potato',9),(10,_binary '','Carbs',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'230g','Sweet Potato',10),(11,_binary '','Carbs',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2.5 pieces','Tortilla Wrap',11),(12,_binary '','Carbs',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'3 pieces','Vietnam Rice Paper (Dry)',12),(13,_binary '','Supplements',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'45g','Isolate Whey',13),(14,_binary '','Supplements',NULL,NULL,NULL,NULL,NULL,'mix with water 200ml',NULL,'15g','Apple Cider',14),(15,_binary '','Supplements',NULL,NULL,NULL,NULL,NULL,'per day',NULL,'6g','Pink Salt',15),(16,_binary '','Supplements',NULL,NULL,'0 cal',NULL,NULL,'up to you',NULL,NULL,'Stevia / Sweetener',16),(17,_binary '','Protein',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1 egg','Egg (Jumbo Size)',17),(18,_binary '','Protein',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'130g','Chicken Breast',18),(19,_binary '','Protein',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'130g','Tilapia Fish',19),(20,_binary '','Protein',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'130g','Beef',20),(21,_binary '','Fruits',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'100g','Strawberry / Blueberry / Mix Berry',21),(22,_binary '','Fats',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'20g','Baked Almonds',22),(23,_binary '','Fats',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'60g','Avocado',23),(24,_binary '','Fats',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'50g','Cashews',24),(25,_binary '','Vegetables',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Green Salad',25),(26,_binary '','Vegetables',NULL,NULL,NULL,NULL,NULL,'up to you',NULL,NULL,'All Herbs',26);
/*!40000 ALTER TABLE `food_library` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_items`
--

DROP TABLE IF EXISTS `inventory_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `item_name` varchar(255) NOT NULL,
  `price_mmk` bigint NOT NULL,
  `stock_quantity` int NOT NULL,
  `active_for_shop` bit(1) DEFAULT NULL,
  `category` varchar(32) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `images_json` varchar(2000) DEFAULT NULL,
  `unit` varchar(16) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_items`
--

LOCK TABLES `inventory_items` WRITE;
/*!40000 ALTER TABLE `inventory_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marketplace_plan_subscriptions`
--

DROP TABLE IF EXISTS `marketplace_plan_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marketplace_plan_subscriptions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `auto_renew` bit(1) DEFAULT NULL,
  `cancellation_date` datetime(6) DEFAULT NULL,
  `cancellation_reason` varchar(500) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `payment_method` enum('BANK_TRANSFER','CARD','CASH','WALLET') DEFAULT NULL,
  `plan_id` bigint NOT NULL,
  `price_paid_mmk` decimal(38,2) DEFAULT NULL,
  `purchase_date` datetime(6) NOT NULL,
  `refund_admin_notes` varchar(500) DEFAULT NULL,
  `refund_payment_method` varchar(32) DEFAULT NULL,
  `refund_processed_at` datetime(6) DEFAULT NULL,
  `refund_rejection_reason` varchar(500) DEFAULT NULL,
  `refund_screenshot_url` varchar(500) DEFAULT NULL,
  `refund_status` enum('APPROVED','NONE','REJECTED','REQUESTED') DEFAULT NULL,
  `refund_transfer_id` varchar(128) DEFAULT NULL,
  `status` enum('ACTIVE','CANCELLED','EXPIRED','PAUSED') NOT NULL,
  `subscription_end_date` datetime(6) NOT NULL,
  `subscription_start_date` datetime(6) NOT NULL,
  `subscription_type` enum('MONTHLY','ONE_TIME_ACCESS','YEARLY') DEFAULT NULL,
  `transaction_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marketplace_plan_subscriptions`
--

LOCK TABLES `marketplace_plan_subscriptions` WRITE;
/*!40000 ALTER TABLE `marketplace_plan_subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `marketplace_plan_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marketplace_plans`
--

DROP TABLE IF EXISTS `marketplace_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marketplace_plans` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active_subscribers` int DEFAULT NULL,
  `category` enum('CARDIO','FLEXIBILITY','MIXED','NUTRITION','SPORT','STRENGTH') DEFAULT NULL,
  `content_structure` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `description` text,
  `difficulty_level` enum('ADVANCED','BEGINNER','INTERMEDIATE') DEFAULT NULL,
  `duration_weeks` int DEFAULT NULL,
  `exercises_json` json DEFAULT NULL,
  `include_macro_planning` bit(1) DEFAULT NULL,
  `include_supplement_guide` bit(1) DEFAULT NULL,
  `plan_type` enum('PERIODIZED','PROGRESSIVE','WEEKLY') DEFAULT NULL,
  `preview_video_url` varchar(500) DEFAULT NULL,
  `price_mmk` decimal(38,2) DEFAULT NULL,
  `published_at` datetime(6) DEFAULT NULL,
  `rating` decimal(38,2) DEFAULT NULL,
  `status` enum('ARCHIVED','DRAFT','PUBLISHED') NOT NULL,
  `target_audience` varchar(255) DEFAULT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `total_purchases` int DEFAULT NULL,
  `trainer_id` bigint NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marketplace_plans`
--

LOCK TABLES `marketplace_plans` WRITE;
/*!40000 ALTER TABLE `marketplace_plans` DISABLE KEYS */;
/*!40000 ALTER TABLE `marketplace_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `members` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `amount` decimal(18,0) DEFAULT NULL,
  `card_code` varchar(255) DEFAULT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `plan_type` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `trainer_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKkaomgy33poqefmxsf64uf3gfw` (`card_code`),
  KEY `FKtg8v9c0lme086rwosjtnkdhwr` (`trainer_id`),
  KEY `FKpj3n6wh5muoeakc485whgs3x5` (`user_id`),
  CONSTRAINT `FKpj3n6wh5muoeakc485whgs3x5` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKtg8v9c0lme086rwosjtnkdhwr` FOREIGN KEY (`trainer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `members`
--

LOCK TABLES `members` WRITE;
/*!40000 ALTER TABLE `members` DISABLE KEYS */;
INSERT INTO `members` VALUES (1,'undefined',500000,'MWD000001','244+275+912','2026-09-07','2025-12-01','Ko Wai Yan','Premium 1-Month','2026-08-07','Expired',6,NULL),(2,'',100000,'MWD000002','245','2026-01-01','2025-12-01','Ko Myo Chit','Basic 1-Month','2025-12-01','Expired',NULL,NULL),(3,'',500000,'MWD000003','246','2026-01-01','2025-12-01','Ko Htun Wai Aung','Premium 1-Month','2025-12-01','Inactive',5,NULL),(4,'undefined',100000,'MWD000004','247+276+906+937+959','2026-09-03','2025-12-01','Zin Ko Htike','Basic 1-Month','2026-08-03','Expired',NULL,NULL),(5,'',100000,'MWD000005','248','2026-01-02','2025-12-02','Ko Lwin Myo Aung','Basic 1-Month','2025-12-02','Inactive',NULL,NULL),(6,'',100000,'MWD000006','248P1','2026-01-02','2025-12-02','Ko Lwin Myo Aung P1','Basic 1-Month','2025-12-02','Expired',NULL,NULL),(7,'undefined',100000,'MWD000007','249+290+923+951','2026-09-07','2025-12-03','Ma Sandar Kyaw','Basic 1-Month','2026-08-07','Expired',NULL,NULL),(8,'',100000,'MWD000008','249P1','2026-01-03','2025-12-03','Ma Sandar Kyaw P1','Basic 1-Month','2025-12-03','Expired',NULL,NULL),(9,'undefined',500000,'MWD000009','250+287+918+944','2026-06-13','2025-12-03','Ar Fu','Premium 1-Month','2026-05-13','Expired',6,NULL),(10,'undefined',100000,'MWD000010','251+281+919+933','2026-09-11','2025-12-03','Ko Aung Khaing','Basic 1-Month','2026-08-11','Expired',NULL,NULL),(11,'undefined',100000,'MWD000011','252','2026-01-07','2025-12-07','Ko Si Thu','Basic 1-Month','2025-12-07','Inactive',NULL,NULL),(12,'undefined',100000,'MWD000012','253+280+910+934','2026-09-11','2025-12-07','Ma Mee Mee','Basic 1-Month','2026-08-11','Expired',NULL,NULL),(13,'undefined',100000,'MWD000013','253P1+280P1+910P1+934P1','2026-05-05','2025-12-07','Ma Mee Mee P1','Basic 1-Month','2026-04-04','Inactive',NULL,NULL),(14,'undefined',100000,'MWD000014','253P2+280P2+910P2+934P2','2026-05-05','2025-12-07','Ma Mee Mee P2','Basic 1-Month','2026-04-04','Inactive',NULL,NULL),(15,'undefined',500000,'MWD000015','254+273+904+961','2026-09-05','2025-12-07','Ko Aung','Premium 1-Month','2026-08-05','Expired',6,NULL),(16,'undefined',100000,'MWD000016','255+279','2026-02-06','2025-12-08','Ma Zar Zar Oo','Basic 1-Month','2026-01-06','Expired',NULL,NULL),(17,'',100000,'MWD000017','256','2026-01-10','2025-12-10','Sai Lao Hseny','Basic 1-Month','2025-12-10','Expired',NULL,NULL),(18,'undefined',100000,'MWD000018','258+913+936+957','2026-07-09','2025-12-10','Htoo Khant','Basic 1-Month','2026-06-08','Expired',NULL,NULL),(19,'undefined',500000,'MWD000019','260+286+916+942','2026-09-11','2025-12-08','Htet Linn Aung','Premium 1-Month','2026-08-11','Expired',6,NULL),(20,'undefined',100000,'MWD000020','261+289','2026-02-12','2025-12-11','Ko Shwe Lamin','Basic 1-Month','2026-01-12','Expired',NULL,NULL),(21,'',100000,'MWD000021','262','2026-01-13','2025-12-13','Saw Thit Lwin Khant','Basic 1-Month','2025-12-13','Expired',NULL,NULL),(22,'undefined',500000,'MWD000022','263+295+927','2026-09-10','2025-12-15','Ma Thandar Htun','Premium 1-Month','2026-08-10','Expired',2,NULL),(23,'undefined',100000,'MWD000023','264+291','2026-02-15','2025-12-17','Ko Tayza','Basic 1-Month','2026-01-15','Expired',NULL,NULL),(24,'',100000,'MWD000024','265','2026-01-18','2025-12-18','Ko Kyaw Soe Lin Htay','Basic 1-Month','2025-12-18','Expired',NULL,NULL),(25,'',100000,'MWD000025','265P1','2026-01-18','2025-12-18','Ko Kyaw Soe Lin Htay P1','Basic 1-Month','2025-12-18','Expired',NULL,NULL),(26,'undefined',100000,'MWD000026','266+939','2026-04-05','2025-12-18','Ma Kit','Basic 1-Month','2026-03-05','Expired',NULL,NULL),(27,'undefined',100000,'MWD000027','268+930+960','2026-09-10','2025-12-24','Hay Thazin Aung','Basic 1-Month','2026-08-10','Expired',NULL,NULL),(28,'undefined',500000,'MWD000028','269+911+926','2026-09-11','2025-12-27','Ma Ommer','Premium 1-Month','2026-08-11','Expired',2,NULL),(29,'undefined',100000,'MWD000029','270+297+929+952','2026-05-25','2025-12-29','Ko Kyaw','Basic 1-Month','2026-04-24','Expired',NULL,NULL),(30,'',100000,'MWD000030','271','2026-01-29','2025-12-29','Ko Sai San','Basic 1-Month','2025-12-29','Expired',NULL,NULL),(31,'undefined',100000,'MWD000031','272+914','2026-08-07','2025-12-30','Nwe Nwe Htun','Basic 1-Month','2026-07-07','Expired',NULL,NULL),(42,'',100000,'MWD000032','274','2026-02-02','2026-01-02','Ko Sat Naung Htun','Basic 1-Month','2026-01-02','Expired',NULL,NULL),(43,'undefined',500000,'MWD000033','277+908','2026-09-10','2026-01-02','Ko John','Premium 1-Month','2026-08-10','Expired',6,NULL),(44,'undefined',500000,'MWD000034','278+921+945','2026-09-10','2026-01-03','Ma La Won May','Premium 1-Month','2026-08-10','Expired',6,NULL),(45,'',100000,'MWD000035','282','2026-09-10','2026-01-06','Ma Zin Lay','Basic 1-Month','2026-08-10','Expired',NULL,NULL),(46,'undefined',100000,'MWD000036','283+915','2026-03-12','2026-01-08','Ko Myo Zin Paing','Basic 1-Month','2026-02-09','Expired',NULL,NULL),(47,'undefined',500000,'MWD000037','284+917+941','2026-08-10','2026-01-08','Ma Arr Li','Premium 1-Month','2026-07-10','Expired',2,NULL),(48,'',100000,'MWD000038','288','2026-08-14','2026-01-09','Ma Khin Thu Hlaing','Basic 1-Month','2026-07-14','Expired',NULL,NULL),(49,'',3000000,'MWD000039','292','2026-10-23','2026-01-15','Ma Nann','Premium 6-Month','2026-04-20','Active',2,NULL),(50,'',100000,'MWD000040','293','2026-02-16','2026-01-16','Ko Lin Saw Htun','Basic 1-Month','2026-01-16','Expired',NULL,NULL),(51,'',500000,'MWD000041','294','2026-02-21','2026-01-21','Ma Phyu Thazin','Premium 1-Month','2026-01-21','Expired',2,NULL),(52,'undefined',100000,'MWD000042','296+928','2026-03-27','2026-01-23','Ko Kyaw Htet Paing','Basic 1-Month','2026-02-24','Expired',NULL,NULL),(53,'',500000,'MWD000043','298','2026-02-26','2026-01-26','Ma Chal','Premium 1-Month','2026-01-26','Expired',6,NULL),(54,'',100000,'MWD000044','299','2026-02-27','2026-01-27','Ma Hay Man','Basic 1-Month','2026-01-27','Expired',NULL,NULL),(55,'',100000,'MWD000045','300','2026-03-03','2026-01-31','Thet Nyi Nyi','Basic 1-Month','2026-01-31','Expired',NULL,NULL),(56,'undefined',500000,'MWD000046','901+943','2026-08-17','2026-01-31','Ko Ar Sai','Premium 1-Month','2026-07-17','Expired',6,NULL),(57,'undefined',100000,'MWD000047','902+938','2026-07-11','2026-02-02','Clyke','Basic 1-Month','2026-06-10','Expired',NULL,NULL),(58,'undefined',500000,'MWD000048','903+931','2026-06-03','2026-02-02','Ma Htape Htar','Premium 1-Month','2026-05-03','Expired',2,NULL),(59,'undefined',500000,'MWD000049','905','2026-08-31','2026-02-02','Ma Aye Thuzar Myint','Premium 1-Month','2026-07-31','Expired',2,NULL),(60,'undefined',100000,'MWD000050','907+940','2026-04-06','2026-02-02','Kyaw Zin Naing','Basic 1-Month','2026-03-06','Expired',NULL,NULL),(61,'',300000,'MWD000051','909','2026-05-07','2026-02-03','Thu Nay Oo','Basic 3-Month','2026-02-03','Expired',NULL,NULL),(62,'',500000,'MWD000052','920','2026-03-17','2026-02-14','Aung Shine Myat','Premium 1-Month','2026-02-14','Expired',6,NULL),(63,'undefined',500000,'MWD000053','921P1','2026-03-19','2026-02-16','Ma La Won May P1','Premium 1-Month','2026-02-16','Inactive',6,NULL),(64,'undefined',500000,'MWD000054','921P2','2026-03-19','2026-02-16','Ma La Won May P2','Premium 1-Month','2026-02-16','Inactive',6,NULL),(65,'',100000,'MWD000055','922','2026-03-22','2026-02-19','Mg Aung Kaung Khant','Basic 1-Month','2026-02-19','Expired',NULL,NULL),(66,'',100000,'MWD000056','924','2026-03-24','2026-02-21','Mone','Basic 1-Month','2026-02-21','Expired',NULL,NULL),(67,'',100000,'MWD000057','932','2026-04-02','2026-03-02','Ko Phyo Gyi','Basic 1-Month','2026-03-02','Expired',NULL,NULL),(68,'',1000000,'MWD000058','934','2026-05-04','2026-03-03','Ma Yin Chit','Premium 2-Month','2026-03-03','Expired',2,NULL),(69,'',500000,'MWD000059','946','2026-09-03','2026-03-16','Ma Shwe Yee','Premium 1-Month','2026-08-03','Expired',6,NULL),(70,'undefined',500000,'MWD000060','947','2026-07-02','2026-03-16','Ma Nway','Premium 1-Month','2026-06-01','Expired',6,NULL),(71,'undefined',500000,'MWD000061','948+958','2026-09-03','2026-03-20','Mg Chit Ko Ko Lwin','Premium 1-Month','2026-08-03','Expired',6,NULL),(72,'',300000,'MWD000062','949','2026-09-23','2026-03-24','Anty Khaing','Basic 3-Month','2026-06-22','Active',NULL,NULL),(73,'',100000,'MWD000063','950','2026-04-24','2026-03-24','Kyaw Htet Aung','Basic 1-Month','2026-03-24','Expired',NULL,NULL),(74,'',500000,'MWD000064','953','2026-04-25','2026-03-25','Ma May Thu','Premium 1-Month','2026-03-25','Expired',7,NULL),(75,'',100000,'MWD000065','954','2026-09-10','2026-03-26','Ma Aye Aye Pyone','Basic 1-Month','2026-08-10','Expired',NULL,NULL),(76,'undefined',100000,'MWD000066','955','2026-08-02','2026-03-28','Ma Pa Pa Win','Basic 1-Month','2026-07-02','Expired',NULL,NULL),(77,'',300000,'MWD000067','956','2026-09-05','2026-03-30','Ko Khin Hlaing','Basic 3-Month','2026-06-04','Expired',NULL,NULL),(78,'undefined',100000,'MWD000068','962P3','2026-05-05','2026-04-04','Ma Mee Mee P3','Basic 1-Month','2026-04-04','Inactive',NULL,NULL),(79,'',100000,'MWD000069','965','2026-05-05','2026-04-04','Mg Nyein Chan','Basic 1-Month','2026-04-04','Expired',NULL,NULL),(80,'',500000,'MWD000070','967','2026-06-26','2026-04-06','Naung Min Set','Premium 1-Month','2026-05-26','Expired',7,NULL),(81,'',100000,'MWD000071','970','2026-05-08','2026-04-07','Ma Su San','Basic 1-Month','2026-04-07','Expired',NULL,NULL),(82,'',100000,'MWD000072','973','2026-08-10','2026-04-18','Ko Wai Hlawn','Basic 1-Month','2026-07-10','Expired',NULL,NULL),(83,'',100000,'MWD000073','975','2026-05-21','2026-04-20','Ko Khaing Thandar Oo','Basic 1-Month','2026-04-20','Expired',NULL,NULL),(84,'',100000,'MWD000074','976','2026-05-14','2026-04-13','Ko Zin Min Htun','Basic 1-Month','2026-04-13','Expired',NULL,NULL),(85,'',100000,'MWD000075','979','2026-07-25','2026-04-24','Kaung Myat Kyaw','Basic 1-Month','2026-06-24','Expired',NULL,NULL),(86,'',100000,'MWD000076','983','2026-09-11','2026-05-04','Ma Aye Aye Myo','Basic 1-Month','2026-08-11','Expired',NULL,NULL),(87,'',100000,'MWD000077','984','2026-09-11','2026-05-04','Ko Mann','Basic 1-Month','2026-08-11','Expired',NULL,NULL),(88,'undefined',100000,'MWD000078','985','2026-09-05','2026-04-30','Ko Aung Htun Linn','Basic 1-Month','2026-08-05','Expired',NULL,NULL),(89,'',100000,'MWD000079','986','2026-06-01','2026-05-01','Soe Nyein','Basic 1-Month','2026-05-01','Expired',NULL,NULL),(90,'',100000,'MWD000080','987','2026-06-04','2026-05-04','Ko Thurain Aung','Basic 1-Month','2026-05-04','Expired',NULL,NULL),(91,'',100000,'MWD000081','996','2026-08-16','2026-05-06','Nway Yan Linn','Basic 1-Month','2026-07-16','Expired',NULL,NULL),(92,'',100000,'MWD000082','997','2026-06-07','2026-05-07','Ko Si Thu','Basic 1-Month','2026-05-07','Expired',NULL,NULL),(93,'',100000,'MWD000083','997P1','2026-06-07','2026-05-07','Ko Si Thu P1','Basic 1-Month','2026-05-07','Expired',NULL,NULL),(94,'',100000,'MWD000084','998','2026-06-06','2026-05-06','Ko Saw Doe Naw Naw','Basic 1-Month','2026-05-06','Expired',NULL,NULL),(95,'',100000,'MWD000085','1000','2026-06-07','2026-05-07','Ko War Gyi','Basic 1-Month','2026-05-07','Expired',NULL,NULL),(96,'',100000,'MWD000086','1003','2026-06-09','2026-05-09','Ma Nwe Lay','Basic 1-Month','2026-05-09','Expired',NULL,NULL),(97,'',100000,'MWD000087','1003P1','2026-06-09','2026-05-09','Ma Nwe Lay P1','Basic 1-Month','2026-05-09','Expired',NULL,NULL),(98,'',100000,'MWD000088','1003P2','2026-06-09','2026-05-09','Ma Nwe Lay P2','Basic 1-Month','2026-05-09','Expired',NULL,NULL),(99,'',100000,'MWD000089','1004','2026-09-04','2026-05-11','Daw Say Lar','Basic 1-Month','2026-08-04','Expired',NULL,NULL),(100,'',100000,'MWD000090','1006','2026-06-11','2026-05-11','Lin Min Htet','Basic 1-Month','2026-05-11','Expired',NULL,NULL),(101,'',100000,'MWD000091','1009','2026-06-13','2026-05-13','Phyo Win Aung','Basic 1-Month','2026-05-13','Expired',NULL,NULL),(102,'',100000,'MWD000092','1010','2026-06-14','2026-05-14','Kyaw Min Htet','Basic 1-Month','2026-05-14','Expired',NULL,NULL),(103,'',500000,'MWD000093','1014','2026-06-25','2026-05-25','Mya Thuzar','Premium 1-Month','2026-05-25','Expired',2,NULL),(104,'',500000,'MWD000094','1015','2026-06-22','2026-05-22','Ma Nan (Par Par)','Premium 1-Month','2026-05-22','Expired',2,NULL),(105,'',100000,'MWD000095','1017','2026-06-25','2026-05-25','Yin Yin Htun','Basic 1-Month','2026-05-25','Expired',NULL,NULL),(106,'',500000,'MWD000096','1038','2026-07-11','2026-06-10','Li Li','Premium 1-Month','2026-06-10','Expired',2,NULL),(107,'',500000,'MWD000097','1040','2026-07-14','2026-06-13','Ma Nu War','Premium 1-Month','2026-06-13','Expired',2,NULL),(108,'',100000,'MWD000098','1042','2026-07-18','2026-06-17','Than Soe','Basic 1-Month','2026-06-17','Expired',NULL,NULL),(109,'',500000,'MWD000099','1044','2026-07-20','2026-06-19','Ma May Zin Phyo','Premium 1-Month','2026-06-19','Expired',2,NULL),(110,'',100000,'MWD000100','1045','2026-07-23','2026-06-22','Yan Lin Aung','Basic 1-Month','2026-06-22','Expired',NULL,NULL),(111,'',100000,'MWD000101','1047','2026-07-27','2026-06-26','Than Toe Aung','Basic 1-Month','2026-06-26','Expired',NULL,NULL),(112,'',100000,'MWD000102','1048','2026-07-26','2026-06-25','Ma Kyal Sin Aung','Basic 1-Month','2026-06-25','Expired',NULL,NULL),(113,'',100000,'MWD000103','1048P2','2026-07-26','2026-06-25','Mi Mi Myat','Basic 1-Month','2026-06-25','Expired',NULL,NULL),(114,'',100000,'MWD000104','1048P3','2026-07-26','2026-06-25','Nay Min Htun','Basic 1-Month','2026-06-25','Expired',NULL,NULL),(115,'',100000,'MWD000105','1049','2026-07-26','2026-06-25','Eaindray Moe','Basic 1-Month','2026-06-25','Expired',NULL,NULL),(116,'',500000,'MWD000106','1051','2026-09-03','2026-07-02','Ma Thida','Premium 1-Month','2026-08-03','Expired',9,NULL),(117,'',500000,'MWD000107','1057','2026-08-06','2026-07-06','Ma Aye Nandar Htun','Premium 1-Month','2026-07-06','Expired',2,NULL),(118,'',500000,'MWD000108','1058','2026-08-06','2026-07-06','Ko AK','Premium 1-Month','2026-07-06','Expired',9,NULL),(119,'',100000,'MWD000109','1070','2026-08-20','2026-07-20','Ko Ye Yint Thway','Basic 1-Month','2026-07-20','Expired',NULL,NULL),(120,'',100000,'MWD000110','1072','2026-08-20','2026-07-20','Ma Saung Hnin Phyu','Basic 1-Month','2026-07-20','Expired',NULL,NULL),(121,'',100000,'MWD000111','1073','2026-08-25','2026-07-25','Ma Po Po','Basic 1-Month','2026-07-25','Expired',NULL,NULL),(122,'undefined',100000,'MWD000112','1074','2026-08-27','2026-07-27','Ma Nan (Par Par)','Basic 1-Month','2026-07-27','Expired',NULL,NULL),(123,'',500000,'MWD000113','1075','2026-08-31','2026-07-31','Ko Tay Za Linn','Premium 1-Month','2026-07-31','Expired',9,NULL),(124,'',500000,'MWD000114','1077','2026-09-01','2026-08-01','Ma Su Pone Chit','Premium 1-Month','2026-08-01','Expired',2,NULL),(125,'',100000,'MWD000115','1081','2026-09-03','2026-08-03','Ko Kyi Lwin','Basic 1-Month','2026-08-03','Expired',NULL,NULL),(126,'',100000,'MWD000116','1081P1','2026-09-03','2026-08-03','Ko Ye Htet','Basic 1-Month','2026-08-03','Expired',NULL,NULL),(127,'',100000,'MWD000117','1083','2026-09-04','2026-08-04','Ko Kyaw Gyi','Basic 1-Month','2026-08-04','Expired',NULL,NULL),(128,'',1500000,'MWD000118','1086','2026-11-07','2026-08-06','Ma Aye Thandar','Premium 3-Month','2026-08-06','Active',2,NULL);
/*!40000 ALTER TABLE `members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(18,0) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `member_id` bigint NOT NULL,
  `trainer_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKtvbq19graff4nnoqpngbe762` (`member_id`),
  KEY `FK35q2bd8wlmkhgnltixk99ivmi` (`trainer_id`),
  CONSTRAINT `FK35q2bd8wlmkhgnltixk99ivmi` FOREIGN KEY (`trainer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKtvbq19graff4nnoqpngbe762` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=298 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,500000,'2025-12-16','2025-12-01','Paid',1,6),(2,100000,'2025-12-16','2025-12-01','Paid',2,NULL),(3,500000,'2025-12-16','2025-12-01','Paid',3,5),(4,100000,'2025-12-16','2025-12-01','Paid',4,NULL),(5,100000,'2025-12-17','2025-12-02','Paid',5,NULL),(6,100000,'2025-12-17','2025-12-02','Paid',6,NULL),(7,100000,'2025-12-18','2025-12-03','Paid',7,NULL),(8,100000,'2025-12-18','2025-12-03','Paid',8,NULL),(9,500000,'2025-12-18','2025-12-03','Paid',9,6),(10,500000,'2025-12-18','2025-12-03','Paid',10,5),(11,100000,'2025-12-22','2025-12-07','Paid',11,NULL),(12,100000,'2025-12-22','2025-12-07','Paid',12,NULL),(13,100000,'2025-12-22','2025-12-07','Paid',13,6),(14,100000,'2025-12-22','2025-12-07','Paid',14,NULL),(15,500000,'2025-12-22','2025-12-07','Paid',15,5),(16,100000,'2025-12-23','2025-12-08','Paid',16,NULL),(17,100000,'2025-12-25','2025-12-10','Paid',17,NULL),(18,100000,'2025-12-25','2025-12-10','Paid',18,NULL),(19,500000,'2025-12-23','2025-12-08','Paid',19,6),(20,100000,'2025-12-26','2025-12-11','Paid',20,NULL),(21,100000,'2025-12-28','2025-12-13','Paid',21,NULL),(22,100000,'2025-12-30','2025-12-15','Paid',22,NULL),(23,100000,'2026-01-01','2025-12-17','Paid',23,NULL),(24,100000,'2026-01-02','2025-12-18','Paid',24,5),(25,100000,'2026-01-02','2025-12-18','Paid',25,NULL),(26,100000,'2026-01-02','2025-12-18','Paid',26,NULL),(27,100000,'2026-01-08','2025-12-24','Paid',27,NULL),(28,250000,'2026-01-03','2025-12-27','Paid',28,2),(29,100000,'2026-01-13','2025-12-29','Paid',29,6),(30,100000,'2026-01-13','2025-12-29','Paid',30,NULL),(31,100000,'2026-01-14','2025-12-30','Paid',31,NULL),(43,500000,'2026-01-17','2026-01-02','Paid',15,NULL),(44,100000,'2026-01-17','2026-01-02','Paid',42,NULL),(45,500000,'2026-01-17','2026-01-02','Paid',1,NULL),(46,100000,'2026-01-17','2026-01-02','Paid',4,NULL),(47,500000,'2026-01-17','2026-01-02','Paid',43,6),(48,250000,'2026-01-10','2026-01-03','Paid',44,6),(49,100000,'2026-01-21','2026-01-06','Paid',16,NULL),(50,50000,'2026-01-14','2026-01-07','Paid',12,NULL),(51,50000,'2026-01-14','2026-01-07','Paid',13,NULL),(52,50000,'2026-01-14','2026-01-07','Paid',14,NULL),(53,500000,'2026-01-18','2026-01-03','Paid',10,NULL),(54,100000,'2026-01-21','2026-01-06','Paid',45,NULL),(55,100000,'2026-01-23','2026-01-08','Paid',46,NULL),(56,500000,'2026-01-23','2026-01-08','Paid',47,6),(57,500000,'2026-01-23','2026-01-08','Paid',19,NULL),(58,500000,'2026-01-24','2026-01-09','Paid',9,NULL),(59,100000,'2026-01-24','2026-01-09','Paid',48,NULL),(60,100000,'2026-01-27','2026-01-12','Paid',20,NULL),(61,100000,'2026-01-27','2026-01-12','Paid',7,NULL),(62,100000,'2026-01-30','2026-01-15','Paid',23,NULL),(63,500000,'2026-01-30','2026-01-15','Paid',49,2),(64,100000,'2026-01-31','2026-01-16','Paid',50,NULL),(65,500000,'2026-02-05','2026-01-21','Paid',51,2),(66,500000,'2026-02-05','2026-01-21','Paid',22,2),(67,100000,'2026-02-07','2026-01-23','Paid',52,NULL),(68,100000,'2026-02-07','2026-01-23','Paid',29,NULL),(69,500000,'2026-02-10','2026-01-26','Paid',53,6),(70,100000,'2026-02-11','2026-01-27','Paid',54,NULL),(71,100000,'2026-02-15','2026-01-31','Paid',55,NULL),(72,500000,'2026-02-15','2026-01-31','Paid',56,6),(73,100000,'2026-02-17','2026-02-02','Paid',57,NULL),(74,500000,'2026-02-17','2026-02-02','Paid',58,2),(75,500000,'2026-02-17','2026-02-02','Paid',15,5),(76,500000,'2026-02-17','2026-02-02','Paid',59,2),(77,100000,'2026-02-17','2026-02-02','Paid',4,NULL),(78,100000,'2026-02-17','2026-02-02','Paid',60,NULL),(79,500000,'2026-02-17','2026-02-02','Paid',43,6),(80,300000,'2026-03-21','2026-02-03','Paid',61,NULL),(81,100000,'2026-02-19','2026-02-04','Paid',12,NULL),(82,100000,'2026-02-19','2026-02-04','Paid',13,NULL),(83,100000,'2026-02-19','2026-02-04','Paid',14,NULL),(84,500000,'2026-02-10','2026-01-26','Paid',28,2),(85,500000,'2026-02-21','2026-02-06','Paid',1,6),(86,100000,'2026-02-21','2026-02-06','Paid',18,NULL),(87,100000,'2026-02-14','2026-01-30','Paid',31,NULL),(88,100000,'2026-02-24','2026-02-09','Paid',46,NULL),(89,500000,'2026-02-24','2026-02-09','Paid',19,6),(90,500000,'2026-02-25','2026-02-10','Paid',47,2),(91,500000,'2026-02-25','2026-02-10','Paid',9,6),(92,100000,'2026-02-26','2026-02-11','Paid',10,NULL),(93,500000,'2026-03-01','2026-02-14','Paid',62,6),(94,500000,'2026-03-03','2026-02-16','Paid',44,6),(95,500000,'2026-03-03','2026-02-16','Paid',63,6),(96,500000,'2026-03-03','2026-02-16','Paid',64,6),(97,100000,'2026-03-06','2026-02-19','Paid',65,NULL),(98,100000,'2026-03-06','2026-02-19','Paid',7,NULL),(99,100000,'2026-03-08','2026-02-21','Paid',66,NULL),(100,500000,'2026-03-14','2026-02-27','Paid',28,2),(101,500000,'2026-03-10','2026-02-23','Paid',22,2),(102,100000,'2026-03-11','2026-02-24','Paid',52,NULL),(103,100000,'2026-03-12','2026-02-25','Paid',29,NULL),(104,100000,'2026-03-14','2026-02-27','Paid',27,NULL),(105,500000,'2026-03-17','2026-03-02','Paid',58,2),(106,100000,'2026-03-17','2026-03-02','Paid',67,NULL),(107,500000,'2026-03-18','2026-03-03','Paid',10,2),(108,100000,'2026-03-18','2026-03-03','Paid',12,NULL),(109,100000,'2026-03-18','2026-03-03','Paid',13,NULL),(110,100000,'2026-03-18','2026-03-03','Paid',14,NULL),(111,1000000,'2026-04-03','2026-03-03','Paid',68,2),(112,100000,'2026-03-18','2026-03-03','Paid',18,NULL),(113,100000,'2026-03-18','2026-03-03','Paid',4,NULL),(114,100000,'2026-03-19','2026-03-04','Paid',57,NULL),(115,100000,'2026-03-20','2026-03-05','Paid',26,NULL),(116,100000,'2026-03-21','2026-03-06','Paid',60,NULL),(117,500000,'2026-03-25','2026-03-10','Paid',47,2),(118,500000,'2026-03-24','2026-03-09','Paid',19,6),(119,500000,'2026-03-25','2026-03-10','Paid',56,6),(120,500000,'2026-03-26','2026-03-11','Paid',9,6),(121,500000,'2026-03-31','2026-03-16','Paid',44,6),(122,500000,'2026-03-31','2026-03-16','Paid',69,6),(123,500000,'2026-03-31','2026-03-16','Paid',70,6),(124,500000,'2026-04-04','2026-03-20','Paid',71,6),(125,300000,'2026-05-09','2026-03-24','Paid',72,NULL),(126,100000,'2026-04-08','2026-03-24','Paid',73,NULL),(127,50000,'2026-03-31','2026-03-24','Paid',7,NULL),(128,100000,'2026-04-08','2026-03-24','Paid',29,NULL),(129,500000,'2026-04-09','2026-03-25','Paid',74,7),(130,500000,'2026-04-10','2026-03-26','Paid',75,7),(131,100000,'2026-04-12','2026-03-28','Paid',76,NULL),(132,100000,'2026-04-14','2026-03-30','Paid',77,NULL),(133,500000,'2026-04-16','2026-04-01','Paid',18,6),(134,500000,'2026-04-16','2026-04-01','Paid',71,6),(135,100000,'2026-04-16','2026-04-01','Paid',4,NULL),(136,100000,'2026-04-17','2026-04-02','Paid',27,NULL),(137,500000,'2026-04-17','2026-04-02','Paid',15,7),(138,100000,'2026-04-19','2026-04-04','Paid',12,NULL),(139,100000,'2026-04-19','2026-04-04','Paid',13,NULL),(140,100000,'2026-04-19','2026-04-04','Paid',14,NULL),(141,100000,'2026-04-19','2026-04-04','Paid',78,NULL),(142,500000,'2026-04-22','2026-04-07','Paid',28,2),(143,500000,'2026-04-18','2026-04-03','Paid',22,2),(144,100000,'2026-04-19','2026-04-04','Paid',79,NULL),(145,100000,'2026-04-21','2026-04-06','Paid',57,NULL),(146,100000,'2026-04-21','2026-04-06','Paid',80,NULL),(147,500000,'2026-04-21','2026-04-06','Paid',43,6),(148,500000,'2026-04-21','2026-04-06','Paid',58,2),(149,100000,'2026-04-22','2026-04-07','Paid',81,NULL),(150,500000,'2026-04-24','2026-04-09','Paid',9,6),(151,500000,'2026-04-24','2026-04-09','Paid',19,6),(152,100000,'2026-05-03','2026-04-18','Paid',82,NULL),(153,500000,'2026-05-03','2026-04-18','Paid',56,6),(154,100000,'2026-05-05','2026-04-20','Paid',83,NULL),(155,100000,'2026-04-28','2026-04-13','Paid',84,NULL),(156,3000000,'2026-07-22','2026-04-20','Paid',49,2),(157,100000,'2026-05-09','2026-04-24','Paid',29,NULL),(158,100000,'2026-07-09','2026-06-24','Paid',85,NULL),(159,100000,'2026-05-14','2026-04-29','Paid',76,NULL),(160,100000,'2026-05-13','2026-04-28','Paid',7,NULL),(161,500000,'2026-05-19','2026-05-04','Paid',12,7),(162,500000,'2026-05-19','2026-05-04','Paid',10,2),(163,100000,'2026-05-19','2026-05-04','Paid',86,NULL),(164,100000,'2026-05-19','2026-05-04','Paid',87,NULL),(165,100000,'2026-05-15','2026-04-30','Paid',88,NULL),(166,100000,'2026-05-16','2026-05-01','Paid',89,NULL),(167,500000,'2026-05-16','2026-05-01','Paid',1,7),(168,100000,'2026-05-19','2026-05-04','Paid',90,NULL),(169,500000,'2026-05-19','2026-05-04','Paid',18,6),(170,500000,'2026-05-16','2026-05-01','Paid',69,6),(171,500000,'2026-05-16','2026-05-01','Paid',71,6),(172,100000,'2026-05-16','2026-05-01','Paid',4,NULL),(173,500000,'2026-05-19','2026-05-04','Paid',70,6),(174,100000,'2026-05-19','2026-05-04','Paid',77,NULL),(175,500000,'2026-05-20','2026-05-05','Paid',75,7),(176,500000,'2026-05-20','2026-05-05','Paid',15,7),(177,100000,'2026-05-21','2026-05-06','Paid',27,NULL),(178,100000,'2026-05-21','2026-05-06','Paid',91,NULL),(179,100000,'2026-05-22','2026-05-07','Paid',92,NULL),(180,100000,'2026-05-22','2026-05-07','Paid',93,NULL),(181,100000,'2026-05-21','2026-05-06','Paid',94,NULL),(182,100000,'2026-05-21','2026-05-06','Paid',57,NULL),(183,100000,'2026-05-22','2026-05-07','Paid',95,NULL),(184,500000,'2026-05-21','2026-05-06','Paid',43,6),(185,500000,'2026-05-18','2026-05-03','Paid',58,2),(186,100000,'2026-05-24','2026-05-09','Paid',96,NULL),(187,100000,'2026-05-24','2026-05-09','Paid',97,NULL),(188,100000,'2026-05-24','2026-05-09','Paid',98,NULL),(189,100000,'2026-05-26','2026-05-11','Paid',99,NULL),(190,500000,'2026-05-26','2026-05-11','Paid',19,6),(191,100000,'2026-05-26','2026-05-11','Paid',100,NULL),(192,500000,'2026-05-28','2026-05-13','Paid',9,6),(193,100000,'2026-05-28','2026-05-13','Paid',101,NULL),(194,100000,'2026-05-29','2026-05-14','Paid',102,NULL),(195,500000,'2026-05-30','2026-05-15','Paid',22,2),(196,100000,'2026-06-02','2026-05-18','Paid',82,NULL),(197,500000,'2026-06-01','2026-05-17','Paid',56,6),(198,500000,'2026-06-09','2026-05-25','Paid',103,2),(199,500000,'2026-06-06','2026-05-22','Paid',104,2),(200,100000,'2026-06-06','2026-05-22','Paid',80,NULL),(201,100000,'2026-06-09','2026-05-25','Paid',105,NULL),(202,500000,'2026-06-09','2026-05-25','Paid',28,2),(203,500000,'2026-06-10','2026-05-26','Paid',80,7),(204,100000,'2026-06-16','2026-06-01','Paid',76,NULL),(205,500000,'2026-06-16','2026-06-01','Paid',1,7),(206,500000,'2026-06-16','2026-06-01','Paid',69,6),(207,500000,'2026-06-16','2026-06-01','Paid',71,6),(208,500000,'2026-06-16','2026-06-01','Paid',70,6),(209,100000,'2026-06-16','2026-06-01','Paid',4,NULL),(210,100000,'2026-06-16','2026-06-01','Paid',7,NULL),(211,100000,'2026-06-16','2026-06-01','Paid',88,NULL),(212,500000,'2026-06-19','2026-06-04','Paid',47,2),(213,100000,'2026-06-19','2026-06-04','Paid',99,NULL),(214,100000,'2026-06-20','2026-06-05','Paid',12,NULL),(215,100000,'2026-06-20','2026-06-05','Paid',86,NULL),(216,100000,'2026-06-20','2026-06-05','Paid',87,NULL),(217,500000,'2026-06-20','2026-06-05','Paid',10,2),(218,500000,'2026-06-23','2026-06-08','Paid',15,6),(219,100000,'2026-06-23','2026-06-08','Paid',31,NULL),(220,100000,'2026-06-23','2026-06-08','Paid',75,NULL),(221,100000,'2026-06-23','2026-06-08','Paid',27,NULL),(222,100000,'2026-06-23','2026-06-08','Paid',18,NULL),(223,500000,'2026-06-24','2026-06-09','Paid',19,6),(224,500000,'2026-06-24','2026-06-09','Paid',43,6),(225,100000,'2026-06-25','2026-06-10','Paid',57,NULL),(226,500000,'2026-06-25','2026-06-10','Paid',106,2),(227,300000,'2026-07-20','2026-06-04','Paid',77,NULL),(228,500000,'2026-06-28','2026-06-13','Paid',107,2),(229,500000,'2026-06-30','2026-06-15','Paid',59,2),(230,100000,'2026-07-02','2026-06-17','Paid',108,NULL),(231,500000,'2026-07-02','2026-06-17','Paid',56,6),(232,500000,'2026-07-04','2026-06-19','Paid',109,2),(233,100000,'2026-07-07','2026-06-22','Paid',110,NULL),(234,300000,'2026-08-07','2026-06-22','Paid',72,NULL),(235,100000,'2026-07-11','2026-06-26','Paid',111,NULL),(236,100000,'2026-07-10','2026-06-25','Paid',112,NULL),(237,100000,'2026-07-10','2026-06-25','Paid',113,NULL),(238,100000,'2026-07-10','2026-06-25','Paid',114,NULL),(239,100000,'2026-07-10','2026-06-25','Paid',115,NULL),(240,100000,'2026-07-20','2026-07-05','Paid',99,NULL),(241,500000,'2026-07-17','2026-07-02','Paid',116,9),(242,500000,'2026-07-16','2026-07-01','Paid',69,6),(243,500000,'2026-07-16','2026-07-01','Paid',71,6),(244,100000,'2026-07-16','2026-07-01','Paid',4,NULL),(245,100000,'2026-07-17','2026-07-02','Paid',76,NULL),(246,100000,'2026-07-18','2026-07-03','Paid',88,NULL),(247,100000,'2026-07-22','2026-07-07','Paid',12,NULL),(248,100000,'2026-07-22','2026-07-07','Paid',31,NULL),(249,100000,'2026-07-22','2026-07-07','Paid',87,NULL),(250,100000,'2026-07-22','2026-07-07','Paid',10,NULL),(251,100000,'2026-07-22','2026-07-07','Paid',86,NULL),(252,500000,'2026-07-21','2026-07-06','Paid',117,2),(253,500000,'2026-07-21','2026-07-06','Paid',118,9),(254,500000,'2026-07-22','2026-07-07','Paid',22,2),(255,500000,'2026-07-22','2026-07-07','Paid',1,6),(256,100000,'2026-07-22','2026-07-07','Paid',7,NULL),(257,500000,'2026-07-24','2026-07-09','Paid',43,6),(258,500000,'2026-07-25','2026-07-10','Paid',47,2),(259,100000,'2026-07-25','2026-07-10','Paid',82,NULL),(260,100000,'2026-07-25','2026-07-10','Paid',27,NULL),(261,100000,'2026-07-25','2026-07-10','Paid',75,NULL),(262,500000,'2026-07-25','2026-07-10','Paid',19,6),(263,100000,'2026-07-29','2026-07-14','Paid',48,NULL),(264,100000,'2026-07-31','2026-07-16','Paid',91,NULL),(265,100000,'2026-08-04','2026-07-20','Paid',119,NULL),(266,500000,'2026-08-01','2026-07-17','Paid',56,6),(267,100000,'2026-08-04','2026-07-20','Paid',120,NULL),(268,100000,'2026-08-09','2026-07-25','Paid',121,NULL),(269,100000,'2026-08-11','2026-07-27','Paid',122,NULL),(270,500000,'2026-08-15','2026-07-31','Paid',123,9),(271,500000,'2026-08-15','2026-07-31','Paid',59,2),(272,500000,'2026-08-16','2026-08-01','Paid',124,2),(273,500000,'2026-08-18','2026-08-03','Paid',69,6),(274,500000,'2026-08-18','2026-08-03','Paid',71,6),(275,100000,'2026-08-18','2026-08-03','Paid',4,NULL),(276,500000,'2026-08-18','2026-08-03','Paid',116,9),(277,100000,'2026-08-18','2026-08-03','Paid',125,NULL),(278,100000,'2026-08-18','2026-08-03','Paid',126,NULL),(279,100000,'2026-08-19','2026-08-04','Paid',99,NULL),(280,100000,'2026-08-19','2026-08-04','Paid',127,NULL),(281,500000,'2026-08-20','2026-08-05','Paid',15,6),(282,100000,'2026-08-20','2026-08-05','Paid',88,NULL),(283,1500000,'2026-09-21','2026-08-06','Paid',128,2),(284,500000,'2026-08-22','2026-08-07','Paid',1,6),(285,100000,'2026-08-22','2026-08-07','Paid',7,NULL),(286,500000,'2026-08-25','2026-08-10','Paid',44,6),(287,100000,'2026-08-25','2026-08-10','Paid',27,NULL),(288,100000,'2026-08-25','2026-08-10','Paid',75,NULL),(289,100000,'2026-08-25','2026-08-10','Paid',45,NULL),(290,500000,'2026-08-25','2026-08-10','Paid',22,2),(291,500000,'2026-08-25','2026-08-10','Paid',43,6),(292,100000,'2026-08-26','2026-08-11','Paid',12,NULL),(293,100000,'2026-08-26','2026-08-11','Paid',87,NULL),(294,100000,'2026-08-26','2026-08-11','Paid',86,NULL),(295,100000,'2026-08-26','2026-08-11','Paid',10,NULL),(296,500000,'2026-08-26','2026-08-11','Paid',28,2),(297,500000,'2026-08-26','2026-08-11','Paid',19,6);
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_features`
--

DROP TABLE IF EXISTS `plan_features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan_features` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `feature_text` varchar(500) DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  `plan_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKmii31u2imuu6cet94c3yv7c0p` (`plan_id`),
  CONSTRAINT `FKmii31u2imuu6cet94c3yv7c0p` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_features`
--

LOCK TABLES `plan_features` WRITE;
/*!40000 ALTER TABLE `plan_features` DISABLE KEYS */;
/*!40000 ALTER TABLE `plan_features` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_reviews`
--

DROP TABLE IF EXISTS `plan_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan_reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `helpful_count` int DEFAULT NULL,
  `plan_id` bigint NOT NULL,
  `rating` int NOT NULL,
  `review_text` text,
  `subscription_id` bigint NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `trainer_response` text,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `verified_purchase` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_reviews`
--

LOCK TABLES `plan_reviews` WRITE;
/*!40000 ALTER TABLE `plan_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `plan_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plans`
--

DROP TABLE IF EXISTS `plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plans` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `category` enum('BASIC','PREMIUM') NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `duration_days` int NOT NULL,
  `plan_name` varchar(255) NOT NULL,
  `price` decimal(18,0) DEFAULT NULL,
  `show_on_home` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKfb6y5kokslw0dfj4a3up3fenp` (`plan_name`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plans`
--

LOCK TABLES `plans` WRITE;
/*!40000 ALTER TABLE `plans` DISABLE KEYS */;
INSERT INTO `plans` VALUES (1,_binary '','BASIC','basic daily',1,'Basic Daily',10000,_binary ''),(2,_binary '','BASIC','Gym',31,'Basic 1-Month',100000,_binary ''),(3,_binary '','BASIC','Gym',62,'Basic 2-Month',200000,_binary '\0'),(4,_binary '','BASIC','Gym',93,'Basic 3-Month',300000,_binary '\0'),(5,_binary '','BASIC','Gym',124,'Basic 4-Month',400000,_binary '\0'),(6,_binary '','BASIC','Gym',155,'Basic 5-Month',500000,_binary '\0'),(7,_binary '','PREMIUM','Gym + personal trainer',1,'Premium Daily',20000,_binary '\0'),(8,_binary '','PREMIUM','Gym + personal trainer',31,'Premium 1-Month',500000,_binary ''),(9,_binary '','PREMIUM','Gym + personal trainer',62,'Premium 2-Month',1000000,_binary '\0'),(10,_binary '','PREMIUM','Gym + personal trainer',93,'Premium 3-Month',1500000,_binary '\0'),(11,_binary '','PREMIUM','Gym + personal trainer',124,'Premium 4-Month',2000000,_binary '\0'),(12,_binary '','PREMIUM','Gym + personal trainer',155,'Premium 5-Month',2500000,_binary '\0'),(13,_binary '','BASIC','Gym',186,'Basic 6-Month',600000,_binary '\0'),(14,_binary '','PREMIUM','Gym + personal trainer',186,'Premium 6-Month',3000000,_binary '\0'),(15,_binary '','BASIC','Gym',15,'Basic 1/2-Month',50000,_binary '\0'),(16,_binary '','PREMIUM','Gym + personal trainer',15,'Premium 1/2-Month',250000,_binary '');
/*!40000 ALTER TABLE `plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pos_transactions`
--

DROP TABLE IF EXISTS `pos_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pos_transactions` (
  `transaction_id` bigint NOT NULL AUTO_INCREMENT,
  `cashier_id` bigint NOT NULL,
  `payment_method` enum('CASH','CBPAY','KBZPAY','WAVEPAY') NOT NULL,
  `timestamp` datetime(6) NOT NULL,
  `total_amount_mmk` bigint NOT NULL,
  PRIMARY KEY (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pos_transactions`
--

LOCK TABLES `pos_transactions` WRITE;
/*!40000 ALTER TABLE `pos_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `pos_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `premium_feature_access`
--

DROP TABLE IF EXISTS `premium_feature_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `premium_feature_access` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `access_level` enum('BASIC','PREMIUM','TRAINER') DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `expiry_date` datetime(6) DEFAULT NULL,
  `feature_type` enum('ADVANCED_ANALYTICS','AI_PLANS','COACHING','MACRO_PLANNING') NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `source` enum('DIRECT_PURCHASE','GYM_SUBSCRIPTION','MARKETPLACE_PLAN') DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `premium_feature_access`
--

LOCK TABLES `premium_feature_access` WRITE;
/*!40000 ALTER TABLE `premium_feature_access` DISABLE KEYS */;
/*!40000 ALTER TABLE `premium_feature_access` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shop_order_items`
--

DROP TABLE IF EXISTS `shop_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shop_order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image_url` varchar(500) DEFAULT NULL,
  `item_id` bigint DEFAULT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `unit_price_mmk` bigint NOT NULL,
  `order_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKprcx34kogn2i7skf69p5xsrsg` (`order_id`),
  CONSTRAINT `FKprcx34kogn2i7skf69p5xsrsg` FOREIGN KEY (`order_id`) REFERENCES `shop_orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shop_order_items`
--

LOCK TABLES `shop_order_items` WRITE;
/*!40000 ALTER TABLE `shop_order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `shop_order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shop_orders`
--

DROP TABLE IF EXISTS `shop_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shop_orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `delivery_address` varchar(500) DEFAULT NULL,
  `delivery_city` varchar(100) DEFAULT NULL,
  `delivery_name` varchar(100) DEFAULT NULL,
  `delivery_note` varchar(500) DEFAULT NULL,
  `delivery_phone` varchar(32) DEFAULT NULL,
  `delivery_township` varchar(100) DEFAULT NULL,
  `status` enum('CANCELLED','CONFIRMED','DELIVERED','PENDING','SHIPPED') NOT NULL,
  `total_mmk` bigint NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shop_orders`
--

LOCK TABLES `shop_orders` WRITE;
/*!40000 ALTER TABLE `shop_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `shop_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_settings`
--

DROP TABLE IF EXISTS `site_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(255) NOT NULL,
  `setting_value` varchar(2000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK7mkby5o0md29h5yrcwjdh77bb` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` VALUES (1,'hours_morning','7:00 AM - 11:00 AM'),(2,'address','No. 4, Shwe Myawaddy Market Street 17, Myawaddy, Kayin'),(3,'gym_name','MWD GYM'),(4,'hours_evening','3:00 PM - 8:00 PM'),(5,'phone','09-974-448-285, 09-665-456-515'),(6,'contact_email','info@mwdgym.com');
/*!40000 ALTER TABLE `site_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_logs`
--

DROP TABLE IF EXISTS `system_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(255) NOT NULL,
  `actor` varchar(100) DEFAULT NULL,
  `category` varchar(50) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `detail` varchar(500) DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `level` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_log_created_at` (`created_at`),
  KEY `idx_log_level` (`level`),
  KEY `idx_log_actor` (`actor`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_logs`
--

LOCK TABLES `system_logs` WRITE;
/*!40000 ALTER TABLE `system_logs` DISABLE KEYS */;
INSERT INTO `system_logs` VALUES (1,'LOGIN','Admin','AUTH','2026-09-10 12:55:01.948181','User logged in','192.168.65.1','INFO'),(2,'LOGIN','Admin','AUTH','2026-09-14 05:51:20.871500','User logged in','172.18.0.1','INFO'),(3,'LOGIN','Admin','AUTH','2026-09-15 03:27:02.102004','User logged in','172.18.0.1','INFO'),(4,'LOGIN','Admin','AUTH','2026-09-15 03:43:38.583522','User logged in','192.168.65.1','INFO'),(5,'LOGIN','Admin','AUTH','2026-09-17 03:12:44.977367','User logged in','192.168.65.1','INFO'),(6,'LOGIN','Admin','AUTH','2026-09-17 03:20:51.786390','User logged in','192.168.65.1','INFO');
/*!40000 ALTER TABLE `system_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trainer_earnings`
--

DROP TABLE IF EXISTS `trainer_earnings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainer_earnings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `churned_subscribers` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `gross_revenue_mmk` decimal(38,2) DEFAULT NULL,
  `gym_commission_amount_mmk` decimal(38,2) DEFAULT NULL,
  `gym_commission_percentage` decimal(38,2) DEFAULT NULL,
  `new_subscribers` int DEFAULT NULL,
  `payout_date` datetime(6) DEFAULT NULL,
  `payout_status` enum('COMPLETED','FAILED','PENDING','PROCESSING') DEFAULT NULL,
  `period_month` varchar(7) DEFAULT NULL,
  `plan_id` bigint DEFAULT NULL,
  `subscription_count` int DEFAULT NULL,
  `trainer_id` bigint NOT NULL,
  `trainer_payout_amount_mmk` decimal(38,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trainer_earnings`
--

LOCK TABLES `trainer_earnings` WRITE;
/*!40000 ALTER TABLE `trainer_earnings` DISABLE KEYS */;
/*!40000 ALTER TABLE `trainer_earnings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction_items`
--

DROP TABLE IF EXISTS `transaction_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `item_name` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `unit_price_mmk` bigint NOT NULL,
  `transaction_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKklgqgv0usfi5yj07vpqihgpvf` (`transaction_id`),
  CONSTRAINT `FKklgqgv0usfi5yj07vpqihgpvf` FOREIGN KEY (`transaction_id`) REFERENCES `pos_transactions` (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction_items`
--

LOCK TABLES `transaction_items` WRITE;
/*!40000 ALTER TABLE `transaction_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `transaction_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_permissions`
--

DROP TABLE IF EXISTS `user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_permissions` (
  `user_id` bigint NOT NULL,
  `permission` varchar(255) DEFAULT NULL,
  UNIQUE KEY `UKo090f18qtl3dv36wdih9fm3k8` (`user_id`,`permission`),
  CONSTRAINT `FKkowxl8b2bngrxd1gafh13005u` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_permissions`
--

LOCK TABLES `user_permissions` WRITE;
/*!40000 ALTER TABLE `user_permissions` DISABLE KEYS */;
INSERT INTO `user_permissions` VALUES (2,'INVENTORY'),(2,'MEMBERS'),(2,'PAYMENTS'),(3,'INVENTORY'),(3,'MEMBERS'),(3,'PAYMENTS'),(4,'INVENTORY'),(4,'MEMBERS'),(4,'PAYMENTS'),(5,'INVENTORY'),(5,'MEMBERS'),(5,'PAYMENTS'),(6,'INVENTORY'),(6,'MEMBERS'),(6,'PAYMENTS'),(7,'INVENTORY'),(7,'MEMBERS'),(7,'PAYMENTS'),(8,'PAYMENTS'),(9,'PAYMENTS');
/*!40000 ALTER TABLE `user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_progress`
--

DROP TABLE IF EXISTS `user_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_progress` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `body_metrics` json DEFAULT NULL,
  `current_week` int DEFAULT NULL,
  `exercises_completed` int DEFAULT NULL,
  `exercises_total` int DEFAULT NULL,
  `marketplace_plan_id` bigint NOT NULL,
  `mood_energy_level` int DEFAULT NULL,
  `notes` text,
  `nutrition_compliance` json DEFAULT NULL,
  `performance_data` json DEFAULT NULL,
  `recorded_date` datetime(6) NOT NULL,
  `subscription_id` bigint NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `week_number` int DEFAULT NULL,
  `workout_completion_rate` double DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_progress`
--

LOCK TABLES `user_progress` WRITE;
/*!40000 ALTER TABLE `user_progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('ADMIN','CLIENT','STAFF','TRAINER') NOT NULL,
  `show_on_home` bit(1) NOT NULL,
  `username` varchar(255) NOT NULL,
  `coin_balance` bigint DEFAULT NULL,
  `default_delivery_address` varchar(500) DEFAULT NULL,
  `default_delivery_city` varchar(100) DEFAULT NULL,
  `default_delivery_name` varchar(100) DEFAULT NULL,
  `default_delivery_note` varchar(500) DEFAULT NULL,
  `default_delivery_phone` varchar(32) DEFAULT NULL,
  `default_delivery_township` varchar(100) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,_binary '','2026-08-11 10:25:34.684938','Admin','$2a$10$Rm47ji.nZFqW.CRd3tFpieWlY42k/FbeS2IzDiAwANR9DHXQiSbrO','ADMIN',_binary '','admin',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,_binary '','2026-08-11 10:29:43.356749','Ma Paing Myint Myint','$2a$10$h4Zi5xPOrJtZaqxLkul4ru.SBumvV72/vFtu9BSHg0.UFDt9g91gC','TRAINER',_binary '','trainer1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,_binary '\0','2026-08-11 10:30:16.332795','Mg La Min','$2a$10$kexg8g5ZupDjbh5Lsq1sRe2hsnU0vEWxMeCA5/HfLlBPt3LDa9Zkm','TRAINER',_binary '\0','trainer2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,_binary '\0','2026-08-11 10:38:17.305859','Mg Zin Ko','$2a$10$Mjlz6vRdrUk4PDbKihtR2uZuQusHC4PYJiPFL6Iz3xug/3nPgUsEe','TRAINER',_binary '\0','trainer3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,_binary '\0','2026-08-11 10:39:09.706185','Mg Kyaw Khant Zaw','$2a$10$aNRLkjR3CFTi/8vNXSeHPu0F2ns3v.Tl1o89G7fejnZJgOp.TVqY6','TRAINER',_binary '\0','trainer4',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,_binary '','2026-08-11 10:40:01.382231','Mg Shine Maung','$2a$10$ZrrCj9LEk6Ofl/aPIr8HSOx4pRl56bEuX2gZVDr2K0WWSZ.WmKka2','TRAINER',_binary '','trainer5',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,_binary '\0','2026-08-11 10:40:29.294531','Mg Phyoe Wai Aung','$2a$10$t2jlCSGEqWn9mcOvKKDZ3u.HRI7I3tU.ICXqR7pzVDe7AJcnvahsW','TRAINER',_binary '\0','trainer6',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,_binary '','2026-08-11 10:42:05.406000','Ma Cho Zin Myint','$2a$10$IBz9QW1j/QprqNVKYAYgHuHa0FMY5AbAy5E7Tq.H6jR.NNBmlfkE2','TRAINER',_binary '','trainer7',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,_binary '','2026-08-11 10:44:30.319406','Wan Kyar Lae','$2a$10$9gZJx3mWcYpAQ83bcH8ApOBz9sIP3trztSMHxVafI6em6lul7X6si','TRAINER',_binary '','trainer8',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workout_plans`
--

DROP TABLE IF EXISTS `workout_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workout_plans` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `content_json` text NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `include_warm` bit(1) DEFAULT NULL,
  `included_days` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `theme` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workout_plans`
--

LOCK TABLES `workout_plans` WRITE;
/*!40000 ALTER TABLE `workout_plans` DISABLE KEYS */;
INSERT INTO `workout_plans` VALUES (1,_binary '','{\"days\":[{\"name\":\"Day 1 - Push (Chest & Shoulders)\",\"exercises\":[{\"id\":1,\"name\":\"asdfasdf\",\"muscleGroup\":\"Chest\",\"sets\":\"3\",\"reps\":\"10-12\",\"weight\":\"\",\"notes\":\"\"}]},{\"name\":\"Day 2 - Pull (Back & Biceps)\",\"exercises\":[]},{\"name\":\"Day 3 - Legs & Core\",\"exercises\":[]}]}','2026-09-15 03:27:51.514770',_binary '','0,1,2,3,4,5','asdf','asdfasdf','default','2026-09-15 03:27:51.514775');
/*!40000 ALTER TABLE `workout_plans` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-17  9:56:19
