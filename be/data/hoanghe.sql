-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th8 16, 2025 lúc 05:34 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `hoanghe`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitietdonhang`
--

CREATE TABLE `chitietdonhang` (
  `id_ChiTietDH` int(11) NOT NULL,
  `id_SanPham` int(11) DEFAULT NULL,
  `id_DonHang` int(11) DEFAULT NULL,
  `soLuongMua` int(11) DEFAULT NULL COMMENT 'Số lượng mua của sản phẩm',
  `soLuong` int(11) DEFAULT NULL COMMENT 'Số lượng sản phẩm',
  `giaMua` decimal(10,2) DEFAULT NULL COMMENT 'Giá mua tại thời điểm đặt hàng',
  `donGia` decimal(10,2) DEFAULT NULL COMMENT 'Đơn giá tại thời điểm đặt hàng',
  `thanhTien` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `chitietdonhang`
--

INSERT INTO `chitietdonhang` (`id_ChiTietDH`, `id_SanPham`, `id_DonHang`, `soLuongMua`, `soLuong`, `giaMua`, `donGia`, `thanhTien`) VALUES
(1, 13, 4, 1, 1, 650000.00, NULL, NULL),
(2, 17, 5, 1, 1, 600000.00, NULL, NULL),
(3, 10, 6, 1, 1, 399000.00, 399000.00, NULL),
(4, 17, 7, 1, 1, 600000.00, 600000.00, NULL),
(5, 17, 8, 1, 1, 600000.00, 600000.00, NULL),
(6, 17, 9, 1, 1, 600000.00, 600000.00, NULL),
(7, 17, 10, 1, 1, 600000.00, 600000.00, NULL),
(8, 16, 11, 1, 1, 250000.00, 250000.00, NULL),
(9, 15, 11, 1, 1, 1200000.00, 1200000.00, NULL),
(10, 17, 11, 1, 1, 600000.00, 600000.00, NULL),
(11, 16, 12, 1, 1, 250000.00, 250000.00, NULL),
(12, 15, 12, 1, 1, 1200000.00, 1200000.00, NULL),
(13, 17, 12, 1, 1, 600000.00, 600000.00, NULL),
(14, 17, 13, 1, 1, 600000.00, 600000.00, NULL),
(15, 12, 14, 1, 1, 750000.00, 750000.00, NULL),
(16, 17, 14, 1, 1, 600000.00, 600000.00, NULL),
(17, 12, 15, 1, 1, 750000.00, 750000.00, NULL),
(18, 17, 15, 1, 1, 600000.00, 600000.00, NULL),
(19, 12, 16, 1, 1, 750000.00, 750000.00, NULL),
(20, 17, 16, 1, 1, 600000.00, 600000.00, NULL),
(21, 12, 17, 1, 1, 750000.00, 750000.00, NULL),
(22, 17, 17, 1, 1, 600000.00, 600000.00, NULL),
(23, 12, 18, 1, 1, 750000.00, 750000.00, NULL),
(24, 17, 18, 2, 2, 1200000.00, 600000.00, NULL),
(25, 12, 19, 1, 1, 750000.00, 750000.00, NULL),
(26, 17, 19, 3, 3, 1800000.00, 600000.00, NULL),
(27, 12, 20, 1, 1, 750000.00, 750000.00, NULL),
(28, 17, 20, 3, 3, 1800000.00, 600000.00, NULL),
(29, 12, 21, 1, 1, 750000.00, 750000.00, NULL),
(30, 17, 21, 3, 3, 1800000.00, 600000.00, NULL),
(31, 12, 22, 1, 1, 750000.00, 750000.00, NULL),
(32, 17, 22, 3, 3, 1800000.00, 600000.00, NULL),
(33, 12, 23, 1, 1, 750000.00, 750000.00, NULL),
(34, 17, 23, 3, 3, 1800000.00, 600000.00, NULL),
(35, 12, 24, 1, 1, 750000.00, 750000.00, NULL),
(36, 17, 24, 3, 3, 1800000.00, 600000.00, NULL),
(37, 12, 25, 1, 1, 750000.00, 750000.00, NULL),
(38, 17, 25, 3, 3, 1800000.00, 600000.00, NULL),
(39, 12, 26, 1, 1, 750000.00, 750000.00, NULL),
(40, 17, 26, 3, 3, 1800000.00, 600000.00, NULL),
(41, 12, 27, 1, 1, 750000.00, 750000.00, NULL),
(42, 17, 27, 3, 3, 1800000.00, 600000.00, NULL),
(43, 12, 28, 1, 1, 750000.00, 750000.00, NULL),
(44, 17, 28, 3, 3, 1800000.00, 600000.00, NULL),
(45, 12, 29, 1, 1, 750000.00, 750000.00, NULL),
(46, 17, 29, 4, 4, 2400000.00, 600000.00, NULL),
(47, 12, 30, 1, 1, 750000.00, 750000.00, NULL),
(48, 17, 31, 1, 1, 600000.00, 600000.00, NULL),
(49, 12, 31, 1, 1, 750000.00, 750000.00, NULL),
(50, 15, 32, 1, 1, 1200000.00, 1200000.00, NULL),
(51, 17, 32, 1, 1, 600000.00, 600000.00, NULL),
(52, 12, 32, 2, 2, 1500000.00, 750000.00, NULL),
(53, 15, 33, 1, 1, 1200000.00, 1200000.00, NULL),
(54, 17, 33, 2, 2, 1200000.00, 600000.00, NULL),
(55, 12, 33, 2, 2, 1500000.00, 750000.00, NULL),
(56, 15, 34, 1, 1, 1200000.00, 1200000.00, NULL),
(57, 17, 34, 2, 2, 1200000.00, 600000.00, NULL),
(58, 12, 34, 2, 2, 1500000.00, 750000.00, NULL),
(59, 15, 35, 2, 2, 2400000.00, 1200000.00, NULL),
(60, 17, 35, 2, 2, 1200000.00, 600000.00, NULL),
(61, 12, 35, 2, 2, 1500000.00, 750000.00, NULL),
(62, 15, 36, 2, 2, 2400000.00, 1200000.00, NULL),
(63, 17, 36, 3, 3, 1800000.00, 600000.00, NULL),
(64, 12, 36, 2, 2, 1500000.00, 750000.00, NULL),
(65, 15, 37, 3, 3, 3600000.00, 1200000.00, NULL),
(66, 17, 37, 3, 3, 1800000.00, 600000.00, NULL),
(67, 12, 37, 2, 2, 1500000.00, 750000.00, NULL),
(68, 17, 38, 3, 3, 1800000.00, 600000.00, NULL),
(69, 11, 39, 1, 1, 350000.00, 350000.00, NULL),
(70, 17, 39, 3, 3, 1800000.00, 600000.00, NULL),
(71, 10, 40, 1, 1, 399000.00, 399000.00, NULL),
(72, 11, 40, 1, 1, 350000.00, 350000.00, NULL),
(73, 17, 40, 3, 3, 1800000.00, 600000.00, NULL),
(74, 13, 41, 1, 1, 650000.00, 650000.00, NULL),
(75, 13, 42, 1, 1, 650000.00, 650000.00, NULL),
(76, 10, 43, 1, 1, 450000.00, 450000.00, NULL),
(77, 10, 44, 1, 1, 450000.00, 450000.00, NULL),
(78, 13, 45, 1, 1, 650000.00, 650000.00, NULL),
(79, 17, 46, 1, 1, 600000.00, 600000.00, NULL),
(80, 13, 46, 1, 1, 650000.00, 650000.00, NULL),
(81, 15, 47, 1, 1, 1200000.00, 1200000.00, NULL),
(82, 17, 47, 1, 1, 600000.00, 600000.00, NULL),
(83, 13, 47, 1, 1, 650000.00, 650000.00, NULL),
(84, 15, 48, 2, 2, 2400000.00, 1200000.00, NULL),
(85, 17, 48, 1, 1, 600000.00, 600000.00, NULL),
(86, 13, 48, 1, 1, 650000.00, 650000.00, NULL),
(87, 15, 49, 2, 2, 2400000.00, 1200000.00, NULL),
(88, 17, 49, 2, 2, 1200000.00, 600000.00, NULL),
(89, 13, 49, 1, 1, 650000.00, 650000.00, NULL),
(90, 15, 50, 2, 2, 2400000.00, 1200000.00, NULL),
(91, 17, 50, 3, 3, 1800000.00, 600000.00, NULL),
(92, 13, 50, 1, 1, 650000.00, 650000.00, NULL),
(93, 15, 51, 2, 2, 2400000.00, 1200000.00, NULL),
(94, 17, 51, 3, 3, 1800000.00, 600000.00, NULL),
(95, 13, 51, 1, 1, 650000.00, 650000.00, NULL),
(96, 10, 52, 1, 1, 399000.00, 399000.00, NULL),
(97, 15, 52, 2, 2, 2400000.00, 1200000.00, NULL),
(98, 17, 52, 3, 3, 1800000.00, 600000.00, NULL),
(99, 13, 52, 1, 1, 650000.00, 650000.00, NULL),
(100, 10, 53, 1, 1, 399000.00, 399000.00, NULL),
(101, 15, 53, 2, 2, 2400000.00, 1200000.00, NULL),
(102, 17, 53, 3, 3, 1800000.00, 600000.00, NULL),
(103, 13, 53, 1, 1, 650000.00, 650000.00, NULL),
(104, 13, 54, 1, 1, 650000.00, 650000.00, NULL),
(105, 16, 55, 1, 1, 250000.00, 250000.00, NULL),
(106, 17, 56, 1, 1, 600000.00, 600000.00, NULL),
(107, 16, 57, 2, 2, 500000.00, 250000.00, NULL),
(108, 17, 57, 1, 1, 600000.00, 600000.00, NULL),
(109, 17, 58, 1, 1, 600000.00, 600000.00, NULL),
(111, 13, 60, 1, 1, 650000.00, 650000.00, NULL),
(112, 17, 60, 1, 1, 600000.00, 600000.00, NULL),
(113, 11, 61, 1, 1, 350000.00, 350000.00, NULL),
(114, 17, 62, 1, 1, 600000.00, 600000.00, NULL),
(115, 18, 63, 1, 1, 777777.00, 777777.00, NULL),
(116, 17, 63, 1, 1, 600000.00, 600000.00, NULL),
(117, 17, 64, 1, 1, 600000.00, 600000.00, NULL),
(118, 17, 65, 1, 1, 600000.00, 600000.00, NULL),
(119, 14, 66, 1, 1, 100000.00, 100000.00, NULL),
(120, 17, 67, 1, 1, 600000.00, 600000.00, NULL),
(121, 17, 68, 1, 1, 600000.00, 600000.00, NULL),
(122, 17, 69, 1, 1, 600000.00, 600000.00, NULL),
(123, 18, 70, 3, 3, 2333331.00, 777777.00, NULL),
(124, 10, 71, 1, 1, 399000.00, 399000.00, NULL),
(125, 17, 72, 1, 1, 600000.00, 600000.00, NULL),
(126, 17, 73, 2, 2, 1200000.00, 600000.00, NULL),
(127, 14, 74, 1, 1, 100000.00, 100000.00, NULL),
(128, 17, 74, 1, 1, 600000.00, 600000.00, NULL),
(129, 18, 75, 1, 1, 777777.00, 777777.00, NULL),
(130, 18, 76, 1, 1, 777777.00, 777777.00, NULL),
(131, 17, 77, 1, 1, 600000.00, 600000.00, NULL),
(132, 18, 77, 1, 1, 777777.00, 777777.00, NULL),
(133, 14, 78, 1, 1, 100000.00, 100000.00, NULL),
(134, 17, 78, 1, 1, 600000.00, 600000.00, NULL),
(135, 18, 78, 1, 1, 777777.00, 777777.00, NULL),
(136, 17, 79, 2, 2, 1200000.00, 600000.00, NULL),
(137, 17, 80, 1, 1, 600000.00, 600000.00, NULL),
(138, 14, 81, 1, 1, 100000.00, 100000.00, NULL),
(139, 14, 82, 1, 1, 100000.00, 100000.00, NULL),
(140, 17, 83, 1, 1, 600000.00, 600000.00, NULL),
(141, 14, 83, 1, 1, 100000.00, 100000.00, NULL),
(142, 17, 84, 1, 1, 600000.00, 600000.00, NULL),
(143, 14, 84, 1, 1, 100000.00, 100000.00, NULL),
(144, 17, 85, 1, 1, 600000.00, 600000.00, NULL),
(145, 14, 85, 1, 1, 100000.00, 100000.00, NULL),
(146, 17, 86, 2, 2, 1200000.00, 600000.00, NULL),
(147, 14, 86, 1, 1, 100000.00, 100000.00, NULL),
(148, 17, 87, 2, 2, 1200000.00, 600000.00, NULL),
(149, 14, 87, 1, 1, 100000.00, 100000.00, NULL),
(150, 17, 88, 2, 2, 1200000.00, 600000.00, NULL),
(151, 14, 88, 1, 1, 100000.00, 100000.00, NULL),
(152, 17, 89, 2, 2, 1200000.00, 600000.00, NULL),
(153, 14, 89, 1, 1, 100000.00, 100000.00, NULL),
(154, 17, 90, 2, 2, 1200000.00, 600000.00, NULL),
(155, 14, 90, 1, 1, 100000.00, 100000.00, NULL),
(156, 17, 91, 2, 2, 1200000.00, 600000.00, NULL),
(157, 14, 91, 1, 1, 100000.00, 100000.00, NULL),
(158, 17, 92, 2, 2, 1200000.00, 600000.00, NULL),
(159, 14, 92, 1, 1, 100000.00, 100000.00, NULL),
(160, 17, 93, 2, 2, 1200000.00, 600000.00, NULL),
(161, 14, 93, 1, 1, 100000.00, 100000.00, NULL),
(162, 17, 94, 2, 2, 1200000.00, 600000.00, NULL),
(163, 14, 94, 1, 1, 100000.00, 100000.00, NULL),
(164, 17, 95, 2, 2, 1200000.00, 600000.00, NULL),
(165, 14, 95, 1, 1, 100000.00, 100000.00, NULL),
(166, 17, 96, 2, 2, 1200000.00, 600000.00, NULL),
(167, 14, 96, 1, 1, 100000.00, 100000.00, NULL),
(168, 17, 97, 2, 2, 1200000.00, 600000.00, NULL),
(169, 14, 97, 1, 1, 100000.00, 100000.00, NULL),
(170, 17, 98, 2, 2, 1200000.00, 600000.00, NULL),
(171, 14, 98, 1, 1, 100000.00, 100000.00, NULL),
(172, 17, 99, 2, 2, 1200000.00, 600000.00, NULL),
(173, 14, 99, 1, 1, 100000.00, 100000.00, NULL),
(174, 17, 100, 2, 2, 1200000.00, 600000.00, NULL),
(175, 14, 100, 1, 1, 100000.00, 100000.00, NULL),
(176, 17, 101, 2, 2, 1200000.00, 600000.00, NULL),
(177, 14, 101, 1, 1, 100000.00, 100000.00, NULL),
(178, 17, 102, 2, 2, 1200000.00, 600000.00, NULL),
(179, 14, 102, 1, 1, 100000.00, 100000.00, NULL),
(180, 17, 103, 2, 2, 1200000.00, 600000.00, NULL),
(181, 14, 103, 1, 1, 100000.00, 100000.00, NULL),
(182, 17, 104, 2, 2, 1200000.00, 600000.00, NULL),
(183, 14, 104, 1, 1, 100000.00, 100000.00, NULL),
(184, 17, 105, 2, 2, 1200000.00, 600000.00, NULL),
(185, 14, 105, 1, 1, 100000.00, 100000.00, NULL),
(186, 17, 106, 2, 2, 1200000.00, 600000.00, NULL),
(187, 14, 106, 1, 1, 100000.00, 100000.00, NULL),
(188, 17, 107, 2, 2, 1200000.00, 600000.00, NULL),
(189, 14, 107, 1, 1, 100000.00, 100000.00, NULL),
(190, 17, 108, 2, 2, 1200000.00, 600000.00, NULL),
(191, 14, 108, 1, 1, 100000.00, 100000.00, NULL),
(192, 17, 109, 2, 2, 1200000.00, 600000.00, NULL),
(193, 14, 109, 1, 1, 100000.00, 100000.00, NULL),
(194, 17, 110, 1, 1, 600000.00, 600000.00, NULL),
(195, 17, 111, 1, 1, 600000.00, 600000.00, NULL),
(196, 17, 112, 1, 1, 600000.00, 600000.00, NULL),
(197, 17, 113, 1, 1, 600000.00, 600000.00, NULL),
(198, 17, 114, 1, 1, 600000.00, 600000.00, NULL),
(199, 17, 115, 1, 1, 600000.00, 600000.00, NULL),
(200, 17, 116, 1, 1, 600000.00, 600000.00, NULL),
(201, 14, 117, NULL, NULL, NULL, NULL, NULL),
(202, 17, 117, NULL, NULL, NULL, NULL, NULL),
(204, 17, 147, 3, NULL, 1800000.00, 600000.00, NULL),
(205, 17, 148, 1, NULL, 600000.00, 600000.00, NULL),
(206, 17, 149, 1, NULL, 600000.00, 600000.00, NULL),
(207, 17, 150, 1, NULL, 600000.00, 600000.00, NULL),
(208, 17, 151, 1, NULL, 600000.00, 600000.00, NULL),
(209, 17, 152, 1, NULL, 600000.00, 600000.00, NULL),
(210, 17, 153, 1, NULL, 600000.00, 600000.00, NULL),
(211, 17, 154, 1, NULL, 600000.00, 600000.00, NULL),
(212, 17, 155, 1, NULL, 600000.00, 600000.00, NULL),
(213, 10, 156, 1, NULL, 399000.00, 399000.00, NULL),
(214, 17, 157, 1, NULL, 600000.00, 600000.00, NULL),
(215, 14, 158, 1, NULL, 100000.00, 100000.00, NULL),
(216, 17, 158, 1, NULL, 600000.00, 600000.00, NULL),
(217, 17, 159, 1, NULL, 600000.00, 600000.00, NULL),
(218, 17, 160, 1, NULL, 600000.00, 600000.00, NULL),
(219, 17, 161, 1, NULL, 600000.00, 600000.00, NULL),
(220, 17, 162, 2, NULL, 1200000.00, 600000.00, NULL),
(221, 17, 163, 1, NULL, 600000.00, 600000.00, NULL),
(222, 17, 164, 1, NULL, 600000.00, 600000.00, NULL),
(224, 17, 165, 1, NULL, 600000.00, 600000.00, NULL),
(225, 17, 166, 1, NULL, 600000.00, 600000.00, NULL),
(226, 17, 167, 2, NULL, 1200000.00, 600000.00, NULL),
(227, 17, 168, 1, NULL, 600000.00, 600000.00, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danhgia`
--

