FROM postgis/postgis:15-3.4

RUN apt-get update \
    && apt-cache showpkg postgresql-15-pgvector \
    && apt-get install -y --no-install-recommends \
       postgresql-15-pgvector \
    && rm -rf /var/lib/apt/lists/*
