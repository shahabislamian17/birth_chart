# Birth Chart Tool

A clone of the Chani birth chart tool that allows users to input their birth information to generate an astrology chart.

## Features

- Birth information form (name, date, time, location, email)
- Google Maps location autocomplete
- Newsletter subscription option
- Birth chart result page with detailed astrology information
- Chart/Table view toggle
- Detailed breakdown of planets, angles, and points
- Responsive design
- Modern UI matching the original design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory and add your API keys:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
ASTRO_API_KEY=gtExAhB9gS9pD7unOcrYV9vRM0hMQjkn8VbSDWio
```

To get a Google Maps API key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Places API" and "Maps JavaScript API"
4. Create credentials (API Key)
5. Add the API key to your `.env.local` file

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000/chart-tool](http://localhost:3000/chart-tool) in your browser.

## Project Structure

```
chart/
├── app/
│   ├── chart-tool/
│   │   ├── page.tsx         # Main chart tool page with form
│   │   ├── result.tsx       # Result page component
│   │   ├── styles.ts        # Form styled components
│   │   └── result-styles.ts # Result page styled components
│   ├── layout.tsx           # Root layout
│   └── globals.css           # Global styles
├── package.json
├── tsconfig.json
└── next.config.js
```

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Styled Components
- Google Maps Places API

## Notes

- The form shows a result page with sample astrology data after submission. In a production app, you would integrate with an astrology API (like Swiss Ephemeris or similar) to calculate actual birth chart data.
- Images are loaded from the original website. For production, you should download and host these assets locally.
- The Google Maps API key is required for the location autocomplete feature to work.
- The chart visualization is currently a placeholder. For a full implementation, you would use an astrology charting library or generate SVG charts based on calculated planetary positions.

## API Integration

For information on what APIs you need and where to get them, see [API_GUIDE.md](./API_GUIDE.md).

The guide covers:
- Astrology calculation APIs (Swiss Ephemeris, AstroAPI.io, etc.)
- Geocoding APIs (already implemented with Google Maps)
- Time zone APIs
- Implementation examples
- Free tier options

## WordPress Integration

To embed this tool in your WordPress website, see [WORDPRESS_EMBED_GUIDE.md](./WORDPRESS_EMBED_GUIDE.md).

The guide covers:
- Iframe embedding (easiest method)
- WordPress shortcode creation
- Custom plugin development
- Responsive design
- Security considerations

# birth_chart
