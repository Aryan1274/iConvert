import { useState, useEffect } from 'react'
import './FolderPicker.css'

export default function FolderPicker({ isOpen, onClose, onSelect }) {
  const [currentPath, setCurrentPath] = useState('root')
  const [parentPath, setParentPath] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadPath('root')
    }
  }, [isOpen])

  const loadPath = async (path) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/fs/list?path=${encodeURIComponent(path)}`)
      const data = await res.json()
      if (data.error) {
        alert(data.error)
      } else {
        setCurrentPath(data.current)
        setParentPath(data.parent)
        setItems(data.items || [])
      }
    } catch (err) {
      alert('Error loading directory: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content folder-picker">
        <div className="modal-header">
          <h3>Select Folder</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="folder-path-display">
          Current: {currentPath === 'root' ? 'This PC' : currentPath}
        </div>

        <div className="folder-list">
          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : (
            <>
              {parentPath && (
                <div 
                  className="folder-item parent-folder"
                  onClick={() => loadPath(parentPath)}
                >
                  <span className="folder-icon">⬆️</span>
                  <span>.. (Up)</span>
                </div>
              )}
              
              {items.map(item => (
                <div 
                  key={item.path} 
                  className="folder-item"
                  onClick={() => loadPath(item.path)}
                >
                  <span className="folder-icon">📁</span>
                  <span className="folder-name">{item.name}</span>
                </div>
              ))}

              {items.length === 0 && (
                <div className="empty-state">Folder is empty</div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className="btn-primary" 
            onClick={() => onSelect(currentPath)}
            disabled={currentPath === 'root'}
          >
            Select Current Folder
          </button>
        </div>
      </div>
    </div>
  )
}
