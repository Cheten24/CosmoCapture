import BookingSection from "../components/BookingSection"
import QueueSection from "../components/QueueSection"

const TelescopeFeedPage = () => {

  
  return (
    <div className="min-h-screen bg-transparent py-12 relative z-10">
      <div className="max-w-[1600px] mx-auto px-6">
        <BookingSection />
        <QueueSection />
      </div>
    </div>
  )
}

export default TelescopeFeedPage