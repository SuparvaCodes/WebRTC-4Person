 SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `groupcall`
--

-- --------------------------------------------------------

--
-- Table structure for table `room`
--

CREATE TABLE `room` (
  `room_id` varchar(40) NOT NULL,
  `host_name` text NOT NULL,
  `is_password` text NOT NULL,
  `password` text NOT NULL,
  `host_name` text NOT NULL,
  `time_created` text NOT NULL,
  `room_subject` text NOT NULL,
  `members_count` int(11) NOT NULL,
  `members_list` json NOT NULL,
  `max_members` int(11) NOT NULL,
  `users_ips` json NOT NULL,
  `blocked_ips` json NOT NULL,
  `room_server_number` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Indexes for table `room`
--
ALTER TABLE `room`
  ADD PRIMARY KEY (`room_server_number`);
