import { DbComment } from '../../interfaces/database.types';

export type TCreateComment = {
  postId: string;
  content: string;
  image?: string | null;
};

export type TUpdateComment = Partial<TCreateComment> & { id: string };

export type TCommentResponse = DbComment;
