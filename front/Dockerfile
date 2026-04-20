FROM node:22-alpine
WORKDIR /front
COPY . /front
RUN npm install -g @angular/cli
RUN npm install
EXPOSE 3000
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "3000"]