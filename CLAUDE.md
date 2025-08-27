# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **airafaceWeb-2.0**, a Vue.js 2.6 web application for managing face recognition and access control devices (AiraFace products). The application provides comprehensive management interfaces for personnel, visitors, devices, attendance tracking, and system configuration.

## Development Commands

### Essential Commands
- `npm install` - Install project dependencies
- `npm run serve` or `npm start` - Start development server with hot-reload (runs on HTTPS with custom certificates)
- `npm run build` - Build for production
- `npm run lint` - Lint and fix files (no dedicated test command available)

### Internationalization
- `npm run i18n2csv` - Convert i18n JSON files to CSV format for translation management
- `npm run csv2i18n` - Convert CSV translations back to JSON files

### Testing
- Jest is configured but no test script is defined in package.json
- Run tests with: `npx jest` if needed
- Test files should be placed in `tests/unit/` directory

## Architecture Overview

### Core Framework Stack
- **Vue.js 2.6** with Vue Router and Vuex for state management
- **CoreUI Vue** for UI components and layout
- **Element UI** for additional form components
- **VXE Table** for advanced data tables
- **Vue i18n** for internationalization (supports 9 languages: en, zh, ja, es, fr, th, vi, id, tr)

### Key Architectural Patterns

#### Global API Service Layer
- All API calls are defined as Vue prototype methods in `src/globalParams.js` (1700+ lines)
- API methods follow naming pattern: `$global[Action][Entity]` (e.g., `$globalCreatePerson`, `$globalFindCameras`)
- Uses custom `postJson()` function with token-based authentication
- Supports both callback and Promise patterns
- Base API path determined by environment (development vs production)

#### Multi-Language Support
- Language files in `src/i18n/` directory with JSON format
- Automatic browser language detection with manual override
- CSV-based translation workflow for easier localization management
- Language switching affects both UI and date picker components

#### Dashboard-Centric Design
- Multiple specialized dashboard views:
  - Welcome Dashboard (default display mode)
  - Occupancy Dashboard (capacity tracking)
  - Capacity Dashboard (space management)  
  - Self Check-in Dashboard (self-service mode)
  - Guard Dashboard (security monitoring)
  - Alcohol Check-in Dashboard (specialized screening)

#### Device Management Architecture
- **Video Devices**: Cameras and tablets with group management
- **Output Devices**: IO boxes and Wiegand converters with group management  
- **Access Control**: Rule-based system with schedules and actions
- Device profiles define capabilities per hardware type (stored in `$profileLists`)

### Directory Structure

#### Core Application
- `src/main.js` - Application entry point with extensive i18n setup
- `src/globalParams.js` - Global configuration and API service layer
- `src/store.js` - Vuex state management
- `src/router/index.js` - Vue Router configuration
- `src/webSocketService.js` - Real-time communication service

#### Component Organization
- `src/containers/` - Layout components (Header, Sidebar, Footer, Container)
- `src/components/` - Reusable UI components
- `src/views/` - Page-level components organized by feature:
  - `dashboards/` - Various dashboard implementations
  - `personsmanagement/` - Person and visitor management
  - `videodevice/` - Camera and tablet management
  - `outputdevice/` - IO box and Wiegand device management
  - `accessrules/` - Access control rules and schedules
  - `attendance/` - Attendance tracking and reports
  - `reports/` - Investigation and reporting tools
  - `systemsettings/` - System configuration

#### Multi-Step Form Pattern
- Complex forms use step-by-step wizards (Step1Form.vue, Step2Form.vue, etc.)
- Found throughout device management and configuration sections
- Consistent pattern for data collection and validation

#### Styling Architecture
- Custom SCSS in `src/assets/scss/` with organized structure:
  - `base/` - Foundation styles
  - `component/` - UI component styles
  - `helper/` - Utility classes
  - `layout/` - Layout-specific styles
  - `page/` - Page-specific styles (especially dashboard variants)

### Development Environment
- Requires Node.js >= 12.x and npm >= 6.x
- Uses HTTPS in development with custom certificates in `src/assets/https/`
- Development server configured in `vue.config.js` with HTTPS support
- Hot module replacement enabled for efficient development

### WebSocket Integration
- Real-time verification results via WebSocket connection
- WebSocket path: `wss://{host}:{port}/airafacelite/verifyresults` (HTTPS) or `ws://{host}:{port}/airafacelite/verifyresults` (HTTP)
- Integrated with Vuex store for real-time state updates

### Face Recognition Integration
- Uses `face-api.js` library for client-side face detection/recognition
- Models stored in `public/models/` directory
- Supports multiple face detection modes and recognition features

## Important Implementation Notes

### API Authentication
- Token-based authentication with automatic renewal
- Tokens stored in both Vuex store and cookies for persistence
- Automatic logout on token expiration or API errors
- Session maintenance every 60 seconds

### Device Type Handling  
- Different device capabilities defined in `$profileLists` array
- Device-specific features enabled/disabled based on hardware type
- Three main device types: airaTablet_plus, airaTablet_xs, airaFace 2

### Error Handling Patterns
- Consistent error handling in API calls with both callback and Promise patterns
- Loading states managed through vue-loading-overlay
- User feedback via vue-simple-alert for notifications

### Performance Considerations
- Large data sets handled with pagination (slice_shift/slice_length pattern)
- Image downloads configurable per API call
- WebSocket used for real-time updates to avoid polling

When working on this codebase, prioritize understanding the global API patterns in `globalParams.js` and the multi-step form patterns used throughout the application. The extensive internationalization support means all user-facing strings should use the `$t()` function for proper translation support.
- 請一律用繁體中文回答