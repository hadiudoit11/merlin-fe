import { useState } from 'react';

export default function TypequestBrandGuidelines() {
  const [copiedColor, setCopiedColor] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(id);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const colors = {
    primary: [
      { name: 'Coral', hex: '#ff6b6b', rgb: '255, 107, 107', usage: 'Primary brand color, CTAs, highlights' },
      { name: 'Coral Dark', hex: '#e85555', rgb: '232, 85, 85', usage: 'Hover states, emphasis' },
      { name: 'Coral Light', hex: '#ff8e8e', rgb: '255, 142, 142', usage: 'Backgrounds, accents' },
    ],
    secondary: [
      { name: 'Teal', hex: '#4ecdc4', rgb: '78, 205, 196', usage: 'Success states, progress, navigation' },
      { name: 'Yellow', hex: '#ffe66d', rgb: '255, 230, 109', usage: 'Warnings, achievements, highlights' },
      { name: 'Mint', hex: '#95e1d3', rgb: '149, 225, 211', usage: 'Subtle accents, backgrounds' },
    ],
    neutral: [
      { name: 'Charcoal', hex: '#2d2d2d', rgb: '45, 45, 45', usage: 'Primary text, dark backgrounds' },
      { name: 'Gray 700', hex: '#4a4a4a', rgb: '74, 74, 74', usage: 'Secondary elements' },
      { name: 'Gray 500', hex: '#888888', rgb: '136, 136, 136', usage: 'Muted text, borders' },
      { name: 'Gray 200', hex: '#e0e0e0', rgb: '224, 224, 224', usage: 'Borders, dividers' },
      { name: 'Off White', hex: '#fafafa', rgb: '250, 250, 250', usage: 'Backgrounds' },
      { name: 'Cream', hex: '#fef9f3', rgb: '254, 249, 243', usage: 'Warm backgrounds' },
    ]
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      fontFamily: '"Space Grotesk", sans-serif',
      color: '#2d2d2d'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Fraunces:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Header */}
      <header style={{
        background: '#2d2d2d',
        padding: '60px',
        color: '#fff'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
            {/* Logo */}
            <svg width="60" height="60" viewBox="0 0 120 120">
              <rect x="10" y="20" width="100" height="90" rx="12" fill="#3d3d3d" stroke="#2d2d2d" strokeWidth="3" />
              <defs>
                <linearGradient id="keyGradHeader" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4a4a4a" />
                  <stop offset="100%" stopColor="#3d3d3d" />
                </linearGradient>
              </defs>
              <rect x="18" y="24" width="84" height="74" rx="8" fill="url(#keyGradHeader)" />
              <path d="M60 40 L75 60 L67 60 L67 80 L53 80 L53 60 L45 60 Z" fill="#ff6b6b" />
            </svg>
            <div>
              <h1 style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: '36px',
                fontWeight: 600,
                margin: 0
              }}>
                Typequest
              </h1>
              <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '14px' }}>
                Brand Guidelines v1.0
              </p>
            </div>
          </div>
          <p style={{
            fontSize: '18px',
            color: '#aaa',
            maxWidth: '600px',
            lineHeight: 1.7
          }}>
            This guide defines the visual identity of Typequest — a playful, approachable tool that helps non-technical people build technical skills through practice.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 60px' }}>
        
        {/* Section: Brand Essence */}
        <section style={{ marginBottom: '100px' }}>
          <h2 style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: '32px',
            fontWeight: 600,
            marginBottom: '40px',
            paddingBottom: '16px',
            borderBottom: '3px solid #ff6b6b'
          }}>
            Brand Essence
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px'
          }}>
            {[
              { title: 'Mission', content: 'Empower non-technical people to build technical confidence through playful, judgment-free practice.' },
              { title: 'Personality', content: 'Friendly, encouraging, playful, approachable. We\'re the supportive friend who makes learning fun, not intimidating.' },
              { title: 'Voice', content: 'Casual but not sloppy. Enthusiastic but not overwhelming. We use simple language, celebrate small wins, and never talk down to users.' }
            ].map((item, i) => (
              <div key={i} style={{
                padding: '32px',
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}>
                <h3 style={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontSize: '20px',
                  fontWeight: 600,
                  marginBottom: '16px',
                  color: '#ff6b6b'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '15px',
                  lineHeight: 1.8,
                  color: '#666',
                  margin: 0
                }}>
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Logo */}
        <section style={{ marginBottom: '100px' }}>
          <h2 style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: '32px',
            fontWeight: 600,
            marginBottom: '40px',
            paddingBottom: '16px',
            borderBottom: '3px solid #ff6b6b'
          }}>
            Logo
          </h2>

          {/* Primary Logo */}
          <div style={{ marginBottom: '60px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
              Primary Logo — "Level Up Key"
            </h3>
            <p style={{ color: '#666', marginBottom: '32px', maxWidth: '600px', lineHeight: 1.7 }}>
              The logo combines a keyboard key with an upward arrow, symbolizing progress and leveling up. 
              It represents the core promise: press a key, level up your skills.
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
              marginBottom: '40px'
            }}>
              {/* On Light */}
              <div style={{
                background: '#fff',
                padding: '48px',
                borderRadius: '16px',
                textAlign: 'center',
                border: '1px solid #e0e0e0'
              }}>
                <svg width="100" height="100" viewBox="0 0 120 120">
                  <rect x="10" y="20" width="100" height="90" rx="12" fill="#2d2d2d" stroke="#1a1a1a" strokeWidth="3" />
                  <defs>
                    <linearGradient id="keyGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4a4a4a" />
                      <stop offset="100%" stopColor="#2d2d2d" />
                    </linearGradient>
                  </defs>
                  <rect x="18" y="24" width="84" height="74" rx="8" fill="url(#keyGrad1)" />
                  <path d="M60 40 L75 60 L67 60 L67 80 L53 80 L53 60 L45 60 Z" fill="#ff6b6b" />
                </svg>
                <div style={{ marginTop: '16px', fontSize: '13px', color: '#888' }}>On Light</div>
              </div>

              {/* On Dark */}
              <div style={{
                background: '#2d2d2d',
                padding: '48px',
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <svg width="100" height="100" viewBox="0 0 120 120">
                  <rect x="10" y="20" width="100" height="90" rx="12" fill="#3d3d3d" stroke="#4a4a4a" strokeWidth="3" />
                  <defs>
                    <linearGradient id="keyGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#5a5a5a" />
                      <stop offset="100%" stopColor="#3d3d3d" />
                    </linearGradient>
                  </defs>
                  <rect x="18" y="24" width="84" height="74" rx="8" fill="url(#keyGrad2)" />
                  <path d="M60 40 L75 60 L67 60 L67 80 L53 80 L53 60 L45 60 Z" fill="#ff6b6b" />
                </svg>
                <div style={{ marginTop: '16px', fontSize: '13px', color: '#888' }}>On Dark</div>
              </div>

              {/* On Brand */}
              <div style={{
                background: '#ff6b6b',
                padding: '48px',
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <svg width="100" height="100" viewBox="0 0 120 120">
                  <rect x="10" y="20" width="100" height="90" rx="12" fill="#fff" />
                  <rect x="18" y="24" width="84" height="74" rx="8" fill="#fafafa" />
                  <path d="M60 40 L75 60 L67 60 L67 80 L53 80 L53 60 L45 60 Z" fill="#ff6b6b" />
                </svg>
                <div style={{ marginTop: '16px', fontSize: '13px', color: '#fff' }}>On Brand</div>
              </div>
            </div>
          </div>

          {/* Logo with Wordmark */}
          <div style={{ marginBottom: '60px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
              Logo with Wordmark
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px'
            }}>
              {/* Horizontal */}
              <div style={{
                background: '#fff',
                padding: '48px',
                borderRadius: '16px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <svg width="60" height="60" viewBox="0 0 120 120">
                    <rect x="10" y="20" width="100" height="90" rx="12" fill="#2d2d2d" stroke="#1a1a1a" strokeWidth="3" />
                    <rect x="18" y="24" width="84" height="74" rx="8" fill="#3d3d3d" />
                    <path d="M60 40 L75 60 L67 60 L67 80 L53 80 L53 60 L45 60 Z" fill="#ff6b6b" />
                  </svg>
                  <span style={{
                    fontFamily: '"Fraunces", Georgia, serif',
                    fontSize: '32px',
                    fontWeight: 600,
                    color: '#2d2d2d'
                  }}>
                    Typequest
                  </span>
                </div>
                <div style={{ marginTop: '24px', fontSize: '13px', color: '#888' }}>Horizontal Lockup</div>
              </div>

              {/* Stacked */}
              <div style={{
                background: '#fff',
                padding: '48px',
                borderRadius: '16px',
                border: '1px solid #e0e0e0',
                textAlign: 'center'
              }}>
                <svg width="70" height="70" viewBox="0 0 120 120" style={{ marginBottom: '12px' }}>
                  <rect x="10" y="20" width="100" height="90" rx="12" fill="#2d2d2d" stroke="#1a1a1a" strokeWidth="3" />
                  <rect x="18" y="24" width="84" height="74" rx="8" fill="#3d3d3d" />
                  <path d="M60 40 L75 60 L67 60 L67 80 L53 80 L53 60 L45 60 Z" fill="#ff6b6b" />
                </svg>
                <div style={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontSize: '28px',
                  fontWeight: 600,
                  color: '#2d2d2d'
                }}>
                  Typequest
                </div>
                <div style={{ marginTop: '24px', fontSize: '13px', color: '#888' }}>Stacked Lockup</div>
              </div>
            </div>
          </div>

          {/* Clear Space & Minimum Size */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '40px'
          }}>
            {/* Clear Space */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
                Clear Space
              </h3>
              <div style={{
                background: '#fff',
                padding: '48px',
                borderRadius: '16px',
                border: '1px solid #e0e0e0',
                textAlign: 'center'
              }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <div style={{
                    position: 'absolute',
                    inset: '-30px',
                    border: '2px dashed #4ecdc4',
                    borderRadius: '8px'
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '-30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '10px',
                    color: '#4ecdc4',
                    background: '#fff',
                    padding: '0 8px'
                  }}>
                    1x
                  </div>
                  <svg width="80" height="80" viewBox="0 0 120 120">
                    <rect x="10" y="20" width="100" height="90" rx="12" fill="#2d2d2d" />
                    <rect x="18" y="24" width="84" height="74" rx="8" fill="#3d3d3d" />
                    <path d="M60 40 L75 60 L67 60 L67 80 L53 80 L53 60 L45 60 Z" fill="#ff6b6b" />
                  </svg>
                </div>
                <p style={{ marginTop: '40px', fontSize: '13px', color: '#888' }}>
                  Maintain clear space equal to the arrow height (1x) on all sides
                </p>
              </div>
            </div>

            {/* Minimum Size */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
                Minimum Size
              </h3>
              <div style={{
                background: '#fff',
                padding: '48px',
                borderRadius: '16px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '32px', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <svg width="32" height="32" viewBox="0 0 120 120">
                      <rect x="10" y="20" width="100" height="90" rx="12" fill="#2d2d2d" />
                      <rect x="18" y="24" width="84" height="74" rx="8" fill="#3d3d3d" />
                      <path d="M60 40 L75 60 L67 60 L67 80 L53 80 L53 60 L45 60 Z" fill="#ff6b6b" />
                    </svg>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>32px</div>
                    <div style={{ fontSize: '10px', color: '#4ecdc4' }}>Digital min</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 120 120">
                      <rect x="10" y="20" width="100" height="90" rx="12" fill="#2d2d2d" />
                      <rect x="18" y="24" width="84" height="74" rx="8" fill="#3d3d3d" />
                      <path d="M60 40 L75 60 L67 60 L67 80 L53 80 L53 60 L45 60 Z" fill="#ff6b6b" />
                    </svg>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>24px</div>
                    <div style={{ fontSize: '10px', color: '#888' }}>Favicon</div>
                  </div>
                </div>
                <p style={{ marginTop: '32px', fontSize: '13px', color: '#888', textAlign: 'center' }}>
                  Never use the logo smaller than 32px for general use, 24px for favicons
                </p>
              </div>
            </div>
          </div>

          {/* Don'ts */}
          <div style={{ marginTop: '60px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
              Logo Don'ts
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px'
            }}>
              {[
                { label: "Don't stretch", transform: 'scaleX(1.3)' },
                { label: "Don't rotate", transform: 'rotate(15deg)' },
                { label: "Don't recolor arrow", arrowColor: '#4ecdc4' },
                { label: "Don't add effects", filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.5))' }
              ].map((item, i) => (
                <div key={i} style={{
                  background: '#fff5f5',
                  padding: '24px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '2px solid #ffcccc'
                }}>
                  <div style={{
                    transform: item.transform || 'none',
                    filter: item.filter || 'none',
                    display: 'inline-block'
                  }}>
                    <svg width="50" height="50" viewBox="0 0 120 120">
                      <rect x="10" y="20" width="100" height="90" rx="12" fill="#2d2d2d" />
                      <rect x="18" y="24" width="84" height="74" rx="8" fill="#3d3d3d" />
                      <path d="M60 40 L75 60 L67 60 L67 80 L53 80 L53 60 L45 60 Z" fill={item.arrowColor || '#ff6b6b'} />
                    </svg>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '11px', color: '#cc0000' }}>
                    ✕ {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Colors */}
        <section style={{ marginBottom: '100px' }}>
          <h2 style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: '32px',
            fontWeight: 600,
            marginBottom: '40px',
            paddingBottom: '16px',
            borderBottom: '3px solid #ff6b6b'
          }}>
            Color Palette
          </h2>

          {/* Primary Colors */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
              Primary Colors
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {colors.primary.map((color, i) => (
                <div
                  key={i}
                  onClick={() => copyToClipboard(color.hex, `primary-${i}`)}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid #e0e0e0',
                    transition: 'transform 0.2s'
                  }}
                >
                  <div style={{ height: '100px', background: color.hex }} />
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{color.name}</div>
                    <div style={{ fontSize: '13px', color: '#888', fontFamily: '"JetBrains Mono", monospace' }}>
                      {copiedColor === `primary-${i}` ? '✓ Copied!' : color.hex}
                    </div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '8px' }}>{color.usage}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Colors */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
              Secondary Colors
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {colors.secondary.map((color, i) => (
                <div
                  key={i}
                  onClick={() => copyToClipboard(color.hex, `secondary-${i}`)}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <div style={{ height: '100px', background: color.hex }} />
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{color.name}</div>
                    <div style={{ fontSize: '13px', color: '#888', fontFamily: '"JetBrains Mono", monospace' }}>
                      {copiedColor === `secondary-${i}` ? '✓ Copied!' : color.hex}
                    </div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '8px' }}>{color.usage}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Neutral Colors */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
              Neutral Colors
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
              {colors.neutral.map((color, i) => (
                <div
                  key={i}
                  onClick={() => copyToClipboard(color.hex, `neutral-${i}`)}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <div style={{ 
                    height: '60px', 
                    background: color.hex,
                    border: color.hex === '#fafafa' || color.hex === '#fef9f3' ? '1px solid #e0e0e0' : 'none'
                  }} />
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}>{color.name}</div>
                    <div style={{ fontSize: '11px', color: '#888', fontFamily: '"JetBrains Mono", monospace' }}>
                      {copiedColor === `neutral-${i}` ? '✓ Copied!' : color.hex}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Typography */}
        <section style={{ marginBottom: '100px' }}>
          <h2 style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: '32px',
            fontWeight: 600,
            marginBottom: '40px',
            paddingBottom: '16px',
            borderBottom: '3px solid #ff6b6b'
          }}>
            Typography
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
            marginBottom: '60px'
          }}>
            {/* Fraunces */}
            <div style={{
              background: '#fff',
              padding: '32px',
              borderRadius: '16px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: '48px',
                fontWeight: 600,
                marginBottom: '16px',
                color: '#2d2d2d'
              }}>
                Aa
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Fraunces</h3>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>Headlines, logo wordmark, emphasis</p>
              <div style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#666'
              }}>
                <div style={{ fontWeight: 400 }}>Regular 400</div>
                <div style={{ fontWeight: 600 }}>Semibold 600</div>
                <div style={{ fontStyle: 'italic' }}>Italic</div>
              </div>
            </div>

            {/* Space Grotesk */}
            <div style={{
              background: '#fff',
              padding: '32px',
              borderRadius: '16px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: '48px',
                fontWeight: 600,
                marginBottom: '16px',
                color: '#2d2d2d'
              }}>
                Aa
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Space Grotesk</h3>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>Body text, UI elements, buttons</p>
              <div style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#666'
              }}>
                <div style={{ fontWeight: 400 }}>Regular 400</div>
                <div style={{ fontWeight: 500 }}>Medium 500</div>
                <div style={{ fontWeight: 600 }}>Semibold 600</div>
                <div style={{ fontWeight: 700 }}>Bold 700</div>
              </div>
            </div>

            {/* JetBrains Mono */}
            <div style={{
              background: '#fff',
              padding: '32px',
              borderRadius: '16px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '48px',
                fontWeight: 500,
                marginBottom: '16px',
                color: '#2d2d2d'
              }}>
                Aa
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>JetBrains Mono</h3>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>Code, terminal, technical elements</p>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#666'
              }}>
                <div style={{ fontWeight: 400 }}>Regular 400</div>
                <div style={{ fontWeight: 500 }}>Medium 500</div>
              </div>
            </div>
          </div>

          {/* Type Scale */}
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
            Type Scale
          </h3>
          <div style={{
            background: '#fff',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid #e0e0e0'
          }}>
            {[
              { size: '48px', name: 'Display', font: 'Fraunces', weight: 600 },
              { size: '32px', name: 'H1', font: 'Fraunces', weight: 600 },
              { size: '24px', name: 'H2', font: 'Fraunces', weight: 600 },
              { size: '20px', name: 'H3', font: 'Space Grotesk', weight: 600 },
              { size: '18px', name: 'Lead', font: 'Space Grotesk', weight: 400 },
              { size: '16px', name: 'Body', font: 'Space Grotesk', weight: 400 },
              { size: '14px', name: 'Small', font: 'Space Grotesk', weight: 400 },
              { size: '12px', name: 'Caption', font: 'Space Grotesk', weight: 500 },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '24px',
                padding: '16px 0',
                borderBottom: i < 7 ? '1px solid #eee' : 'none'
              }}>
                <div style={{ width: '80px', fontSize: '12px', color: '#888' }}>{item.name}</div>
                <div style={{ width: '60px', fontSize: '12px', color: '#888', fontFamily: '"JetBrains Mono", monospace' }}>{item.size}</div>
                <div style={{
                  fontFamily: item.font === 'Fraunces' ? '"Fraunces", Georgia, serif' : '"Space Grotesk", sans-serif',
                  fontSize: item.size,
                  fontWeight: item.weight,
                  color: '#2d2d2d'
                }}>
                  The quick brown fox
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: UI Elements */}
        <section style={{ marginBottom: '100px' }}>
          <h2 style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: '32px',
            fontWeight: 600,
            marginBottom: '40px',
            paddingBottom: '16px',
            borderBottom: '3px solid #ff6b6b'
          }}>
            UI Elements
          </h2>

          {/* Buttons */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
              Buttons
            </h3>
            <div style={{
              background: '#fff',
              padding: '32px',
              borderRadius: '16px',
              border: '1px solid #e0e0e0',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              alignItems: 'center'
            }}>
              <button style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                padding: '16px 32px',
                background: '#ff6b6b',
                color: '#fff',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer'
              }}>
                Primary Button
              </button>
              <button style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                padding: '16px 32px',
                background: 'transparent',
                color: '#2d2d2d',
                border: '2px solid #e0e0e0',
                borderRadius: '50px',
                cursor: 'pointer'
              }}>
                Secondary Button
              </button>
              <button style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                padding: '12px 24px',
                background: '#4ecdc4',
                color: '#fff',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer'
              }}>
                Success
              </button>
              <button style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                padding: '12px 24px',
                background: '#2d2d2d',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}>
                Dark Button
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#888', marginTop: '16px' }}>
              Border radius: 50px for primary/playful actions, 8px for utilitarian actions
            </p>
          </div>

          {/* Cards */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
              Cards
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px'
            }}>
              <div style={{
                background: '#fff',
                padding: '32px',
                borderRadius: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>🎯</div>
                <h4 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: '20px', marginBottom: '8px' }}>Feature Card</h4>
                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Soft shadow, rounded corners, emoji icons</p>
              </div>
              <div style={{
                background: '#fff5f5',
                padding: '32px',
                borderRadius: '20px',
                border: '2px solid #ff6b6b'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>✨</div>
                <h4 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: '20px', marginBottom: '8px' }}>Highlighted Card</h4>
                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Brand tint background with border</p>
              </div>
              <div style={{
                background: '#2d2d2d',
                padding: '32px',
                borderRadius: '20px',
                color: '#fff'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>🏆</div>
                <h4 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: '20px', marginBottom: '8px' }}>Dark Card</h4>
                <p style={{ fontSize: '14px', color: '#aaa', margin: 0 }}>For terminal/code contexts</p>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
              Badges & Pills
            </h3>
            <div style={{
              background: '#fff',
              padding: '32px',
              borderRadius: '16px',
              border: '1px solid #e0e0e0',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center'
            }}>
              <span style={{
                background: '#ff6b6b',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '50px',
                fontSize: '12px',
                fontWeight: 600
              }}>
                New
              </span>
              <span style={{
                background: '#4ecdc4',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '50px',
                fontSize: '12px',
                fontWeight: 600
              }}>
                +100 XP
              </span>
              <span style={{
                background: '#ffe66d',
                color: '#2d2d2d',
                padding: '6px 14px',
                borderRadius: '50px',
                fontSize: '12px',
                fontWeight: 600
              }}>
                Achievement
              </span>
              <span style={{
                background: '#f0f0f0',
                color: '#666',
                padding: '6px 14px',
                borderRadius: '50px',
                fontSize: '12px',
                fontWeight: 500
              }}>
                Coming Soon
              </span>
              <span style={{
                background: '#f0fffe',
                color: '#4ecdc4',
                padding: '6px 14px',
                borderRadius: '50px',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid #4ecdc4'
              }}>
                Detected
              </span>
            </div>
          </div>
        </section>

        {/* Section: Iconography */}
        <section style={{ marginBottom: '100px' }}>
          <h2 style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: '32px',
            fontWeight: 600,
            marginBottom: '40px',
            paddingBottom: '16px',
            borderBottom: '3px solid #ff6b6b'
          }}>
            Iconography
          </h2>
          
          <p style={{ color: '#666', marginBottom: '32px', maxWidth: '600px', lineHeight: 1.7 }}>
            We use emojis as our primary icon system. They're friendly, universally understood, 
            and align with our playful brand personality.
          </p>

          <div style={{
            background: '#fff',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: '24px',
              textAlign: 'center'
            }}>
              {[
                { emoji: '🎯', label: 'Goals' },
                { emoji: '🚀', label: 'Start' },
                { emoji: '⌨️', label: 'Typing' },
                { emoji: '🏆', label: 'Win' },
                { emoji: '📈', label: 'Progress' },
                { emoji: '✨', label: 'Magic' },
                { emoji: '💪', label: 'Power' },
                { emoji: '🎮', label: 'Play' },
                { emoji: '📦', label: 'Install' },
                { emoji: '💡', label: 'Tip' },
                { emoji: '⚡', label: 'Speed' },
                { emoji: '🔥', label: 'Streak' },
                { emoji: '👋', label: 'Hello' },
                { emoji: '📖', label: 'Learn' },
                { emoji: '⚔️', label: 'Quest' },
                { emoji: '🎉', label: 'Celebrate' }
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>{item.emoji}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Voice & Tone */}
        <section>
          <h2 style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: '32px',
            fontWeight: 600,
            marginBottom: '40px',
            paddingBottom: '16px',
            borderBottom: '3px solid #ff6b6b'
          }}>
            Voice & Tone
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '32px'
          }}>
            {/* Do */}
            <div style={{
              background: '#f0fffe',
              padding: '32px',
              borderRadius: '16px',
              border: '2px solid #4ecdc4'
            }}>
              <h3 style={{ color: '#4ecdc4', marginBottom: '20px', fontSize: '18px' }}>✓ Do</h3>
              <ul style={{ margin: 0, padding: '0 0 0 20px', color: '#666', lineHeight: 2 }}>
                <li>Use simple, everyday language</li>
                <li>Celebrate small wins ("Nice work! 🎉")</li>
                <li>Be encouraging and supportive</li>
                <li>Use humor sparingly but warmly</li>
                <li>Explain technical terms when needed</li>
                <li>Use contractions (you're, it's, that's)</li>
              </ul>
            </div>

            {/* Don't */}
            <div style={{
              background: '#fff5f5',
              padding: '32px',
              borderRadius: '16px',
              border: '2px solid #ff6b6b'
            }}>
              <h3 style={{ color: '#ff6b6b', marginBottom: '20px', fontSize: '18px' }}>✕ Don't</h3>
              <ul style={{ margin: 0, padding: '0 0 0 20px', color: '#666', lineHeight: 2 }}>
                <li>Use jargon or assume knowledge</li>
                <li>Be condescending or patronizing</li>
                <li>Make users feel dumb for mistakes</li>
                <li>Be overly formal or corporate</li>
                <li>Use passive voice when active works</li>
                <li>Overload with exclamation points!!!</li>
              </ul>
            </div>
          </div>

          {/* Examples */}
          <div style={{ marginTop: '40px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
              Example Copy
            </h3>
            <div style={{
              background: '#fff',
              padding: '32px',
              borderRadius: '16px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Error message</div>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{ flex: 1, padding: '16px', background: '#fff5f5', borderRadius: '8px' }}>
                    <span style={{ color: '#cc0000', fontSize: '12px' }}>✕ Before:</span>
                    <div style={{ marginTop: '8px' }}>"Error: Invalid input. Please try again."</div>
                  </div>
                  <div style={{ flex: 1, padding: '16px', background: '#f0fffe', borderRadius: '8px' }}>
                    <span style={{ color: '#4ecdc4', fontSize: '12px' }}>✓ After:</span>
                    <div style={{ marginTop: '8px' }}>"Oops! That didn't quite work. Let's try again 💪"</div>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Success message</div>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{ flex: 1, padding: '16px', background: '#fff5f5', borderRadius: '8px' }}>
                    <span style={{ color: '#cc0000', fontSize: '12px' }}>✕ Before:</span>
                    <div style={{ marginTop: '8px' }}>"Task completed successfully."</div>
                  </div>
                  <div style={{ flex: 1, padding: '16px', background: '#f0fffe', borderRadius: '8px' }}>
                    <span style={{ color: '#4ecdc4', fontSize: '12px' }}>✓ After:</span>
                    <div style={{ marginTop: '8px' }}>"You did it! +50 XP earned 🎉"</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        background: '#2d2d2d',
        padding: '40px 60px',
        color: '#888',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
          <svg width="32" height="32" viewBox="0 0 120 120">
            <rect x="10" y="20" width="100" height="90" rx="12" fill="#3d3d3d" />
            <rect x="18" y="24" width="84" height="74" rx="8" fill="#4a4a4a" />
            <path d="M60 40 L75 60 L67 60 L67 80 L53 80 L53 60 L45 60 Z" fill="#ff6b6b" />
          </svg>
          <span style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: '20px', color: '#fff' }}>Typequest</span>
        </div>
        <p style={{ fontSize: '13px', margin: 0 }}>
          Brand Guidelines v1.0 · Last updated {new Date().toLocaleDateString()}
        </p>
      </footer>
    </div>
  );
}
