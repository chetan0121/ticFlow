import { useId, useMemo, useRef } from 'react'
import type { KeyboardEvent, ReactNode, RefObject } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import type { DropDownOptions } from '../../../hooks/useGameSetupOptions'
import { useClickOutsideClose } from '../../../hooks/useClickOutsideClose'

const DEFAULT_TEXT = {
  modalTitle: 'Select Option',
  listboxLabel: 'Options',
}

const hasText = (value?: string) => Boolean(value && value.trim().length > 0)

type OptionItemType = DropDownOptions['selection']['options'][number]

interface TriggerButtonProps {
  buttonRef: RefObject<HTMLButtonElement | null>
  controlsId: string
  id: string
  isOpen: boolean
  onClick: () => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
  option: OptionItemType
}

function OptionIcon({
  children,
  selected = false,
}: {
  children: ReactNode
  selected?: boolean
}) {
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-200 [&>svg]:h-4.5 [&>svg]:w-4.5 ${
        selected
          ? 'border-amber-300/35 bg-amber-300/15 text-amber-200'
          : 'border-white/10 bg-white/6 text-amber-100/75'
      }`}
    >
      {children}
    </span>
  )
}

function TriggerButton({
  buttonRef,
  controlsId,
  id,
  isOpen,
  onClick,
  onKeyDown,
  option,
}: TriggerButtonProps) {
  return (
    <button
      ref={buttonRef}
      id={id}
      type="button"
      aria-controls={controlsId}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-amber-300/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#21150d] focus-visible:outline-none ${
        isOpen
          ? 'border-amber-300/55 bg-amber-200/[0.14] shadow-[0_14px_34px_rgba(0,0,0,0.3)]'
          : 'border-amber-100/20 bg-white/7.5 hover:border-amber-200/45 hover:bg-amber-100/11'
      }`}
    >
      {option.logo ? <OptionIcon selected={isOpen}>{option.logo}</OptionIcon> : null}

      <span className="min-w-0 flex-1">
        <span className="block truncate font-['Montserrat'] text-sm font-semibold text-white sm:text-[15px]">
          {option.label}
        </span>
        {hasText(option.description) ? (
          <span className="mt-0.5 block truncate text-xs leading-5 text-white/50">
            {option.description}
          </span>
        ) : null}
      </span>

      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
          isOpen
            ? 'rotate-180 border-amber-200/35 bg-amber-200/15 text-amber-100'
            : 'border-white/10 bg-black/10 text-white/60 group-hover:border-amber-100/25 group-hover:text-amber-100'
        }`}
      >
        <ChevronDown size={16} strokeWidth={2.5} />
      </span>
    </button>
  )
}

interface OptionRowProps {
  buttonRef: (node: HTMLButtonElement | null) => void
  index: number
  isSelected: boolean
  onClick: () => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, index: number) => void
  option: OptionItemType
}

function OptionRow({
  buttonRef,
  index,
  isSelected,
  onClick,
  onKeyDown,
  option,
}: OptionRowProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      role="option"
      aria-selected={isSelected}
      tabIndex={-1}
      onClick={onClick}
      onKeyDown={event => onKeyDown(event, index)}
      className={`group flex w-full items-center gap-3 rounded-xl border px-2.5 py-2.5 text-left transition-all duration-200 focus-visible:outline-none ${
        isSelected
          ? 'border-amber-300/35 bg-amber-200/13 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
          : 'border-transparent bg-transparent hover:border-white/10 hover:bg-white/6 focus-visible:border-amber-200/35 focus-visible:bg-white/6'
      }`}
    >
      {option.logo ? <OptionIcon selected={isSelected}>{option.logo}</OptionIcon> : null}

      <span className="min-w-0 flex-1">
        <span
          className={`block font-['Montserrat'] text-sm font-semibold ${
            isSelected ? 'text-amber-100' : 'text-white/85'
          }`}
        >
          {option.label}
        </span>
        {hasText(option.description) ? (
          <span className="mt-0.5 block text-xs leading-5 text-white/45">
            {option.description}
          </span>
        ) : null}
      </span>

      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
          isSelected
            ? 'border-amber-300/55 bg-amber-300/20 text-amber-100'
            : 'border-white/10 bg-white/[0.035] text-transparent group-hover:border-white/20'
        }`}
      >
        <Check size={13} strokeWidth={3} />
      </span>
    </button>
  )
}

