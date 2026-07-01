import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') ?? 'LUMORA'
  const price = searchParams.get('price') ?? ''
  const brand = searchParams.get('brand') ?? ''
  const image = searchParams.get('image') ?? ''

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: 'linear-gradient(135deg, #0d0d12 0%, #16101e 60%, #0e1520 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,92,255,0.25) 0%, transparent 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -80,
          right: 100,
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Product image */}
      {image && (
        <div
          style={{
            position: 'absolute',
            right: 60,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 400,
            height: 400,
            borderRadius: 24,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Text content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
          maxWidth: image ? 600 : 1100,
        }}
      >
        {/* Brand badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #7C5CFF, #00D4FF)',
              borderRadius: 8,
              padding: '4px 14px',
              fontSize: 14,
              fontWeight: 700,
              color: 'white',
              letterSpacing: 2,
            }}
          >
            LUMORA
          </div>
          {brand && (
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>· {brand}</span>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 40 ? 44 : 56,
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          {title}
        </div>

        {/* Price */}
        {price && (
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #7C5CFF, #00D4FF)',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            ${price}
          </div>
        )}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  )
}
