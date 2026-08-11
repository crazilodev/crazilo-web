'use client'

import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'primary' | 'danger' | 'warning' | 'gold'
  loading?: boolean
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  loading = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
  }

  const btnVariant = variant === 'warning' ? 'gold' : variant

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-6">
        <p className="text-sm text-gray-600 mb-6 leading-relaxed whitespace-pre-line">
          {message}
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            size="sm"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={btnVariant}
            onClick={handleConfirm}
            loading={loading}
            size="sm"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
