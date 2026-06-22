import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-lg mb-6">Page not found.</p>
      <Link to="/" className="text-blue-500 underline">
        Go back home
      </Link>
    </div>
  )
}