// Create express app
var express = require("express")
var app = express()
var db = require("./database.js")

// Server port
var HTTP_PORT = 4040
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});
// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});

// Insert here other API endpoints
app.get("/api/contenidos", (req, res, next) => {
    var sql = "select * from Contenido"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

// Insert here other API endpoints
app.get("/api/categoriascontenidos", (req, res, next) => {
    var sql = `SELECT
        Contenido.id_contenido AS 'ID Contenido',
        (
            SELECT
                group_concat(Categoria.descripcion, ', ')
            FROM Categoria
            INNER JOIN CategoriasContenido
            ON Categoria.id_categoria = CategoriasContenido.id_categoria
            WHERE CategoriasContenido.id_contenido = Contenido.id_contenido
        ) AS 'Categorias'
    FROM Contenido`
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

// Default response for any other request
app.use(function(req, res){
    res.status(404)
    res.set("Connection", "close")
    res.json({error:true, error_message : "<some - error message>"})
});