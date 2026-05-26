import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react"

import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore"

import { db } from "../firebase"

export interface RecentCapturesRef {
  refresh: () => void
}

interface CaptureItem {
  id: string
  image: string
  objectName: string
  createdAt: any
}

const RecentCaptures = forwardRef<RecentCapturesRef>((props, ref) => {
  const [captures, setCaptures] = useState<CaptureItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadCaptures = async () => {
    try {
      setLoading(true)

      const snapshot = await getDocs(
        collection(db, "captures")
      )

      const items: CaptureItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<CaptureItem, "id">),
      }))
      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )

      setCaptures(items)
    } catch (error) {
      console.error("Failed to load captures:", error)
    } finally {
      setLoading(false)
    }
  }

  useImperativeHandle(ref, () => ({
    refresh: loadCaptures,
  }))

  useEffect(() => {
    loadCaptures()
  }, [])

  if (loading) {
    return (
      <div className="text-slate-400">
        Loading captures...
      </div>
    )
  }

  if (captures.length === 0) {
    return (
      <div className="text-slate-400">
        No captures yet.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {captures.map((capture) => (
        <div
          key={capture.id}
          className="bg-slate-900/50 border border-slate-700 rounded-2xl overflow-hidden"
        >
          <img
            src={capture.image}
            alt={capture.objectName}
            className="w-full h-52 object-cover"
          />

          <div className="p-4">
            <h4 className="text-white text-lg font-bold">
              {capture.objectName}
            </h4>

            <p className="text-slate-400 text-sm mt-2">
              {capture.createdAt
                ? new Date(
                    typeof capture.createdAt === "string"
                      ? capture.createdAt
                      : capture.createdAt.seconds * 1000
                  ).toLocaleString()
                : "No date"}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
})

export default RecentCaptures