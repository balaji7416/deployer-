import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return "just now";
  if (diffMins === 1) return "1 min ago";
  if (diffHrs < 1) return `${diffMins} mins ago`;
  if (diffHrs === 1) return "1 hr ago";
  if (diffDays < 1) return `${diffHrs} hrs ago`;
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}
