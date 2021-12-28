FROM node
WORKDIR /code
ENV SCF true
ENV COOKIE none
COPY . .
RUN yarn
EXPOSE 9000
ENTRYPOINT ["node", "app.js"]