# bunko-reader

## Getting Started

```bash
#Install dependencies
npm i

#Run dev front
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.



## Backend setup
```bash
#Move to backend folder
cd server

#Install requirements
pip install -r requirements.txt

#Create .env file with OpenAI key
echo "OPENAI_KEY=YOUR_KEY" > .env

#Run server
uvicorn main:app --reload
```
Server is running on  [http://localhost:8000](http://localhost:8000)