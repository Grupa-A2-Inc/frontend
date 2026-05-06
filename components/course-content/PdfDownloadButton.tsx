"use client";

import { Download } from "lucide-react";

interface PdfDownloadButtonProps {
  url: string;
  title: string;
}

export default function PdfDownloadButton({ url, title }: PdfDownloadButtonProps) {
  return (
    <a 
      href={url} 
      target="_blank"
      rel="noreferrer"
      download
      className="flex items-center gap-3 bg-brand-bg border border-brand-border hover:border-[#6366f1]/50 p-4 rounded-lg transition-colors group w-full md:w-1/2"
    >
      <div className="bg-brand-surface p-2 rounded-md group-hover:bg-[#6366f1]/20 transition-colors">
        <Download size={20} className="text-brand-muted group-hover:text-[#6366f1]" />
      </div>
      <span className="text-sm font-medium text-white">{title}</span>
    </a>
  );
}