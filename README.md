# 🎯 Royal Shisha Bar

A modern, responsive website for a premium hookah bar in Germany featuring user authentication, menu display, live announcements, reviews, events tracking, and future integrations for table reservations and Spotify DJ features.

![Royal Shisha Bar](https://img.shields.io/badge/Status-In%20Development-orange)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.6-38B2AC)

## ✨ Features

### 🚀 Phase 1 (Current)
- ✅ **Responsive Design** - Mobile-first approach with beautiful UI
- ✅ **Live Popup System** - Owners can display real-time announcements
- ✅ **User Authentication** - Sign up, sign in, and user management
- ✅ **Modern Landing Page** - Hero section with animations
- ✅ **Navigation System** - Responsive header and footer
- ✅ **State Management** - Zustand for global state

### 🔄 In Development
- [ ] **Menu Display** - Hookah and drinks catalog with filtering
- [ ] **Reviews System** - Customer reviews and ratings
- [ ] **Google Maps Integration** - Location and directions
- [ ] **Event Tracker** - Upcoming events and registration
- [ ] **Contact Page** - Location, hours, and contact info

### 🎵 Phase 2 (Future)
- [ ] **Table Reservation System** - Booking calendar and time slots
- [ ] **Spotify DJ Feature** - Playlist management and song requests
- [ ] **Online Ordering** - Menu ordering system
- [ ] **Admin Panel** - Content management for owners

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/royal-shishabar.git
   cd royal-shishabar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── layout/         # Layout components (Header, Footer)
│   ├── common/         # Common UI components
│   ├── auth/           # Authentication components
│   ├── menu/           # Menu-related components
│   ├── reviews/        # Review components
│   └── events/         # Event components
├── pages/              # Page components
├── stores/             # Zustand stores
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── assets/             # Static assets
```

## 🎨 Design System

### Colors
- **Primary**: Orange gradient (#f2751f to #e35d14)
- **Secondary**: Gray scale (#64748b to #0f172a)
- **Accent**: Purple (#d946ef)

### Typography
- **Display**: Playfair Display (headings)
- **Body**: Inter (body text)

### Components
- **Buttons**: Primary, Secondary, Outline variants
- **Cards**: Product, Review, Event cards
- **Forms**: Input fields with validation states

## 🔐 Authentication

The app includes a complete authentication system with:
- Email/password registration and login
- Social login (Google, Facebook) - ready for integration
- User profile management
- Role-based access (Customer, Staff, Admin)
- Persistent sessions with Zustand

## 📱 Responsive Design

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

All components are built with a mobile-first approach and include touch-friendly interactions.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the Vite configuration
3. Deploy with one click

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_URL=your_api_url_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

### Phase 1 (Current)
- [x] Project setup and basic structure
- [x] Authentication system
- [x] Landing page and navigation
- [ ] Menu display system
- [ ] Reviews and ratings
- [ ] Google Maps integration
- [ ] Event management

### Phase 2 (Q2 2024)
- [ ] Table reservation system
- [ ] Spotify DJ integration
- [ ] Online ordering
- [ ] Admin panel

### Phase 3 (Q3 2024)
- [ ] Mobile app development
- [ ] Loyalty program
- [ ] Advanced analytics
- [ ] Multi-location support

## 📞 Support

For support, email Royal.Waldkraiburg@gmail.com or create an issue in this repository.

---

**Built with ❤️ for Royal Shisha Bar**
