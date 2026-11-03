import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useId,
} from 'react'

export interface ElasticLetteringRef {
  pluck: (letterIndex?: number, strength?: number) => void
}

export interface ElasticLetteringProps {
  /**
   * The headline text. Newlines (\n) or natural wraps split into independent elastic bands.
   */
  text?: string
  children?: React.ReactNode
  /**
   * Element to render. Accessible for screen readers.
   * Default: "span"
   */
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  /**
   * Font size. Numbers are pixels; strings accept any CSS length.
   * If omitted, inherits from className or container.
   */
  fontSize?: number | string
  /**
   * Font weight. If omitted, inherits from className or container.
   */
  fontWeight?: number
  /**
   * Letter spacing as a CSS length. If omitted, inherits from className or container.
   */
  letterSpacing?: string
  /**
   * Line height for wrapped headlines. If omitted, inherits from className or container.
   */
  lineHeight?: number
  /**
   * Text alignment: "left" | "center" | "right". Default: "center"
   */
  align?: 'left' | 'center' | 'right'
  /**
   * Text colour. Leave unset to inherit from the page.
   */
  color?: string
  /**
   * Colour the letters warm toward while the band is stretched.
   * Default: "#B15CFF"
   */
  tensionColor?: string
  /**
   * How far stretched letters shift toward tensionColor, from 0 to 1.
   * Default: 0.8
   */
  tensionTint?: number
  /**
   * How strongly neighbours follow a pulled letter, from 0 to 1.
   * Default: 0.6
   */
  tension?: number
  /**
   * How hard letters spring back home, from 0.2 to 4.
   * Default: 1
   */
  stiffness?: number
  /**
   * How much the line wobbles as it settles, from 0 to 1.
   * Default: 0.62
   */
  bounce?: number
  /**
   * Distance in em a letter follows the pointer freely.
   * Default: 4
   */
  reach?: number
  /**
   * How much fast-moving letters stretch along their motion, from 0 to 1.
   * Default: 0.5
   */
  squash?: number
  /**
   * How much letters lean to follow the curve of the band, from 0 to 1.
   * Default: 0.5
   */
  tilt?: number
  /**
   * How much a held letter grows as it is picked up, from 0 to 1.
   * Default: 0.5
   */
  lift?: number
  /**
   * Releasing mid-swipe flings the letter with the pointer's speed.
   * Default: true
   */
  throwable?: boolean
  /**
   * Clicking a letter without dragging plucks it, sending a ripple along the line.
   * Default: true
   */
  pluckOnClick?: boolean
  /**
   * Strength of a pluck, from 0 to 3. Default: 1
   */
  pluckStrength?: number
  /**
   * Gently tug one letter the first time the headline scrolls into view.
   * Default: false
   */
  hint?: boolean
  /**
   * Allow letters to be grabbed. Reduced-motion users can still drag, without wobble or flings.
   * Default: true
   */
  interactive?: boolean
  /**
   * Optional custom color for periods / punctuation if desired.
   */
  dotColor?: string
  /**
   * Classes for the root element.
   */
  className?: string
  /**
   * Optional inline styles.
   */
  style?: React.CSSProperties
}

interface LetterPhysics {
  x: number
  y: number
  vx: number
  vy: number
  targetX: number
  targetY: number
  baseColor: string
}

interface LineState {
  letters: LetterPhysics[]
  activePointerId: number | null
  grabbedIndex: number | null
  dragStartX: number
  dragStartY: number
  pointerHistory: { x: number; y: number; time: number }[]
  isDragging: boolean
  hasSettled: boolean
  lastPluckTime: number
}

// Color parsing & interpolation helper
function parseHexOrRgb(colorStr: string): [number, number, number] {
  if (!colorStr) return [17, 24, 39]
  if (colorStr.startsWith('#')) {
    let hex = colorStr.slice(1)
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('')
    }
    const num = parseInt(hex, 16)
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
  }
  const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
  if (rgbMatch) {
    return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])]
  }
  return [17, 24, 39]
}

function lerpColor(c1: [number, number, number], c2: [number, number, number], t: number): string {
  const clampT = Math.max(0, Math.min(1, t))
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * clampT)
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * clampT)
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * clampT)
  return `rgb(${r}, ${g}, ${b})`
}

