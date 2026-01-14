import { useTheme } from '../../hooks/useTheme'

const themes = [
  { id: 'default', name: 'Default', emoji: '🐱' },
  { id: 'orange-cat', name: 'Orange Cat', emoji: '🧡' },
  { id: 'gray-cat', name: 'Gray Cat', emoji: '🐈' },
  { id: 'calico-cat', name: 'Calico Cat', emoji: '🐈‍⬛' },
]

function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <div>
      <h3>Select Theme</h3>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {themes.map((themeOption) => (
          <button
            key={themeOption.id}
            onClick={() => setTheme(themeOption.id)}
            style={{
              padding: '12px 16px',
              border: theme === themeOption.id ? '2px solid #007bff' : '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: theme === themeOption.id ? '#e7f3ff' : 'white',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '24px' }}>{themeOption.emoji}</span>
            <span>{themeOption.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ThemeSelector
