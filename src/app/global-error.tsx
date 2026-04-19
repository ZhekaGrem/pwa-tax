'use client'
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main style={{ padding: 24 }}>
          <h1>Critical error</h1>
          <p>{error.message}</p>
          <button onClick={reset}>Reload</button>
        </main>
      </body>
    </html>
  )
}
