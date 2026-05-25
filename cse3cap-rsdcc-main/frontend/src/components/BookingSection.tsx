import { useState, useRef } from "react"
import { collection, addDoc } from "firebase/firestore"
import { db } from "../firebase"


const hours = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
const minutes = ["00", "15", "30", "45"]
const periods = ["AM", "PM"]

export default function BookingSection() {

  const [selectedDate, setSelectedDate] = useState("")
  const [selectedHour, setSelectedHour] = useState("9")
  const [selectedMinute, setSelectedMinute] = useState("00")
  const [selectedPeriod, setSelectedPeriod] = useState("PM")

  const [availableObjects, setAvailableObjects] = useState<any[]>([])
  const [selectedObject, setSelectedObject] = useState("")

  const [loadingObjects, setLoadingObjects] = useState(false)

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

  const convertTo24Hour = (
    hour: string,
    period: string
  ) => {

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

  // --------------------------------------------------
  // CHECK AVAILABLE OBJECTS
  // --------------------------------------------------
  const handleCheckObjects = async () => {

    if (!selectedDate) {

      setMessage("Please select a date first.")
      setIsError(true)

      return
    }

    setLoadingObjects(true)

    setMessage("")
    setSelectedObject("")

    try {

      const selected24Hour = convertTo24Hour(
        selectedHour,
        selectedPeriod
      )

      // --------------------------------------------------
      // NIGHT OBJECTS
      // --------------------------------------------------
      const nighttimeObjects = [
        {
          name: "Moon",
          image: "/planets/moon.png",
          type: "Natural Satellite",
          visibility: "Excellent",
        },
        {
          name: "Mars",
          image: "/planets/mars.png",
          type: "Planet",
          visibility: "Good",
        },
        {
          name: "Jupiter",
          image: "/planets/jupiter.png",
          type: "Planet",
          visibility: "Excellent",
        },
        {
          name: "Saturn",
          image: "/planets/saturn.png",
          type: "Planet",
          visibility: "Good",
        },
        {
          name: "Orion Nebula",
          image: "/planets/orion-nebula.png",
          type: "Nebula",
          visibility: "Excellent",
        },
      ]

      // --------------------------------------------------
      // DAY OBJECTS
      // --------------------------------------------------
      const daytimeObjects = [
        {
          name: "Sun",
          image: "/planets/sun.png",
          type: "Star",
          visibility: "Excellent",
        },
      ]

      // --------------------------------------------------
      // TIME FILTERING
      // --------------------------------------------------
      if (selected24Hour >= 18 || selected24Hour < 6) {

        setAvailableObjects(nighttimeObjects)

      } else {

        setAvailableObjects(daytimeObjects)
      }

      setMessage("Available objects loaded successfully.")
      setIsError(false)

    } catch (error) {

      console.error(error)

      setMessage("Failed to fetch available objects.")
      setIsError(true)

    } finally {

      setLoadingObjects(false)
    }
  }

  // --------------------------------------------------
  // BOOK SESSION
  // --------------------------------------------------
  const handleBooking = async () => {

    if (!selectedDate) {

      setMessage("Please choose a date.")
      setIsError(true)

      return
    }

    if (!selectedObject) {

      setMessage("Please select an object.")
      setIsError(true)

      return
    }

    try {

      const selected24Hour = convertTo24Hour(
        selectedHour,
        selectedPeriod
      )

      const formattedHour = String(selected24Hour).padStart(2, "0")

      const fullTime = `${formattedHour}:${selectedMinute}`

      const response = await fetch(
        "http://127.0.0.1:5000/api/booking",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: "Guest User",
            date: selectedDate,
            time: fullTime,
            object: selectedObject,
          }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        await addDoc(collection(db, "bookings"), {
          username: localStorage.getItem("username"),
          email: localStorage.getItem("userEmail"),
          object: selectedObject,
          date: selectedDate,
          time: fullTime,
          createdAt: new Date(),
        })

        setMessage(
          data.message || "Booking successful."
        )

        setIsError(false)

      } else {

        setMessage(
          data.message || "Booking failed."
        )

        setIsError(true)
      }

    } catch (error) {

      console.error(error)

      setMessage(
        "Failed to connect to booking server."
      )

      setIsError(true)
    }
  }

  return (

    <section className="relative min-h-screen overflow-hidden px-6 py-20 bg-black">

      {/* BACKGROUND */}
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

      <div className="absolute inset-0 bg-black/30 z-[1]" />

      <div className="relative z-10">

        {/* HEADER */}
        <div className="mb-8">

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-5 tracking-wide">
            Book Telescope Session
          </h2>

          <p className="text-white/65 text-lg max-w-3xl leading-relaxed">
            Select a date and time to discover which celestial objects
            are available for observation.
          </p>

        </div>

        {/* BOOKING PANEL */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 shadow-[0_0_40px_rgba(37,99,235,0.12)]">

          {/* DATE + TIME */}
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
                    selectedDate
                      ? "text-white"
                      : "text-white/40"
                  }`}
                  style={{ colorScheme: "dark" }}
                />

                <span className="text-white text-lg ml-3">
                  📅
                </span>

              </div>

            </div>

            {/* TIME */}
            <div>

              <label className="block text-white font-medium mb-2">
                Select Time
              </label>

              <div className="grid grid-cols-3 gap-3">

                <select
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(e.target.value)}
                  className="rounded-xl bg-black/40 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-blue-400"
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
                  className="rounded-xl bg-black/40 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-blue-400"
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
                  className="rounded-xl bg-black/40 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-blue-400"
                >
                  {periods.map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>

              </div>

            </div>

          </div>

          {/* CHECK OBJECTS BUTTON */}
          <button
            onClick={handleCheckObjects}
            disabled={loadingObjects}
            className="mt-8 px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition duration-300 shadow-[0_0_25px_rgba(168,85,247,0.35)]"
          >
            {loadingObjects
              ? "Checking Available Objects..."
              : "Check Available Objects"}
          </button>

          {/* OBJECT CARDS */}
          {availableObjects.length > 0 && (

            <div className="mt-10">

              <h3 className="text-2xl font-bold text-white mb-6">
                Available Objects
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                {availableObjects.map((object) => (

                  <button
                    key={object.name}

                    onClick={() =>
                      setSelectedObject(object.name)
                    }

                    className={`group relative rounded-2xl border p-5 transition duration-300 overflow-hidden transform ${
                      selectedObject === object.name

                        ? "border-blue-400 bg-blue-500/10 shadow-[0_0_25px_rgba(59,130,246,0.4)] scale-105"

                        : "border-white/10 bg-black/40 hover:border-blue-400 hover:scale-105"
                    }`}
                  >

                    <div className="flex flex-col items-center text-center">

                      <img
                        src={object.image}
                        alt={object.name}
                        className="w-24 h-24 object-contain mb-4 group-hover:scale-110 transition duration-300"
                      />

                      <h4 className="text-xl font-bold text-white">
                        {object.name}
                      </h4>

                      <p className="text-white/50 text-sm mt-1">
                        {object.type}
                      </p>

                      <p className="text-green-400 mt-3">
                        Visibility: {object.visibility}
                      </p>

                    </div>

                  </button>
                ))}

              </div>

            </div>
          )}

          {/* BOOK BUTTON */}
          <button
            onClick={handleBooking}
            disabled={!selectedObject}
            className={`mt-10 w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold transition duration-300 ${
              !selectedObject
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white shadow-[0_0_25px_rgba(37,99,235,0.35)]"
            }`}
          >
            Book Session
          </button>

          {/* MESSAGE */}
          {message && (

            <div
              className={`mt-6 rounded-xl border px-4 py-3 font-medium ${
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