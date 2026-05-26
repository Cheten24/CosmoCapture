import { useEffect, useState } from "react"

type MediaItem = {
  filename: string
  url: string
}

export default function RecentCapturesPage() {
  const [images, setImages] = useState<MediaItem[]>([])
  const [videos, setVideos] = useState<MediaItem[]>([])

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/captures/media")
      .then((res) => res.json())
      .then((data) => {
        setImages(data.images || [])
        setVideos(data.videos || [])
      })
      .catch((err) => console.error(err))
  }, [])

  return (
    <div className="min-h-screen bg-black text-white px-8 py-10">
      <h1 className="text-4xl font-bold mb-10">
        Captured Media
      </h1>

      {/* IMAGES BLOCK */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-3xl">📁</div>

          <h2 className="text-3xl font-bold text-blue-400">
            Images
          </h2>
        </div>

        {images.length === 0 ? (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-10 text-slate-400">
            No images captured yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {images.map((image) => (
              <div
                key={image.filename}
                className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-lg"
              >
                <img
                  src={image.url}
                  alt={image.filename}
                  className="w-full h-64 object-cover"
                />

                <div className="p-4">
                  <p className="text-sm text-slate-300 break-all">
                    {image.filename}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VIDEOS BLOCK */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="text-3xl">📁</div>

          <h2 className="text-3xl font-bold text-purple-400">
            Videos
          </h2>
        </div>

        {videos.length === 0 ? (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-10 text-slate-400">
            No videos recorded yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <div
                key={video.filename}
                className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-lg"
              >
                <video
                  src={video.url}
                  controls
                  className="w-full h-72 bg-black"
                />

                <div className="p-4">
                  <p className="text-sm text-slate-300 break-all">
                    {video.filename}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}