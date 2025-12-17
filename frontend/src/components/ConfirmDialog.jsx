import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material'
import CloseIcon from "@mui/icons-material/Close";
import React from 'react'

const ConfirmDialog = ({open, title="Confirm", message, onConfirm, onCancel, confirmText="Yes", cancelText="Cancel", confirmColor="error"}) => {
  return (
    <Dialog open={open} onClose={onCancel}>
        <DialogTitle sx={{ bgcolor: "#1976D2", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            {title}
            <IconButton onClick={onCancel}><CloseIcon sx={{ color: "white" }} /></IconButton>
        </DialogTitle>

        <DialogContent>
            {message}
        </DialogContent>

        <DialogActions>
            <Button onClick={onCancel}>
                {cancelText}
            </Button>
            <Button onClick={onConfirm} color={confirmColor} variant="contained">
                {confirmText}
            </Button>
        </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog