import { useState, useRef, useEffect } from "react"

const hours = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
const minutes = ["00", "15", "30", "45"]
const periods = ["AM", "PM"]


export default function BookingSection() {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedHour, setSelectedHour] = useState("3")
  const [selectedMinute, setSelectedMinute] = useState("15")
  const [selectedPeriod, setSelectedPeriod] = useState("PM")

  const [availableObjects, setAvailableObjects] = useState<any[]>([])
  const [selectedObject, setSelectedObject] = useState("")

  const [loadingObjects, setLoadingObjects] = useState(false)
  const [objectError, setObjectError] = useState("")

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

  useEffect(() => {
    const fetchVisibleObjects = async () => {
      if (!selectedDate) return

      setLoadingObjects(true)
      setObjectError("")
      setSelectedObject("")

      try {
        const hour24 = convertTo24Hour(selectedHour, selectedPeriod)

        const formattedHour = String(hour24).padStart(2, "0")

        const fullTime = `${formattedHour}:${selectedMinute}:00`

        // Example Melbourne GPS coordinates
        const latitude = -37.8136
        const longitude = 144.9631

        const response = await fetch(
          `http://localhost:8080/api/visibility/objects?date=${selectedDate}&time=${fullTime}&lat=${latitude}&lng=${longitude}`
        )

        const data = await response.json()

        console.log(data)

        if (data.objects && data.objects.length > 0) {
          setAvailableObjects(data.objects)
        } else {
          setAvailableObjects([])
          setObjectError("No visible objects available for this date and time.")
        }
      } catch (error) {
        console.error(error)
        setObjectError("Failed to fetch visible objects.")
      } finally {
        setLoadingObjects(false)
      }
    }

    fetchVisibleObjects()
  }, [selectedDate, selectedHour, selectedMinute, selectedPeriod])

  const handleBooking = async () => {
    if (!selectedDate) {
      setMessage("Please choose a date for your session.")
      setIsError(true)
      return
    }

    if (!selectedObject) {
      setMessage("Please select an available object.")
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

    try {
      const response = await fetch("http://localhost:8080/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate,
          time: fullTime,
          object: selectedObject,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message || "Booking successful.")
        setIsError(false)
      } else {
        setMessage(data.error || "Booking failed.")
        setIsError(true)
      }
    } catch (error) {
      console.error(error)

      setMessage("Failed to connect to booking server.")
      setIsError(true)
    }
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
            Select your preferred date, time, and automatically discover
            visible celestial objects available for observation.
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

            {/* OBJECT DROPDOWN */}
            <div>

              <label className="block text-white font-medium mb-2">
                Available Objects
              </label>

              {loadingObjects ? (
                <div className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-blue-400">
                  Fetching visible objects...
                </div>
              ) : availableObjects.length > 0 ? (
                <select
                  value={selectedObject}
                  onChange={(e) => setSelectedObject(e.target.value)}
                  className="w-full rounded-xl bg-black/40 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-blue-400 transition"
                >
                  <option value="">Select Object</option>

                  {availableObjects.map((object: any) => (
                    <option
                      key={object.name}
                      value={object.name}
                    >
                      {object.name} •
                      RA: {object.ra} •
                      Dec: {object.dec}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full rounded-xl bg-black/40 border border-red-400/20 px-4 py-3 text-red-300">
                  {objectError || "No visible objects found."}
                </div>
              )}

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
            disabled={!selectedObject || loadingObjects}
            className={`mt-8 w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold transition duration-300 ${
              !selectedObject || loadingObjects
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white shadow-[0_0_25px_rgba(37,99,235,0.35)]"
            }`}
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