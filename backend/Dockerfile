FROM node:16

# Create App Directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install Dependencies
COPY package*.json ./

RUN npm install --silent

# Copy app source code
COPY . .

RUN npm install -g nodemon

# Exports
EXPOSE 8000

CMD ["npm","start"]