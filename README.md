# Install all dependencies
npm install

# Install specific packages
npm install express prisma bcryptjs express-session multer

# Start server
node index.js

# Check if server is running
Invoke-WebRequest -Uri http://localhost:3000/login -Method Head

# Push schema to database (create tables)
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Seed admin user
node seed-admin.js

# Seed test team
node seed-team.js

# Seed 25 dummy teams (for testing pagination/search)
node seed-teams.js

Test Admin Account
Username: admin
Password: admin123
URL: http://localhost:3000/login
Dashboard: http://localhost:3000/admin

Test Team Account
Username: tim_test
Password: password123
URL: http://localhost:3000/login
Dashboard: http://localhost:3000/dashboard
