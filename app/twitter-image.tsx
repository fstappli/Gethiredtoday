import { ImageResponse } from 'next/og';

export const alt = 'GetHiredToday: free resume builder, ATS checker and job search';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#0D1B19', padding: '64px 72px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#0B6E5F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 800 }}>G</div>
          <div style={{ display: 'flex', fontSize: 38, fontWeight: 700 }}>
            GetHired<span style={{ color: '#5FD3B3' }}>Today</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>Get hired faster with a resume that passes the ATS</div>
          <div style={{ fontSize: 30, color: '#A9BDB7' }}>Free resume builder, ATS checker and job search</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 26, color: '#5FD3B3', fontWeight: 700 }}>www.hiredtodayapp.com</div>
          <div style={{ display: 'flex', background: '#5FD3B3', color: '#0D1B19', fontSize: 26, fontWeight: 800, padding: '14px 28px', borderRadius: 14 }}>Start free</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
