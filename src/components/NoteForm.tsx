import React, {useState, useEffect} from "react";
import {TextField, Button, Paper, Typography} from "@mui/material";
import {Note as NoteType} from "../lib/supabase";

interface NoteFormProps {
  initialNote?: NoteType | null;
  onSubmit: (
    note: Omit<NoteType, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  onCancel: () => void;
}

// ノート作成・編集用フォームコンポーネント
export const NoteForm: React.FC<NoteFormProps> = ({
  initialNote,
  onSubmit,
  onCancel,
}) => {
  // フォームの状態管理
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState("");

  // 初期値のセット
  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content || "");
    }
  }, [initialNote]);

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!title.trim()) {
      setTitleError("タイトルは必須です");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        // 認証実装後にuser_idを追加
      });
      // 送信成功後フォームをリセット
      setTitle("");
      setContent("");
      setTitleError("");
    } catch (error) {
      console.error("Error submitting note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper className="p-6 mb-6">
      <Typography variant="h6" className="mb-4">
        {initialNote ? "ノートを編集" : "新しいノートを作成"}
      </Typography>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="タイトル"
          variant="outlined"
          fullWidth
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value.trim()) setTitleError("");
          }}
          error={!!titleError}
          helperText={titleError}
          required
          disabled={isSubmitting}
        />

        <TextField
          label="内容"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
        />

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" onClick={onCancel} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {initialNote ? "更新" : "作成"}
          </Button>
        </div>
      </form>
    </Paper>
  );
};
