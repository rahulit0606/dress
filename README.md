# Virtual Trial Room SaaS Platform

A comprehensive web dashboard for showroom owners to manage their virtual try-on business with AI-powered dress fitting technology.

## Features

### ✅ Implemented
- **User Authentication** - Secure login/registration with Supabase
- **Dress Management** - Upload, organize, and manage dress catalog
- **Customer Management** - Track customer interactions and preferences
- **Analytics Dashboard** - Real-time insights and performance metrics
- **AI Virtual Try-On** - Replicate-powered virtual dress fitting
- **Database Integration** - Full CRUD operations with Supabase
- **Responsive Design** - Works on desktop, tablet, and mobile

### 🚧 In Development
- WhatsApp Business API integration
- Payment processing (Stripe/Razorpay)
- Bulk dress upload via CSV
- Advanced analytics and reporting

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage)
- **AI Service**: Replicate API (IDM-VTON model)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_REPLICATE_API_TOKEN=your_replicate_api_token
```

### 2. Supabase Setup

1. Create a new Supabase project
2. Run the migration files in `supabase/migrations/` in order
3. Enable Row Level Security (RLS) on all tables
4. Create a storage bucket named `try-on-images` with public access

### 3. Replicate API Setup

1. Sign up at [Replicate.com](https://replicate.com)
2. Get your API token from the dashboard
3. Add it to your `.env` file as `VITE_REPLICATE_API_TOKEN`

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

## AI Virtual Try-On

The application uses Replicate's IDM-VTON model for virtual try-on:

- **Model**: `cuuupid/idm-vton`
- **Input**: Customer photo + dress image
- **Output**: Realistic virtual try-on result
- **Processing Time**: 30-60 seconds
- **Quality**: High-resolution, realistic fitting

### Supported Image Formats
- PNG, JPG, JPEG
- Max size: 10MB
- Recommended: Clear, full-body photos for best results

## Database Schema

### Core Tables
- `showroom_profiles` - Showroom owner accounts
- `dresses` - Dress catalog with images and metadata
- `customers` - Customer information and preferences
- `try_ons` - Virtual try-on records and results
- `analytics_events` - User interaction tracking

### Features
- Row Level Security (RLS) enabled
- Real-time subscriptions
- Automatic timestamps
- Foreign key constraints

## API Integrations

### ✅ Connected
- **Supabase Database API** - Full CRUD operations
- **Supabase Auth API** - User authentication
- **Supabase Storage API** - Image storage
- **Replicate AI API** - Virtual try-on processing

### 🚧 Planned
- **WhatsApp Business API** - Customer campaigns
- **Stripe API** - Subscription billing
- **Email API** - Notifications and campaigns

## Deployment

The application is deployed on Bolt Hosting and can be accessed at:
https://virtual-trial-room-s-gcsk.bolt.host

### Build for Production

```bash
npm run build
```

## Usage

### For Showroom Owners
1. Register/login to the web dashboard
2. Upload dresses to your catalog
3. Configure virtual try-on settings
4. Monitor customer interactions and analytics
5. Send campaigns to customers

### For Customers (Mobile App - Separate Project)
1. Browse dress catalog
2. Take photo for virtual try-on
3. View realistic try-on results
4. Save favorites and share results

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For technical support or questions:
- Check the console for error messages
- Verify environment variables are set correctly
- Ensure Supabase migrations are applied
- Test API connections in the dashboard

## Roadmap

### Phase 1 (Current)
- ✅ Basic dashboard and dress management
- ✅ AI virtual try-on integration
- ✅ Customer tracking

### Phase 2 (Next)
- 🚧 WhatsApp campaigns
- 🚧 Payment processing
- 🚧 Advanced analytics

### Phase 3 (Future)
- Mobile app for customers
- 3D virtual try-on
- AR integration
- Multi-language support