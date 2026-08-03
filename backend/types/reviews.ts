export type ReviewStatus = 'Pending' | 'Approved' | 'Flagged' | 'Rejected';

export interface Review {
  id: number;
  reviewer_name: string;
  customer_id: number | null;
  product_id: number;
  product_name: string;
  rating: number; // 1 to 5
  comment: string;
  status: ReviewStatus;
  flagged_reason: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface ReviewStatCounts {
  pendingCount: number;
  approvedCount: number;
  flaggedCount: number;
  rejectedCount: number;
}

export interface GetReviewsQueryParams {
  status?: ReviewStatus | 'All';
  rating?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateReviewRequest {
  product_id: number;
  rating: number;
  comment: string;
  product_name?: string;
}

export interface FlagReviewRequest {
  reason?: string;
}

export interface PaginatedReviewsData {
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
  statCounts: ReviewStatCounts;
}
