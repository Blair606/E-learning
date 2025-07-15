-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 16, 2025 at 12:42 AM
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
-- Database: `e_learning`
--

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `type` enum('text','file','quiz') NOT NULL DEFAULT 'text',
  `file_path` varchar(255) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `due_date` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('draft','published','closed') DEFAULT 'draft',
  `total_marks` int(11) DEFAULT 100
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assignments`
--

INSERT INTO `assignments` (`id`, `course_id`, `title`, `description`, `type`, `file_path`, `file_name`, `due_date`, `created_at`, `updated_at`, `status`, `total_marks`) VALUES
(11, 9, 'the dawn is near', 'what the fuck men', 'text', NULL, NULL, '2025-07-20 23:59:00', '2025-07-15 19:33:47', '2025-07-15 19:33:47', 'draft', 30);

-- --------------------------------------------------------

--
-- Table structure for table `assignment_submissions`
--

CREATE TABLE `assignment_submissions` (
  `id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `submission_text` text DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `marks_obtained` int(11) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `status` enum('submitted','graded') DEFAULT 'submitted',
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `graded_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `class_chat_messages`
--

CREATE TABLE `class_chat_messages` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `class_materials`
--

CREATE TABLE `class_materials` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `uploader_id` int(11) NOT NULL,
  `material_type` enum('file','link') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `class_materials`
--

INSERT INTO `class_materials` (`id`, `class_id`, `title`, `description`, `file_url`, `file_type`, `file_size`, `uploader_id`, `material_type`, `created_at`, `updated_at`) VALUES
(1, 1, 'The ways to hell is through the devils mansion ', 'this is to help you recup your life in this world ', 'http://localhost/E-learning/uploads/6818b01195af2.pdf', 'application/pdf', 348275, 3, 'file', '2025-05-05 12:33:21', '2025-05-05 12:33:21');

-- --------------------------------------------------------

--
-- Table structure for table `class_participants`
--

CREATE TABLE `class_participants` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('host','participant') DEFAULT 'participant',
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `left_at` timestamp NULL DEFAULT NULL,
  `attendance_status` enum('present','absent','late') DEFAULT 'present'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `class_recordings`
--

CREATE TABLE `class_recordings` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `recording_url` varchar(255) NOT NULL,
  `duration` int(11) DEFAULT NULL COMMENT 'Duration in minutes',
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `school_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `instructor_id` int(11) NOT NULL,
  `credits` int(11) NOT NULL DEFAULT 3,
  `schedule` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`schedule`)),
  `prerequisites` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`prerequisites`)),
  `status` enum('active','inactive','pending') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `name`, `code`, `description`, `school_id`, `department_id`, `instructor_id`, `credits`, `schedule`, `prerequisites`, `status`, `created_at`, `updated_at`) VALUES
(9, 'introduction to programing', 'SPA035CSC3557757', 'do the necessary ', 10, 12, 20, 3, '[{\"day\":\"Monday\",\"time\":\"09:00\",\"duration\":60}]', '[]', 'active', '2025-07-15 19:15:52', '2025-07-15 19:15:52');

-- --------------------------------------------------------

--
-- Table structure for table `course_content`
--

CREATE TABLE `course_content` (
  `id` int(11) NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('active','inactive','draft') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_content`
--

INSERT INTO `course_content` (`id`, `course_id`, `title`, `content`, `created_at`, `updated_at`, `status`) VALUES
(8, 9, 'the beginning of the end ', 'Here are some concise notes on **Introduction to Computing**, covering fundamental concepts for beginners:\n\n### 1. **What is Computing?**\n- **Definition**: Computing is the process of using computer systems to perform tasks, process data, and solve problems through the manipulation of information.\n- Involves hardware (physical components) and software (programs and instructions).\n- Core goal: Transform data into meaningful information.\n\n### 2. **Key Components of a Computer System**\n- **Hardware**:\n  - **CPU (Central Processing Unit)**: The \"brain\" of the computer, executes instructions.\n  - **Memory**:\n    - **RAM (Random Access Memory)**: Temporary storage for active data.\n    - **ROM (Read-Only Memory)**: Permanent storage for essential instructions.\n  - **Storage**: Hard drives (HDD), Solid-State Drives (SSD) for long-term data.\n  - **Input Devices**: Keyboard, mouse, microphone, etc.\n  - **Output Devices**: Monitor, printer, speakers, etc.\n- **Software**:\n  - **System Software**: Operating systems (e.g., Windows, macOS, Linux) manage hardware and provide a platform for applications.\n  - **Application Software**: Programs for specific tasks (e.g., web browsers, word processors).\n  - **Firmware**: Software embedded in hardware (e.g., BIOS).\n\n### 3. **Basic Concepts**\n- **Binary System**: Computers use binary (0s and 1s) to represent data.\n  - Bits (binary digits) and bytes (8 bits) are fundamental units.\n- **Data Representation**:\n  - Text: Encoded using standards like ASCII or Unicode.\n  - Numbers: Stored as binary integers or floating-point.\n  - Images/Videos: Represented as pixels with color values.\n- **Algorithms**: Step-by-step procedures to solve problems (e.g., sorting, searching).\n- **Programming**: Writing instructions (code) for computers using languages like Python, Java, or C++.\n\n### 4. **Types of Computers**\n- **Personal Computers (PCs)**: Desktops, laptops for individual use.\n- **Servers**: Powerful computers providing services (e.g., web hosting).\n- **Mainframes**: Large systems for bulk data processing.\n- **Supercomputers**: High-performance systems for complex computations (e.g., scientific simulations).\n- **Embedded Systems**: Specialized computers in devices (e.g., cars, appliances).\n\n### 5. **Operating Systems**\n- Manages hardware and software resources.\n- Examples: Windows, macOS, Linux, Android, iOS.\n- Functions: File management, process management, memory allocation, user interface.\n\n### 6. **Computer Networks**\n- **Definition**: Interconnected computers sharing resources and data.\n- **Types**:\n  - LAN (Local Area Network): Small area, like an office.\n  - WAN (Wide Area Network): Large area, like the internet.\n- **Internet**: Global network enabling communication, data transfer, and access to services.\n  - Protocols: TCP/IP, HTTP, FTP govern data exchange.\n\n### 7. **Software Development**\n- **Steps**:\n  1. Problem definition\n  2. Algorithm design\n  3. Coding\n  4. Testing\n  5. Maintenance\n- **Programming Paradigms**:\n  - Procedural: Step-by-step instructions (e.g., C).\n  - Object-Oriented: Based on objects and classes (e.g., Java, Python).\n  - Functional: Based on mathematical functions (e.g., Haskell).\n\n### 8. **Data and Information**\n- **Data**: Raw facts (e.g., numbers, text).\n- **Information**: Processed, meaningful data.\n- **Databases**: Organized data storage (e.g., SQL databases).\n- **Big Data**: Large, complex datasets requiring advanced processing.\n\n### 9. **Security and Ethics**\n- **Cybersecurity**:\n  - Threats: Viruses, malware, phishing.\n  - Protection: Firewalls, encryption, antivirus software.\n- **Ethics**:\n  - Privacy: Respect user data.\n  - Intellectual Property: Avoid piracy, respect copyrights.\n  - Digital Divide: Address unequal access to technology.\n\n### 10. **Trends in Computing**\n- **Cloud Computing**: Storing and accessing data/services over the internet (e.g., AWS, Google Cloud).\n- **Artificial Intelligence (AI)**: Systems that mimic human intelligence (e.g., machine learning, neural networks).\n- **Internet of Things (IoT)**: Connected devices (e.g., smart homes).\n- **Quantum Computing**: Emerging field using quantum mechanics for faster processing.\n\n### 11. **Basic Skills for Beginners**\n- **Typing and Navigation**: Familiarity with keyboard, mouse, and file systems.\n- **Software Usage**: Learn basic tools (e.g., word processors, spreadsheets).\n- **Problem-Solving**: Break down tasks logically.\n- **Coding Basics**: Start with simple languages like Python or Scratch.\n\n### Resources for Further Learning\n- **Online Platforms**: Codecademy, Coursera, Khan Academy.\n- **Books**: \"Computer Science Illuminated\" by Nell Dale, \"Introduction to Computing Systems\" by Patt & Patel.\n- **Practice**: Experiment with basic coding or explore open-source software.\n\nIf you’d like a deeper dive into any topic (e.g., programming, hardware, or a specific concept), let me know! I can also search for recent resources or analyze specific content if you provide it.', '2025-07-15 21:10:48', '2025-07-15 21:10:48', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `course_questions`
--

CREATE TABLE `course_questions` (
  `id` int(11) NOT NULL,
  `content_id` int(11) NOT NULL,
  `question_text` text NOT NULL,
  `option1` varchar(255) NOT NULL,
  `option2` varchar(255) NOT NULL,
  `option3` varchar(255) NOT NULL,
  `option4` varchar(255) NOT NULL,
  `correct_answer` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course_teachers`
--

CREATE TABLE `course_teachers` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `head_of_department` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `school_id`, `name`, `code`, `description`, `head_of_department`, `status`, `created_at`, `updated_at`) VALUES
(12, 10, 'computer science', 'CSC355', 'pure computing ', NULL, 'active', '2025-05-05 17:03:24', '2025-05-05 17:03:24');

