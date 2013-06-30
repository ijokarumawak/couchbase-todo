# couchbase-todo
A simple todo management application using Node.js and Couchbase Server.

# How to install

    npm install

## Setting a config file.

    # Create a config file.
    vi config/default.yaml

    # Define the Couchbase connection settings.
    # Plus the ElasticSearch connection if you have one.
    Couchbase:
      connection:
        user: ""
        password: ""
        hosts: ["localhost:8091"]
        bucket: "todo"
        debug: true
      designDocs:
        localDir: ./db/design-docs

    ElasticSearch:
      connection:
        host; "localhost:
        port: 9200
      indes: "todo"

## Create design docs.

    node db/couchbase-admin.js uploadDesignDoc dev_all
    node db/couchbase-admin.js uploadDesignDoc dev_comment
    node db/couchbase-admin.js uploadDesignDoc dev_project
    node db/couchbase-admin.js uploadDesignDoc dev_task


# How to start

    node app.js

    # And log-in to the application
    http://localhost:3000

