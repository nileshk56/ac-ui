-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 18, 2020 at 02:29 PM
-- Server version: 5.6.35
-- PHP Version: 7.1.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `ac`
--

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `post_id` bigint(20) NOT NULL,
  `post_type` enum('I','V','T') NOT NULL,
  `post_desc` text,
  `media_path` varchar(256) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `popular_index` bit(11) DEFAULT NULL,
  `is_published` int(11) DEFAULT NULL,
  `like_count` int(11) NOT NULL DEFAULT '0',
  `comment_count` int(11) NOT NULL DEFAULT '0',
  `share_count` int(11) NOT NULL DEFAULT '0',
  `tags` varchar(256) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`post_id`, `post_type`, `post_desc`, `media_path`, `user_id`, `popular_index`, `is_published`, `like_count`, `comment_count`, `share_count`, `tags`, `created`) VALUES
(1, 'I', 'some post text here', '', 1, NULL, NULL, 0, 0, 0, NULL, '2020-04-18 06:32:14'),
(2, 'I', 'very good', 'https://nk-s3.s3.amazonaws.com/ac/uploads/1587192749135DSC_0464.JPG', 1, NULL, NULL, 0, 0, 0, NULL, '2020-04-18 06:53:18'),
(3, 'I', 'some text ehre', 'https://nk-s3.s3.amazonaws.com/ac/uploads/1587193084326DSC_0445.JPG', 1, NULL, NULL, 0, 0, 0, NULL, '2020-04-18 06:58:39'),
(4, 'I', 'some again teext heree\r\n', 'https://nk-s3.s3.amazonaws.com/ac/uploads/1587193250334DSC_0453.JPG', 1, NULL, NULL, 0, 0, 0, NULL, '2020-04-18 07:01:34'),
(5, 'I', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\r\n\r\n', '', 1, NULL, NULL, 0, 0, 0, NULL, '2020-04-18 10:18:38'),
(6, 'I', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'https://nk-s3.s3.amazonaws.com/ac/uploads/158720523084820170722_104415.jpg', 1, NULL, NULL, 0, 0, 0, NULL, '2020-04-18 10:20:38'),
(7, 'I', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'https://nk-s3.s3.amazonaws.com/ac/uploads/158720528647520170722_104415.jpg', 1, NULL, NULL, 0, 0, 0, NULL, '2020-04-18 10:21:28'),
(8, 'T', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', '', 1, NULL, NULL, 1, 5, 0, NULL, '2020-04-18 10:38:02');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` bigint(20) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `gender` enum('M','F') NOT NULL,
  `dob` datetime DEFAULT NULL,
  `image` varchar(256) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`, `gender`, `dob`, `image`, `created`) VALUES
(1, 'n1', 'n1', 'M', NULL, NULL, '2020-04-17 15:15:00');

-- --------------------------------------------------------

--
-- Table structure for table `user_activities`
--

CREATE TABLE `user_activities` (
  `user_activity_id` bigint(20) NOT NULL,
  `user_activity_type` enum('LIKE','COMMENT','SHARE','TAG') NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `post_id` bigint(20) NOT NULL,
  `comment` text,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `user_activities`
--

INSERT INTO `user_activities` (`user_activity_id`, `user_activity_type`, `user_id`, `post_id`, `comment`, `created`) VALUES
(1, 'LIKE', 1, 4, NULL, '2020-04-18 07:02:57'),
(2, 'LIKE', 1, 8, NULL, '2020-04-18 10:38:16'),
(3, 'COMMENT', 1, 8, 'a', '2020-04-18 12:20:22'),
(4, 'COMMENT', 1, 8, 'a', '2020-04-18 12:21:37'),
(5, 'COMMENT', 1, 8, 'a', '2020-04-18 12:22:46'),
(6, 'COMMENT', 1, 8, 'nilesh kangane is going to be billinaire', '2020-04-18 12:23:40'),
(7, 'COMMENT', 1, 8, 'nice', '2020-04-18 12:28:03'),
(8, 'COMMENT', 1, 8, 'my perfect comment', '2020-04-18 12:28:33');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`post_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `user_activities`
--
ALTER TABLE `user_activities`
  ADD PRIMARY KEY (`user_activity_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `post_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `user_activities`
--
ALTER TABLE `user_activities`
  MODIFY `user_activity_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;