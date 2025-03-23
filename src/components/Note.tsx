import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  CardHeader,
} from "@mui/material";
import {Edit as EditIcon, Delete as DeleteIcon} from "@mui/icons-material";
import {Note as NoteType} from "../lib/supabase";

interface NoteProps {
  note: NoteType;
  onEdit: (note: NoteType) => void;
  onDelete: (id: string) => void;
}

// 個別のノートカードコンポーネント
export const Note: React.FC<NoteProps> = ({note, onEdit, onDelete}) => {
  // 日付をフォーマットする関数
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="w-full mb-4 hover:shadow-lg transition-shadow duration-200">
      <CardHeader
        title={note.title}
        subheader={`更新: ${formatDate(note.updated_at)}`}
        className="pb-0"
      />
      <CardContent>
        <Typography
          variant="body1"
          component="div"
          className="whitespace-pre-wrap"
        >
          {note.content}
        </Typography>
      </CardContent>
      <CardActions disableSpacing className="flex justify-end">
        <IconButton
          aria-label="編集"
          onClick={() => onEdit(note)}
          className="text-blue-600 hover:text-blue-800"
        >
          <EditIcon />
        </IconButton>
        <IconButton
          aria-label="削除"
          onClick={() => onDelete(note.id)}
          className="text-red-600 hover:text-red-800"
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};
