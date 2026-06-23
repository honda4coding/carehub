import React from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] px-4 py-3 sm:px-6 mt-4 rounded-xl">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] px-4 py-2 text-[12px] font-bold text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] disabled:opacity-50 cursor-pointer"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] px-4 py-2 text-[12px] font-bold text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] disabled:opacity-50 cursor-pointer"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-[13px] font-medium text-[hsl(var(--color-text-muted))]">
            Showing page <span className="font-bold text-[hsl(var(--color-text))]">{currentPage}</span> of{" "}
            <span className="font-bold text-[hsl(var(--color-text))]">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-[hsl(var(--color-text-muted))] ring-1 ring-inset ring-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-bg-soft))] focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <span className="sr-only">Previous</span>
              <LuChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            {/* Simple page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-[13px] font-semibold focus:z-20 focus:outline-offset-0 transition-colors cursor-pointer ${
                  page === currentPage
                    ? "z-10 bg-[hsl(var(--color-primary))] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--color-primary))]"
                    : "text-[hsl(var(--color-text-muted))] ring-1 ring-inset ring-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-bg-soft))]"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-[hsl(var(--color-text-muted))] ring-1 ring-inset ring-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-bg-soft))] focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <span className="sr-only">Next</span>
              <LuChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
