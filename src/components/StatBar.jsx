import { useEffect, useRef, useState } from 'react'

export default function StatBar({ label, percent }) {
  const barRef = useRef(null)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAnimated(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.5 }
    )

    if (barRef.current) observer.observe(barRef.current)

    return () => observer.disconnect()
  }, [])

  return (
    <li>
      {label}
      <div className="bar" ref={barRef}>
        <div
          className="bar-inner"
          style={{ width: animated ? `${percent}%` : '0%' }}
        >
          <div className="bar-gradient" />
        </div>
      </div>
    </li>
  )
}
