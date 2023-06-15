# HaLLMet

## Getting Started
### Dependencies
To install the client dependencies, navigate to the root folder and execute the following command:
```bash
#Install client dependencies
npm i
```

For the backend dependencies, go to the `server` folder and install them using the following commands:
```bash
# Move to backend folder
cd server

# Install backend dependencies
pip install -r requirements.txt
```

### API Key
The prototype utilizes the `gtp-3.5-turbo` model from OpenAI. In order to use the prototype, you need to provide your own API key. Within the `server` folder, create a .env file with the following command, replacing "YOUR_KEY" with your OpenAI API key:
```bash
# Create .env file with your OpenAI key
echo "OPENAI_KEY=YOUR_KEY" > .env
```


### Running the Prototype
To run the client prototype, execute the following command in the root folder:
```bash
# Run client
npm run dev
```
Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to access the prototype client.

For the backend, go to the server folder and start the server using the command below to allow model requests:
```bash
# Move to backend folder
cd server

# Run server
uvicorn main:app --reload
```
The server will be running at [http://localhost:8000](http://localhost:8000)