# Netlify Deployment Guide for REPRO PLAN Frontend

This guide will help you deploy the REPRO PLAN frontend to Netlify for your investor pitch.

## ✅ Pre-Deployment Checklist

- [x] Frontend uses mock API (no backend connection needed)
- [x] Netlify configuration file exists (`netlify.toml`)
- [x] SPA routing configured (`public/_redirects`)
- [x] Build scripts configured in `package.json`
- [x] PWA manifest configured
- [x] Environment variables documented

## Quick Deploy Steps

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Sign up/Login to Netlify**
   - Go to [netlify.com](https://www.netlify.com)
   - Sign up or log in with GitHub/GitLab/Bitbucket

2. **Create New Site**
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository
   - Select your repository

3. **Configure Build Settings**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`
   - **Node version**: `18` (or latest LTS)

4. **Environment Variables (Optional)**
   - Go to Site Settings → Environment Variables
   - Add if needed (for prototype, none required):
     ```
     REACT_APP_USE_MOCK_API=true
     ```
   - **Note**: Mock API is enabled by default, so this is optional

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete (~2-5 minutes)
   - Your site will be live at `https://your-site-name.netlify.app`

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Navigate to frontend directory
cd frontend

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=build
```

### Option 3: Deploy via Git Push (Auto-deploy)

1. Connect repository to Netlify (as in Option 1)
2. Netlify will automatically deploy on every push to main branch
3. Configure in Site Settings → Build & deploy → Continuous Deployment

## Environment Variables

For prototype/demo, **no environment variables are required**. The app uses mock data by default.

If you want to explicitly set it (optional):
- `REACT_APP_USE_MOCK_API=true` (default, can be omitted)

When ready to connect to backend (future):
- `REACT_APP_USE_MOCK_API=false`
- `REACT_APP_API_URL=https://your-backend-url.ondigitalocean.app`

## Build Configuration

The `netlify.toml` file is already configured with:

- ✅ Build command: `npm run build`
- ✅ Publish directory: `build`
- ✅ Node version: 18
- ✅ SPA routing (all routes redirect to index.html)
- ✅ Security headers
- ✅ Cache headers for static assets
- ✅ PWA service worker caching

## Verification Checklist

After deployment, verify:

1. **Homepage loads**: `https://your-site.netlify.app`
2. **SPA routing works**: Navigate to different pages
3. **Mock API works**: Try logging in with any 4+ character code
4. **PWA installable**: Check if "Install App" prompt appears
5. **Offline mode**: Test offline functionality
6. **All features work**: Test key features like chatbot, clinics, etc.

## Custom Domain (Optional)

1. Go to Site Settings → Domain management
2. Click "Add custom domain"
3. Follow instructions to configure DNS
4. SSL certificate is automatically provisioned

## Troubleshooting

### Build Fails

**Error: Module not found**
- Solution: Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: TypeScript errors**
- Solution: Fix TypeScript errors before deploying
- Run `npm run build` locally first

**Error: Out of memory**
- Solution: Upgrade Netlify plan or optimize build
- Add `NODE_OPTIONS=--max-old-space-size=4096` to environment variables

### Site Not Loading

**404 on routes**
- Solution: Verify `public/_redirects` file exists with `/* /index.html 200`
- Check `netlify.toml` redirects configuration

**Blank page**
- Solution: Check browser console for errors
- Verify build completed successfully
- Check that `index.html` exists in build folder

### Mock API Not Working

**API calls failing**
- Solution: Verify `REACT_APP_USE_MOCK_API` is not set to `false`
- Check browser console for errors
- Mock API should work without any backend

## Performance Optimization

The app is already optimized with:

- ✅ Code splitting
- ✅ Lazy loading
- ✅ Service worker caching
- ✅ Static asset optimization
- ✅ Compression enabled

## Security

Security headers are configured in `netlify.toml`:

- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy
- ✅ Permissions-Policy

## Analytics (Optional)

To add analytics:

1. Go to Site Settings → Integrations
2. Add Google Analytics, Plausible, or other analytics
3. Or add manually in `public/index.html`

## Support

- **Netlify Docs**: https://docs.netlify.com
- **Netlify Community**: https://answers.netlify.com
- **Build Logs**: Available in Netlify dashboard

## Post-Deployment

After successful deployment:

1. ✅ Test all features
2. ✅ Share URL with investors
3. ✅ Monitor build logs for any issues
4. ✅ Set up custom domain (optional)
5. ✅ Configure analytics (optional)

## Next Steps

Once backend is deployed to DigitalOcean:

1. Update environment variables in Netlify:
   - `REACT_APP_USE_MOCK_API=false`
   - `REACT_APP_API_URL=https://your-backend-url.ondigitalocean.app`
2. Redeploy frontend
3. Test end-to-end functionality

---

**Your app is ready for investor pitch! 🚀**

