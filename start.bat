@echo off

echo Starting the Backend...
cd backend
start cmd /k "npm run start:dev"

echo Starting the Frontend...
cd ..
cd frontend
start cmd /k "npm run dev"

echo All services have been started.
pause
