package main

import (
	"flag"
)

func main() {
	grpchost := flag.String("server-host", "", "server listen host")
	grpcport := flag.String("server-port", "9999", "server listen port")
	wsport := flag.String("gateway-port", "9998", "gateway listen port")
	wshost := flag.String("gateway-host", "127.0.0.1", "gateway listen host")
	flag.Parse()

	grpcaddr := *grpchost + ":" + *grpcport
	wsaddr := *wshost + ":" + *wsport

	go RunGrpcServer(grpcaddr)
	go RunWsGateway(wsaddr, grpcaddr)
	select {}
}
