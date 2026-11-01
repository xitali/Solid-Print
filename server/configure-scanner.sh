#!/bin/sh
set -eu
# Run only inside the dedicated solidprint-scan container.
[ "$(hostname)" = solidprint-scan ] || exit 1
cp -n /etc/clamav/clamd.conf /etc/clamav/clamd.conf.before-solidprint || true
sed -i -E '/^(StreamMaxLength|MaxFileSize|MaxScanSize|MaxThreads|LocalSocketMode|AlertExceedsMax|EnableReloadCommand) /d' /etc/clamav/clamd.conf
cat >> /etc/clamav/clamd.conf <<'EOF'
StreamMaxLength 110M
MaxFileSize 110M
MaxScanSize 300M
MaxThreads 1
LocalSocketMode 660
AlertExceedsMax yes
EnableReloadCommand true
EOF
systemctl restart clamav-daemon
mkdir -p /opt/solidprint
chmod 755 /opt/solidprint
systemctl daemon-reload
systemctl is-active clamav-daemon
