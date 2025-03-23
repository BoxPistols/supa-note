import {useState, useEffect} from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  CssBaseline,
  AppBar,
  Toolbar,
  Button,
  AlertColor,
} from "@mui/material";
import {Add as AddIcon} from "@mui/icons-material";
import {NoteForm} from "./components/NoteForm";
import {NotesList} from "./components/NotesList";
import {DeleteConfirmDialog} from "./components/DeleteConfirmDialog";
import {Notification} from "./components/Notification";
import {Note, notesApi} from "./lib/supabase";

function App() {
  // 状態管理
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deleteNote, setDeleteNote] = useState<Note | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info" as AlertColor,
  });

  // ノート一覧を取得
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await notesApi.getNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      showNotification("ノートの取得に失敗しました", "error");
    } finally {
      setLoading(false);
    }
  };

  // 初回ロード時にノート一覧を取得
  useEffect(() => {
    fetchNotes();
  }, []);

  // 通知表示関数
  const showNotification = (message: string, severity: AlertColor) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  // 通知を閉じる処理
  const handleCloseNotification = () => {
    setNotification({...notification, open: false});
  };

  // フォームキャンセル処理
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingNote(null);
  };

  // ノート作成・更新処理
  const handleSubmitNote = async (
    noteData: Omit<Note, "id" | "created_at" | "updated_at">
  ) => {
    try {
      if (editingNote) {
        // 更新処理
        await notesApi.updateNote(editingNote.id, noteData);
        showNotification("ノートを更新しました", "success");
      } else {
        // 作成処理
        await notesApi.createNote(noteData);
        showNotification("新しいノートを作成しました", "success");
      }

      // フォームを閉じてノート一覧を再取得
      setShowForm(false);
      setEditingNote(null);
      fetchNotes();
    } catch (error) {
      console.error("Error saving note:", error);
      showNotification(
        editingNote
          ? "ノートの更新に失敗しました"
          : "ノートの作成に失敗しました",
        "error"
      );
    }
  };

  // 編集ボタン押下処理
  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  // 削除確認ダイアログを表示
  const handleDeleteClick = (id: string) => {
    const noteToDelete = notes.find((note) => note.id === id);
    if (noteToDelete) {
      setDeleteNote(noteToDelete);
    }
  };

  // 削除処理
  const handleConfirmDelete = async () => {
    if (!deleteNote) return;

    try {
      await notesApi.deleteNote(deleteNote.id);
      showNotification("ノートを削除しました", "success");
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      showNotification("ノートの削除に失敗しました", "error");
    } finally {
      setDeleteNote(null);
    }
  };

  return (
    <>
      <CssBaseline />
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
            シンプルノートアプリ
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" className="py-8">
        <Box className="flex justify-between items-center mb-6">
          <Typography variant="h4" component="h1">
            マイノート
          </Typography>

          {!showForm && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(true)}
            >
              新規作成
            </Button>
          )}
        </Box>

        {showForm && (
          <NoteForm
            initialNote={editingNote}
            onSubmit={handleSubmitNote}
            onCancel={handleCancelForm}
          />
        )}

        <Paper className="p-6">
          <NotesList
            notes={notes}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </Paper>
      </Container>

      {/* 削除確認ダイアログ */}
      {deleteNote && (
        <DeleteConfirmDialog
          open={!!deleteNote}
          title={deleteNote.title}
          onClose={() => setDeleteNote(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* 通知 */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </>
  );
}

export default App;
