import { useState } from 'react'
import StoryCreateBox from '../components/stories/StoryCreateBox'
import StoryFeed from '../components/stories/StoryFeed'
import UserList from '../components/users/UserList'
import Header from '../components/layout/Header'

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
    <div>
      <Header />
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div>
          <StoryCreateBox onStoryCreated={handleStoryCreated} />
          <StoryFeed
            refreshKey={refreshKey}
            onArchive={handleArchive}
            onDelete={handleDelete}
          />
        </div>
        <div>
          <UserList />
        </div>
      </div>
    </div>
  )
}

export default HomePage
