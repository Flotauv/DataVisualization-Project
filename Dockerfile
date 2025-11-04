FROM debian:latest
RUN apt-get update && \
    apt-get install -y apache2  apache2-utils && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html/

RUN rm -f /var/www/html/index.html

COPY . /var/www/html/

RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html

EXPOSE 80

CMD ["apache2ctl", "-D", "FOREGROUND"]

# linux command : docker run --rm --name myapache -d -p 8080:80 my_container_image_name