function createLineState(line: string, color?: string, dotColor?: string): LineState {
  const lettersCount = line.length
  const letters: LetterPhysics[] = Array.from({ length: lettersCount }, (_, i) => {
    const char = line[i]
    const isPeriod = char === '.' && !!dotColor
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      targetX: 0,
      targetY: 0,
      baseColor: isPeriod ? dotColor : color || '',
    }
  })

  return {
    letters,
    activePointerId: null,
    grabbedIndex: null,
    dragStartX: 0,
    dragStartY: 0,
    pointerHistory: [],
    isDragging: false,
    hasSettled: true,
    lastPluckTime: 0,
  }
}

export const ElasticLettering = forwardRef<ElasticLetteringRef, ElasticLetteringProps>(
  (
    {
      text,
      children,
      as: Component = 'span',
      fontSize,
      fontWeight,
      letterSpacing,
      lineHeight,
      align = 'center',
      color,
      tensionColor = '#b91c1c',
      tensionTint = 0.8,
      tension = 0.6,
      stiffness = 1,
      bounce = 0.62,
      reach = 4,
      squash = 0.5,
      tilt = 0.5,
      lift = 0.5,
      throwable = true,
      pluckOnClick = true,
      pluckStrength = 1,
      hint = false,
      interactive = true,
      dotColor,
      className = '',
      style = {},
    },
    ref
  ) => {
    const rawText = text || (typeof children === 'string' ? children : '')
    const lines = React.useMemo(() => rawText.split('\n'), [rawText])
    const containerRef = useRef<HTMLElement | null>(null)
    const domRefs = useRef<(HTMLSpanElement | null)[][]>([])
    const linesStateRef = useRef<LineState[]>([])
    const rafIdRef = useRef<number | null>(null)
    const isLoopRunningRef = useRef<boolean>(false)
    const hintTriggeredRef = useRef<boolean>(false)
    const parsedTensionColor = useRef<[number, number, number]>(parseHexOrRgb(tensionColor))

    useEffect(() => {
      parsedTensionColor.current = parseHexOrRgb(tensionColor)
    }, [tensionColor])

    // Synchronously initialize physics state so it is ALWAYS available on render #1
    if (linesStateRef.current.length !== lines.length) {
      linesStateRef.current = lines.map((line) => createLineState(line, color, dotColor))
    }

    // Keep base colors in sync if props change
    useEffect(() => {
      linesStateRef.current = lines.map((line) => createLineState(line, color, dotColor))
    }, [lines, color, dotColor])

    // Core zero-lag physics step executed inside requestAnimationFrame
    const updatePhysics = useCallback(() => {
      let anyActive = false
      const dt = 1 / 60
      const springK = Math.max(80, stiffness * 340)
      const dampingC = Math.max(8, 2 * Math.sqrt(springK) * (1 - bounce * 0.72))
      const tensionCoupling = tension * 0.32

      const rootEl = containerRef.current
      const computedFontSize = rootEl
        ? parseFloat(window.getComputedStyle(rootEl).fontSize) || 48
        : 48
      const maxReachPx = reach * computedFontSize

      linesStateRef.current.forEach((lineState, lineIdx) => {
        const { letters, isDragging, grabbedIndex } = lineState
        const n = letters.length

        // Integrate letter motion
        for (let i = 0; i < n; i++) {
          const l = letters[i]
          const el = domRefs.current[lineIdx]?.[i]
          if (!el) continue

          const isGrabbed = isDragging && grabbedIndex === i

          if (isGrabbed) {
            // Grabbed letter tracks target directly with high responsiveness
            const dx = l.targetX - l.x
            const dy = l.targetY - l.y
            l.vx = dx * 28
            l.vy = dy * 28
            l.x += l.vx * dt
            l.y += l.vy * dt
            anyActive = true
          } else {
            // Spring force towards rest / target
            const fx = -springK * (l.x - l.targetX) - dampingC * l.vx
            const fy = -springK * (l.y - l.targetY) - dampingC * l.vy

            // Wave coupling to neighbours (creates elastic band & ripple wave)
            let neighborCouplingX = 0
            let neighborCouplingY = 0

            if (i > 0) {
              neighborCouplingX += (letters[i - 1].x - l.x) * tensionCoupling
              neighborCouplingY += (letters[i - 1].y - l.y) * tensionCoupling
            }
            if (i < n - 1) {
              neighborCouplingX += (letters[i + 1].x - l.x) * tensionCoupling
              neighborCouplingY += (letters[i + 1].y - l.y) * tensionCoupling
            }

            l.vx += (fx + neighborCouplingX * springK * 0.4) * dt
            l.vy += (fy + neighborCouplingY * springK * 0.4) * dt

            l.x += l.vx * dt
            l.y += l.vy * dt

            const speed = Math.hypot(l.vx, l.vy)
            const dist = Math.hypot(l.x, l.y)

            if (dist > 0.05 || speed > 0.1 || isDragging) {
              anyActive = true
            } else if (!isDragging) {
              l.x = 0
              l.y = 0
              l.vx = 0
              l.vy = 0
            }
          }

          // Tilt calculation based on neighbor slopes
          let tiltDeg = 0
          if (tilt > 0) {
            const prevY = i > 0 ? letters[i - 1].y : l.y
            const nextY = i < n - 1 ? letters[i + 1].y : l.y
            const slope = (nextY - prevY) / Math.max(20, computedFontSize * 0.8)
            tiltDeg = Math.max(-35, Math.min(35, Math.atan(slope) * (180 / Math.PI) * tilt))
          }

          // Lift calculation
          let scale = 1
          if (isGrabbed && lift > 0) {
            const pullDist = Math.hypot(l.x, l.y)
            const liftRatio = Math.min(1, pullDist / (computedFontSize * 1.5))
            scale = 1 + lift * 0.3 * liftRatio
          }

          // Squash / stretch calculation
          if (squash > 0 && !isGrabbed) {
            const speed = Math.hypot(l.vx, l.vy)
            if (speed > 100) {
              const stretch = Math.min(0.4, (speed / 1800) * squash)
              scale *= 1 + stretch * 0.5
            }
          }

          // Direct DOM transform (zero React reconciliation overhead)
          const transformStr = `translate3d(${l.x.toFixed(2)}px, ${l.y.toFixed(2)}px, 0) rotate(${tiltDeg.toFixed(2)}deg) scale(${scale.toFixed(3)})`
          if (el.style.transform !== transformStr) {
            el.style.transform = transformStr
          }

          // Tension color shift
          if (tensionTint > 0) {
            const dist = Math.hypot(l.x, l.y)
            const stretchRatio = Math.min(1, dist / (maxReachPx * 0.6)) * tensionTint
            if (stretchRatio > 0.01) {
              const baseRgb = parseHexOrRgb(l.baseColor || '#111827')
              const tinted = lerpColor(baseRgb, parsedTensionColor.current, stretchRatio)
              if (el.style.color !== tinted) {
                el.style.color = tinted
              }
            } else if (l.baseColor) {
              if (el.style.color !== l.baseColor) {
                el.style.color = l.baseColor
              }
            } else if (el.style.color !== '') {
              el.style.color = ''
            }
          }
        }
      })

      if (anyActive) {
        rafIdRef.current = requestAnimationFrame(updatePhysics)
      } else {
        isLoopRunningRef.current = false
        rafIdRef.current = null
      }
    }, [bounce, lift, reach, squash, stiffness, tension, tensionTint, tilt])

    const startPhysicsLoop = useCallback(() => {
      if (!isLoopRunningRef.current) {
        isLoopRunningRef.current = true
        rafIdRef.current = requestAnimationFrame(updatePhysics)
      }
    }, [updatePhysics])

    // Pluck helper function: sends transverse wave ripple
    const pluckLine = useCallback(
      (lineIdx: number, letterIdx?: number, strength = 1) => {
        const lineState = linesStateRef.current[lineIdx]
        if (!lineState) return
        const n = lineState.letters.length
        if (n === 0) return

        const targetIndex =
          typeof letterIdx === 'number' && letterIdx >= 0 && letterIdx < n
            ? letterIdx
            : Math.floor(n / 2)

        const rootEl = containerRef.current
        const computedFontSize = rootEl
          ? parseFloat(window.getComputedStyle(rootEl).fontSize) || 48
          : 48

        const effectiveStrength = Math.min(3, Math.max(0.1, strength * pluckStrength))
        const impulse = computedFontSize * 2.2 * effectiveStrength

        // Direct velocity impulse creating transverse wave
        lineState.letters[targetIndex].vy = -impulse
        if (targetIndex > 0) {
          lineState.letters[targetIndex - 1].vy = -impulse * 0.5
        }
        if (targetIndex < n - 1) {
          lineState.letters[targetIndex + 1].vy = -impulse * 0.5
        }

        lineState.lastPluckTime = performance.now()
        startPhysicsLoop()
      },
      [pluckStrength, startPhysicsLoop]
    )

    // Expose ref API
    useImperativeHandle(
      ref,
      () => ({
        pluck: (letterIndex?: number, strength?: number) => {
          pluckLine(0, letterIndex, strength)
        },
      }),
      [pluckLine]
    )

    // Pointer event handlers with setPointerCapture
    const handlePointerDown = (
      e: React.PointerEvent<HTMLSpanElement>,
      lineIdx: number,
      charIdx: number
    ) => {
      if (!interactive) return
      const lineState = linesStateRef.current[lineIdx]
      if (!lineState) return

      const target = e.currentTarget
      try {
        target.setPointerCapture(e.pointerId)
      } catch {
        // fallback
      }

      lineState.activePointerId = e.pointerId
      lineState.grabbedIndex = charIdx
      lineState.dragStartX = e.clientX
      lineState.dragStartY = e.clientY
      lineState.isDragging = true
      lineState.pointerHistory = [{ x: e.clientX, y: e.clientY, time: performance.now() }]

      startPhysicsLoop()
    }

    const handlePointerMove = (
      e: React.PointerEvent<HTMLSpanElement>,
      lineIdx: number
    ) => {
      const lineState = linesStateRef.current[lineIdx]
      if (!lineState || !lineState.isDragging || lineState.activePointerId !== e.pointerId) {
        return
      }

      const dxRaw = e.clientX - lineState.dragStartX
      const dyRaw = e.clientY - lineState.dragStartY
      const rawDist = Math.hypot(dxRaw, dyRaw)

      const rootEl = containerRef.current
      const computedFontSize = rootEl
        ? parseFloat(window.getComputedStyle(rootEl).fontSize) || 48
        : 48
      const maxReachPx = reach * computedFontSize

      // Logarithmic resistance when exceeding free reach
      let effectiveDist = rawDist
      if (rawDist > maxReachPx) {
        const excess = rawDist - maxReachPx
        effectiveDist = maxReachPx + Math.pow(excess, 0.72) * 2.2
      }

      const ratio = rawDist > 0 ? effectiveDist / rawDist : 0
      const targetX = dxRaw * ratio
      const targetY = dyRaw * ratio

      const grabbed = lineState.grabbedIndex ?? 0
      const n = lineState.letters.length

      // Set target for grabbed letter and spread catenary tension to neighbours
      lineState.letters.forEach((l, i) => {
        if (i === grabbed) {
          l.targetX = targetX
          l.targetY = targetY
        } else {
          const distFromGrabbed = Math.abs(i - grabbed)
          // Exponential catenary falloff based on tension
          const spreadWidth = 1 + tension * (n * 0.45)
          const influence = Math.exp(-Math.pow(distFromGrabbed / spreadWidth, 2)) * tension
          l.targetX = targetX * influence
          l.targetY = targetY * influence
        }
      })

      // Record rolling velocity history (last 100ms)
      const now = performance.now()
      lineState.pointerHistory.push({ x: e.clientX, y: e.clientY, time: now })
      lineState.pointerHistory = lineState.pointerHistory.filter((p) => now - p.time < 120)

      startPhysicsLoop()
    }

    const handlePointerUp = (
      e: React.PointerEvent<HTMLSpanElement>,
      lineIdx: number
    ) => {
      const lineState = linesStateRef.current[lineIdx]
      if (!lineState || lineState.activePointerId !== e.pointerId) return

      const wasDragging = lineState.isDragging
      const grabbed = lineState.grabbedIndex

      lineState.isDragging = false
      lineState.activePointerId = null
      lineState.grabbedIndex = null

      // Clear targets back to origin
      lineState.letters.forEach((l) => {
        l.targetX = 0
        l.targetY = 0
      })

      // Fling velocity calculation
      if (throwable && wasDragging && grabbed !== null && lineState.pointerHistory.length >= 2) {
        const history = lineState.pointerHistory
        const first = history[0]
        const last = history[history.length - 1]
        const dtMs = last.time - first.time

        if (dtMs > 10) {
          const vx = ((last.x - first.x) / dtMs) * 1000
          const vy = ((last.y - first.y) / dtMs) * 1000
          const flingSpeed = Math.hypot(vx, vy)

          if (flingSpeed > 180) {
            const maxFling = 2200
            const clampedVx = Math.max(-maxFling, Math.min(maxFling, vx * 0.75))
            const clampedVy = Math.max(-maxFling, Math.min(maxFling, vy * 0.75))

            lineState.letters[grabbed].vx = clampedVx
            lineState.letters[grabbed].vy = clampedVy

            // Spread fling impulse to neighbours
            if (grabbed > 0) lineState.letters[grabbed - 1].vy = clampedVy * 0.4
            if (grabbed < lineState.letters.length - 1)
              lineState.letters[grabbed + 1].vy = clampedVy * 0.4
          }
        }
      }

      // Pluck on quick click without movement
      const dragDist = Math.hypot(
        e.clientX - lineState.dragStartX,
        e.clientY - lineState.dragStartY
      )
      if (pluckOnClick && dragDist < 6 && grabbed !== null) {
        pluckLine(lineIdx, grabbed, 1)
      }

      startPhysicsLoop()
    }

    // Hint animation: gently tug letter on initial load once visible, or on scroll into view
    useEffect(() => {
      if (!hint || hintTriggeredRef.current) return

      let timeoutId: number | null = null

      const triggerHint = () => {
        if (hintTriggeredRef.current) return
        hintTriggeredRef.current = true
        // Wait 800ms for parent entrance fade-in (motion.div transition 0.6s + delay 0.1s)
        timeoutId = window.setTimeout(() => {
          pluckLine(0, undefined, 0.9)
        }, 850)
      }

      // Check if already in viewport on mount (e.g. Hero section at top of page)
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const isAlreadyVisible =
          rect.top < window.innerHeight && rect.bottom > 0 && rect.width > 0 && rect.height > 0
        if (isAlreadyVisible) {
          triggerHint()
          return () => {
            if (timeoutId) clearTimeout(timeoutId)
          }
        }
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hintTriggeredRef.current) {
              triggerHint()
              observer.disconnect()
            }
          })
        },
        { threshold: 0.1 }
      )

      if (containerRef.current) {
        observer.observe(containerRef.current)
      }

      return () => {
        if (timeoutId) clearTimeout(timeoutId)
        observer.disconnect()
      }
    }, [hint, pluckLine])

    // Cleanup RAF on unmount
    useEffect(() => {
      return () => {
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current)
        }
      }
    }, [])

    const alignClass =
      align === 'left'
        ? 'text-left items-start'
        : align === 'right'
        ? 'text-right items-end'
        : 'text-center items-center'

    const id = useId()

    const inlineStyles: React.CSSProperties = {
      ...(fontSize !== undefined ? { fontSize } : {}),
      ...(fontWeight !== undefined ? { fontWeight } : {}),
      ...(letterSpacing !== undefined ? { letterSpacing } : {}),
      ...(lineHeight !== undefined ? { lineHeight } : {}),
      ...(color ? { color } : {}),
      ...style,
    }

    return (
      <Component
        ref={(node: HTMLElement | null) => {
          containerRef.current = node
        }}
        className={`elastic-lettering-root select-none inline-flex flex-col ${alignClass} ${className}`}
        style={inlineStyles}
        aria-label={rawText}
      >
        <span className="sr-only">{rawText}</span>
        {lines.map((line, lineIdx) => (
          <span
            key={`${id}-line-${lineIdx}`}
            className="elastic-line relative block whitespace-nowrap cursor-grab active:cursor-grabbing"
            style={{
              touchAction: 'none',
              transformStyle: 'preserve-3d',
            }}
            onPointerMove={(e) => handlePointerMove(e, lineIdx)}
            onPointerUp={(e) => handlePointerUp(e, lineIdx)}
            onPointerCancel={(e) => handlePointerUp(e, lineIdx)}
          >
            {line.split('').map((char, charIdx) => {
              const isPeriod = char === '.' && !!dotColor
              return (
                <span
                  key={`${id}-char-${lineIdx}-${charIdx}`}
                  ref={(el) => {
                    if (!domRefs.current[lineIdx]) {
                      domRefs.current[lineIdx] = []
                    }
                    domRefs.current[lineIdx][charIdx] = el
                  }}
                  onPointerDown={(e) => handlePointerDown(e, lineIdx, charIdx)}
                  aria-hidden="true"
                  className="elastic-char inline-block will-change-transform transform-gpu transition-colors duration-75"
                  style={{
                    color: isPeriod ? dotColor : undefined,
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              )
            })}
          </span>
        ))}
      </Component>
    )
  }
)

ElasticLettering.displayName = 'ElasticLettering'
export default ElasticLettering
