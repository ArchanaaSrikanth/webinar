FROM node:22-alpin As build 
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build 


FROM nginx:alpin
COPY --FROM=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]