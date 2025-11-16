# Environment Configuration

## Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# MongoDB Connection URI
# For local MongoDB:
MONGO_URI=mongodb://localhost:27017/ai-resume-analyzer

# For MongoDB Atlas (Cloud):
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-resume-analyzer

# Node.js Server Port
PORT=5000

# Environment
NODE_ENV=development
```

## How to Create the .env File

### Windows (PowerShell)
```powershell
cd backend
@"
MONGO_URI=mongodb://localhost:27017/ai-resume-analyzer
PORT=5000
NODE_ENV=development
"@ | Out-File -FilePath .env -Encoding utf8
```

### Windows (Command Prompt)
```cmd
cd backend
echo MONGO_URI=mongodb://localhost:27017/ai-resume-analyzer > .env
echo PORT=5000 >> .env
echo NODE_ENV=development >> .env
```

### macOS/Linux
```bash
cd backend
cat > .env << EOF
MONGO_URI=mongodb://localhost:27017/ai-resume-analyzer
PORT=5000
NODE_ENV=development
EOF
```

## MongoDB Atlas Setup

If you're using MongoDB Atlas:

1. Create an account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string
6. Replace `<username>`, `<password>`, and `<cluster>` in the connection string
7. Update `MONGO_URI` in your `.env` file

Example:
```env
MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/ai-resume-analyzer?retryWrites=true&w=majority
```

## FastAPI Configuration

FastAPI server (resume analysis) runs on port 8000 by default. This is configured in `backend/app.py`. If you need to change it, modify:

```python
# In backend/app.py, change the port in the CORS middleware and uvicorn command
uvicorn.run(app, host="127.0.0.1", port=8000)
```

## Frontend Configuration

The frontend is configured to connect to:
- Node.js API: `http://localhost:5000`
- FastAPI: `http://127.0.0.1:8000`

If you change these ports, update the API URLs in:
- `frontend/src/components/*.jsx` files
- Look for `http://localhost:5000` and `http://127.0.0.1:8000`

## Security Notes

1. **Never commit `.env` files to Git** - They contain sensitive information
2. Use environment variables in production
3. Use strong passwords for MongoDB
4. Restrict MongoDB network access in production
5. Use HTTPS in production

## Verification

After creating your `.env` file, verify it's working:

```bash
cd backend
node -e "require('dotenv').config(); console.log('MongoDB URI:', process.env.MONGO_URI); console.log('Port:', process.env.PORT);"
```

You should see your configured values printed.

