import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createCommentEvent, publishComment, type NostrComment } from '@wavefunc/common'
import { Loader2, X } from 'lucide-react'
import { nostrService } from '@/lib/services/ndk'
import { toast } from 'sonner'

interface ReplyToCommentProps {
    stationEvent: any // NDKEvent, avoiding direct import
    parentComment: NostrComment
    onCommentPosted: () => void
}

export function ReplyToComment({ stationEvent, parentComment, onCommentPosted }: ReplyToCommentProps) {
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!content.trim() || isSubmitting) return

        setIsSubmitting(true)

        try {
            const ndk = nostrService.getNDK()
            if (!ndk) throw new Error('NDK not available')

            // Create an unsigned event
            const commentEvent = createCommentEvent(content.trim(), stationEvent, parentComment)

            // Publish the comment
            await publishComment(ndk, commentEvent)

            setContent('')
            onCommentPosted()
            toast.success('Reply posted')
        } catch (error) {
            toast.error('Failed to post reply')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-card p-4 rounded-md border">
            <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-muted-foreground">Replying to {parentComment.pubkey.slice(0, 8)}...</p>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                        e.preventDefault()
                        onCommentPosted()
                    }}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a reply..."
                className="resize-none mb-2"
                rows={3}
            />

            <div className="flex justify-end">
                <Button
                    type="submit"
                    size="sm"
                    disabled={!content.trim() || isSubmitting}
                    onClick={(e) => {
                        if (!content.trim() || isSubmitting) {
                            e.preventDefault()
                            return
                        }
                    }}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Posting...
                        </>
                    ) : (
                        'Post Reply'
                    )}
                </Button>
            </div>
        </form>
    )
}
