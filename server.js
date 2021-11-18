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

const dbAll = (sql, params, res) => {
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message})
          return
        }
        res.json({
            "message":"success",
            "data":rows
        })
      })
}

const dbRun = function (sql, params, res) {
    db.run(sql, params, function (err){
        if (err) {
            res.status(400).json({"error":err.message})
            return
        }
        console.log(this)
        res.json({
            "message":"success",
            "changes":this.changes
        })
    })
}

// Insert here other API endpoints
app.get("/api/contenidos", (req, res, next) => {
    var sql = "select * from Contenido"
    var params = []
    dbAll(sql, params, res)
})


// app.get("/api/categoriascontenidos", (req, res, next) => {
//     var sql = `SELECT
//         Contenido.id_contenido AS 'ID Contenido',
//         (
//             SELECT
//                 group_concat(Categoria.descripcion, ', ')
//             FROM Categoria
//             INNER JOIN CategoriasContenido
//             ON Categoria.id_categoria = CategoriasContenido.id_categoria
//             WHERE CategoriasContenido.id_contenido = Contenido.id_contenido
//         ) AS 'Categorias'
//     FROM Contenido`
//     var params = []
//     dbAll(sql, params, res)
// })

app.get("/api/descargas/byUsuario/:userId", (req, res, next) => {
    var sql = `SELECT
        Descarga.id_descarga AS 'ID Descarga',
        Contenido.tipo_contenido AS 'Tipo Contenido',
        Contenido.titulo AS 'Titulo',
        ifnull(Encuesta_Descarga.puntaje_global_experiencia, 0) AS 'Puntaje Actual Encuesta',
        Descarga.fecha_descarga AS 'Fecha Descarga'
    FROM Descarga
    INNER JOIN Contenido_Descargable
    ON Descarga.id_descargable = Contenido_Descargable.id_descargable
    INNER JOIN Contenido
    ON Contenido_Descargable.id_contenido = Contenido.id_contenido
    LEFT OUTER JOIN Encuesta_Descarga
    ON Encuesta_Descarga.id_descarga = Descarga.id_descarga
    WHERE Descarga.id_usuario = ${req.params.userId}
    ORDER BY Descarga.fecha_descarga DESC`
    var params = []
    dbAll(sql, params, res)
})

app.delete("/api/descargas/:descargaId/eliminarEncuesta", (req, res, next) => {
    var sql = `DELETE FROM Encuesta_Descarga
    WHERE Encuesta_Descarga.id_descarga = ${req.params.descargaId}`
    var params = []
    dbRun(sql, params, res)
})

app.get("/api/descargas/:descargaId/getEncuesta", (req, res, next) => {
    var sql = `SELECT
        Encuesta_Descarga.id_encuesta as 'ID Encuesta',
        ifnull(Encuesta_Descarga.puntaje_global_experiencia, 0) AS 'Puntaje Actual Encuesta',
        ifnull(Encuesta_Descarga.resumen_positivo_descarga, '') AS 'Positivo Descarga',
        ifnull(Encuesta_Descarga.resumen_negativo_descarga, '') AS 'Negativo Descarga',
        ifnull(Encuesta_Descarga.resumen_positivo_plataforma, '') AS 'Positivo Plataforma',
        ifnull(Encuesta_Descarga.resumen_negativo_plataforma, '') AS 'Negativo Plataforma'
    FROM Descarga
    INNER JOIN Encuesta_Descarga
    ON Encuesta_Descarga.id_descarga = Descarga.id_descarga
    WHERE Descarga.id_descarga = ${req.params.descargaId}`
    var params = []
    dbAll(sql, params, res)
})


// Default response for any other request
app.use(function(req, res){
    res.status(404)
    res.set("Connection", "close")
    res.json({error:true, error_message : "<some - error message>"})
})