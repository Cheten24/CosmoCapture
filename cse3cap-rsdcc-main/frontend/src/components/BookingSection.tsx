import { useState, useRef } from "react"

const hours = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
const minutes = ["00", "15", "30", "45"]
const periods = ["AM", "PM"]
const spaceObjects = [
  {
    name: "Moon",
    visible: true,
    ra: "08h 32m",
    dec: "+18°",
    description: "Earth's natural satellite.",
  },
  {
    name: "Saturn",
    visible: false,
    ra: "21h 14m",
    dec: "-12°",
    description: "Planet with rings.",
  },
  {
    name: "Jupiter",
    visible: true,
    ra: "02h 45m",
    dec: "-08°",
    description: "Largest planet in the solar system.",
  },
  {
    name: "Mars",
    visible: true,
    ra: "07h 18m",
    dec: "+24°",
    description: "Known as the red planet.",
  },
  {
    name: "Orion Nebula",
    visible: false,
    ra: "05h 35m",
    dec: "-05°",
    description: "A bright diffuse nebula.",
  },
]

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
    <section className="relative min-h-screen overflow-hidden px-6 py-20 bg-black">

      {/* GALAXY BACKGROUND */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(80,0,255,0.35), transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(0,100,255,0.35), transparent 40%),
            radial-gradient(circle at 50% 50%, #020617, #000000)
          `
        }}
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/30 z-[1]" />

      {/* CONTENT */}
      <div className="relative z-10">

        <div className="mb-6">

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-5 tracking-wide">
            Book Your Telescope Session
          </h2>

          <p className="text-white/65 text-lg max-w-3xl leading-relaxed">
            Select your preferred date, time, and space object to reserve a telescope
            observation session. This interface is designed to make the booking
            process simple, clear, and user-friendly.
          </p>

        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 shadow-[0_0_40px_rgba(37,99,235,0.12)]">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* DATE */}
            <div>

              <label className="block text-white font-medium mb-2">
                Select Date
              </label>

              <div
                onClick={openCalendar}
                className="w-full cursor-pointer rounded-xl bg-black/40 border border-white/10 px-4 py-3 flex items-center justify-between hover:border-blue-400 transition"
              >

                <input
                  ref={dateInputRef}
                  type="date"
                  min={getTodayString()}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`bg-transparent outline-none w-full pointer-events-none ${
                    selectedDate ? "text-white" : "text-white/40"
                  }`}
                  style={{ colorScheme: "dark" }}
                />

                <span className="text-white text-lg ml-3">📅</span>

              </div>

            </div>

            {/* OBJECT */}
            <div>

              <label className="block text-white font-medium mb-2">
                Select Space Object
              </label>

              <select
  value={selectedObject}
  onChange={(e) => setSelectedObject(e.target.value)}
  className="w-full rounded-xl bg-black/40 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-blue-400 transition"
>
  <option value="">Select Object</option>

  {spaceObjects.map((object) => (
    <option
      key={object.name}
      value={object.name}
      disabled={!object.visible}
    >
      {object.name} •
      {object.visible ? " Visible" : " Unavailable"} •
      RA: {object.ra} •
      Dec: {object.dec}
    </option>
  ))}
</select>

            </div>

          </div>

          {/* TIME */}
          <div className="mt-6">

            <label className="block text-white font-medium mb-3">
              Choose Time
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              <select
                value={selectedHour}
                onChange={(e) => setSelectedHour(e.target.value)}
                className="rounded-xl bg-black/40 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-blue-400 transition"
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
                className="rounded-xl bg-black/40 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-blue-400 transition"
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
                className="rounded-xl bg-black/40 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-blue-400 transition"
              >
                {periods.map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>

            </div>

          </div>

          {/* BUTTON */}
          <button
            onClick={handleBooking}
            className="mt-8 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 hover:scale-105 transition duration-300 text-white px-8 py-4 rounded-2xl font-semibold shadow-[0_0_25px_rgba(37,99,235,0.35)]"
          >
            Book Now
          </button>

          {/* MESSAGE */}
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

      </div>

    </section>
  )
}