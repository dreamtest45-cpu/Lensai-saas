import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// نسخ من Link / redirect / usePathname / useRouter تدعم اللغة تلقائياً
// استخدميها بدل next/link و next/navigation بكل الصفحات
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
