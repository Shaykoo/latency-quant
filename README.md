# Latency Intelligence Dashboard

A real-time 3D visualization dashboard for monitoring global exchange latency across multiple cloud providers. Built with Next.js, React Three Fiber, and TypeScript.

## 🚀 Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📚 Libraries Used

### Core Framework
- **Next.js** (`^15.1.4`) - React framework with App Router
- **React** (`^18.3.1`) - UI library
- **TypeScript** (`^5`) - Type safety

### 3D Visualization
- **@react-three/fiber** (`^9.4.0`) - React renderer for Three.js
- **@react-three/drei** (`^9.114.8`) - Useful helpers for react-three-fiber (OrbitControls, Html, Stars, etc.)
- **three** (`^0.169.0`) - 3D graphics library

### State Management
- **zustand** (`^5.0.0`) - Lightweight state management for:
  - Latency feed data
  - Historical latency data
  - Dashboard filters
  - Visualization layer toggles
  - Theme preferences

### Data Validation
- **zod** (`^3.24.1`) - Schema validation for latency data frames

### Utilities
- **nanoid** (`^5.0.7`) - Unique ID generation
- **pino** (`^9.4.0`) - Structured logging

### Styling
- **Tailwind CSS** (`^4`) - Utility-first CSS framework
- **@tailwindcss/postcss** (`^4`) - PostCSS plugin for Tailwind

### Development Tools
- **@biomejs/biome** (`^1.8.3`) - Fast formatter and linter
- **vitest** (`^2.1.5`) - Unit testing framework
- **eslint** (`^9`) - Code linting

## 🎯 Assumptions Made

### Data Structure Assumptions
1. **Latency Samples**: Each sample contains:
   - Exchange name (enum: Binance, Bybit, Deribit, OKX, Coinbase)
   - Cloud provider (enum: AWS, GCP, Azure, Fastly)
   - Geographic region (string)
   - Latitude/longitude coordinates
   - Latency value in milliseconds
   - Timestamp

2. **Data Streaming**: 
   - Data arrives via Server-Sent Events (SSE) at `/api/latency/stream`
   - Frames are sent every 5 seconds (configurable via `LATENCY_STREAM_INTERVAL_MS`)
   - Each frame contains multiple samples and aggregated statistics

3. **Geographic Mapping**:
   - Coordinates are converted from lat/long to 3D Cartesian coordinates for globe rendering
   - Globe radius is fixed at 1.5 units
   - Markers are positioned on the globe surface

4. **Latency Ranges**:
   - Low latency: < 60ms (green connections)
   - Medium latency: 60-100ms (yellow connections)
   - High latency: > 100ms (red connections)

5. **Historical Data**:
   - Data is accumulated in-memory on the client side
   - No persistence - data is lost on page refresh
   - Time ranges supported: 1 minute, 1 hour, 24 hours, 7 days, 30 days

6. **Theme Persistence**:
   - Theme preference is stored in `localStorage` with key `latency-dashboard-theme`
   - Default theme is "dark"
   - Theme is applied after client-side hydration to prevent SSR mismatches

## 🎲 Dummy/Simulated Data

**⚠️ Important**: This project uses **simulated latency data** for development and demonstration purposes. All latency measurements are generated algorithmically and do not represent real-world measurements.

### Data Source Location
The simulated data generator is located in:
- `src/modules/latency/services/simulate-latency.ts` - Core simulation logic
- `src/lib/latency/source.ts` - Data polling and streaming setup

### Simulated Exchange Locations

The following exchanges and their locations are hardcoded:

| Exchange | Cloud Provider | Region | Latitude | Longitude |
|----------|---------------|--------|----------|-----------|
| Binance | AWS | ap-southeast-1 | 1.3521 | 103.8198 |
| Bybit | Fastly | eu-west-3 | 48.8566 | 2.3522 |
| Deribit | GCP | us-central1 | 41.8781 | -87.6298 |
| OKX | Azure | jp-east | 35.6762 | 139.6503 |
| Coinbase | AWS | us-east-1 | 37.7749 | -122.4194 |

### Latency Generation Algorithm

Latency values are generated using the following logic:

1. **Base Latency** (varies by provider):
   - Fastly: 45-80ms
   - Azure: 60-95ms
   - AWS/GCP: 55-90ms

