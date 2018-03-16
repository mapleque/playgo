Contributing Guide
====

Issue
----

Now, you can say every thing you like.

Server Develope Environment
----

The server develope with [Golang](https://golang.org).

The api define by [protobuf](https://developers.google.com/protocol-buffers/docs/proto3) and implement in [grpc](https://grpc.io/).

```
go get -u github.com/golang/protobuf/protoc-gen-go
go get -u google.golang.org/grpc
export PATH=$PATH:$GOPATH/bin

protoc --go_out=plugins=grpc:server/ playgo.proto
```
