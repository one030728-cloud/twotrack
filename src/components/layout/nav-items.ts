import {
  BookUserIcon,
  CalendarDaysIcon,
  ClipboardCheckIcon,
  FileEditIcon,
  FileTextIcon,
  HardHatIcon,
  HashIcon,
  ImagesIcon,
  LayoutDashboardIcon,
  MessageCircleIcon,
  PackageIcon,
  PenLineIcon,
  RefreshCwIcon,
  StoreIcon,
  UsersIcon,
  WifiIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  icon: LucideIcon;
  url?: string;
  children?: { title: string; icon: LucideIcon; url: string }[];
  separator?: boolean;
  hideTitle?: boolean;
};

export const navItems: NavItem[] = [
  { title: "대시보드", icon: LayoutDashboardIcon, url: "/" },
  { title: "캘린더", icon: CalendarDaysIcon, url: "/calendar" },
  { title: "가맹점", icon: StoreIcon, url: "/merchants" },
  { title: "채팅", icon: MessageCircleIcon, url: "/chat" },
  { title: "계약서/서명", icon: FileTextIcon, url: "/contracts" },
  { title: "Slack", icon: HashIcon, url: "/slack" },
  {
    title: "CS",
    icon: ClipboardCheckIcon,
    separator: true,
    children: [
      {
        title: "가맹 접수",
        icon: FileTextIcon,
        url: "/franchise-receipts",
      },
      { title: "변경 관리", icon: RefreshCwIcon, url: "/changes" },
      { title: "우국상 관리", icon: ClipboardCheckIcon, url: "/woo" },
      { title: "인터넷 관리", icon: WifiIcon, url: "/internet" },
    ],
  },
  {
    title: "기술지원",
    icon: WrenchIcon,
    children: [
      { title: "설치 관리", icon: WrenchIcon, url: "/installs" },
      { title: "매장 운영 이력", icon: StoreIcon, url: "/stores" },
      { title: "기사 페이지", icon: HardHatIcon, url: "/installs/mine" },
      { title: "완료사진", icon: ImagesIcon, url: "/installs/photos" },
      {
        title: "외부 기사 관리",
        icon: UsersIcon,
        url: "/external-techs",
      },
      { title: "재고 실사", icon: PackageIcon, url: "/inventory" },
      { title: "전환건", icon: RefreshCwIcon, url: "/transfers" },
      { title: "설계도", icon: FileEditIcon, url: "/blueprints" },
    ],
  },
  {
    title: "관리",
    icon: PenLineIcon,
    separator: true,
    hideTitle: true,
    children: [
      { title: "용지 요청", icon: PenLineIcon, url: "/paper-orders" },
      { title: "직원 관리", icon: BookUserIcon, url: "/admin/users" },
    ],
  },
];
