import http.server
import socketserver
import os
import socket

PORT = 8000

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

class DualStackServer(socketserver.ThreadingTCPServer):
    address_family = socket.AF_INET6
    def server_bind(self):
        self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        super().server_bind()

# Change directory to the script's directory to serve files from there
os.chdir(os.path.dirname(os.path.abspath(__file__)))

DualStackServer.allow_reuse_address = True
with DualStackServer(("", PORT), NoCacheHTTPRequestHandler) as httpd:
    print(f"Serving HTTP on port {PORT} with caching disabled (Dual IPv4/IPv6)...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nKeyboard interrupt received, exiting.")

