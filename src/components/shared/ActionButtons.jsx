import { useNavigate } from 'react-router-dom'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'

export default function ActionButtons({ viewTo, editTo, onDelete, disabled }) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-1">
      {viewTo && (
        <button
          title="View"
          onClick={() => navigate(viewTo)}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      )}
      {editTo && (
        <button
          title="Edit"
          onClick={() => navigate(editTo)}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-amber-50 hover:text-amber-600 transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}
      {onDelete && (
        <ConfirmDialog
          onConfirm={onDelete}
          trigger={
            <button
              title="Delete"
              disabled={disabled}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          }
        />
      )}
    </div>
  )
}
