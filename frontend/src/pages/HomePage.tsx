import { useState } from 'react'
import StoryCreateBox from '../components/stories/StoryCreateBox'
import StoryFeed from '../components/stories/StoryFeed'
import UserList from '../components/users/UserList'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'

function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleStoryCreated = () => {
    // Trigger refresh of story feed
    setRefreshKey((prev) => prev + 1)
  }

  const handleArchive = (storyId: number) => {
    // Archive story and refresh feed
    setRefreshKey((prev) => prev + 1)
  }

  const handleDelete = (storyId: number) => {
    // Delete story and refresh feed
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background-color, #000000)' }}>
      <Sidebar />
      <div style={{ marginLeft: '72px', width: '100%' }}>
        <Header />
        <div
          style={{
            marginTop: '60px',
            display: 'grid',
            gridTemplateColumns: '1fr 600px 1fr',
            gap: '24px',
            padding: '24px',
            maxWidth: '1200px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Left sidebar content - can be used for suggestions or empty */}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <StoryCreateBox onStoryCreated={handleStoryCreated} />
            <StoryFeed
              refreshKey={refreshKey}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <UserList />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
