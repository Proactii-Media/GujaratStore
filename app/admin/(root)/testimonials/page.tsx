"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Pencil,
  Trash2,
  Check,
  X,
  ArrowUpDown,
  MessageSquareQuote,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Loader from "@/components/Loader";

interface Testimonial {
  id: string;
  imageId?: string;
  author: string;
  position: string;
  quote: string;
  productType: string;
  rating: number;
  review: string;
  isApproved: boolean;
  createdAt: string;
}

const TestimonialsAdminPage = () => {
  // States
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [filterStatus, setFilterStatus] = useState("all");

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  // Fetch Testimonials
  const fetchTestimonials = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        setLoading(true);
      }

      try {
        const queryParams = new URLSearchParams({
          admin: "true",
          page: currentPage.toString(),
          limit: pageSize.toString(),
          search: searchTerm,
          sortBy,
          sortOrder,
          status: filterStatus,
        });

        const response = await fetch(
          `/api/testimonials?${queryParams}`
        );

        const result = await response.json();

        if (!result.success) {
          throw new Error(
            result.error || "Failed to fetch testimonials"
          );
        }

        setTestimonials(result.data || []);

        setPagination({
          currentPage: result.pagination?.currentPage || 1,
          totalPages: result.pagination?.totalPages || 1,
          totalItems: result.pagination?.total || 0,
          itemsPerPage: result.pagination?.limit || 10,
          hasNext: result.pagination?.hasNext || false,
          hasPrev: result.pagination?.hasPrev || false,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch testimonials";

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [
      currentPage,
      pageSize,
      searchTerm,
      filterStatus,
      sortBy,
      sortOrder,
      toast,
    ]
  );

  // Initial Fetch
  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  // Search Debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== searchTerm) {
        setIsSearching(true);
        setSearchTerm(searchInput);
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, searchTerm]);

  useEffect(() => {
    if (isSearching && !loading) {
      setIsSearching(false);
    }
  }, [isSearching, loading]);

  // Sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }

    setCurrentPage(1);
  };

  // Page Size Change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) {
      return;
    }

    setActionLoading(id);

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.error || "Failed to delete testimonial"
        );
      }

      toast({
        title: "Success",
        description: "Testimonial deleted successfully!",
      });

      fetchTestimonials();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to delete testimonial";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Approve / Reject
  const handleApprove = async (
    id: string,
    currentStatus: boolean
  ) => {
    setActionLoading(id);

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isApproved: !currentStatus,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.error || "Failed to update testimonial"
        );
      }

      toast({
        title: "Success",
        description: `Testimonial ${
          !currentStatus ? "approved" : "rejected"
        } successfully!`,
      });

      fetchTestimonials(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to update testimonial";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Page Numbers
  const getPageNumbers = () => {
    const { currentPage, totalPages } = pagination;

    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(
        totalPages,
        start + maxVisible - 1
      );

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  if (loading && testimonials.length === 0) {
    return <Loader />;
  }

  return (
    <div className="p-2 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageSquareQuote className="text-brand h-8 w-8" />
        <h1 className="h1">Testimonials</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">

          {/* Top Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search testimonials..."
                value={searchInput}
                onChange={(e) =>
                  setSearchInput(e.target.value)
                }
                className="pr-10"
              />

        

              {(isSearching || loading) && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand"></div>
              )}
            </div>

            <Link href="/admin/testimonials/add">
              <Button className="bg-brand hover:bg-brand/90 text-white">
                Add Testimonial
              </Button>
            </Link>
          </div>

          {/* Table */}
          <div className="border rounded-lg relative">

            {isSearching && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand"></div>

                  <span className="text-sm text-gray-600">
                    Searching...
                  </span>
                </div>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>

                  <TableHead className="bg-gray-50">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("author")}
                      className="font-medium"
                    >
                      Author
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>

                  <TableHead className="bg-gray-50">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("position")}
                      className="font-medium"
                    >
                      Position
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>

                  <TableHead className="bg-gray-50">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("productType")}
                      className="font-medium"
                    >
                      Product Type
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>

                  <TableHead className="bg-gray-50 text-center">
                    Rating
                  </TableHead>

              

                  <TableHead className="bg-gray-50">
                    Status
                  </TableHead>

                  <TableHead className="bg-gray-50">
                    Actions
                  </TableHead>

                </TableRow>
              </TableHeader>

              <TableBody>
                {testimonials.length ? (
                  testimonials.map((testimonial) => (
                    <TableRow
                      key={testimonial.id}
                      className="hover:bg-gray-50"
                    >
                      <TableCell className="font-medium">
                        {testimonial.author}
                      </TableCell>

                      <TableCell>
                        {testimonial.position}
                      </TableCell>

                      <TableCell>
                        {testimonial.productType}
                      </TableCell>

                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 font-semibold">
                          {testimonial.rating}
                        </span>
                      </TableCell>

                      <TableCell className="bg-white">
                        <Badge
                          variant={
                            testimonial.isApproved
                              ? "default"
                              : "secondary"
                          }
                        >
                          {testimonial.isApproved
                            ? "Approved"
                            : "Pending"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">

                  

                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-gray-100"
                            onClick={() =>
                              router.push(
                                `/admin/testimonials/edit/${testimonial.id}`
                              )
                            }
                          >
                            <Pencil className="h-4 w-4 text-gray-600" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-red-100"
                            onClick={() =>
                              handleDelete(testimonial.id)
                            }
                            disabled={
                              actionLoading === testimonial.id
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>

                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-gray-500"
                    >
                      {isSearching
                        ? "Searching..."
                        : "No testimonials found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Rows per page:
              </span>

              <Select
                value={pageSize.toString()}
                onValueChange={(value) =>
                  handlePageSizeChange(Number(value))
                }
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {[10, 20, 50, 100].map((size) => (
                    <SelectItem
                      key={size}
                      value={size.toString()}
                    >
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Showing{" "}
                {(pagination.currentPage - 1) *
                  pagination.itemsPerPage +
                  1}{" "}
                to{" "}
                {Math.min(
                  pagination.currentPage *
                    pagination.itemsPerPage,
                  pagination.totalItems
                )}{" "}
                of {pagination.totalItems} results
              </span>
            </div>

            <div className="flex items-center gap-2">

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handlePageChange(
                    pagination.currentPage - 1
                  )
                }
                disabled={!pagination.hasPrev}
              >
                Previous
              </Button>

              <div className="flex gap-1">
                {getPageNumbers().map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant={
                      pagination.currentPage === pageNumber
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      handlePageChange(pageNumber)
                    }
                    className={
                      pagination.currentPage === pageNumber
                        ? "bg-brand hover:bg-brand/90 text-white"
                        : ""
                    }
                  >
                    {pageNumber}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handlePageChange(
                    pagination.currentPage + 1
                  )
                }
                disabled={!pagination.hasNext}
              >
                Next
              </Button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsAdminPage;