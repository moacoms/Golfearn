'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type FormStatus = 'idle' | 'loading' | 'success' | 'error' | 'duplicate'

export default function PreRegistrationForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const supabase = createClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('pre_registrations')
        .insert({ email })

      if (error) {
        // 중복 이메일 체크 (unique constraint violation)
        if (error.code === '23505') {
          setStatus('duplicate')
        } else {
          setStatus('error')
          setErrorMessage(error.message)
        }
        return
      }

      setStatus('success')
      setEmail('')
    } catch (err) {
      setStatus('error')
      setErrorMessage('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white/20 rounded-lg p-6">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-xl font-semibold mb-2">사전예약 완료!</p>
          <p className="opacity-90">
            서비스 오픈 시 가장 먼저 알려드릴게요.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'duplicate') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white/20 rounded-lg p-6">
          <div className="text-4xl mb-3">👋</div>
          <p className="text-xl font-semibold mb-2">이미 등록된 이메일이에요!</p>
          <p className="opacity-90">
            오픈 소식을 기다려주세요.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-4 text-sm underline opacity-80 hover:opacity-100"
          >
            다른 이메일로 등록하기
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일을 입력하세요"
          className="input flex-1 text-foreground"
          required
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn bg-white text-primary hover:bg-gray-100 font-semibold px-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? '등록 중...' : '사전예약'}
        </button>
      </div>
      {status === 'error' && (
        <p className="mt-3 text-sm text-red-200">
          {errorMessage || '오류가 발생했습니다. 다시 시도해주세요.'}
        </p>
      )}
      <p className="mt-4 text-sm opacity-80">
        서비스 오픈 시 가장 먼저 알려드립니다. 스팸 없음, 약속!
      </p>
    </form>
  )
}
