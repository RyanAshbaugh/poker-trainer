FROM python:3.11-slim

# Use arg names that avoid shell reserved UID
ARG USER_ID=1001
ARG GROUP_ID=1001

WORKDIR /app

RUN groupadd -g ${GROUP_ID} --non-unique appuser && \
    useradd -u ${USER_ID} --non-unique -g appuser -m appuser

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chown -R appuser:appuser /app
USER appuser

ENV PORT=5000
EXPOSE 5000

CMD ["python", "server.py"]

