import React from "react";
import {Typography, Box, CircularProgress} from "@mui/material";
import {Note} from "./Note";
import {Note as NoteType} from "../lib/supabase";

interface NotesListProps {
  notes: NoteType[];
  loading: boolean;
  onEdit: (note: NoteType) => void;
  onDelete: (id: string) => void;
}

// ノート一覧を表示するコンポーネント
export const NotesList: React.FC<NotesListProps> = ({
  notes,
  loading,
  onEdit,
  onDelete,
}) => {
  // ロード中の表示
  if (loading) {
    return (
      <Box className="flex justify-center p-8">
        <CircularProgress />
      </Box>
    );
  }

  // ノートが無い場合の表示
  if (notes.length === 0) {
    return (
      <Box className="text-center p-8">
        <Typography variant="h6" color="textSecondary">
          ノートがありません。新しいノートを作成してみましょう！
        </Typography>
      </Box>
    );
  }

  // ノート一覧の表示
  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <Note key={note.id} note={note} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};
