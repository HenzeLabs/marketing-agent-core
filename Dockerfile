FROM python:3.11-slim

WORKDIR /app
COPY . /app

RUN pip install --upgrade pip
RUN pip install -r requirements.txt


ENV PORT=8080
ENV PYTHONPATH=/app

CMD ["python", "app.py"]
