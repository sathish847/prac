# 🚀 Netlify Deployment with Cloudflare Security

This guide explains how to deploy your property management application to Netlify while using Cloudflare for enhanced security features.

## 📋 Prerequisites

- Netlify account ([sign up](https://app.netlify.com))
- Cloudflare account ([sign up](https://dash.cloudflare.com))
- Domain name (optional but recommended)

## 🏗️ Deployment Steps

### 1. Deploy to Netlify

#### Option A: Git Integration (Recommended)
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Netlify:
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Choose your repository
   - Netlify will auto-detect settings from `netlify.toml`

#### Option B: Manual Deploy
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to production
npm run netlify:deploy

# Or deploy as draft first
npm run netlify:deploy:draft
```

### 2. Configure Cloudflare Security

#### Step 1: Add Your Site to Cloudflare
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click "Add a Site"
3. Enter your Netlify domain (e.g., `amazing-site-123.netlify.app`)
4. Choose your plan (Free plan works for basic security)

#### Step 2: Update DNS Records
1. In Cloudflare, go to DNS → Records
2. Update the CNAME record to point to your Netlify site
3. Or if using a custom domain, update accordingly

#### Step 3: Enable Security Features

**Firewall Rules:**
- Go to Security → WAF
- Create custom rules to block suspicious traffic

**Rate Limiting:**
- Go to Security → Rate limiting
- Set up rules to prevent DDoS attacks

**SSL/TLS:**
- Go to SSL/TLS → Overview
- Ensure "Full (strict)" encryption is enabled

**Bot Management:**
- Go to Security → Bots
- Enable bot fight mode

### 3. Custom Domain Setup (Optional)

#### Connect Domain to Netlify
1. In Netlify Dashboard → Site settings → Domain management
2. Add your custom domain
3. Follow DNS instructions

#### Update Cloudflare for Custom Domain
1. In Cloudflare, update DNS records for your custom domain
2. Set SSL/TLS encryption mode to "Full (strict)"
3. Enable "Always Use HTTPS"

## 🔒 Security Features Included

### Netlify Security Headers
- `Strict-Transport-Security`: Forces HTTPS
- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME sniffing
- `X-XSS-Protection`: XSS protection
- `Referrer-Policy`: Controls referrer information

### Cloudflare Security Features
- **DDoS Protection**: Automatic mitigation
- **Web Application Firewall (WAF)**: Blocks malicious requests
- **Rate Limiting**: Prevents abuse
- **Bot Management**: Blocks bad bots
- **SSL/TLS Encryption**: End-to-end encryption
- **CDN**: Fast global content delivery

## 🌍 Environment Variables

Add environment variables in Netlify Dashboard:
- Site settings → Environment variables

Or in `netlify.toml`:
```toml
[build.environment]
API_BASE_URL = "https://your-api-endpoint.com"
CLOUDFLARE_API_KEY = "your-api-key"
```

## 🔄 Build Settings

Your `netlify.toml` includes:
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18
- SPA redirects configured

## 🧪 Testing Your Deployment

1. **Test SPA Routing**: Navigate between pages without full reloads
2. **Test HTTPS**: Ensure all traffic is encrypted
3. **Test Security Headers**: Use [securityheaders.com](https://securityheaders.com)
4. **Test Performance**: Use Google PageSpeed Insights

## 🚨 Troubleshooting

### Common Issues

**SPA Routing Not Working:**
- Check that `[[redirects]]` section is in `netlify.toml`
- Verify `_headers` file is in `public/` folder

**Security Headers Not Applied:**
- Ensure `_headers` file is copied to build output
- Check Netlify function logs

**Cloudflare Not Protecting:**
- Verify DNS records point to Cloudflare
- Check that proxy status is enabled (orange cloud)

### Useful Commands

```bash
# Check build locally
npm run build
npm run preview

# Deploy with verbose logging
netlify deploy --prod --dir=dist --message "Deploy with security updates"
```

## 📊 Monitoring

- **Netlify Analytics**: Site performance and usage
- **Cloudflare Analytics**: Security events and traffic patterns
- **Uptime Monitoring**: Set up monitoring for your domain

## 🔐 Additional Security Recommendations

1. **Enable 2FA** on all accounts (Netlify, Cloudflare, Git)
2. **Regular Updates**: Keep dependencies updated
3. **Backup Strategy**: Regular backups of your data
4. **Access Control**: Limit admin access appropriately
5. **Audit Logs**: Monitor access logs regularly

## 📞 Support

- **Netlify**: [Support Center](https://docs.netlify.com/)
- **Cloudflare**: [Support Center](https://support.cloudflare.com/)
- **Security Issues**: Report to respective platforms immediately

---

**Your property management app is now deployed with enterprise-grade security! 🛡️**
