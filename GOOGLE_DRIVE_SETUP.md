# Google Drive Setup Instructions for Desk Diary

This guide will help you set up Google Drive API to replace Cloudinary for file uploads.

## Prerequisites
- Google account: deskdiary401@gmail.com
- Access to Google Cloud Console

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Sign in with `deskdiary401@gmail.com`
3. Click "Select a project" at the top
4. Click "New Project"
5. Name it: "Desk Diary"
6. Click "Create"

## Step 2: Enable Google Drive API

1. In the Google Cloud Console, make sure your "Desk Diary" project is selected
2. Go to "APIs & Services" > "Library"
3. Search for "Google Drive API"
4. Click on it and click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Select "External" user type
   - Click "Create"
   - Fill in:
     - App name: "Desk Diary"
     - User support email: deskdiary401@gmail.com
     - Developer contact: deskdiary401@gmail.com
   - Click "Save and Continue" (skip other sections)
4. Back to credentials, click "Create Credentials" > "OAuth client ID"
5. Select "Web application"
6. Name it: "Desk Diary Web"
7. Add your app's URL to "Authorized JavaScript origins":
   - For local development: `http://localhost:5173`
   - For production: `https://your-domain.com`
8. Add redirect URI to "Authorized redirect URIs":
   - `http://localhost:5173` (for local)
   - `https://your-domain.com` (for production)
9. Click "Create"
10. Copy the **Client ID** (you'll need this for .env)

## Step 4: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the **API Key** (you'll need this for .env)
4. (Optional) Click "Edit API Key" to restrict it to Drive API only

## Step 5: Create Google Drive Folder (Optional)

1. Go to [Google Drive](https://drive.google.com) with deskdiary401@gmail.com
2. Create a new folder named "Desk Diary Uploads"
3. Open the folder and copy the folder ID from the URL:
   - URL format: `https://drive.google.com/drive/folders/FOLDER_ID`
   - Copy the `FOLDER_ID` part
4. (Optional) Share the folder with deskdiary401@gmail.com

## Step 6: Update Environment Variables

1. Open `.env` file in your project
2. Replace the placeholder values:
   ```
   VITE_GOOGLE_CLIENT_ID=your-actual-client-id-here
   VITE_GOOGLE_API_KEY=your-actual-api-key-here
   VITE_GOOGLE_DRIVE_FOLDER_ID=your-folder-id-here (optional)
   ```

## Step 7: Test the Integration

1. Restart your development server
2. Try uploading an image in the admin dashboard
3. First time, you'll be prompted to authorize with Google
4. Grant permission to access your Google Drive
5. The file should upload to your Google Drive folder

## Important Notes

- **OAuth Consent**: First-time users will see a Google authorization popup
- **File Permissions**: Uploaded files are automatically set to "anyone with link can view"
- **Folder Organization**: Use the folder ID to keep uploads organized
- **Quota**: Google Drive has free tier limits (15GB storage)
- **Security**: Never commit your API keys or client ID to version control

## Troubleshooting

**"Google Drive is not configured" error:**
- Make sure VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY are set in .env
- Restart the development server after updating .env

**"Access blocked" error:**
- Make sure your app's URL is in Authorized JavaScript origins
- Make sure redirect URI is in Authorized redirect URIs

**Upload fails with 403 error:**
- Check that Google Drive API is enabled
- Verify API key has Drive API permissions

**Files not displaying:**
- Check that files are set to public (anyone with link can view)
- The code automatically sets permissions, but verify in Google Drive
