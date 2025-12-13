FROM nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY ./dist/  /usr/share/nginx/html
RUN chgrp -R root /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html  /etc/nginx/conf.d/default.conf && \
    chmod -R 777 /var/cache/nginx /var/run /var/log/nginx  /usr/share/nginx/html   /etc/nginx/conf.d/default.conf 
EXPOSE 8080