2. **Jitter Calculation**:
   - Sinusoidal jitter based on current time and latitude: `Math.sin(Date.now() / 60000 + latitude) * 12`
   - Adds realistic variation to latency values

3. **Final Latency**:
   - `latencyMs = Math.max(10, Math.round(baseLatency + jitter))`
   - Minimum latency is capped at 10ms

4. **Aggregated Statistics**:
   - Min: Minimum latency across all samples
   - Max: Maximum latency across all samples
   - Avg: Average latency (rounded to 2 decimal places)
   - P95: 95th percentile latency

### Data Update Frequency

- **Default**: Every 5 seconds (5000ms)
- **Configurable**: Set `LATENCY_STREAM_INTERVAL_MS` environment variable
- **Heartbeat**: Every 15 seconds to keep SSE connection alive

### Replacing with Real Data

To replace simulated data with real latency measurements:

1. **Modify the data source** (`src/lib/latency/source.ts`):
   - Replace `generateLatencyFrame()` call with your actual data fetching logic
   - Ensure your data conforms to the `LatencyStreamEnvelope` schema (see `src/modules/latency/schema.ts`)

2. **Update the API route** (`src/app/api/latency/stream/route.ts`):
   - Modify the SSE stream to use your real data source
   - Maintain the same event format: `event: latency-frame\ndata: {JSON}\n\n`

3. **Schema Validation**:
   - All incoming data is validated using Zod schemas
   - Ensure your data matches:
     - `LatencySampleSchema` for individual samples
     - `LatencyFrameSchema` for complete frames
     - `LatencyStreamEnvelopeSchema` for the envelope

4. **Coordinate System**:
   - Ensure your data includes valid latitude (-90 to 90) and longitude (-180 to 180)
   - Coordinates are automatically converted to 3D positions for globe rendering

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/latency/stream/     # SSE endpoint for latency data
│   └── dashboard/latency/       # Main dashboard page
├── lib/
│   ├── latency/source.ts       # Data polling and streaming
│   └── logger.ts                # Structured logging
├── modules/latency/
│   ├── components/              # React components
│   │   ├── LatencyGlobe.tsx    # 3D globe visualization
│   │   ├── markers-layer.tsx   # Exchange markers
│   │   ├── latency-connections.tsx  # Animated connections
│   │   ├── region-visualization.tsx  # Cloud provider regions
│   │   ├── latency-heatmap.tsx      # Heatmap overlay
│   │   ├── control-panel.tsx        # Filters and controls
│   │   ├── latency-trends-chart.tsx # Historical trends
│   │   └── ...
│   ├── hooks/                   # Zustand stores and hooks
│   ├── services/
│   │   └── simulate-latency.ts  # Dummy data generator
│   ├── schema.ts                # Zod validation schemas
│   └── utils/                   # Utility functions
```

## 🎨 Features

- **3D Globe Visualization**: Interactive 3D globe with real-time marker updates
- **Animated Connections**: Color-coded latency connections between exchanges
- **Region Visualization**: Cloud provider region boundaries and clusters
- **Latency Heatmap**: Dynamic heatmap overlay on globe surface
- **Historical Trends**: Time-series charts with configurable time ranges
- **Interactive Filters**: Filter by exchange, provider, and latency range
- **Dark/Light Mode**: Theme switching with persistence
- **Export Functionality**: Download latency reports as JSON or CSV
- **Responsive Design**: Mobile, tablet, and desktop support

## 🔧 Configuration

### Environment Variables

- `LATENCY_STREAM_INTERVAL_MS`: Interval between latency frame updates (default: 5000ms)

### Browser Storage

- `latency-dashboard-theme`: Stores user's theme preference ("dark" or "light")

## 📝 Notes

- All latency data is **simulated** for development purposes
- Historical data is stored in-memory and lost on page refresh
- The globe uses a fixed radius of 1.5 units for 3D rendering
- Connection colors are based on average latency between two points
- Heatmap uses Gaussian falloff for smooth color transitions

## 🔗 Links

- **GitHub Repository**: [https://github.com/Shaykoo/Latency-Intelligence](https://github.com/Shaykoo/Latency-Intelligence)
- **Next.js Documentation**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **React Three Fiber**: [https://docs.pmnd.rs/react-three-fiber](https://docs.pmnd.rs/react-three-fiber)

## 📄 License

This project is private and proprietary.
# latency-quant
