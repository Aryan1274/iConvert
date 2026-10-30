/**
 * ConversionCard — Reusable card component for image/video conversion.
 *
 * Props:
 *  - type: 'image' | 'video'
 *  - title: string
 *  - description: string
 *  - inputFormats: string[]
 *  - outputFormat: string
 *  - buttonText: string
 *  - buttonIcon: string (emoji)
 *  - disabled: boolean
 *  - onClick: function
 */
function ConversionCard({
  type,
  title,
  description,
  inputFormats,
  outputFormat,
  buttonText,
  buttonIcon,
  disabled,
  onClick
}) {
  const cardClass = type === 'image' ? 'image-card' : 'video-card'
  const icon = type === 'image' ? '🖼️' : '🎬'

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick()
    }
  }

  return (
    <div
      className={`conversion-card ${cardClass} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
    >
      <div className="card-icon">{icon}</div>

      <h2 className="card-title">{title}</h2>
      <p className="card-description">{description}</p>

      <div className="card-format-badge">
        {inputFormats.map((fmt, i) => (
          <span key={fmt}>
            {i > 0 && <span style={{ marginRight: 4 }}>/</span>}
            <span className="format-tag">{fmt}</span>
          </span>
        ))}
        <span className="format-arrow">→</span>
        <span className="format-tag">{outputFormat}</span>
      </div>

      <button className="card-button" disabled={disabled}>
        <span className="button-icon">{buttonIcon}</span>
        {buttonText}
      </button>
    </div>
  )
}

export default ConversionCard
