import { useState, useRef } from "react"

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
  const [isError, setIsError] = useState(false)

  const dateInputRef = useRef<HTMLInputElement>(null)

  const getTodayString = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const convertTo24Hour = (hour: string, period: string) => {
    let hourNumber = Number(hour)

    if (period === "AM") {
      if (hourNumber === 12) {
        hourNumber = 0
      }
    } else {
      if (hourNumber !== 12) {
        hourNumber += 12
      }
    }

    return hourNumber
  }

  const openCalendar = () => {
    dateInputRef.current?.showPicker()
  }

  const handleBooking = () => {
    if (!selectedDate) {
      setMessage("Please choose a date for your session.")
      setIsError(true)
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const chosenDate = new Date(selectedDate)
    chosenDate.setHours(0, 0, 0, 0)

    if (chosenDate < today) {
      setMessage("Please select today or a future date.")
      setIsError(true)
      return
    }

    if (selectedDate === getTodayString()) {
      const now = new Date()

      const selected24Hour = convertTo24Hour(selectedHour, selectedPeriod)
      const selectedMinuteNumber = Number(selectedMinute)

      const selectedDateTime = new Date()
      selectedDateTime.setSeconds(0, 0)
      selectedDateTime.setHours(selected24Hour, selectedMinuteNumber, 0, 0)

      if (selectedDateTime <= now) {
        setMessage("Please select a future time for today.")
        setIsError(true)
        return
      }
    }

    const fullTime = `${selectedHour}:${selectedMinute} ${selectedPeriod}`

    setMessage(
      `Booking request submitted for ${selectedDate} at ${fullTime} to observe ${selectedObject}.`
    )
    setIsError(false)
  }

  return (
    <section className="mb-14">
      <div className="mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Book Your Telescope Session
        </h2>
        <p className="text-slate-300 text-lg max-w-3xl leading-relaxed">
          Select your preferred date, time, and space object to reserve a telescope
          observation session. This interface is designed to make the booking
          process simple, clear, and user-friendly.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-700 bg-slate-800/50 backdrop-blur-md p-6 md:p-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white font-medium mb-2">
              Select Date
            </label>

            <div
              onClick={openCalendar}
              className="w-full cursor-pointer rounded-xl bg-slate-900 border border-slate-600 px-4 py-3 flex items-center justify-between hover:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400 transition"
            >
              <input
                ref={dateInputRef}
                type="date"
                min={getTodayString()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`bg-transparent outline-none w-full pointer-events-none ${
                  selectedDate ? "text-white" : "text-slate-400"
                }`}
                style={{ colorScheme: "dark" }}
              />
              <span className="text-white text-lg ml-3">📅</span>
            </div>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              Select Space Object
            </label>
            <select
              value={selectedObject}
              onChange={(e) => setSelectedObject(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-600 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
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
              className="rounded-xl bg-slate-900 border border-slate-600 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
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
              className="rounded-xl bg-slate-900 border border-slate-600 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
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
              className="rounded-xl bg-slate-900 border border-slate-600 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
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
          className="mt-8 w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 hover:scale-105 transition duration-300 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
        >
          Book Now
        </button>

        {message && (
          <div
            className={`mt-5 rounded-xl border px-4 py-3 font-medium ${
              isError
                ? "bg-red-500/10 border-red-400 text-red-300"
                : "bg-green-500/10 border-green-400 text-green-300"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </section>
  )
}