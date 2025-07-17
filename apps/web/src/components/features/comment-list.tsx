"use client"

import { useState } from "react"
import { MessageCircle, ThumbsUp, Reply } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface Comment {
  id: string
  author: {
    name: string
    avatar?: string
  }
  content: string
  timestamp: string
  likes: number
  replies?: Comment[]
}

interface CommentListProps {
  comments: Comment[]
  onAddComment?: (content: string, parentId?: string) => void
  onLikeComment?: (commentId: string) => void
}

export function CommentList({ comments, onAddComment, onLikeComment }: CommentListProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const handleReply = (parentId: string) => {
    if (replyContent.trim()) {
      onAddComment?.(replyContent, parentId)
      setReplyContent("")
      setReplyingTo(null)
    }
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <Card className={isReply ? "ml-8 mt-2" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.author.avatar || "/placeholder.svg"} />
            <AvatarFallback>{comment.author.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{comment.author.name}</p>
            <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm mb-3">{comment.content}</p>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onLikeComment?.(comment.id)} className="h-8 px-2">
            <ThumbsUp className="h-3 w-3 mr-1" />
            {comment.likes}
          </Button>
          {!isReply && (
            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(comment.id)} className="h-8 px-2">
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
        </div>

        {replyingTo === comment.id && (
          <div className="mt-3 space-y-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleReply(comment.id)}>
                Reply
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setReplyingTo(null)
                  setReplyContent("")
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {comment.replies?.map((reply) => (
          <CommentItem key={reply.id} comment={reply} isReply />
        ))}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
      </div>

      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}

      {comments.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
