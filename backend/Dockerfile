FROM python:3.11-slim

# Use arg names that don't clash with shell's $UID
ARG UID=1001
ARG GID=1001

WORKDIR /app

RUN groupadd -g ${GID} --non-unique appuser && \
    useradd -u ${UID} --non-unique -g appuser -m appuser

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chown -R appuser:appuser /app
USER appuser

ENV PORT=5000
EXPOSE 5000

CMD ["python", "server.py"]

