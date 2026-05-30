export function Loader({ size = 20 }) {
  return (
    <div
      className="rounded-full border-2 border-bg-border border-t-accent animate-spin"
      style={{ width: size, height: size }}
    />
  )
}
