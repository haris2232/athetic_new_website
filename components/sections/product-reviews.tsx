"use client"

import { useState, useEffect } from "react"
import { Star, MessageSquare, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import type { Product } from "@/lib/types"

interface Review {
  _id: string
  product: {
    title: string
  }
  customer: {
    name: string
    email: string
  }
  rating: number
  comment: string
  status: string
  adminResponse?: string
  responseDate?: string
  createdAt: string
}

interface ProductReviewsProps {
  product: Product
}

export default function ProductReviews({ product }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
    customerName: "",
    customerEmail: ""
  })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchReviews()
  }, [product.id])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://34.18.0.53:5000/api/reviews/public/${product.id}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitReview = async () => {
    if (!newReview.comment.trim() || !newReview.customerName.trim() || !newReview.customerEmail.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('http://34.18.0.53:5000/api/reviews/public/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          rating: newReview.rating,
          comment: newReview.comment,
          customerName: newReview.customerName,
          customerEmail: newReview.customerEmail
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Review submitted successfully! It will be visible after admin approval.",
        })
        setShowReviewForm(false)
        setNewReview({
          rating: 5,
          comment: "",
          customerName: "",
          customerEmail: ""
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to submit review",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`h-4 w-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"} ${
              interactive ? "cursor-pointer hover:text-yellow-400" : ""
            }`}
            onClick={() => interactive && onStarClick?.(star)}
          />
        ))}
      </div>
    )
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium uppercase tracking-wide text-white">REVIEWS</span>
          {reviews.length > 0 && (
            <div className="flex items-center space-x-2">
              {renderStars(averageRating)}
              <span className="text-sm text-gray-300">({reviews.length} reviews)</span>
            </div>
          )}
        </div>
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="text-white border-gray-600 hover:bg-gray-700"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Write Review
        </Button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
          <h3 className="text-lg font-medium text-white mb-4">Write a Review</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Rating</label>
              {renderStars(newReview.rating, true, (rating) => 
                setNewReview(prev => ({ ...prev, rating }))
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Your Name</label>
              <Input
                value={newReview.customerName}
                onChange={(e) => setNewReview(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter your name"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Your Email</label>
              <Input
                type="email"
                value={newReview.customerEmail}
                onChange={(e) => setNewReview(prev => ({ ...prev, customerEmail: e.target.value }))}
                placeholder="Enter your email"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Your Review</label>
              <Textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your experience with this product..."
                rows={4}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={submitReview} 
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowReviewForm(false)}
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-600 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {renderStars(review.rating)}
                  <span className="text-sm font-medium text-white">
                    {review.customer.name}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-sm text-gray-300 mb-2">
                {review.comment}
              </p>
              
              {review.adminResponse && (
                <div className="bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-500 mt-3">
                  <div className="flex items-center mb-1">
                    <MessageSquare className="h-3 w-3 mr-2 text-blue-400" />
                    <span className="text-xs font-medium text-blue-400">Store Response</span>
                  </div>
                  <p className="text-xs text-gray-300">{review.adminResponse}</p>
                  {review.responseDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(review.responseDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No reviews yet</h3>
            <p className="text-gray-500">Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  )
} 