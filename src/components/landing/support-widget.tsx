'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Mail } from 'lucide-react'

const WA_LINK =
  'https://wa.me/244928053925?text=Ol%C3%A1%2C%20tenho%20interesse%20no%20CRM%20para%20WhatsApp'

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-7 w-7 text-white"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

export function SupportWidget() {
  const [hovered, setHovered] = useState(false)

  return (
    <>
      <style>{`
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
        }
        @keyframes popupSlide {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Popup card */}
        {hovered && (
          <div
            className="w-72 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/95 shadow-2xl backdrop-blur-sm"
            style={{ animation: 'popupSlide 0.2s cubic-bezier(0.16,1,0.3,1)' }}
          >
            {/* Green top accent */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #16a34a, #22c55e)' }} />

            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-3">
                Precisa de ajuda?
              </p>

              {/* Agent info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div
                    className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-green-500/40"
                    style={{ animation: 'pulse-green 2s ease-in-out infinite' }}
                  >
                    <Image
                      src="/support-avatar.png"
                      alt="Suporte Orgabot"
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {/* Online dot */}
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-slate-900" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Suporte Orgabot</p>
                  <p className="text-xs text-slate-400">Estamos disponíveis para te ajudar!</p>
                </div>
              </div>

              {/* WhatsApp button */}
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-green-500 hover:shadow-lg hover:shadow-green-500/25 active:scale-[0.98]"
              >
                <WhatsAppIcon />
                Falar no WhatsApp
              </a>

              {/* Email */}
              <div className="mt-3 flex items-center justify-center gap-1.5">
                <Mail className="h-3 w-3 text-slate-500" />
                <span className="text-xs text-slate-500">orgabot57@gmail.com</span>
              </div>
            </div>
          </div>
        )}

        {/* Main floating button */}
        <button
          type="button"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => window.open(WA_LINK, '_blank', 'noopener,noreferrer')}
          aria-label="Falar com suporte no WhatsApp"
          className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full transition-transform duration-200 hover:scale-110 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            boxShadow: '0 4px 24px rgba(34,197,94,0.4)',
            animation: 'pulse-green 2.5s ease-in-out infinite',
          }}
        >
          <Image
            src="/support-avatar.png"
            alt="Suporte"
            width={56}
            height={56}
            className="h-full w-full object-cover rounded-full"
          />
          {/* WhatsApp overlay icon on hover */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full bg-green-600/90 transition-opacity duration-200"
            style={{ opacity: hovered ? 1 : 0 }}
          >
            <WhatsAppIcon />
          </div>
        </button>
      </div>
    </>
  )
}
