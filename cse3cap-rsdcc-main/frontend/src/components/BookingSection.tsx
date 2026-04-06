import { useState } from "react"

const hours = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
const minutes = ["00", "15", "30", "45"]
const periods = ["AM", "PM"]

export default function BookingSection() {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedHour, setSelectedHour] = useState("3")
  const [selectedMinute, setSelectedMinute] = useState("15")
  const [selectedPeriod, setSelectedPeriod] = useState("PM")
  const [selectedObject, setSelectedObject] = useState("Moon")
  const [message, setMessage] = useState("")

  const handleBooking = () => {
    if (!selectedDate) {
      setMessage("Please choose a date for your session.")
      return
    }

    const fullTime = `${selectedHour}:${selectedMinute} ${selectedPeriod}`

    setMessage(
      `Booking request submitted for ${selectedDate} at ${fullTime} to observe ${selectedObject}.`
    )
  }

  return (
    <section className="mb-14">
      <div className="mb-5">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Book Your Telescope Session
        </h2>
        <p className="text-slate-300 text-lg max-w-3xl">
          Select a preferred date and time to reserve your telescope viewing
          session. This booking interface helps students plan their observation
          experience in a simple and user-friendly way.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-700 bg-slate-800/45 backdrop-blur-sm p-6 md:p-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white font-medium mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-600 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              Select Space Object
            </label>
            <select
              value={selectedObject}
              onChange={(e) => setSelectedObject(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-600 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option>Moon</option>
              <option>Saturn</option>
              <option>Jupiter</option>
              <option>Mars</option>
              <option>Orion Nebula</option>
              <option>Star Clusters</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-white font-medium mb-3">
            Choose Time
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(e.target.value)}
              className="rounded-xl bg-slate-900 border border-slate-600 text-white px-4 py-3"
            >
              {hours.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>

            <select
              value={selectedMinute}
              onChange={(e) => setSelectedMinute(e.target.value)}
              className="rounded-xl bg-slate-900 border border-slate-600 text-white px-4 py-3"
            >
              {minutes.map((minute) => (
                <option key={minute} value={minute}>
                  {minute}
                </option>
              ))}
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="rounded-xl bg-slate-900 border border-slate-600 text-white px-4 py-3"
            >
              {periods.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleBooking}
          className="mt-8 bg-gradient-to-r from-purple-500 to-indigo-500 hover:scale-105 transition duration-300 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
        >
          Book Now
        </button>

        {message && (
          <p className="mt-5 text-green-300 font-medium">{message}</p>
        )}
      </div>
    </section>
  )
}