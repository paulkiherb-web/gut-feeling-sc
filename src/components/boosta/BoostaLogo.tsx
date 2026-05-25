import { useId } from 'react';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZES = {
  sm: { width: 84,  height: 28 },
  md: { width: 108, height: 36 },
  lg: { width: 144, height: 48 },
  xl: { width: 180, height: 60 },
};

export default function BoostaLogo({ size = 'md' }: Props) {
  const uid = useId().replace(/:/g, '');
  const { width, height } = SIZES[size];

  const markGrad   = `boostaMarkGrad-${uid}`;
  const accentGrad = `boostaAccentGrad-${uid}`;
  const shadow     = `softShadow-${uid}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 1080 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Boosta logo"
    >
      <defs>
        <linearGradient id={markGrad} x1="40" y1="300" x2="260" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0"    stopColor="#21E7B0" />
          <stop offset="0.45" stopColor="#18AEEF" />
          <stop offset="1"    stopColor="#1E38FF" />
        </linearGradient>

        <linearGradient id={accentGrad} x1="900" y1="245" x2="960" y2="205" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#21E7B0" />
          <stop offset="1" stopColor="#1E38FF" />
        </linearGradient>

        <filter id={shadow} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#0B163A" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Mark */}
      <g transform="translate(72 52)" filter={`url(#${shadow})`}>
        <path
          d="M63 0H169C219 0 252 30 252 76C252 107 236 130 206 143C241 154 264 181 264 219C264 273 225 308 166 308H62C43 308 31 288 40 271L76 203H35C16 203 4 183 13 166L58 84C71 59 77 34 63 0Z"
          fill={`url(#${markGrad})`}
        />
        <path
          d="M116 52H165C190 52 207 67 207 90C207 113 190 128 165 128H96L116 52Z"
          fill="rgba(255,255,255,0.08)"
        />
        <path
          d="M95 173H169C198 173 218 191 218 219C218 247 198 265 168 265H56L95 173Z"
          fill="rgba(255,255,255,0.08)"
        />
        <path
          d="M33 253C78 213 126 178 199 145"
          stroke="white"
          strokeWidth="30"
          strokeLinecap="round"
        />
        <path d="M183 133L223 121L203 158Z" fill="white" />
        <path
          d="M184 43L197 78L232 91L197 104L184 139L171 104L136 91L171 78L184 43Z"
          fill="white"
        />
      </g>

      {/* Wordmark */}
      <text
        x="360"
        y="230"
        fontFamily="Inter, SF Pro Display, Avenir Next, Arial, sans-serif"
        fontSize="154"
        fontWeight="800"
        letterSpacing="-7"
        fill="#07122E"
      >
        Boosta
      </text>

      {/* Accent on final a */}
      <path
        d="M911 232C928 231 943 224 953 211C951 238 931 254 900 254C903 245 906 238 911 232Z"
        fill={`url(#${accentGrad})`}
        opacity="0.95"
      />
    </svg>
  );
}