-- --------------------------------------------------------

--
-- Table structure for table `discussion_comments`
--

CREATE TABLE `discussion_comments` (
  `id` int(11) NOT NULL,
  `topic_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discussion_groups`
--

CREATE TABLE `discussion_groups` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `course_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `number_of_groups` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `discussion_groups`
--

INSERT INTO `discussion_groups` (`id`, `title`, `course_id`, `description`, `due_date`, `number_of_groups`, `created_at`, `updated_at`) VALUES
(1, 'the fuck meen', 6, 'this all we are going to do', '2025-05-21 15:50:00', 2, '2025-05-06 09:46:40', '2025-05-06 09:46:40');

-- --------------------------------------------------------

--
-- Table structure for table `discussion_group_members`
--

CREATE TABLE `discussion_group_members` (
  `id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('student','teacher','moderator') DEFAULT 'student',
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `discussion_group_members`
--

INSERT INTO `discussion_group_members` (`id`, `group_id`, `user_id`, `role`, `joined_at`) VALUES
(1, 1, 14, 'teacher', '2025-05-06 09:46:40');

-- --------------------------------------------------------

--
-- Table structure for table `discussion_notifications`
--

CREATE TABLE `discussion_notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `topic_id` int(11) DEFAULT NULL,
  `type` enum('new_topic','new_comment','mention','reply') NOT NULL,
  `content` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discussion_topics`
--

CREATE TABLE `discussion_topics` (
  `id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `status` enum('active','completed','dropped') DEFAULT 'active',
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `enrollments`
--

INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `status`, `enrolled_at`, `completed_at`) VALUES
(2, 19, 9, 'active', '2025-07-15 20:47:53', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `feedback` text DEFAULT NULL,
  `graded_by` int(11) DEFAULT NULL,
  `graded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guardians`
--

CREATE TABLE `guardians` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `national_id` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guardian_students`
--

CREATE TABLE `guardian_students` (
  `id` int(11) NOT NULL,
  `guardian_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `relationship` varchar(50) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `online_classes`
--

CREATE TABLE `online_classes` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `course_id` int(11) NOT NULL,
  `instructor_id` int(11) NOT NULL,
  `scheduled_date` date NOT NULL,
  `scheduled_time` time NOT NULL,
  `duration` int(11) NOT NULL COMMENT 'Duration in minutes',
  `meeting_link` varchar(255) DEFAULT NULL,
  `status` enum('scheduled','live','completed','cancelled') DEFAULT 'scheduled',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `online_classes`
--

INSERT INTO `online_classes` (`id`, `title`, `course_id`, `instructor_id`, `scheduled_date`, `scheduled_time`, `duration`, `meeting_link`, `status`, `description`, `created_at`, `updated_at`) VALUES
(3, 'what the fuck meen ', 6, 14, '2025-05-08', '15:00:00', 90, 'https://powerlearnproject-org.zoom.us/w/88411977842?tk=KpFuRb4G3ql2KXma-uumuZiIVly4FGFp-LSUMI1HM2I.DQcAAAAUlcO4chZoc214b0lES1IzeUpVZTZpTnNicFdRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&pwd=5WTWxoOW9mhZ3NJpfab9SvLozxKUuB.1#success', 'scheduled', 'this is all we are going to do..., everybody get ready please', '2025-05-06 08:56:51', '2025-05-06 08:56:51');

-- --------------------------------------------------------

--
-- Table structure for table `schools`
--

CREATE TABLE `schools` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `address` text DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `schools`
--

INSERT INTO `schools` (`id`, `name`, `code`, `description`, `status`, `address`, `contact_email`, `contact_phone`, `created_at`, `updated_at`) VALUES
(10, 'School of pure and applied science', 'SPA035', 'pure scientific world', 'active', NULL, NULL, NULL, '2025-05-05 17:02:53', '2025-05-05 17:02:53');

-- --------------------------------------------------------

--
-- Table structure for table `school_departments`
--

CREATE TABLE `school_departments` (
  `school_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `grade_level` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `user_id`, `student_id`, `grade_level`, `created_at`, `updated_at`) VALUES
(2, 16, 'STU20250016', NULL, '2025-05-05 17:22:21', '2025-05-05 17:22:21'),
(3, 17, 'STU20250017', NULL, '2025-05-07 13:12:21', '2025-05-07 13:12:21'),
(4, 19, 'STU20250019', NULL, '2025-07-15 18:28:39', '2025-07-15 18:28:39');

-- --------------------------------------------------------

--
-- Table structure for table `student_assignments`
--

CREATE TABLE `student_assignments` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `submission_date` datetime DEFAULT NULL,
  `grade` decimal(5,2) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `status` enum('not_submitted','submitted','graded') DEFAULT 'not_submitted',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `submissions`
--

CREATE TABLE `submissions` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `submission_text` text DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `grade` decimal(5,2) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `status` enum('submitted','graded','late') NOT NULL DEFAULT 'submitted',
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `graded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `role` enum('admin','teacher','student','parent') NOT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `token` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `school` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `specialization` text DEFAULT NULL,
  `education` text DEFAULT NULL,
  `experience` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `school_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `first_name`, `last_name`, `role`, `status`, `token`, `phone`, `address`, `school`, `department`, `specialization`, `education`, `experience`, `created_at`, `updated_at`, `school_id`, `department_id`) VALUES
(13, 'daisygrace606@gmail.com', '$2y$10$VKGe46KfqJci7g8NCVU1c.DwJHNP6HRTZMaKiD9D1XG2hRvIhsNji', 'Daisy', 'Grace', 'admin', 'active', 'bb799ebe90684903f959769eb7ad7e8c4f392384ec79fb7e09c5affe486ffa15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-05 17:00:51', '2025-07-15 22:20:26', NULL, NULL),
(19, 'bobbyziggler606@gmail.com', '$2y$10$mIThDrK81LYgCNbK1wMVq.gpY96iALvkuUh26vOzY14Oyp8gcTf6K', 'Bildard ', 'Blair', 'student', 'active', 'df9aeda1ae159ad7372e460c8f6ed36b4d410c8c4c8c55096f2bce0fdc48e065', '+254799377583', '40100', NULL, NULL, NULL, NULL, NULL, '2025-07-15 18:28:39', '2025-07-15 22:31:21', 10, 12),
(20, 'chichilasty@gmail.com', '$2y$10$7ffjeShtHe8hpyVbBtpyM.hDiSyM0Qu/Hy6bUkxlMVsBZL8X1yuUu', 'charity', 'Apondi', 'teacher', 'active', '67e946f436f4a8807bc687f9b0288d3df7616582e539ffdd3592a7ef32446ea9', '+25479937753', '40100', 'School of pure and applied science', 'computer science', 'computer science ', 'Masters in computing ', '20 years in teaching ', '2025-07-15 18:35:04', '2025-07-15 22:03:06', 10, 12);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_assignments_course` (`course_id`);

--
-- Indexes for table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assignment_id` (`assignment_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `class_chat_messages`
--
ALTER TABLE `class_chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_class_chat_messages_class` (`class_id`);

--
-- Indexes for table `class_materials`
--
ALTER TABLE `class_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `uploader_id` (`uploader_id`);

--
-- Indexes for table `class_participants`
--
ALTER TABLE `class_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_participant` (`class_id`,`user_id`),
  ADD KEY `idx_class_participants_user` (`user_id`);

--
-- Indexes for table `class_recordings`
--
ALTER TABLE `class_recordings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `department_id` (`department_id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `instructor_id` (`instructor_id`);

--
-- Indexes for table `course_content`
--
ALTER TABLE `course_content`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_course_content_course_id` (`course_id`);

--
-- Indexes for table `course_questions`
--
ALTER TABLE `course_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `content_id` (`content_id`);

--
-- Indexes for table `course_teachers`
--
ALTER TABLE `course_teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_course_teacher` (`course_id`,`teacher_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_department_school` (`school_id`),
  ADD KEY `idx_department_name` (`name`);

--
-- Indexes for table `discussion_comments`
--
ALTER TABLE `discussion_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_discussion_comments_topic` (`topic_id`);

--
-- Indexes for table `discussion_groups`
--
ALTER TABLE `discussion_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_discussion_groups_course` (`course_id`);

--
-- Indexes for table `discussion_group_members`
--
ALTER TABLE `discussion_group_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_group_member` (`group_id`,`user_id`),
  ADD KEY `idx_discussion_group_members_group` (`group_id`),
  ADD KEY `idx_discussion_group_members_user` (`user_id`);

--
-- Indexes for table `discussion_notifications`
--
ALTER TABLE `discussion_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `topic_id` (`topic_id`),
  ADD KEY `idx_discussion_notifications_user` (`user_id`),
  ADD KEY `idx_discussion_notifications_group` (`group_id`);

--
-- Indexes for table `discussion_topics`
--
ALTER TABLE `discussion_topics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_discussion_topics_group` (`group_id`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_enrollment` (`student_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_grade` (`student_id`,`assignment_id`),
  ADD KEY `assignment_id` (`assignment_id`),
  ADD KEY `graded_by` (`graded_by`);

--
-- Indexes for table `guardians`
--
ALTER TABLE `guardians`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `national_id` (`national_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `guardian_students`
--
ALTER TABLE `guardian_students`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guardian_id` (`guardian_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `online_classes`
--
ALTER TABLE `online_classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_online_classes_course` (`course_id`),
  ADD KEY `idx_online_classes_instructor` (`instructor_id`),
  ADD KEY `idx_online_classes_status` (`status`);

--
-- Indexes for table `schools`
--
ALTER TABLE `schools`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_school_name` (`name`);

--
-- Indexes for table `school_departments`
--
ALTER TABLE `school_departments`
  ADD PRIMARY KEY (`school_id`,`department_id`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `student_assignments`
--
ALTER TABLE `student_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_submission` (`student_id`,`assignment_id`),
  ADD KEY `assignment_id` (`assignment_id`);

--
-- Indexes for table `submissions`
--
ALTER TABLE `submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `assignment_id` (`assignment_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_school` (`school`),
  ADD KEY `idx_department` (`department`),
  ADD KEY `fk_user_school` (`school_id`),
  ADD KEY `fk_user_department` (`department_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `class_chat_messages`
--
ALTER TABLE `class_chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `class_materials`
--
ALTER TABLE `class_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `class_participants`
--
ALTER TABLE `class_participants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `class_recordings`
--
ALTER TABLE `class_recordings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `course_content`
--
ALTER TABLE `course_content`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `course_questions`
--
ALTER TABLE `course_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_teachers`
--
ALTER TABLE `course_teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `discussion_comments`
--
ALTER TABLE `discussion_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `discussion_groups`
--
ALTER TABLE `discussion_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `discussion_group_members`
--
ALTER TABLE `discussion_group_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `discussion_notifications`
--
ALTER TABLE `discussion_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `discussion_topics`
--
ALTER TABLE `discussion_topics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `grades`
--
ALTER TABLE `grades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `guardians`
--
ALTER TABLE `guardians`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `guardian_students`
--
ALTER TABLE `guardian_students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `online_classes`
--
ALTER TABLE `online_classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `schools`
--
ALTER TABLE `schools`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `student_assignments`
--
ALTER TABLE `student_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `submissions`
--
ALTER TABLE `submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  ADD CONSTRAINT `assignment_submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignment_submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
