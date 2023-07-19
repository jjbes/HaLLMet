# HaLLMet

## About
Inspired by hyper-reading techniques, HaLLMet is a system designed to address the perception that reading on screens is less effective than physical texts. HaLLMet focuses on improving the reading experience of digital books by extracting meaningful information from documents and provide alternative reading methods.

A demo is available at : https://hallmet-frontend.ew.r.appspot.com

## Screenshot
<img width="960" alt="Sans titre" src="https://github.com/jjbes/HaLLMet/assets/18220944/b9c5a283-9eae-431a-a704-837906e55b8c">

## Getting Started
### Requirements
* NodeJS ([install](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm))
* Python 3 ([install](https://www.python.org/downloads/))
* Uvicorn ([install](https://www.uvicorn.org/))

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
