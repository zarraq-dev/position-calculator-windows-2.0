# Position Calculator

A lightweight Windows desktop application for calculating trading position sizes and reward:risk ratios.

## Overview

Position Calculator helps traders determine optimal position sizes based on their risk parameters. Enter your entry price, target price, stop-loss, and risk amount to instantly calculate position sizing for both long and short trades.

## Features

- Calculate position size based on risk parameters
- Calculate reward:risk ratio for trade evaluation
- Support for both long and short positions
- Modern glassmorphic dark theme UI
- Always-on-top window for use alongside trading platforms
- Keyboard navigation with arrow keys between fields
- No installation required (portable executable)

## Download

Download the latest `PositionCalculator.exe` from the [Releases](../../releases) page.

No installation required - just download and run.

## Usage

1. Enter your **Entry Price** (the price you plan to enter the trade)
2. Enter your **Target Price** (your profit target)
3. Enter your **Stop Loss** (your exit price if the trade goes against you)
4. Enter your **Risk Amount** (the dollar amount you're willing to lose)
5. Select **Direction** (Long for buying, Short for selling)
6. Click **Calculate** or press Enter

The calculator will display:
- **Position Size** - Number of shares/units to trade
- **Reward:Risk** - Ratio of potential profit to potential loss

## Keyboard Shortcuts

- **Arrow Up/Down** - Navigate between input fields
- **Enter** - Calculate position size
- **Escape** - Close error modal

## Technology Stack

- **Electron** - Desktop application framework
- **React** - UI component library
- **TypeScript** - Type-safe programming language
- **Vitest** - Testing framework

## Development

### Prerequisites

- Node.js 20 or higher
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/zarraq-dev/position-calculator-windows-2.0.git
cd position-calculator-windows-2.0

# Install dependencies
npm install
```

### Running in Development

```bash
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Building

```bash
# Build portable executable
npm run dist

# Build installer
npm run dist:installer
```

The executable will be created in the `release/` folder.

## Project Structure

```
position-calculator-windows-2.0/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── main.ts           # Application entry point
│   │   └── preload.ts        # Preload script for IPC
│   ├── renderer/             # React UI (frontend)
│   │   ├── App.tsx           # Main React component
│   │   ├── components/       # UI components
│   │   │   ├── Calculator.tsx
│   │   │   ├── InputField.tsx
│   │   │   └── ErrorModal.tsx
│   │   └── styles/           # CSS styling
│   │       └── glassmorphic.css
│   └── shared/               # Shared business logic
│       ├── calculations.ts   # Position calculation functions
│       └── types.ts          # TypeScript interfaces
├── tests/                    # Test files
│   ├── calculations.test.ts  # Business logic tests
│   └── Calculator.test.tsx   # UI component tests
└── package.json
```

## License

Apache License 2.0 - see LICENSE file for details

---

*Last Updated: 2025-11-26*
