# Remote Compile

This project is a Web service for a remote build service which accepts user's source files and project configuration and builds the project incrementally and lets them download the output binaries

## Requirements

The server relies on a seperated compile server for the actual build process. Minio object storage ( which is used for storing source files and built targets ) and PostgreSQL server instances must be running for the secver to function properly. a `.env` file is also needed for the following configurations:

```
VERSION=                                # server version
PORT=                                   # http server port
DBNAME=                                 # database name
DBUSER=                                 # database username
DBPASS=                                 # database password
DBHOST=                                 # database host
JWT_SECRET=                             # jwt secret
MD5_SALT=                               # salt used for password hash
MINIO_PORT=                             # minio
MINIO_ENDPOINT=                         # minio
MINIO_ACCESSKEY=                        # minio
MINIO_SECRETKEY=                        # minio
RCS_SECRET=                             # secret used for communicating
COST_PER_BUILD=                         # credit required for making build request
```

## Running

cd to project directory and run:

```shell
npm install
npm start
```

## Architecture

This project consist of two services, the core service (which resides in this repo) and compile servers. The core service serves client requests and is dependent on compile server for handling the build process. The service is compatible with serverless technologies and can be deployed on any cloud infrastructure.

The compile server is different, it needs direct access to the OS filesystem. That is because it spawns GCC instances which need to read C source and header files and also write the binaries on the disk. For that reason, compile servers are deprived of the luxury of being run on the cloud and must be deployed on regular servers. The compile server only serves the requests sent by the core service, and thus a secret token is used for authorization. There is a relation in the database which stores the information ( endoint, port, etc ) of every server.


## Workflow

The client can trigger a build in the following way:

1.  client creates a new project.
2.  the core service allocates a compiler server to the project.
3.  client uploads files.
4.  client requests a build.
5.  the core service creates a new build entry in the database
6.  the core service asks the respective compile server to build the project
7.  the compile server builds the project
8.  the compile server update the build entry with compiler logs and result
9.  the core service is notified by the compile server

there could have been a tenth step for the client being notified by the server. due to http being a unidirectional protocol, this had to be implemented using sockets, but was'nt for reasons:
- Sockets are not guaranteed to be supported on evey cloud infra.
- Getting realtime notifications for builds is not **mission-critical**. A typical build might take up to minutes. The client can make repeatative reuqests to the server with relatively large intervals.
- There are various notification services (such as push notification) which can be utilized for this purpose. 

## Project Config

The configuration is a JSON document that describes the source tree and the build instructions for every target. The config can contain multiple targets such as libraries and executables that can depend on each other. Integers in the `tree` setion specify file identifiers which can be refered to in the `targets` section.

``` JSON
{
    "tree":{
        "dir1":{
            "dir1-1":{
                "file1-1-1":1
            },
            "file1-1":2,
            "file1-2":3,
        },
        "file1":4,
        "file2":5,
    },
    "targets":{
        "mylib": {
            "output":"ar",
            "src": [ 1, 2, 3 ],
        },
        "mybin": {
            "output":"bin",
            "src": [ 4, 5 ],
            "dependency":["mylib"]
        },
    }
}
```

## API

The core API uses JWT tokens for user authentication. The REST API methods provided by the server:

### Managing users
```
POST /api/login     # login
POST /api/register  # register
POST /api/chpass    # change password
POST /api/charge    # charge account
POST /api/chname    # change first/last name
GET /api/profile    # get account info
```

### Projects
```
GET /api/projects           # get user's projects list
GET /api/project/<pname>/   # get project
POST /api/project/<pname>/  # add project
PUT /api/project/<pname>/   # edit project build instruction
```

### Files
```
GET /api/project/<pname>/files/         # get projects list
GET /api/project/<pname>/files/<fid>    # get project
POST /api/project/<pname>/files/<fid>   # upload file
PUT /api/project/<pname>/files/<fid>    # edit file
```

### Builds
```
GET /api/build/<bid>/status         # get build status
GET /api/build/<bid>/log            # get build logs
GET /api/build/<bid>/<targetname>   # get output binary
```