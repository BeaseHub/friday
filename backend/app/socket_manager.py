from fastapi_socketio import SocketManager
from fastapi import FastAPI

app = FastAPI()
sio = SocketManager(app=app)