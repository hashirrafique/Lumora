export function MeshGradient() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Violet blob — top left */}
      <div
        className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full animate-float opacity-25 will-change-transform"
        style={{
          background: 'radial-gradient(circle at 40% 40%, #7C5CFF 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      {/* Cyan blob — bottom right */}
      <div
        className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full animate-float-slow opacity-20 will-change-transform"
        style={{
          background: 'radial-gradient(circle at 60% 60%, #22D3EE 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      {/* Pink blob — top right */}
      <div
        className="absolute -top-10 right-1/4 w-[300px] h-[300px] rounded-full animate-float-delay opacity-15 will-change-transform"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #EC4899 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />
      {/* Purple blob — bottom left */}
      <div
        className="absolute bottom-0 left-1/3 w-[350px] h-[350px] rounded-full opacity-15 will-change-transform"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #9333EA 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float 7s ease-in-out infinite 1.5s',
        }}
      />
    </div>
  )
}
