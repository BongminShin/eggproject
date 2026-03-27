import Link from 'next/link'
import SignupForm from './SignupForm'

export default function SignupPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="text-3xl">🥚</span>
          <span className="text-2xl font-bold text-egg-600">egg</span>
        </Link>
        <p className="text-warm-500 text-sm mt-2">Join your local community</p>
      </div>

      <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-6">
        <SignupForm />

        <p className="text-center text-sm text-warm-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-egg-600 font-medium hover:text-egg-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
