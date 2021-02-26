FROM python:3-alpine

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN apk add --update --no-cache g++ gcc libxslt-dev
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ./start.sh