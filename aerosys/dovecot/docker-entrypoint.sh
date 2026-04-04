#!/bin/bash
set -e

# Create vmail system user for mail delivery
if ! id vmail &>/dev/null; then
  groupadd -g 5000 vmail
  useradd -u 5000 -g vmail -s /sbin/nologin -d /var/mail vmail
fi

# Create mail directory
mkdir -p /var/mail
chown -R vmail:vmail /var/mail
chmod 755 /var/mail

# Create demo user (alex@aerosys.aero / demo1234)
# Generate password hash: doveadm pw -s SHA512-CRYPT -p demo1234
echo "alex@aerosys.aero:{SHA512-CRYPT}\$6\$rounds=5000\$aerosysmail\$xyz123placeholder:::::::" \
  > /etc/dovecot/users 2>/dev/null || true

echo "✅ Dovecot configured"
exec /usr/sbin/dovecot -F