CREATE TABLE `danhgia` (
  `id_DanhGia` int(11) NOT NULL,
  `id_SanPham` int(11) NOT NULL,
  `id_DonHang` int(11) NOT NULL,
  `id_NguoiDung` int(11) NOT NULL,
  `noiDung` text DEFAULT NULL,
  `hinhAnh` text DEFAULT NULL,
  `danhGiaSao` int(11) NOT NULL CHECK (`danhGiaSao` between 1 and 5),
  `ngayDanhGia` datetime DEFAULT current_timestamp(),
  `trangThai` enum('active','hidden','deleted') DEFAULT 'active',
  `phanHoiAdmin` text DEFAULT NULL,
  `ngayPhanHoi` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Bảng đánh giá sản phẩm - hỗ trợ hình ảnh và nội dung không bắt buộc';

--
-- Đang đổ dữ liệu cho bảng `danhgia`
--

INSERT INTO `danhgia` (`id_DanhGia`, `id_SanPham`, `id_DonHang`, `id_NguoiDung`, `noiDung`, `hinhAnh`, `danhGiaSao`, `ngayDanhGia`, `trangThai`, `phanHoiAdmin`, `ngayPhanHoi`) VALUES
(1, 17, 157, 9, 'sản phảm giá tốt ưu đãi quá shop ơi', NULL, 5, '2025-08-15 14:57:10', 'active', NULL, NULL),
(2, 14, 158, 9, 'ddddddddddddddd', NULL, 5, '2025-08-15 15:14:46', 'active', NULL, NULL),
(3, 17, 161, 9, 'vvvvvvvvvvv', NULL, 5, '2025-08-15 21:35:13', 'active', NULL, NULL),
(4, 17, 162, 7, NULL, NULL, 5, '2025-08-15 23:49:00', 'active', NULL, NULL),
(5, 17, 163, 7, 'ok ổn lắm nha shop pơ', NULL, 5, '2025-08-15 23:52:50', 'active', NULL, NULL),
(6, 17, 164, 7, 'ok lắm nha shop ơi lần tơi sẽ uh', NULL, 5, '2025-08-15 23:56:26', 'active', NULL, NULL),
(7, 17, 166, 7, NULL, NULL, 5, '2025-08-16 09:38:46', 'active', NULL, NULL),
(8, 17, 167, 7, NULL, NULL, 5, '2025-08-16 10:17:14', 'active', NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danhmuc`
--

CREATE TABLE `danhmuc` (
  `id_DanhMuc` int(11) NOT NULL,
  `tenDanhMuc` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `danhmuc`
--

INSERT INTO `danhmuc` (`id_DanhMuc`, `tenDanhMuc`) VALUES
(1, 'Hoa Sinh Nhật'),
(2, 'Hoa Chúc Mừng'),
(4, 'Hoa Tình Yêu'),
(5, 'Hoa Khai Trương'),
(6, 'Hoa Tang Lễ'),
(7, 'Hoa Tổng Hợp');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danhmucchitiet`
--

CREATE TABLE `danhmucchitiet` (
  `id_DanhMucChiTiet` int(11) NOT NULL,
  `id_DanhMuc` int(11) DEFAULT NULL,
  `tenDanhMucChiTiet` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `danhmucchitiet`
--

INSERT INTO `danhmucchitiet` (`id_DanhMucChiTiet`, `id_DanhMuc`, `tenDanhMucChiTiet`) VALUES
(1, 1, 'Hoa Hồng'),
(2, 1, 'Hoa Cúc'),
(3, 2, 'Hoa Khai Trương'),
(4, 2, 'Hoa Sự Kiện'),
(6, 4, 'hoa sung'),
(7, 4, 'hoa qua tang'),
(8, 5, 'hoa 2'),
(9, 5, 'hoa 3'),
(10, 6, 'hoa 5'),
(11, 6, 'hoa 6'),
(12, 7, 'hoa 7'),
(13, 7, 'hoa 8');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `donhang`
--

CREATE TABLE `donhang` (
  `id_DonHang` int(11) NOT NULL,
  `id_NguoiDung` int(11) DEFAULT NULL,
  `id_voucher` int(11) DEFAULT NULL,
  `ngayDatHang` datetime DEFAULT current_timestamp(),
  `phuongThucThanhToan` varchar(100) DEFAULT NULL,
  `soLuong` int(11) DEFAULT NULL,
  `tongThanhToan` decimal(10,2) DEFAULT NULL,
  `phiVanChuyen` decimal(10,2) DEFAULT NULL,
  `trangThaiDonHang` varchar(100) DEFAULT NULL,
  `lyDo` text DEFAULT NULL COMMENT 'Lý do hủy đơn hàng hoặc giao hàng thất bại',
  `status` enum('cho_xu_ly','da_xac_nhan','dang_chuan_bi','dang_giao','da_giao','huy_boi_khach','huy_boi_admin','khach_bom_hang') DEFAULT 'cho_xu_ly',
  `diaChiGiaoHang` text DEFAULT NULL COMMENT 'Địa chỉ giao hàng',
  `ghiChu` text DEFAULT NULL COMMENT 'Ghi chú đơn hàng',
  `maDonHang` varchar(50) DEFAULT NULL COMMENT 'Mã đơn hàng',
  `tenNguoiNhan` varchar(255) DEFAULT NULL COMMENT 'Tên người nhận',
  `soDienThoai` varchar(20) DEFAULT NULL COMMENT 'Số điện thoại người nhận',
  `email` varchar(255) DEFAULT NULL COMMENT 'Email người nhận'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `donhang`
--

INSERT INTO `donhang` (`id_DonHang`, `id_NguoiDung`, `id_voucher`, `ngayDatHang`, `phuongThucThanhToan`, `soLuong`, `tongThanhToan`, `phiVanChuyen`, `trangThaiDonHang`, `lyDo`, `status`, `diaChiGiaoHang`, `ghiChu`, `maDonHang`, `tenNguoiNhan`, `soDienThoai`, `email`) VALUES
(1, NULL, NULL, '2025-07-02 04:17:16', 'cod', NULL, 1200000.00, 0.00, NULL, NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(2, NULL, NULL, '2025-07-02 04:18:04', 'card', NULL, 600000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(3, NULL, NULL, '2025-07-02 04:37:08', 'cod', NULL, 600000.00, 0.00, NULL, NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(4, 2, NULL, '2025-07-02 12:49:32', 'COD', NULL, 650000.00, 0.00, 'delivered', NULL, 'cho_xu_ly', 'Địa chỉ giao hàng sẽ được cập nhật sau', 'Thông tin giao hàng được cập nhật từ thông tin tài khoản', NULL, 'Admin User', '0987654321', NULL),
(5, 2, NULL, '2025-07-02 14:20:02', 'COD', NULL, 600000.00, 0.00, 'delivered', NULL, 'cho_xu_ly', 'Địa chỉ giao hàng sẽ được cập nhật sau', 'Thông tin giao hàng được cập nhật từ thông tin tài khoản', NULL, 'Admin User', '0987654321', NULL),
(6, 5, NULL, '2025-07-02 18:25:43', 'COD', 1, 429000.00, 30000.00, 'confirmed', NULL, 'cho_xu_ly', 'Địa chỉ giao hàng sẽ được cập nhật sau', 'Thông tin giao hàng được cập nhật từ thông tin tài khoản', NULL, 'phamvanviet ', '0336636315', NULL),
(7, 5, NULL, '2025-07-03 15:28:54', 'COD', 1, 600000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', 'Địa chỉ giao hàng sẽ được cập nhật sau', 'Thông tin giao hàng được cập nhật từ thông tin tài khoản', NULL, 'phamvanviet ', '0336636315', NULL),
(8, 5, NULL, '2025-07-03 16:03:14', 'TRANSFER', 1, 600000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', 'Địa chỉ giao hàng sẽ được cập nhật sau', 'Thông tin giao hàng được cập nhật từ thông tin tài khoản', NULL, 'phamvanviet ', '0336636315', NULL),
(9, 5, NULL, '2025-07-03 16:09:11', 'TRANSFER', 1, 600000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', 'Địa chỉ giao hàng sẽ được cập nhật sau', 'Thông tin giao hàng được cập nhật từ thông tin tài khoản', NULL, 'phamvanviet ', '0336636315', NULL),
(10, 5, NULL, '2025-07-03 16:16:55', 'TRANSFER', 1, 600000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', 'Địa chỉ giao hàng sẽ được cập nhật sau', 'Thông tin giao hàng được cập nhật từ thông tin tài khoản', NULL, 'phamvanviet ', '0336636315', NULL),
(11, 5, NULL, '2025-07-03 16:26:29', 'CARD', 3, 2050000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', 'Địa chỉ giao hàng sẽ được cập nhật sau', 'Thông tin giao hàng được cập nhật từ thông tin tài khoản', NULL, 'phamvanviet ', '0336636315', NULL),
(12, 5, NULL, '2025-07-03 16:27:04', 'CARD', 3, 2050000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', 'Địa chỉ giao hàng sẽ được cập nhật sau', 'Thông tin giao hàng được cập nhật từ thông tin tài khoản', NULL, 'phamvanviet ', '0336636315', NULL),
(13, 5, NULL, '2025-07-03 16:28:15', 'TRANSFER', 1, 600000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', 'Địa chỉ giao hàng sẽ được cập nhật sau', 'Thông tin giao hàng được cập nhật từ thông tin tài khoản', NULL, 'phamvanviet ', '0336636315', NULL),
(14, 5, NULL, '2025-07-03 16:32:38', 'CARD', 2, 1350000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(15, 5, NULL, '2025-07-03 16:33:03', 'CARD', 2, 1350000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(16, 5, NULL, '2025-07-03 16:33:58', 'CARD', 2, 1350000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(17, 5, NULL, '2025-07-03 16:34:48', 'CARD', 2, 1350000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(18, 5, NULL, '2025-07-03 16:52:08', 'CARD', 2, 1950000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(19, 5, NULL, '2025-07-03 17:06:14', 'CARD', 2, 2550000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(20, 5, NULL, '2025-07-03 17:06:16', 'CARD', 2, 2550000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(21, 5, NULL, '2025-07-03 17:06:16', 'CARD', 2, 2550000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(22, 5, NULL, '2025-07-03 17:06:23', 'CARD', 2, 2550000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(23, 5, NULL, '2025-07-03 17:07:43', 'CARD', 2, 2550000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(24, 5, NULL, '2025-07-03 17:09:09', 'CARD', 2, 2550000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(25, 5, NULL, '2025-07-03 17:09:09', 'CARD', 2, 2550000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(26, 5, NULL, '2025-07-03 17:27:13', 'CARD', 2, 2550000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(27, 5, NULL, '2025-07-03 17:28:41', 'CARD', 2, 2550000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(28, 5, NULL, '2025-07-03 17:31:51', 'CARD', 2, 2550000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(29, 5, NULL, '2025-07-03 17:38:41', 'CARD', 2, 3150000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(30, 5, NULL, '2025-07-04 15:57:26', 'VNPay', 1, 750000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(31, 5, NULL, '2025-07-04 15:59:12', 'VNPay', 2, 1350000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(32, 5, NULL, '2025-07-04 16:43:13', 'VNPay', 3, 3300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(33, 5, NULL, '2025-07-04 16:54:11', 'VNPay', 3, 3900000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(34, 5, NULL, '2025-07-04 16:59:42', 'VNPay', 3, 3900000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(35, 5, NULL, '2025-07-04 17:02:24', 'VNPay', 3, 5100000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(36, 5, NULL, '2025-07-04 17:07:23', 'VNPay', 3, 5700000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(37, 5, NULL, '2025-07-04 17:18:57', 'VNPay', 3, 6900000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(38, 5, NULL, '2025-07-04 17:19:50', 'VNPay', 1, 1800000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(39, 5, NULL, '2025-07-04 17:26:49', 'VNPay', 2, 2150000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(40, 5, NULL, '2025-07-04 17:34:51', 'VNPay', 3, 2549000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(41, 5, NULL, '2025-07-04 17:38:43', 'VNPay', 1, 650000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(42, 5, NULL, '2025-07-04 17:38:46', 'VNPay', 1, 650000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(43, NULL, NULL, '2025-07-04 17:41:55', 'COD', 1, 450000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(44, NULL, NULL, '2025-07-04 17:42:02', 'COD', 1, 450000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(45, 5, NULL, '2025-07-04 17:43:22', 'VNPay', 1, 650000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(46, 5, NULL, '2025-07-04 17:46:11', 'VNPay', 2, 1250000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(47, 5, NULL, '2025-07-04 17:50:58', 'VNPay', 3, 2450000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(48, 5, NULL, '2025-07-04 18:08:25', 'VNPay', 3, 3650000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(49, 5, NULL, '2025-07-04 18:35:49', 'VNPay', 3, 4250000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(50, 5, NULL, '2025-07-04 18:45:07', 'VNPay', 3, 4850000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(51, 5, NULL, '2025-07-04 18:45:49', 'ZaloPay', 3, 4850000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(52, 5, NULL, '2025-07-04 18:47:26', 'ZaloPay', 4, 5249000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(53, 5, NULL, '2025-07-04 18:48:11', 'VNPay', 4, 5249000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(54, 5, NULL, '2025-07-07 14:46:27', 'ZaloPay', 1, 650000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(55, 5, NULL, '2025-07-09 13:38:33', 'COD', 1, 250000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(56, 5, NULL, '2025-07-09 13:40:16', 'ZaloPay', 1, 600000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(57, 5, NULL, '2025-07-09 13:51:44', 'ZaloPay', 2, 1100000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(58, 7, NULL, '2025-07-09 13:55:59', 'ZaloPay', 1, 600000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(60, 7, 1, '2025-07-12 17:08:01', 'COD', 2, 1200000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(61, 7, NULL, '2025-07-12 17:49:10', 'COD', 1, 350000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(62, 7, 1, '2025-07-12 18:18:43', 'COD', 1, 550000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(63, 9, NULL, '2025-07-17 13:31:54', 'COD', 2, 1377777.00, 0.00, 'cancelled_by_customer', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(64, 9, 1, '2025-07-17 22:58:18', 'COD', 1, 550000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(65, 9, NULL, '2025-07-17 23:07:32', 'COD', 1, 600000.00, 0.00, 'failed_delivery', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(66, 9, NULL, '2025-07-17 23:11:06', 'COD', 1, 100000.00, 0.00, 'failed_delivery', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(67, 9, NULL, '2025-07-17 23:15:33', 'COD', 1, 600000.00, 0.00, 'processing', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(68, 9, NULL, '2025-07-17 23:19:59', 'COD', 1, 600000.00, 0.00, 'delivered', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(69, 9, NULL, '2025-07-17 23:25:39', 'COD', 1, 600000.00, 0.00, 'delivered', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(70, 9, NULL, '2025-07-17 23:25:56', 'COD', 1, 2333331.00, 0.00, 'delivered', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(71, 9, NULL, '2025-07-20 21:16:45', 'COD', 1, 399000.00, 0.00, 'delivered', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(72, 9, NULL, '2025-07-20 21:18:07', 'COD', 1, 600000.00, 0.00, 'delivered', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(73, 9, NULL, '2025-07-20 21:34:09', 'COD', 1, 1200000.00, 0.00, 'delivered', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(74, 9, NULL, '2025-07-20 21:34:46', 'COD', 2, 700000.00, 0.00, 'cancelled_by_customer', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(75, 9, NULL, '2025-07-25 10:00:19', 'VNPay', 1, 777777.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(76, 9, NULL, '2025-07-25 10:00:57', 'ZaloPay', 1, 777777.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(77, 9, NULL, '2025-07-25 10:27:47', 'ZaloPay', 2, 1377777.00, 0.00, 'processing', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(78, 9, NULL, '2025-07-25 10:28:08', 'COD', 3, 1477777.00, 0.00, 'shipping', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(79, 9, NULL, '2025-07-25 10:41:43', 'COD', 1, 1200000.00, 0.00, 'delivered', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(80, 9, NULL, '2025-07-25 10:43:43', 'COD', 1, 600000.00, 0.00, 'failed_delivery', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(81, 9, NULL, '2025-07-29 21:30:35', 'ZaloPay', 1, 100000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(82, 9, NULL, '2025-07-29 21:33:35', 'ZaloPay', 1, 100000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(83, 9, NULL, '2025-07-29 21:36:39', 'ZaloPay', 2, 700000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(84, 9, NULL, '2025-07-29 21:37:34', 'ZaloPay', 2, 700000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(85, 9, NULL, '2025-07-29 21:37:36', 'ZaloPay', 2, 700000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(86, 9, NULL, '2025-07-29 21:38:40', 'VNPay', 2, 1300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(87, 9, NULL, '2025-07-29 21:40:52', 'ZaloPay', 2, 1300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(88, 9, NULL, '2025-07-29 21:41:04', 'ZaloPay', 2, 1300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(89, 9, NULL, '2025-07-29 21:41:05', 'ZaloPay', 2, 1300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(90, 9, NULL, '2025-07-29 21:42:33', 'ZaloPay', 2, 1300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(91, 9, NULL, '2025-07-29 21:42:34', 'ZaloPay', 2, 1300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(92, 9, NULL, '2025-07-29 21:42:52', 'ZaloPay', 2, 1300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(93, 9, NULL, '2025-07-29 21:42:53', 'ZaloPay', 2, 1300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(94, 9, NULL, '2025-07-29 21:44:00', 'ZaloPay', 2, 1300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(95, 9, NULL, '2025-07-29 21:44:01', 'ZaloPay', 2, 1300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(96, 9, NULL, '2025-07-29 21:44:31', 'ZaloPay', 2, 1300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(97, 9, NULL, '2025-07-29 21:44:35', 'ZaloPay', 2, 1300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(98, 9, NULL, '2025-07-29 21:44:36', 'ZaloPay', 2, 1300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(99, 9, NULL, '2025-07-29 21:44:51', 'ZaloPay', 2, 1300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(100, 9, NULL, '2025-07-29 21:44:59', 'ZaloPay', 2, 1300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(101, 9, NULL, '2025-07-29 21:46:11', 'ZaloPay', 2, 1300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(102, 9, NULL, '2025-07-29 21:46:13', 'ZaloPay', 2, 1300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(103, 9, NULL, '2025-07-29 21:47:01', 'ZaloPay', 2, 1300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(104, 9, NULL, '2025-07-29 21:49:11', 'ZaloPay', 2, 1300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(105, 9, NULL, '2025-07-29 21:49:12', 'ZaloPay', 2, 1300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(106, 9, NULL, '2025-07-29 21:49:44', 'ZaloPay', 2, 1300000.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(107, NULL, NULL, '2025-07-29 21:51:44', 'ZaloPay', 2, 0.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(108, NULL, NULL, '2025-07-29 21:51:49', 'ZaloPay', 2, 0.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(109, NULL, NULL, '2025-07-29 21:52:26', 'COD', 2, 0.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(110, NULL, NULL, '2025-07-29 21:52:38', 'ZaloPay', 1, 0.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(111, NULL, NULL, '2025-07-29 21:56:59', 'ZaloPay', 1, 0.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(112, NULL, NULL, '2025-07-29 21:57:00', 'ZaloPay', 1, 0.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(113, NULL, NULL, '2025-07-29 21:57:31', 'ZaloPay', 1, 0.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(114, NULL, NULL, '2025-07-29 21:58:55', 'COD', 1, 0.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(115, NULL, NULL, '2025-07-29 21:59:12', 'ZaloPay', 1, 0.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(116, NULL, NULL, '2025-07-29 22:00:08', 'ZaloPay', 1, 0.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(117, NULL, NULL, '2025-08-01 22:01:24', 'COD', 2, 0.00, 0.00, 'confirmed', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(147, 9, NULL, '2025-08-10 22:41:01', 'COD', 1, 1800000.00, 0.00, 'cho_xu_ly', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(148, 9, NULL, '2025-08-10 22:43:24', 'ZaloPay', 1, 600000.00, 0.00, 'cho_xu_ly', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(149, 9, NULL, '2025-08-10 22:43:25', 'ZaloPay', 1, 600000.00, 0.00, 'cho_xu_ly', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(150, 9, NULL, '2025-08-10 22:43:54', 'ZaloPay', 1, 600000.00, 0.00, 'cho_xu_ly', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(151, 9, NULL, '2025-08-10 22:55:15', 'ZaloPay', 1, 600000.00, 0.00, 'cho_xu_ly', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(152, 9, NULL, '2025-08-10 22:55:16', 'ZaloPay', 1, 600000.00, 0.00, 'cho_xu_ly', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(153, 9, NULL, '2025-08-10 22:55:28', 'ZaloPay', 1, 600000.00, 0.00, 'cho_xu_ly', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(154, 9, NULL, '2025-08-10 22:55:29', 'ZaloPay', 1, 600000.00, 0.00, 'cho_xu_ly', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(155, 9, NULL, '2025-08-10 22:59:20', 'ZaloPay', 1, 600000.00, 0.00, 'huy_boi_khach', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(156, NULL, NULL, '2025-08-10 23:00:09', 'VNPay', 1, 399000.00, 0.00, 'da_xac_nhan', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(157, 9, NULL, '2025-08-10 23:00:36', 'ZaloPay', 1, 600000.00, 0.00, 'da_giao', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(158, 9, NULL, '2025-08-15 15:13:54', 'COD', 2, 700000.00, 0.00, 'da_giao', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(159, 9, NULL, '2025-08-15 18:36:24', 'COD', 1, 600000.00, 0.00, 'huy_boi_khach', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(160, 9, NULL, '2025-08-15 21:30:09', 'COD', 1, 600000.00, 0.00, 'cho_xu_ly', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(161, 9, NULL, '2025-08-15 21:30:34', 'ZaloPay', 1, 600000.00, 0.00, 'da_giao', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(162, 7, NULL, '2025-08-15 23:38:53', 'COD', 1, 1200000.00, 0.00, 'da_giao', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(163, 7, NULL, '2025-08-15 23:51:54', 'COD', 1, 600000.00, 0.00, 'da_giao', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(164, 7, NULL, '2025-08-15 23:55:33', 'COD', 1, 600000.00, 0.00, 'da_giao', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(165, 7, NULL, '2025-08-16 09:19:32', 'COD', 1, 600000.00, 0.00, 'huy_boi_admin', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(166, 7, NULL, '2025-08-16 09:38:07', 'COD', 1, 600000.00, 0.00, 'da_giao', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(167, 7, NULL, '2025-08-16 10:12:33', 'COD', 1, 1200000.00, 0.00, 'da_giao', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL),
(168, 7, NULL, '2025-08-16 10:19:48', 'ZaloPay', 1, 600000.00, 0.00, 'cho_xu_ly', NULL, 'cho_xu_ly', NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `giohang`
--

CREATE TABLE `giohang` (
  `id_GioHang` int(11) NOT NULL,
  `id_NguoiDung` int(11) NOT NULL,
  `id_SanPham` int(11) NOT NULL,
  `soLuong` int(11) NOT NULL DEFAULT 1,
  `giaTaiThoiDiem` decimal(10,2) NOT NULL COMMENT 'Giá sản phẩm tại thời điểm thêm vào giỏ',
  `ngayThem` datetime NOT NULL DEFAULT current_timestamp(),
  `ngayCapNhat` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `giohang`
--

INSERT INTO `giohang` (`id_GioHang`, `id_NguoiDung`, `id_SanPham`, `soLuong`, `giaTaiThoiDiem`, `ngayThem`, `ngayCapNhat`) VALUES
(5, 1, 17, 1, 600000.00, '2025-07-02 14:45:41', '2025-07-02 14:45:41'),
(24, 5, 17, 1, 600000.00, '2025-07-09 13:40:07', '2025-07-09 13:47:47'),
(25, 5, 16, 2, 250000.00, '2025-07-09 13:48:00', '2025-07-09 13:49:29'),
(65, 9, 17, 1, 600000.00, '2025-08-15 21:30:25', '2025-08-15 21:30:25'),
(66, 9, 14, 1, 100000.00, '2025-08-15 21:44:47', '2025-08-15 21:44:47'),
(72, 7, 17, 1, 600000.00, '2025-08-16 10:19:35', '2025-08-16 10:19:35');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nguoidung`
--

CREATE TABLE `nguoidung` (
  `id_NguoiDung` int(11) NOT NULL,
  `tenDangNhap` varchar(255) DEFAULT NULL,
  `matKhau` varchar(255) DEFAULT NULL,
  `ten` varchar(255) DEFAULT NULL,
  `diaChi` varchar(255) DEFAULT NULL,
  `soDienThoai` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `googleId` varchar(255) DEFAULT NULL COMMENT 'Google OAuth ID for authentication',
  `vaiTro` varchar(50) DEFAULT NULL,
  `trangThai` varchar(50) DEFAULT NULL,
  `ngayTao` datetime DEFAULT current_timestamp(),
  `resetPasswordToken` varchar(255) DEFAULT NULL,
  `resetPasswordExpiry` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `nguoidung`
--

INSERT INTO `nguoidung` (`id_NguoiDung`, `tenDangNhap`, `matKhau`, `ten`, `diaChi`, `soDienThoai`, `email`, `googleId`, `vaiTro`, `trangThai`, `ngayTao`, `resetPasswordToken`, `resetPasswordExpiry`) VALUES
(1, NULL, '$2b$10$0h15rbizNKsJIlSUH5z1pu..IJsNKFSEJ.VdCAeKdnMWEE3bBUwiG', 'Test User', NULL, '0123456789', 'test@example.com', NULL, 'admin', 'HOAT_DONG', '2025-07-02 18:31:45', NULL, NULL),
(2, NULL, 'e10adc3949ba59abbe56e057f20f883e', 'Admin User', NULL, '0987654321', 'admin@example.com', NULL, 'admin', 'HOAT_DONG', '2025-07-02 18:31:45', NULL, NULL),
(3, NULL, '$2b$10$hUokRn.wwWFBx90sE/PUOu3PybWzqqW10O/13MD379m8T0ABschlW', 'New User', NULL, '0987654321', 'newuser@example.com', NULL, 'admin', 'HOAT_DONG', '2025-07-02 11:31:54', NULL, NULL),
(4, NULL, '$2b$10$.fpjm2bDvVlpTBBWE0Yrr.P3XtMQ0QMs.ftLoIIlZ5d3I6jH5QZda', 'New Test User', NULL, '0111222333', 'newuser@test.com', NULL, 'admin', 'HOAT_DONG', '2025-07-02 11:32:40', NULL, NULL),
(5, NULL, '$2b$10$JoWIFe/W1hxZwuFaGtanrOEWW7GOoliJbwJ3xnw0uhdlQJUl8DO.i', 'phamvanviet ', NULL, '0336636315', 'phamvanviet2004zd@gmail.com', NULL, 'customer', 'HOAT_DONG', '2025-07-02 16:26:41', NULL, NULL),
(7, NULL, '$2b$10$lZIYCsXok.Q3m29KheDQEOq9EuKOc1OQhilmFDNGKeRkcVdciI/f.', 'phamvanviet ', NULL, '0336636315', 'phamvanviet2004z@gmail.com', NULL, 'QUAN_LY', 'HOAT_DONG', '2025-07-09 13:54:16', NULL, NULL),
(9, NULL, '$2b$10$livTh1ItpXh5DCJbwlTRGu7Dr7DtSwp2SAeRWMhLnkp9QNThTDA1e', 'phamvanviet ', 'dddddddddddddd', '11222112211', 'phamvanvietz2004z@gmail.com', NULL, 'QUAN_LY', 'DA_KHOA', '2025-07-16 14:23:26', NULL, NULL),
(16, 'admin', '4297f44b13955235245b2497399d7a93', 'Administrator', 'Hà Nội, Việt Nam', '0123456789', 'admin@hoashop.local', NULL, 'NHAN_VIEN', 'HOAT_DONG', '2025-07-30 00:31:50', NULL, NULL),
(17, 'superadmin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Administrator', 'TP.HCM, Việt Nam', '0987654321', 'superadmin@hoashop.local', NULL, 'QUAN_LY', 'HOAT_DONG', '2025-07-30 00:31:50', NULL, NULL),
(18, 'staff', '$2b$10$AYKnIFYkjuvUruobQLgUn.yIn6qQff6JnydiqsT0Pm2GtNImGrtaG', 'Nhân Viên HoaShop', 'Hà Nội, Việt Nam', '0987654321', 'staff@hoashop.local', NULL, 'QUAN_LY', 'HOAT_DONG', '2025-07-30 00:44:56', NULL, NULL),
(19, NULL, NULL, 'Pham Van Viet (FPL HCM)', NULL, NULL, 'vietpvps37929@fpt.edu.vn', NULL, 'KHACH_HANG', 'HOAT_DONG', '2025-08-05 00:09:05', NULL, NULL),
(20, NULL, NULL, '01 premikey', NULL, NULL, 'premikey02@gmail.com', NULL, 'KHACH_HANG', 'HOAT_DONG', '2025-08-08 11:37:34', NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sanpham`
--

CREATE TABLE `sanpham` (
  `id_SanPham` int(11) NOT NULL,
  `maSKU` varchar(100) DEFAULT NULL,
  `tenSp` varchar(255) DEFAULT NULL,
  `tenSp_normalized` varchar(255) DEFAULT NULL,
  `moTa` text DEFAULT NULL,
  `hinhAnh` varchar(255) DEFAULT NULL,
  `thuongHieu` varchar(255) DEFAULT NULL,
  `gia` decimal(10,2) DEFAULT NULL,
  `giaKhuyenMai` decimal(10,2) DEFAULT NULL,
  `id_DanhMucChiTiet` int(11) DEFAULT NULL,
  `trangThai` varchar(20) DEFAULT 'active',
  `soLuong` int(11) NOT NULL DEFAULT 0,
  `seoTitle` varchar(255) DEFAULT NULL COMMENT 'SEO Title for search engines',
  `seoDescription` text DEFAULT NULL COMMENT 'SEO Meta Description for search engines',
  `seoKeywords` text DEFAULT NULL COMMENT 'SEO Keywords separated by commas',
  `slug` varchar(255) DEFAULT NULL COMMENT 'URL-friendly slug for product page',
  `soLuongTon` int(11) NOT NULL DEFAULT 0 COMMENT 'Số lượng tồn kho',
  `soLuongToiThieu` int(11) NOT NULL DEFAULT 5 COMMENT 'Số lượng tồn kho tối thiểu để cảnh báo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `sanpham`
--

INSERT INTO `sanpham` (`id_SanPham`, `maSKU`, `tenSp`, `tenSp_normalized`, `moTa`, `hinhAnh`, `thuongHieu`, `gia`, `giaKhuyenMai`, `id_DanhMucChiTiet`, `trangThai`, `soLuong`, `seoTitle`, `seoDescription`, `seoKeywords`, `slug`, `soLuongTon`, `soLuongToiThieu`) VALUES
(1, NULL, 'Hoa Hồng Rực rỡ 504', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(2, NULL, 'Hoa Hồng Ngọt ngào 915', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(3, NULL, 'Hoa Hồng Tinh khôi 625', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(4, NULL, 'Hoa Hồng Ấm áp 717', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(5, NULL, 'Hoa Hồng Quý phái 447', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(6, NULL, 'Hoa Hồng Đẹp 121', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(7, NULL, 'Hoa Hồng Đẹp 638', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(8, NULL, 'Hoa Hồng Nhẹ nhàng 227', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(9, NULL, 'Hoa Hồng Mộng mơ 524', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(10, 'SKU001', 'Bó hoa hồng đỏ cao cấp', NULL, 'Bó hoa hồng đỏ tươi 12 bông, ý nghĩa tình yêu hoàn hảo', '/images/products/daisy.jpg', 'FlowerCorner', 450000.00, 399000.00, 1, 'active', 0, 'Bó Hoa Hồng Đỏ Cao Cấp - Tặng Người Yêu | HoaShop', 'Bó hoa hồng đỏ tươi 12 bông biểu tượng tình yêu. Chất lượng cao, giao hàng nhanh, giá tốt. Đặt ngay!', 'hoa hồng đỏ, hoa tươi, quà tặng, hoa sinh nhật, hoa valentine', 'bo-hoa-hong-do-cao-cap', 50, 5),
(11, 'SKU002', 'Lẵng hoa cúc vàng tươi', NULL, 'Lẵng hoa cúc vàng tươi mang lại niềm vui và may mắn', '/images/products/event.jpg', 'FlowerCorner', 350000.00, NULL, 2, 'active', 0, 'Lẵng Hoa Cúc Vàng Tươi - Mang Lại May Mắn | HoaShop', 'Lẵng hoa cúc vàng tươi đẹp, mang ý nghĩa may mắn. Giao hàng tận nơi, chất lượng đảm bảo.', 'hoa cúc vàng, lẵng hoa, hoa tươi, may mắn, khai trương', 'lang-hoa-cuc-vang-tuoi', 30, 3),
(12, 'SKU003', 'Giỏ hoa khai trương', NULL, 'Giỏ hoa chúc mừng khai trương phát đạt, thịnh vượng', '/images/products/product-1750594227200-929108794.webp', 'FlowerCorner', 800000.00, 750000.00, 3, 'active', 0, 'Giỏ Hoa Khai Trương - Chúc Mừng Thành Công | HoaShop', 'Giỏ hoa khai trương đẹp, ý nghĩa phát đạt thịnh vượng. Thiết kế hiện đại, giao hàng nhanh.', 'giỏ hoa khai trương, hoa chúc mừng, khai trương, phát đạt', 'gio-hoa-khai-truong', 15, 2),
(13, 'SKU004', 'Bó hoa tulip đỏ nhập khẩu', NULL, 'Bó hoa tulip đỏ nhập khẩu Hà Lan cao cấp', '/images/products/rose.jpg', 'Holland Flowers', 650000.00, NULL, 1, 'active', 0, 'Bó Hoa Tulip Đỏ Nhập Khẩu Hà Lan | HoaShop', 'Hoa tulip đỏ nhập khẩu Hà Lan chính hãng. Chất lượng cao cấp, tươi lâu, giao hàng nhanh.', 'hoa tulip đỏ, nhập khẩu, hà lan, hoa cao cấp, quà tặng', 'bo-hoa-tulip-do-nhap-khau', 25, 5),
(14, 'SKU005', 'Hoa baby trắng thơm', 'hoa baby trang thom', 'Hoa baby trắng thơm ngát, trang trí đẹp', '/images/products/product-1750598743293-184511824.webp', 'VietFlower', 120000.00, 100000.00, 2, 'active', 0, 'Hoa Baby Trắng Thơm - Trang Trí Đẹp | HoaShop', 'Hoa baby trắng thơm ngát, trang trí đẹp cho không gian. Giá ưu đãi, chất lượng tốt.', 'hoa baby trắng, hoa trang trí, thơm ngát, giá rẻ', 'hoa-baby-trang-thom', 6, 10),
(15, 'SKU006', 'Chậu lan hồ điệp tím', NULL, 'Chậu lan hồ điệp tím cao cấp, sang trọng', '/images/products/product-1750598735349-755866346.webp', 'OrchidVN', 1200000.00, NULL, 4, 'active', 0, 'Chậu Lan Hồ Điệp Tím Cao Cấp - Sang Trọng | HoaShop', 'Lan hồ điệp tím cao cấp, sang trọng. Chậu đẹp, hoa to, màu sắc đẹp. Tặng kèm hướng dẫn chăm sóc.', 'lan hồ điệp tím, lan cao cấp, chậu hoa, sang trọng', 'chau-lan-ho-diep-tim', 8, 2),
(16, 'SKU007', 'Hoa hướng dương mini', 'hoa huong duong mini', 'Bó hoa hướng dương mini tươi tắn, năng động', '/images/products/product-1750598726921-701225680.webp', 'SunFlower', 280000.00, 250000.00, 1, 'active', 0, 'Hoa Hướng Dương Mini - Tươi Tắn Năng Động | HoaShop', 'Bó hoa hướng dương mini tươi tắn, mang năng lượng tích cực. Màu vàng rực rỡ, giá ưu đãi.', 'hoa hướng dương mini, tươi tắn, năng động, màu vàng', 'hoa-huong-duong-mini', 40, 8),
(17, 'SKU537661886', 'hoa cuc', NULL, 'cuc hoa aiuuu diep ', '/images/products/product-1750598553683-32833951.webp', 'cucuc', 800000.00, 600000.00, 1, 'active', 0, 'hoa cuc - Chất Lượng Cao | HoaShop', 'hoa cuc dep sieu nhan', 'hoa cuc ', 'hoa-cuc', 1000, 5),
(18, 'SKU438299495', 'hoa huệ ', 'hoa hue', 'hoa huệ hoa huệ hoa huệ hoa huệ hoa huệ ', '/images/products/product-1750605448325-580859059.webp', 'hoa huệ ', 888888.00, 777777.00, 3, 'active', 0, 'h - Chất Lượng Cao | HoaShop', NULL, NULL, 'hoa-hue', 4, 5),
(19, 'SKU030059865', 'hoa1.1', 'hoa', 'hoa1.1hoa1.1hoa1.1', '/images/products/product-1752606030051-233797485.jpg', 'hoa1.1', 3000000.00, NULL, 8, 'active', 0, NULL, NULL, NULL, NULL, 12, 5),
(20, NULL, 'Hoa Hồng Rạng ngời 49', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(21, NULL, 'Hoa Sinh Nhật Tinh khôi 309', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(22, NULL, 'Hoa Sinh Nhật Đẹp 620', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(23, NULL, 'Hoa Sinh Nhật Ấm áp 171', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(24, NULL, 'Hoa Sinh Nhật Đẹp 193', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(25, NULL, 'Hoa Sinh Nhật Thủy chung 829', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(26, NULL, 'Hoa Sinh Nhật Hạnh phúc 162', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(27, NULL, 'Hoa Sinh Nhật Yêu thương 349', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(28, NULL, 'Hoa Sinh Nhật Thủy chung 330', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(29, NULL, 'Hoa Sinh Nhật Đẹp 375', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(30, NULL, 'Hoa Sinh Nhật Đẹp 320', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(31, NULL, 'Hoa Sinh Nhật Rực rỡ 773', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(32, NULL, 'Hoa Sinh Nhật Nồng nàn 700', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(33, NULL, 'Hoa Sinh Nhật Thủy chung 910', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(34, NULL, 'Hoa Sinh Nhật Tinh tế 411', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(35, NULL, 'Hoa Sinh Nhật Ấm áp 714', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(36, NULL, 'Hoa Sinh Nhật Nhẹ nhàng 486', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(37, NULL, 'Hoa Sinh Nhật Thủy chung 48', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(38, NULL, 'Hoa Sinh Nhật Nồng nàn 255', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(39, NULL, 'Hoa Sinh Nhật Sắc màu 496', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(40, NULL, 'Hoa Sinh Nhật Ngọt ngào 289', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(41, NULL, 'Hoa Tình Yêu Mộng mơ 368', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(42, NULL, 'Hoa Tình Yêu Ấm áp 20', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(43, NULL, 'Hoa Tình Yêu Tinh khôi 295', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(44, NULL, 'Hoa Tình Yêu Ngọt ngào 665', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(45, NULL, 'Hoa Tình Yêu Rực sáng 304', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(46, NULL, 'Hoa Tình Yêu Rực rỡ 639', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(47, NULL, 'Hoa Tình Yêu Yêu thương 940', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(48, NULL, 'Hoa Tình Yêu Sắc màu 53', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(49, NULL, 'Hoa Tình Yêu Ngọt ngào 568', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(50, NULL, 'Hoa Tình Yêu Rạng ngời 442', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(51, NULL, 'Hoa Hồng Rực rỡ 504', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(52, NULL, 'Hoa Hồng Ngọt ngào 915', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(53, NULL, 'Hoa Hồng Tinh khôi 625', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(54, NULL, 'Hoa Hồng Ấm áp 717', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(55, NULL, 'Hoa Hồng Quý phái 447', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(56, NULL, 'Hoa Hồng Đẹp 121', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(57, NULL, 'Hoa Hồng Đẹp 638', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(58, NULL, 'Hoa Hồng Nhẹ nhàng 227', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(59, NULL, 'Hoa Hồng Mộng mơ 524', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(60, NULL, 'Hoa Hồng Rực sáng 81', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(61, NULL, 'Hoa Hồng Nồng nàn 40', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(62, NULL, 'Hoa Hồng Thủy chung 60', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(63, NULL, 'Hoa Hồng Sang trọng 744', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(64, NULL, 'Hoa Hồng Sang trọng 42', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(65, NULL, 'Hoa Hồng Hạnh phúc 661', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(66, NULL, 'Hoa Hồng Nồng nàn 671', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(67, NULL, 'Hoa Hồng Tinh khôi 935', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(68, NULL, 'Hoa Hồng Rực sáng 272', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(69, NULL, 'Hoa Hồng Sang trọng 618', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(70, NULL, 'Hoa Hồng Rạng ngời 49', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(71, NULL, 'Hoa Sinh Nhật Tinh khôi 309', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(72, NULL, 'Hoa Sinh Nhật Đẹp 620', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(73, NULL, 'Hoa Sinh Nhật Ấm áp 171', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(74, NULL, 'Hoa Sinh Nhật Đẹp 193', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(75, NULL, 'Hoa Sinh Nhật Thủy chung 829', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(76, NULL, 'Hoa Sinh Nhật Hạnh phúc 162', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(77, NULL, 'Hoa Sinh Nhật Yêu thương 349', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(78, NULL, 'Hoa Sinh Nhật Thủy chung 330', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(79, NULL, 'Hoa Sinh Nhật Đẹp 375', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(80, NULL, 'Hoa Sinh Nhật Đẹp 320', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(81, NULL, 'Hoa Sinh Nhật Rực rỡ 773', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(82, NULL, 'Hoa Sinh Nhật Nồng nàn 700', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(83, NULL, 'Hoa Sinh Nhật Thủy chung 910', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(84, NULL, 'Hoa Sinh Nhật Tinh tế 411', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(85, NULL, 'Hoa Sinh Nhật Ấm áp 714', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(86, NULL, 'Hoa Sinh Nhật Nhẹ nhàng 486', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(87, NULL, 'Hoa Sinh Nhật Thủy chung 48', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(88, NULL, 'Hoa Sinh Nhật Nồng nàn 255', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(89, NULL, 'Hoa Sinh Nhật Sắc màu 496', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(90, NULL, 'Hoa Sinh Nhật Ngọt ngào 289', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(91, NULL, 'Hoa Tình Yêu Mộng mơ 368', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(92, NULL, 'Hoa Tình Yêu Ấm áp 20', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(93, NULL, 'Hoa Tình Yêu Tinh khôi 295', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(94, NULL, 'Hoa Tình Yêu Ngọt ngào 665', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(95, NULL, 'Hoa Tình Yêu Rực sáng 304', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(96, NULL, 'Hoa Tình Yêu Rực rỡ 639', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(97, NULL, 'Hoa Tình Yêu Yêu thương 940', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(98, NULL, 'Hoa Tình Yêu Sắc màu 53', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(99, NULL, 'Hoa Tình Yêu Ngọt ngào 568', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(100, NULL, 'Hoa Tình Yêu Rạng ngời 442', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(101, NULL, 'Hoa Tình Yêu Rạng ngời 3', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(102, NULL, 'Hoa Tình Yêu Dịu dàng 917', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(103, NULL, 'Hoa Tình Yêu Nhẹ nhàng 170', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(104, NULL, 'Hoa Tình Yêu Mộng mơ 60', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(105, NULL, 'Hoa Tình Yêu Nhẹ nhàng 692', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(106, NULL, 'Hoa Tình Yêu Dịu dàng 970', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(107, NULL, 'Hoa Tình Yêu Sắc màu 42', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(108, NULL, 'Hoa Tình Yêu Ngọt ngào 835', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(109, NULL, 'Hoa Tình Yêu Tươi 625', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(110, NULL, 'Hoa Tình Yêu Thanh tao 310', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(111, NULL, 'Hoa Khai Trương Rực rỡ 271', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(112, NULL, 'Hoa Khai Trương Quý phái 558', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(113, NULL, 'Hoa Khai Trương Ngọt ngào 421', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(114, NULL, 'Hoa Khai Trương Tinh tế 706', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(115, NULL, 'Hoa Khai Trương Sắc màu 745', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(116, NULL, 'Hoa Khai Trương Đẹp 558', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(117, NULL, 'Hoa Khai Trương Rực sáng 316', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(118, NULL, 'Hoa Khai Trương Yêu thương 895', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(119, NULL, 'Hoa Khai Trương Dịu dàng 962', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(120, NULL, 'Hoa Khai Trương Ngọt ngào 469', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(121, NULL, 'Hoa Khai Trương Rực sáng 60', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(122, NULL, 'Hoa Khai Trương Thanh tao 89', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(123, NULL, 'Hoa Khai Trương Sang trọng 230', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(124, NULL, 'Hoa Khai Trương Tinh tế 924', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(125, NULL, 'Hoa Khai Trương Sắc màu 310', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(126, NULL, 'Hoa Khai Trương Rực sáng 192', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(127, NULL, 'Hoa Khai Trương Ngọt ngào 293', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(128, NULL, 'Hoa Khai Trương Rực sáng 387', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(129, NULL, 'Hoa Khai Trương Yêu thương 884', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(130, NULL, 'Hoa Khai Trương Ngọt ngào 173', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', 0, NULL, NULL, NULL, NULL, 0, 5),
(133, 'SKU108473427', 'hoa huệ ', 'hoa hue', 'qưewdw', '/images/products/product-1754065108447-127896826.png', 'hoa huệ ', 99999.00, 11111111.00, 2, 'active', 0, NULL, NULL, NULL, NULL, 12, 5);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `voucher`
--

CREATE TABLE `voucher` (
  `id_voucher` int(11) NOT NULL,
  `maVoucher` varchar(100) DEFAULT NULL,
  `giaTriGiam` decimal(10,2) DEFAULT NULL,
  `dieuKienApDung` text DEFAULT NULL,
  `ngayBatDau` datetime DEFAULT NULL,
  `ngayHetHan` datetime DEFAULT NULL,
  `loai` enum('fixed','percentage') DEFAULT 'fixed',
  `giaTriToiThieu` int(11) DEFAULT NULL,
  `giaTriGiamToiDa` int(11) DEFAULT NULL,
  `soLuong` int(11) DEFAULT NULL,
  `soLanNguoiDungDung` int(11) DEFAULT NULL,
  `moTa` text DEFAULT NULL,
  `trangThai` enum('dang_hoat_dong','het_han') DEFAULT 'dang_hoat_dong',
  `soLuongDaDung` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `voucher`
--

INSERT INTO `voucher` (`id_voucher`, `maVoucher`, `giaTriGiam`, `dieuKienApDung`, `ngayBatDau`, `ngayHetHan`, `loai`, `giaTriToiThieu`, `giaTriGiamToiDa`, `soLuong`, `soLanNguoiDungDung`, `moTa`, `trangThai`, `soLuongDaDung`) VALUES
(1, 'WELCOME50', 50000.00, '{\"minOrderTotal\": 200000}', '2023-12-31 07:00:00', '2026-12-31 07:00:00', 'fixed', NULL, NULL, 12, NULL, 'ok la', 'dang_hoat_dong', 0),
(2, 'SAVE100', 100000.00, '{\"minOrderTotal\": 500000}', '2024-01-01 00:00:00', '2024-12-31 23:59:59', 'fixed', NULL, NULL, NULL, NULL, NULL, 'dang_hoat_dong', 0),
(3, 'FLOWER20', 20000.00, '{\"minOrderTotal\": 100000}', '2024-01-01 00:00:00', '2024-12-31 23:59:59', 'fixed', NULL, NULL, NULL, NULL, NULL, 'dang_hoat_dong', 0),
(4, 'SPRING30', 30000.00, '{\"minOrderTotal\": 150000}', '2024-01-01 00:00:00', '2024-12-31 23:59:59', 'fixed', NULL, NULL, NULL, NULL, NULL, 'dang_hoat_dong', 0),
(5, 'SUMMER75', 75000.00, '{\"minOrderTotal\": 300000}', '2024-01-01 00:00:00', '2024-12-31 23:59:59', 'fixed', NULL, NULL, NULL, NULL, NULL, 'dang_hoat_dong', 0),
(6, 'FREE25', 25000.00, '', '2023-12-31 07:00:00', '2026-11-30 07:00:00', 'fixed', NULL, NULL, 1, NULL, '1', 'het_han', 0),
(7, 'VIP150', 150000.00, '{\"minOrderTotal\": 1000000}', '2024-01-01 00:00:00', '2024-12-31 23:59:59', 'fixed', NULL, NULL, NULL, NULL, NULL, 'dang_hoat_dong', 0),
(8, 'HAPPY40', 40000.00, '{\"minOrderTotal\": 200000}', '2024-01-01 00:00:00', '2024-12-31 23:59:59', 'fixed', NULL, NULL, NULL, NULL, NULL, 'dang_hoat_dong', 0),
(9, 'APITEST1752771763535', 25000.00, 'Test voucher from API', '2024-01-01 07:00:00', '2024-12-31 07:00:00', 'fixed', NULL, NULL, NULL, NULL, NULL, 'dang_hoat_dong', 0),
(10, 'APITEST1752771809997', 25000.00, 'Test voucher from API', '2024-01-01 07:00:00', '2024-12-31 07:00:00', 'fixed', NULL, NULL, 12, NULL, NULL, 'dang_hoat_dong', 0),
(12, 'MASIUUUDAI', 20000.00, 'MASIUUUDAI', '2025-07-22 07:00:00', '2027-11-22 07:00:00', 'fixed', NULL, NULL, 19, NULL, 'dd', 'dang_hoat_dong', 0),
(13, 'MAXHOA20', 20000.00, 'MAXHOA20MAXHOA20', '2025-07-22 07:00:00', '2028-07-22 07:00:00', 'fixed', NULL, NULL, 20, NULL, 'MAXHOMAXHOA20A20', 'dang_hoat_dong', 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `yeuthich`
--

CREATE TABLE `yeuthich` (
  `id_YeuThich` int(11) NOT NULL COMMENT 'ID yêu thích',
  `id_NguoiDung` int(11) NOT NULL COMMENT 'ID người dùng',
  `id_SanPham` int(11) NOT NULL COMMENT 'ID sản phẩm yêu thích',
  `ngayThem` datetime DEFAULT current_timestamp() COMMENT 'Ngày thêm vào yêu thích'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng danh sách yêu thích';

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  ADD PRIMARY KEY (`id_ChiTietDH`),
  ADD KEY `id_SanPham` (`id_SanPham`),
  ADD KEY `id_DonHang` (`id_DonHang`);

--
-- Chỉ mục cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  ADD PRIMARY KEY (`id_DanhGia`),
  ADD UNIQUE KEY `unique_review_per_order` (`id_SanPham`,`id_DonHang`,`id_NguoiDung`),
  ADD KEY `idx_review_product` (`id_SanPham`),
  ADD KEY `idx_review_order` (`id_DonHang`),
  ADD KEY `idx_review_user` (`id_NguoiDung`),
  ADD KEY `idx_review_status` (`trangThai`),
  ADD KEY `idx_review_images` (`hinhAnh`(100));

--
-- Chỉ mục cho bảng `danhmuc`
--
ALTER TABLE `danhmuc`
  ADD PRIMARY KEY (`id_DanhMuc`);

--
-- Chỉ mục cho bảng `danhmucchitiet`
--
ALTER TABLE `danhmucchitiet`
  ADD PRIMARY KEY (`id_DanhMucChiTiet`),
  ADD KEY `id_DanhMuc` (`id_DanhMuc`);

--
-- Chỉ mục cho bảng `donhang`
--
ALTER TABLE `donhang`
  ADD PRIMARY KEY (`id_DonHang`),
  ADD KEY `id_NguoiDung` (`id_NguoiDung`),
  ADD KEY `id_voucher` (`id_voucher`);

--
-- Chỉ mục cho bảng `giohang`
--
ALTER TABLE `giohang`
  ADD PRIMARY KEY (`id_GioHang`),
  ADD UNIQUE KEY `unique_user_product` (`id_NguoiDung`,`id_SanPham`),
  ADD KEY `idx_cart_user` (`id_NguoiDung`),
  ADD KEY `idx_cart_product` (`id_SanPham`);

--
-- Chỉ mục cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  ADD PRIMARY KEY (`id_NguoiDung`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `googleId` (`googleId`),
  ADD UNIQUE KEY `googleId_2` (`googleId`),
  ADD UNIQUE KEY `googleId_3` (`googleId`),
  ADD UNIQUE KEY `uk_nguoidung_googleId` (`googleId`),
  ADD KEY `idx_nguoidung_googleId` (`googleId`);

--
-- Chỉ mục cho bảng `sanpham`
--
ALTER TABLE `sanpham`
  ADD PRIMARY KEY (`id_SanPham`),
  ADD UNIQUE KEY `maSKU` (`maSKU`),
  ADD KEY `id_DanhMucChiTiet` (`id_DanhMucChiTiet`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_seo_title` (`seoTitle`),
  ADD KEY `idx_stock` (`soLuongTon`),
  ADD KEY `idx_tenSp_normalized` (`tenSp_normalized`);

--
-- Chỉ mục cho bảng `voucher`
--
ALTER TABLE `voucher`
  ADD PRIMARY KEY (`id_voucher`);

--
-- Chỉ mục cho bảng `yeuthich`
--
ALTER TABLE `yeuthich`
  ADD PRIMARY KEY (`id_YeuThich`),
  ADD UNIQUE KEY `unique_user_product` (`id_NguoiDung`,`id_SanPham`),
  ADD KEY `idx_yeuthich_nguoidung` (`id_NguoiDung`),
  ADD KEY `idx_yeuthich_sanpham` (`id_SanPham`),
  ADD KEY `idx_yeuthich_ngay` (`ngayThem`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  MODIFY `id_ChiTietDH` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=228;

--
-- AUTO_INCREMENT cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  MODIFY `id_DanhGia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `danhmuc`
--
ALTER TABLE `danhmuc`
  MODIFY `id_DanhMuc` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `danhmucchitiet`
--
ALTER TABLE `danhmucchitiet`
  MODIFY `id_DanhMucChiTiet` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `donhang`
--
ALTER TABLE `donhang`
  MODIFY `id_DonHang` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=169;

--
-- AUTO_INCREMENT cho bảng `giohang`
--
ALTER TABLE `giohang`
  MODIFY `id_GioHang` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  MODIFY `id_NguoiDung` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT cho bảng `sanpham`
--
ALTER TABLE `sanpham`
  MODIFY `id_SanPham` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=134;

--
-- AUTO_INCREMENT cho bảng `voucher`
--
ALTER TABLE `voucher`
  MODIFY `id_voucher` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `yeuthich`
--
ALTER TABLE `yeuthich`
  MODIFY `id_YeuThich` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID yêu thích', AUTO_INCREMENT=2;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  ADD CONSTRAINT `chitietdonhang_ibfk_1` FOREIGN KEY (`id_SanPham`) REFERENCES `sanpham` (`id_SanPham`) ON DELETE CASCADE,
  ADD CONSTRAINT `chitietdonhang_ibfk_2` FOREIGN KEY (`id_DonHang`) REFERENCES `donhang` (`id_DonHang`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  ADD CONSTRAINT `fk_review_order` FOREIGN KEY (`id_DonHang`) REFERENCES `donhang` (`id_DonHang`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_review_product` FOREIGN KEY (`id_SanPham`) REFERENCES `sanpham` (`id_SanPham`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_review_user` FOREIGN KEY (`id_NguoiDung`) REFERENCES `nguoidung` (`id_NguoiDung`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `danhmucchitiet`
--
ALTER TABLE `danhmucchitiet`
  ADD CONSTRAINT `danhmucchitiet_ibfk_1` FOREIGN KEY (`id_DanhMuc`) REFERENCES `danhmuc` (`id_DanhMuc`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `donhang`
--
ALTER TABLE `donhang`
  ADD CONSTRAINT `donhang_ibfk_1` FOREIGN KEY (`id_NguoiDung`) REFERENCES `nguoidung` (`id_NguoiDung`) ON DELETE CASCADE,
  ADD CONSTRAINT `donhang_ibfk_2` FOREIGN KEY (`id_voucher`) REFERENCES `voucher` (`id_voucher`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `giohang`
--
ALTER TABLE `giohang`
  ADD CONSTRAINT `giohang_ibfk_1` FOREIGN KEY (`id_NguoiDung`) REFERENCES `nguoidung` (`id_NguoiDung`) ON DELETE CASCADE,
  ADD CONSTRAINT `giohang_ibfk_2` FOREIGN KEY (`id_SanPham`) REFERENCES `sanpham` (`id_SanPham`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `sanpham`
--
ALTER TABLE `sanpham`
  ADD CONSTRAINT `sanpham_ibfk_1` FOREIGN KEY (`id_DanhMucChiTiet`) REFERENCES `danhmucchitiet` (`id_DanhMucChiTiet`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
