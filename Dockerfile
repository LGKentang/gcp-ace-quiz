FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

COPY server/requirements.txt server/requirements.txt
RUN pip install -r server/requirements.txt

COPY server/__init__.py server/main.py server/
COPY index.html script.js style.css theme.js data.json static/

# Run as an unprivileged user; SQLite lives on the /data volume.
RUN useradd --system --uid 10001 --home-dir /app --shell /usr/sbin/nologin ace \
    && mkdir -p /data && chown ace:ace /data
USER ace

ENV STATIC_DIR=/app/static \
    DATABASE_PATH=/data/ace.db

VOLUME ["/data"]
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/healthz', timeout=4).status == 200 else 1)"

# One worker keeps SQLite writes simple; plenty for a study group.
CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8000", \
     "--proxy-headers", "--forwarded-allow-ips", "*", "--no-server-header"]
