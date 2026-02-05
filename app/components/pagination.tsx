import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const createPageLink = (page: number) => `?page=${page}`;

  return (
    <div className="flex justify-center my-10 space-x-2">
      {/* Previous Arrow */}
      <a
        href={createPageLink(currentPage - 1)}
        className={`px-4 py-2 rounded flex items-center justify-center ${
          currentPage === 1 ? 'cursor-not-allowed' : 'bg-white'
        }`}
        aria-disabled={currentPage === 1}
      >
        <FaChevronLeft />
      </a>

      {/* Page Numbers */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <a
          key={page}
          href={createPageLink(page)}
          className={`px-4 py-2 border rounded-3xl ${
            currentPage === page ? 'bg-[#48ac98]  text-white' : 'bg-white'
          }`}
        >
          {page}
        </a>
      ))}

      {/* Next Arrow */}
      <a
        href={createPageLink(currentPage + 1)}
        className={`px-4 py-2 rounded flex items-center justify-center ${
          currentPage === totalPages ? 'cursor-not-allowed' : 'bg-white'
        }`}
        aria-disabled={currentPage === totalPages}
      >
        <FaChevronRight />
      </a>
    </div>
  );
}
