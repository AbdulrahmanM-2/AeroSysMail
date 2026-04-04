FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    dovecot-imapd \
    dovecot-core \
    ssl-cert \
    && rm -rf /var/lib/apt/lists/*

COPY config/dovecot.conf /etc/dovecot/dovecot.conf
COPY config/users        /etc/dovecot/users

RUN chmod 600 /etc/dovecot/users \
    && mkdir -p /var/mail/vhosts/aerosys.aero/alex/Maildir \
    && chown -R dovecot:dovecot /var/mail/vhosts || true

EXPOSE 143 993
CMD ["dovecot", "-F"]
