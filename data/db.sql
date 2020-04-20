-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 20, 2020 at 12:30 PM
-- Server version: 5.6.35
-- PHP Version: 7.1.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `ac`
--

-- --------------------------------------------------------

--
-- Table structure for table `friends`
--

CREATE TABLE `friends` (
  `user_friend_id` bigint(20) NOT NULL,
  `from_username` varchar(50) NOT NULL,
  `to_username` varchar(50) NOT NULL,
  `friendship_status` enum('SENT','CONFIRM','','') NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `friends`
--

INSERT INTO `friends` (`user_friend_id`, `from_username`, `to_username`, `friendship_status`, `created`) VALUES
(7, 'n1', 'nilesh33', 'CONFIRM', '2020-04-20 07:59:26'),
(9, 'n1', 'nilesh22', 'CONFIRM', '2020-04-20 09:07:29'),
(10, 'nilesh22', 'n1', 'CONFIRM', '2020-04-20 09:07:52'),
(11, 'nilesh33', 'n1', 'CONFIRM', '2020-04-20 09:08:11');

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
  `username` varchar(50) DEFAULT NULL,
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

INSERT INTO `posts` (`post_id`, `post_type`, `post_desc`, `media_path`, `user_id`, `username`, `popular_index`, `is_published`, `like_count`, `comment_count`, `share_count`, `tags`, `created`) VALUES
(1, 'I', 'Turn the nav menu into navigation tabs with the .nav-tabs class. Add the .active class to the active/current link. If you want the tabs to be togglable, see the last example on this page.\r\n\r\n', 'https://nk-s3.s3.amazonaws.com/ac/uploads/1587223984359Cartoon-Network-1000x563.jpg', 1, 'n1', NULL, NULL, 1, 0, 0, NULL, '2020-04-18 15:33:08'),
(2, 'T', 'For 50 years, WWF has been protecting the future of nature. The world\'s leading conservation organization, WWF works in 100 countries and is supported by 1.2 million members in the United States and close to 5 million globally.\r\n\r\n', '', 2, 'nilesh22', NULL, NULL, 0, 0, 0, NULL, '2020-04-19 06:12:58'),
(3, 'I', '', 'https://nk-s3.s3.amazonaws.com/ac/uploads/1587277834454unnamed.jpg', 2, 'nilesh22', NULL, NULL, 0, 0, 1, NULL, '2020-04-19 06:30:37'),
(4, 'T', 'Display headings are used to stand out more than normal headings (larger font-size and lighter font-weight), and there are four classes to choose from: .display-1, .display-2, .display-3, .display-4\r\n\r\nIn Bootstrap 4 the HTML <small> element is used to create a lighter, secondary text in any heading:\r\n\r\nFor 50 years, WWF has been protecting the future of nature. The world\'s leading conservation organization, WWF works in 100 countries and is supported by 1.2 million members in the United States and close to 5 million globally.\r\n\r\nFor 50 years, WWF has been protecting the future of nature. The world\'s leading conservation organization, WWF works in 100 countries and is supported by 1.2 million members in the United States and close to 5 million globally.\r\n\r\n', '', 2, 'nilesh22', NULL, NULL, 0, 0, 0, NULL, '2020-04-19 06:31:38');

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
(1, 'n1', 'n1', 'M', NULL, NULL, '2020-04-17 15:15:00'),
(2, 'nilesh22', 'nilesh22', 'M', NULL, NULL, '2020-04-18 15:49:32'),
(3, 'nilesh33', 'nilesh33', 'M', NULL, NULL, '2020-04-20 07:29:42');

-- --------------------------------------------------------

--
-- Table structure for table `user_activities`
--

CREATE TABLE `user_activities` (
  `user_activity_id` bigint(20) NOT NULL,
  `user_activity_type` enum('LIKE','COMMENT','SHARE','TAG') NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `post_id` bigint(20) NOT NULL,
  `comment` text,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `user_activities`
--

INSERT INTO `user_activities` (`user_activity_id`, `user_activity_type`, `user_id`, `username`, `post_id`, `comment`, `created`) VALUES
(1, 'LIKE', 2, 'nilesh22', 1, NULL, '2020-04-20 09:14:57'),
(2, 'SHARE', 3, 'nilesh33', 3, NULL, '2020-04-20 09:15:20');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `friends`
--
ALTER TABLE `friends`
  ADD PRIMARY KEY (`user_friend_id`),
  ADD UNIQUE KEY `from_username` (`from_username`,`to_username`);

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
-- AUTO_INCREMENT for table `friends`
--
ALTER TABLE `friends`
  MODIFY `user_friend_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `post_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `user_activities`
--
ALTER TABLE `user_activities`
  MODIFY `user_activity_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;