function OptionDropdown({ selection, text }: DropDownOptions) {
  const buttonId = useId()
  const listboxId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const { ref, isOpen, toggle, close, open } = useClickOutsideClose()
  const { options, currentOption, selectOption } = selection

  const selectedIndex = Math.max(
    options.findIndex(option => option.value === currentOption),
    0
  )
  const selectedOption = useMemo(
    () => options.find(option => option.value === currentOption) ?? options[0],
    [currentOption, options]
  )

  if (!selectedOption) return null

  const focusOption = (index: number) => optionRefs.current[index]?.focus()
  const openAndFocus = (index: number) => {
    open()
    requestAnimationFrame(() => focusOption(index))
  }
  const chooseOption = (value: (typeof selectedOption)['value']) => {
    selectOption(value)
    close()
    requestAnimationFrame(() => buttonRef.current?.focus())
  }
  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      openAndFocus(selectedIndex)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      openAndFocus(options.length - 1)
    }
  }
  const handleOptionKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusOption((index + 1) % options.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusOption((index - 1 + options.length) % options.length)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusOption(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusOption(options.length - 1)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      close()
      buttonRef.current?.focus()
    }
  }

  return (
    <section
      className={`relative w-full rounded-2xl border p-4 transition-colors duration-300 ${
        isOpen ? 'z-30 border-amber-100/20 bg-black/30' : 'border-white/10 bg-white/5.5'
      }`}
    >
      <div className="mb-3">
        {hasText(text.label) ? (
          <span className="block text-left font-['Montserrat'] text-xs font-semibold tracking-[0.25em] text-amber-100/70 uppercase">
            {text.label}
          </span>
        ) : null}
        {hasText(text.helper) ? (
          <p className="mt-1.5 text-left text-sm leading-5 text-white/50">{text.helper}</p>
        ) : null}
      </div>

      <div className="relative" ref={ref}>
        <TriggerButton
          buttonRef={buttonRef}
          controlsId={listboxId}
          id={buttonId}
          isOpen={isOpen}
          onClick={toggle}
          onKeyDown={handleTriggerKeyDown}
          option={selectedOption}
        />

        <div
          className={`absolute top-full right-0 left-0 z-40 mt-2 origin-top overflow-hidden rounded-2xl border bg-[#21150d]/95 shadow-[0_24px_50px_rgba(0,0,0,0.42)] backdrop-blur-2xl transition-all duration-300 ${
            isOpen
              ? 'visible translate-y-0 scale-100 border-amber-100/20 opacity-100'
              : 'invisible -translate-y-2 scale-[0.98] border-transparent opacity-0'
          }`}
        >
          <div className="border-b border-white/[0.07] px-3 py-2.5">
            <p className="font-['Montserrat'] text-[10px] font-semibold tracking-[0.28em] text-amber-100/55 uppercase">
              {text.modalTitle ?? DEFAULT_TEXT.modalTitle}
            </p>
          </div>

          <div
            id={listboxId}
            role="listbox"
            aria-label={text.listboxLabel ?? DEFAULT_TEXT.listboxLabel}
            aria-labelledby={buttonId}
            className="max-h-64 space-y-1 overflow-y-auto p-2"
          >
            {options.map((option, index) => (
              <OptionRow
                key={String(option.value)}
                buttonRef={node => {
                  optionRefs.current[index] = node
                }}
                index={index}
                isSelected={option.value === currentOption}
                onClick={() => chooseOption(option.value)}
                onKeyDown={handleOptionKeyDown}
                option={option}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default OptionDropdown
