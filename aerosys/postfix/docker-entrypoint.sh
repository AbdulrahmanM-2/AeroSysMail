#!/bin/bash
set -e

echo "🔧 Configuring Postfix..."

# Set hostname from environment or default
MYHOSTNAME=${MAIL_HOSTNAME:-mail.aerosys.aero}
sed -i "s/^myhostname.*/myhostname = $MYHOSTNAME/" /etc/postfix/main.cf

# Initialize alias DB
newaliases 2>/dev/null || true

# Fix permissions on spool directory
chown -R root:postfix /var/spool/postfix/
chmod 755 /var/spool/postfix/

echo "✅ Postfix configured for: $MYHOSTNAME"
exec /usr/sbin/postfix start-fg
