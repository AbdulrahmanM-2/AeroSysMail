FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    postfix \
    ssl-cert \
    mailutils \
    && rm -rf /var/lib/apt/lists/*

COPY config/main.cf   /etc/postfix/main.cf
COPY config/master.cf /etc/postfix/master.cf

# Create mail spool dir structure
RUN mkdir -p /var/mail/vhosts/aerosys.aero \
    && chmod -R 770 /var/mail/vhosts

EXPOSE 25 587
CMD ["postfix", "start-fg"]
