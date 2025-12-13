import { useState } from 'react';
import { useComments, Comment } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, Trash2, Edit2, X, Check, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CommentSectionProps {
  teachingId: string;
}

export const CommentSection = ({ teachingId }: CommentSectionProps) => {
  const { comments, loading, addComment, updateComment, deleteComment } = useComments(teachingId);
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    const { error } = await addComment(newComment);
    setSubmitting(false);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le commentaire',
        variant: 'destructive'
      });
    } else {
      setNewComment('');
      toast({
        title: 'Succès',
        description: 'Commentaire ajouté'
      });
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    const { error } = await updateComment(commentId, editContent);
    
    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le commentaire',
        variant: 'destructive'
      });
    } else {
      setEditingId(null);
      setEditContent('');
      toast({
        title: 'Succès',
        description: 'Commentaire modifié'
      });
    }
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await deleteComment(commentId);
    
    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le commentaire',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Succès',
        description: 'Commentaire supprimé'
      });
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5" />
          Commentaires ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New comment form */}
        {user && (
          <div className="space-y-3">
            <Textarea
              placeholder="Partagez votre réflexion sur cet enseignement..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmit} 
                disabled={!newComment.trim() || submitting}
                size="sm"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Publier
              </Button>
            </div>
          </div>
        )}

        {/* Comments list */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucun commentaire pour le moment. Soyez le premier à partager votre réflexion !
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-4 rounded-lg bg-muted/50">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={comment.profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(comment.profile?.display_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.profile?.display_name || 'Utilisateur'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </span>
                    </div>
                    {user?.id === comment.user_id && (
                      <div className="flex items-center gap-1">
                        {editingId === comment.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleSaveEdit(comment.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEdit(comment)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(comment.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {editingId === comment.id ? (
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="mt-2 min-h-[80px] resize-none"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-foreground/90 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
