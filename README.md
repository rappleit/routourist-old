# Routourist
Routourist is a route builder web application that aims to promote sustainable tourism. 

## Features
- 🗺️ Enter a starting location and destination(s), choose your preferred mode of transportation, and Routourist will generate a route through every location!
- 📊 Statistics on the amount of carbon emissions generated from your route, with comparisons to the carbon emissions generated when other modes of transport are selected
- 📍 An option to optimise your route, which generates the shortest route through all inputted destinations (in an optimised order)
- 💡 Suggestions on nearby attractions and facilities along the created route, such as parks, sustainable hotels, water activities, bicycle rentals, electric vehicle charging spots etc.
- 💾 Ability to save created routes when logged in

## About this project
Routourist is created for the [Google Solutions Challenge 2023](https://developers.google.com/community/gdsc-solution-challenge), targetting the UN Sustainable Development Goals 8.9: Promote Beneficial and Sustainable Tourism, and 12.B: Develop and Implement Tools to Monitor Sustainable Tourism. [View our demo video here](https://www.youtube.com/watch?v=C2CvpDtPIj4).

### Project Members
- Asyraf Omar (https://github.com/asycodes)
- Rachel Lim (https://github.com/rappleit)
- Andrew Yu (https://github.com/Gnoot01)

### Contact
Email: [routourist3dc@gmail.com](mailto:routourist3dc@gmail.com)

---
## Setup Guide

### Prerequisites
- A MongoDB Atlas Account
- A Google Cloud Account

### Installation

Step 1: Clone the repo
```
git clone https://github.com/rappleit/routourist.git
```

Step 2: Go to the `backend` folder

Step 2.1: Install backend dependencies
```
npm install
```
Step 2.2: Create a new `.env` file from `.env.example`
```
copy .env.example .env
```
Step 2.3: Create a new MongoDB free cluster ([tutorial](https://www.mongodb.com/docs/atlas/getting-started/)) and copy the connection string under *Connect > Connect your application*. Paste this connection string in your `.env` file after `MONGO_URI=` (Remember to replace the password)

Step 2.4: Add in your own JWT Secret in your `.env` file after `SECRET=` (This can be a string of random text and numbers. You can use any password generator to generate one)

Step 2.5: Run the backend
```
npm start
```

Step 3: Go to the `frontend` folder

Step 3.1: Install frontend dependencies
```
npm install
```

Step 3.2: Create a new `.env.local` file from `.env.example`
```
copy .env.example .env.local
```

Step 3.3: Obtain API key from Google Cloud Console
1. Head to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. At the top left, under "APIs & Services", click on "Credentials"
4. Click "Create Credentials", then click "API Key"
5. Copy this API Key for later
6. Enable Places, Directions, Geocoding, Maps Javascript APIs from the API "Library"

Paste the copied API Key in your `.env.local` file next to `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=`

Step 3.4: Run the frontend
```
npm run dev
```



