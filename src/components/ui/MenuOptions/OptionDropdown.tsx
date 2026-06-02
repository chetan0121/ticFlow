import { useId, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import type { DropDownOptions } from '../../../hooks/useGameSetupOptions'

// Fallback copy when callers do not provide overrides.
const DEFAULT_TEXT = {
  modalTitle: 'Select Option',
  listboxLabel: 'Options',
}

// Simple guard for non-empty optional strings.
const hasText = (value?: string) => Boolean(value && value.trim().length > 0)

function OptionDropdown({ selection, text }: DropDownOptions) {
  const buttonId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const { options, currentOption, selectOption } = selection

  const listboxLabel = text.listboxLabel ?? text.label ?? DEFAULT_TEXT.listboxLabel
  const modalTitle = text.modalTitle ?? DEFAULT_TEXT.modalTitle

  // Pick the current option, or fall back to the first option for display.
  const selectedOption = useMemo(
    () => options.find(option => option.value === currentOption) ?? options[0],
    [currentOption, options]
  )

  if (!selectedOption) return null

  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen(open => !open)

  const chooseOption = (value: (typeof selectedOption)['value']) => {
    selectOption(value)
    close()
  }

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/20">
      {hasText(text.label) ? (
        <span className="block text-left font-['Montserrat'] text-sm font-medium tracking-[0.28em] text-white/55 uppercase">
          {text.label}
        </span>
      ) : null}
      {hasText(text.helper) ? (
        <p className="mt-2 text-left text-sm text-white/55">{text.helper}</p>
      ) : null}

      <div className="relative mt-3">
        <button
          id={buttonId}
          type="button"
          onClick={toggle}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[hsl(38,95%,54%)]/35 bg-linear-to-b from-[#FFE8B2]/35 to-[#FFC878]/35 px-4 py-3.5 text-left font-['Montserrat'] text-base text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-200 hover:border-[hsl(38,95%,54%)]/65 hover:from-[#FFD68A]/[0.28] hover:to-[#FFB05C]/16 hover:shadow-[0_12px_32px_hsl(38,95%,54%)/25] focus-visible:ring-2 focus-visible:ring-[hsl(38,95%,54%)]/35 focus-visible:outline-none"
        >
          <span className="flex min-w-0 flex-col">
            <span className="flex items-center gap-2 truncate font-medium text-white">
              {selectedOption.logo ? (
                <span className="inline-flex h-5 w-5 items-center justify-center text-[hsl(38,95%,72%)] [&>svg]:h-5 [&>svg]:w-5">
                  {selectedOption.logo}
                </span>
              ) : null}
              <span className="truncate">{selectedOption.label}</span>
            </span>
            {hasText(selectedOption.description) ? (
              <span className="truncate text-sm text-white/55">
                {selectedOption.description}
              </span>
            ) : null}
          </span>
          <ChevronDown
            size={18}
            strokeWidth={2.5}
            className={`shrink-0 text-white/70 transition-transform duration-300 ${
              isOpen ? 'rotate-180 text-[hsl(38,95%,68%)]' : ''
            }`}
          />
        </button>

        {isOpen &&
          createPortal(
            // Portal keeps the modal overlay above everything else.
            <div
              className="fixed inset-0 z-50 bg-black/55 px-4 py-6 backdrop-blur-[2px]"
              onClick={close}
              onKeyDown={event => {
                // Allow closing with Escape when the overlay is focused.
                if (event.key === 'Escape') close()
              }}
            >
              <div className="flex h-full items-center justify-center">
                <div
                  className="w-full max-w-md overflow-hidden rounded-2xl border border-white/12 bg-linear-to-b from-[#22160D]/98 to-[#0C0805]/98 shadow-[0_24px_70px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
                  // Prevent inner clicks from closing the overlay.
                  onClick={event => event.stopPropagation()}
                >
                  <div className="px-4 py-4">
                    <div className="relative max-h-[calc(100vh-10rem)] overflow-y-auto px-1 py-1">
                      <p className="px-3 pb-2 text-xs tracking-[0.35em] text-white/40 uppercase">
                        {modalTitle}
                      </p>
                      <div role="listbox" aria-label={listboxLabel} className="space-y-2">
                        {/* Render the available options in the modal list. */}
                        {options.map(option => {
                          const isSelected = option.value === currentOption

                          return (
                            <button
                              key={String(option.value)}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => chooseOption(option.value)}
                              className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                                isSelected
                                  ? 'border-[hsl(38,95%,60%)]/60 bg-linear-to-b from-[#FFD68A]/16 to-[#FFC36E]/8'
                                  : 'border-white/10 bg-white/5 hover:border-[hsl(38,95%,54%)]/40 hover:bg-white/10'
                              }`}
                            >
                              <span className="min-w-0">
                                <span className="flex items-center gap-2 truncate font-['Montserrat'] text-base text-white">
                                  {option.logo ? (
                                    <span className="inline-flex h-5 w-5 items-center justify-center text-[hsl(38,95%,72%)] [&>svg]:h-5 [&>svg]:w-5">
                                      {option.logo}
                                    </span>
                                  ) : null}
                                  <span className="truncate">{option.label}</span>
                                </span>
                                {hasText(option.description) ? (
                                  <span className="block truncate text-sm text-white/52">
                                    {option.description}
                                  </span>
                                ) : null}
                              </span>

                              <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                                  isSelected
                                    ? 'border-[hsl(38,95%,65%)] bg-[hsl(38,95%,54%)]/20 text-[hsl(38,95%,68%)]'
                                    : 'border-white/10 bg-white/5 text-white/35'
                                }`}
                              >
                                {isSelected ? <Check size={14} strokeWidth={3} /> : null}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
    </div>
  )
}

export default OptionDropdown
