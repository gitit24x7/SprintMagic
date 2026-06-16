import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

// Keeps a runtime crash from showing a blank white screen. Reassures the user
// their board is safe (it's in localStorage) and offers a reload.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('SprintMagic crashed:', error)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-fuchsia-500 text-xl font-bold text-white">
          S
        </span>
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">
            Something went wrong
          </h1>
          <p className="mx-auto mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-ink-soft">
            Your board is safe — it’s saved in this browser. Reloading usually
            fixes it.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-zinc-700"
        >
          Reload SprintMagic
        </button>
      </div>
    )
  }
}
