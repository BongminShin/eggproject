import Link from 'next/link'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="text-3xl">🥚</span>
          <span className="text-2xl font-bold text-egg-600">egg</span>
        </Link>
        <p className="text-warm-500 text-sm mt-2">Welcome back</p>
      </div>

      <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-6">
        <LoginForm />

        <p className="text-center text-sm text-warm-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-egg-600 font-medium hover:text-egg-700">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
