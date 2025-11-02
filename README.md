# Print Brawl

A Next.js e-commerce website where two mobile case designs battle it out. The design with fewer purchases gets eliminated and replaced every 48 hours.

## Getting Started

First, create a `.env.local` file in the root directory with your admin password and MongoDB connection string:

```env
ADMIN_PASSWORD=your_secure_password_here
MONGODB_URI=mongodb+srv://aiodo:your_db_password@aiodo.rf9ujqo.mongodb.net/
```

**Note:** Replace `your_db_password` in the MongoDB URI with your actual database password.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Admin Panel

Access the admin panel at `/admin`. You'll need to enter the password set in the `ADMIN_PASSWORD` environment variable.

The admin panel allows you to:
- Manage designs, prices, and purchase counts
- Set custom next drop dates
- View analytics and user sessions
- Update website content

**Note:** If `ADMIN_PASSWORD` is not set, the default password is `admin123` (for development only).

## Database

This project uses MongoDB to store:
- **Config**: Product configuration (designs, prices, text, next drop date)
- **Analytics**: Page views, clicks, and purchases
- **Sessions**: User session data with detailed behavior tracking

All data is automatically cleaned up (events older than 30 days are removed).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
