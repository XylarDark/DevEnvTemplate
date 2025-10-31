# Secrets Management

This guide covers secure handling of secrets, credentials, and sensitive configuration in this project.

## Principles

1. **Never commit secrets** to version control
2. **Use environment variables** for configuration
3. **Rotate secrets regularly** when possible
4. **Limit secret scope** to minimum required access
5. **Audit secret usage** and access patterns

## Environment Variables

### Local Development

Create a `.env` file in your project root (never commit this file):

```bash
# Copy from template
cp .env.example .env

# Edit with your values
nano .env
```

### Production

Use your deployment platform's secret management:

- **Vercel**: Environment Variables in project settings
- **Netlify**: Environment variables in site settings
- **GitHub Actions**: Repository secrets
- **Docker**: Environment files or secret mounts
- **Kubernetes**: Secrets API or external providers

## Secret Types

### API Keys and Tokens

```bash
# API Keys - Store in environment variables
API_KEY=your_api_key_here
DATABASE_URL=postgresql://user:password@host:port/db

# OAuth tokens
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
SLACK_TOKEN=xoxb-xxxxxxxxxxxx-xxxxxxxxxxxxxxxx
```

### Database Credentials

```bash
# Database connection strings
DATABASE_URL=protocol://username:password@host:port/database

# Individual components (less preferred)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=myuser
DB_PASSWORD=mypassword
```

### Encryption Keys

```bash
# JWT secrets
JWT_SECRET=your_jwt_secret_here

# Encryption keys
ENCRYPTION_KEY=your_encryption_key_here

# Session secrets
SESSION_SECRET=your_session_secret_here
```

## Best Practices

### Development

- Use `.env.example` to document required variables
- Never commit `.env` files
- Use different values for different environments
- Document variable purposes and formats

### Production

- Use platform-specific secret management
- Rotate secrets regularly (90-180 days)
- Monitor secret usage and access
- Use different secrets per environment
- Implement secret versioning where supported

### Code

```javascript
// Good: Use environment variables
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error('API_KEY environment variable is required');
}

// Bad: Hardcoded secrets
const apiKey = 'sk-1234567890abcdef';
```

## Security Scanning

### Pre-commit Hooks

Consider using tools like:

- **git-secrets**: Scans for hardcoded secrets
- **truffleHog**: Finds secrets in git history
- **gitleaks**: Fast secret scanning

### CI/CD Scanning

```yaml
# Example GitHub Actions
- name: Secret Scanning
  uses: zricethezav/gitleaks-action@main
  with:
    config-path: .gitleaks.toml
```

## Tools and Services

### Secret Management Services

- **AWS Secrets Manager**: Cloud-based secret storage
- **Azure Key Vault**: Microsoft's secret management
- **Google Cloud Secret Manager**: GCP secret storage
- **HashiCorp Vault**: Self-hosted secret management
- **1Password**: Team password management
- **LastPass**: Enterprise password management

### Development Tools

- **dotenv**: Load environment variables from .env files
- **dotenv-vault**: Encrypted environment variables
- **envkey**: Environment variable management
- **infisical**: Open-source secret management

## Emergency Procedures

### Secret Compromise

1. **Immediately rotate** the compromised secret
2. **Audit access logs** for unauthorized use
3. **Notify affected parties** if data exposure occurred
4. **Update all systems** using the old secret
5. **Review security practices** to prevent recurrence

### Lost Secrets

1. **Generate new secrets** immediately
2. **Update all configurations** before deployment
3. **Test thoroughly** in staging environment
4. **Deploy during maintenance window** if possible
5. **Monitor for issues** post-deployment

## Compliance

### Regulatory Requirements

- **GDPR**: Data protection and privacy
- **CCPA**: California consumer privacy
- **SOX**: Financial data handling
- **HIPAA**: Health information privacy

### Industry Standards

- **OWASP**: Web application security
- **NIST**: Cybersecurity framework
- **ISO 27001**: Information security management

## Training

### Team Education

- Regular security training sessions
- Code reviews focusing on secret handling
- Incident response drills
- Security awareness newsletters

### Documentation

- Keep this document updated
- Include security checklists in PR templates
- Document secret rotation procedures
- Maintain incident response playbooks

## Monitoring and Auditing

### Access Logging

- Log secret access and usage
- Monitor for unusual access patterns
- Set up alerts for suspicious activity
- Regular audit log reviews

### Automated Monitoring

```yaml
# Example monitoring
- name: Check for exposed secrets
  run: |
    # Scan for common secret patterns
    grep -r "password\|secret\|key" --exclude-dir=.git .
```

## References

- [OWASP Secret Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12 Factor App Config](https://12factor.net/config)
- [GitGuardian Security Best Practices](https://docs.gitguardian.com/secret-detection/best-practices)
