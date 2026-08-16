-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 16, 2026 at 12:57 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `studyfit_ai`
--

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `student_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`student_id`, `name`, `email`, `password`, `created_at`) VALUES
(1, 'Mayuri', 'mayuridalal123@gmail.com', '123456', '2026-08-16 10:27:12');

-- --------------------------------------------------------

--
-- Table structure for table `study_plans`
--

CREATE TABLE `study_plans` (
  `plan_id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `subjects` text NOT NULL,
  `daily_hours` int(11) NOT NULL,
  `exam_date` date NOT NULL,
  `ai_plan` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wellness`
--

CREATE TABLE `wellness` (
  `wellness_id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `water_glasses` int(11) DEFAULT 0,
  `eye_breaks` int(11) DEFAULT 0,
  `movement_breaks` int(11) DEFAULT 0,
  `sleep_hours` decimal(3,1) DEFAULT 0.0,
  `mood` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wellness`
--

INSERT INTO `wellness` (`wellness_id`, `student_id`, `water_glasses`, `eye_breaks`, `movement_breaks`, `sleep_hours`, `mood`, `created_at`) VALUES
(1, 1, 7, 6, 5, 9.0, 'Excellent', '2026-08-16 10:28:08'),
(2, 1, 8, 4, 3, 7.0, 'Excellent', '2026-08-16 10:41:30');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `study_plans`
--
ALTER TABLE `study_plans`
  ADD PRIMARY KEY (`plan_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `wellness`
--
ALTER TABLE `wellness`
  ADD PRIMARY KEY (`wellness_id`),
  ADD KEY `student_id` (`student_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `study_plans`
--
ALTER TABLE `study_plans`
  MODIFY `plan_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `wellness`
--
ALTER TABLE `wellness`
  MODIFY `wellness_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `study_plans`
--
ALTER TABLE `study_plans`
  ADD CONSTRAINT `study_plans_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- Constraints for table `wellness`
--
ALTER TABLE `wellness`
  ADD CONSTRAINT `wellness_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
