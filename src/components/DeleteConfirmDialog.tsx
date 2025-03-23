import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

interface DeleteConfirmDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
}

// 削除確認ダイアログコンポーネント
export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  title,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-confirm-title"
    >
      <DialogTitle id="delete-confirm-title">
        ノートを削除しますか？
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          「{title}」を削除します。この操作は取り消せません。
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          キャンセル
        </Button>
        <Button onClick={onConfirm} color="error" autoFocus>
          削除
        </Button>
      </DialogActions>
    </Dialog>
  );
};
