from app import create_app
<<<<<<< HEAD

app = create_app()
=======

app = create_app()

print("====== COSMOCAPTURE BACKEND ROUTES LOADED ======")
print(app.url_map)
print("================================================")
>>>>>>> 4f2fba1230ab6e6c1402773a2a599ce7ad579245

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False
    )